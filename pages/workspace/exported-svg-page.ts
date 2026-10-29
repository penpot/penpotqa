import {
  expect,
  test,
  type Download,
  type Locator,
  type Page,
} from '@playwright/test';
import { readFile } from 'node:fs/promises';

export type Rgba = { r: number; g: number; b: number; a: number };

/** A point of the exported SVG, in SVG units (1 unit = 1 rendered pixel). */
export type SvgPoint = { x: number; y: number };

/** Fake origin the exported SVG is served from, so it opens as a file outside Penpot. */
const SVG_ORIGIN = 'http://exported-svg.test';

/**
 * An SVG exported from Penpot, opened in a browser tab as an `image/svg+xml`
 * document, the same as opening the downloaded file in Chrome. It's not
 * Penpot UI, so it doesn't extend BasePage; open it in a page without a
 * Penpot session.
 * - Tag checks use regular Playwright locators (CSS works on the XML document).
 * - Visual checks sample pixels of the rendered SVG instead of comparing
 *   screenshots, so they don't depend on baselines or the OS.
 */
export class ExportedSvgPage {
  readonly page: Page;
  private fileName = '';
  private source = '';

  // locators
  /** Root `<svg>` element of the opened document. */
  readonly rootElement: Locator;
  readonly alphaMasks: Locator;
  /** Groups that apply a mask, i.e. `<g mask="url(#…)">`. */
  readonly maskedGroups: Locator;
  readonly clipPaths: Locator;
  /** Images linked to the Penpot instance instead of embedded in the file. */
  readonly penpotImages: Locator;
  readonly ellipses: Locator;
  /** Ids the classic (backend) exporter gives to its elements. */
  readonly screenshotIds: Locator;

  constructor(page: Page) {
    this.page = page;

    this.rootElement = page.locator(':root');
    this.alphaMasks = page.locator('mask[mask-type="alpha"]');
    this.maskedGroups = page.locator('g[mask^="url(#"]');
    this.clipPaths = page.locator('clipPath');
    this.penpotImages = page.locator('image[href*="/assets/by-file-media-id/"]');
    this.ellipses = page.locator('ellipse');
    this.screenshotIds = page.locator('[id^="screenshot"]');
  }

  groupsWithOpacity(opacity: string): Locator {
    return this.page.locator(`g[opacity="${opacity}"]`);
  }

  groupsWithBlendMode(mode: string): Locator {
    return this.page.locator(`g[style*="mix-blend-mode:${mode}"]`);
  }

  /** Elements of the given tag drawn as visible content, not inside a `<mask>`. */
  drawnOutsideMasks(tag: string): Locator {
    return this.page.locator(`${tag}:not(mask ${tag})`);
  }

  private label(message: string): string {
    return `${message} [${this.fileName}]`;
  }

  /**
   * Opens the downloaded SVG and checks that it has no XML errors. A
   * screenshot of the render is attached to the report as evidence.
   */
  async open(download: Download) {
    this.fileName = download.suggestedFilename();
    // Playwright keeps the download in its own artifacts folder until the test ends
    this.source = await readFile(await download.path(), 'utf-8');
    const url = `${SVG_ORIGIN}/${encodeURIComponent(this.fileName)}`;
    await this.page.route(url, (route) =>
      route.fulfill({ contentType: 'image/svg+xml', body: this.source }),
    );
    await this.page.goto(url);
    await this.checkNoXmlErrors();
    await test.info().attach(this.fileName, {
      body: await this.rootElement.screenshot(),
      contentType: 'image/png',
    });
  }

  /**
   * Browsers replace a malformed XML document with an error page
   * (`parsererror`), so a well-formed file keeps `<svg>` as its root.
   */
  async checkNoXmlErrors() {
    const rootName = await this.page.evaluate(() =>
      document.getElementsByTagName('parsererror').length > 0
        ? 'parsererror'
        : document.documentElement.localName,
    );
    expect(rootName, this.label('SVG opens without XML errors')).toBe('svg');
  }

  checkFileName(fileName: string) {
    expect(this.fileName, 'Downloaded file name').toBe(fileName);
  }

  checkXmlDeclaration() {
    expect(
      this.source.trimStart().startsWith('<?xml'),
      this.label('SVG starts with an XML declaration'),
    ).toBe(true);
  }

  /** Size declared by the root `<svg>` (width/height attributes). */
  async getSize(): Promise<{ width: number; height: number }> {
    const [width, height] = await Promise.all([
      this.rootElement.getAttribute('width'),
      this.rootElement.getAttribute('height'),
    ]);
    if (width === null || height === null) {
      throw new Error(this.label('Root <svg> has no width/height'));
    }
    return { width: parseFloat(width), height: parseFloat(height) };
  }

  /** Checks the root size, to 2 decimals (rotated shapes give fractional sizes). */
  async checkSize(width: number, height: number) {
    const size = await this.getSize();
    expect(size.width, this.label('SVG width')).toBeCloseTo(width, 2);
    expect(size.height, this.label('SVG height')).toBeCloseTo(height, 2);
  }

  async checkViewBox(viewBox: string) {
    await expect(this.rootElement, this.label('SVG viewBox')).toHaveAttribute(
      'viewBox',
      viewBox,
    );
  }

  /** No element has an id starting with "screenshot", as the classic exporter writes. */
  async checkNoScreenshotIds() {
    await expect(
      this.screenshotIds,
      this.label('No element has an id starting with "screenshot"'),
    ).toHaveCount(0);
  }

  /**
   * Checks that every definition (e.g. `alphaMasks`, `clipPaths`), called
   * `name` in the report, is used by some `tag` element (any by default)
   * through `attribute="url(#id)"` (e.g. `mask`, `clip-path`).
   * @returns how many definitions were found
   */
  async checkDefinitionsAreReferenced(
    definitions: Locator,
    name: string,
    attribute: string,
    tag = '*',
  ): Promise<number> {
    const ids = await definitions.evaluateAll((elements) =>
      elements.map((element) => element.id),
    );
    expect(ids.length, this.label(`SVG contains ${name}`)).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id, this.label(`Each of the ${name} has an id`)).toBeTruthy();
      await expect(
        this.page.locator(`${tag}[${attribute}="url(#${id})"]`),
        this.label(`A <${tag}> uses #${id} via ${attribute}`),
      ).not.toHaveCount(0);
    }
    return ids.length;
  }

  /** Content is clipped by `<clipPath>` definitions applied by `<g clip-path="url(#…)">`. */
  async checkClipPathsWrapContent() {
    await this.checkDefinitionsAreReferenced(
      this.clipPaths,
      'clip paths',
      'clip-path',
      'g',
    );
  }

  async checkGroupWithOpacity(opacity: string) {
    await expect(
      this.groupsWithOpacity(opacity),
      this.label(`A <g> has opacity ${opacity}`),
    ).toHaveCount(1);
  }

  async checkGroupWithBlendMode(mode: string) {
    await expect(
      this.groupsWithBlendMode(mode),
      this.label(`A <g> has mix-blend-mode ${mode}`),
    ).toHaveCount(1);
  }

  /**
   * The SVG has a single `<ellipse>` with these radii and fill, centred at
   * `center` once its `transform` is applied.
   */
  async checkSingleEllipse(center: SvgPoint, rx: number, ry: number, fill: string) {
    await expect(this.ellipses, this.label('SVG has one <ellipse>')).toHaveCount(1);
    await expect(this.ellipses, this.label('Ellipse rx')).toHaveAttribute(
      'rx',
      `${rx}`,
    );
    await expect(this.ellipses, this.label('Ellipse ry')).toHaveAttribute(
      'ry',
      `${ry}`,
    );
    await expect(this.ellipses, this.label('Ellipse fill')).toHaveAttribute(
      'fill',
      fill,
    );
    // cx/cy plus the translate of its transform, in root coordinates
    const actualCenter = await this.ellipses.evaluate((element) => {
      const ellipse = element as SVGEllipseElement;
      const { x, y } = new DOMPoint(
        ellipse.cx.baseVal.value,
        ellipse.cy.baseVal.value,
      ).matrixTransform(ellipse.getCTM()!);
      return { x, y };
    });
    expect(actualCenter, this.label('Ellipse centre')).toEqual(center);
  }

  /**
   * Each `<mask mask-type="alpha">` is applied by a `<g mask="url(#…)">`
   * wrapping the content, and the mask shape (`maskShapeTag`, e.g. `ellipse`)
   * is only drawn inside `<mask>`, not as visible content.
   */
  async checkAlphaMasksWrapContent(maskShapeTag: string) {
    const masks = await this.checkDefinitionsAreReferenced(
      this.alphaMasks,
      'alpha masks',
      'mask',
      'g',
    );
    await expect(
      this.maskedGroups,
      this.label('Each alpha mask is applied by a <g> wrapper'),
    ).toHaveCount(masks);
    await expect(
      this.drawnOutsideMasks(maskShapeTag),
      this.label(`The mask ${maskShapeTag} is only drawn inside <mask>`),
    ).toHaveCount(0);
  }

  async checkMaskedGroupsContainPenpotImages(count: number) {
    await expect(
      this.maskedGroups.locator(this.penpotImages),
      this.label('Images linked to the Penpot instance inside the masked group'),
    ).toHaveCount(count);
  }

  /**
   * Renders the SVG on a canvas at its own size (1px = 1 SVG unit) and
   * returns the colour at `point`. As in an `<img>`, linked Penpot images and
   * fonts are not loaded, which matches opening the file outside Penpot.
   */
  async getPixel({ x, y }: SvgPoint): Promise<Rgba> {
    const { width, height } = await this.getSize();
    return this.page.evaluate(
      async ({ source, width, height, x, y }) => {
        const img = new Image(width, height);
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
        await img.decode();
        const canvas = document.createElementNS(
          'http://www.w3.org/1999/xhtml',
          'canvas',
        ) as HTMLCanvasElement;
        canvas.width = Math.ceil(width);
        canvas.height = Math.ceil(height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
        return { r, g, b, a };
      },
      { source: this.source, width, height, x, y },
    );
  }

  /** Checks the colour at `point`, allowing small anti-aliasing differences. */
  async checkPixel(
    point: SvgPoint,
    expected: Rgba | 'transparent',
    message: string,
    tolerance = 4,
  ) {
    const actual = await this.getPixel(point);
    const fullMessage = this.label(
      `${message}; pixel (${point.x}, ${point.y}) is rgba(${actual.r}, ${actual.g}, ${actual.b}, ${actual.a})`,
    );
    const target =
      expected === 'transparent' ? { r: 0, g: 0, b: 0, a: 0 } : expected;
    const channels =
      expected === 'transparent'
        ? (['a'] as const)
        : (['r', 'g', 'b', 'a'] as const);
    for (const channel of channels) {
      expect(
        Math.abs(actual[channel] - target[channel]),
        fullMessage,
      ).toBeLessThanOrEqual(tolerance);
    }
  }

  /** Checks the opacity at `point` is within [min, max] (0-255), whatever the colour. */
  async checkAlphaBetween(
    point: SvgPoint,
    min: number,
    max: number,
    message: string,
  ) {
    const { a } = await this.getPixel(point);
    const fullMessage = this.label(
      `${message}; pixel (${point.x}, ${point.y}) alpha is ${a}`,
    );
    expect(a, fullMessage).toBeGreaterThanOrEqual(min);
    expect(a, fullMessage).toBeLessThanOrEqual(max);
  }
}
