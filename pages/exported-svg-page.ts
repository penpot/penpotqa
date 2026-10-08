import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import type { ExportedSvg, Rgba, SvgBrowserName } from 'helpers/svg-export';

/** Fake origin the exported SVG is served from, so it opens as a file outside Penpot. */
const SVG_ORIGIN = 'http://exported-svg.test';

/**
 * An SVG exported from Penpot, opened in a browser tab as an `image/svg+xml`
 * document, the same as opening the downloaded file in Chrome or Firefox.
 * It's not Penpot UI, so it doesn't extend BasePage/BaseComponent.
 * - Tag checks use regular Playwright locators (CSS works on the XML document).
 * - Visual checks sample pixels of the rendered SVG instead of comparing
 *   screenshots, so they don't depend on baselines or the OS.
 */
export class ExportedSvgPage {
  readonly page: Page;
  readonly browserName: SvgBrowserName;
  private svg!: ExportedSvg;

  /** Root `<svg>` element of the opened document. */
  readonly rootElement: Locator;
  readonly alphaMasks: Locator;
  /** Groups that apply a mask, i.e. `<g mask="url(#…)">`. */
  readonly maskedGroups: Locator;
  readonly filters: Locator;
  /** Images linked to the Penpot instance instead of embedded in the file. */
  readonly penpotImages: Locator;

  constructor(page: Page, browserName: SvgBrowserName) {
    this.page = page;
    this.browserName = browserName;

    this.rootElement = page.locator(':root');
    this.alphaMasks = page.locator('mask[mask-type="alpha"]');
    this.maskedGroups = page.locator('g[mask^="url(#"]');
    this.filters = page.locator('filter');
    this.penpotImages = page.locator('image[href*="/assets/by-file-media-id/"]');
  }

  /** Elements of the given tag drawn as visible content, not inside a `<mask>`. */
  drawnOutsideMasks(tag: string): Locator {
    return this.page.locator(`${tag}:not(mask ${tag})`);
  }

  private label(message: string): string {
    return `${message} [${this.svg.fileName} in ${this.browserName}]`;
  }

  async open(svg: ExportedSvg): Promise<void> {
    this.svg = svg;
    const url = `${SVG_ORIGIN}/${encodeURIComponent(svg.fileName)}`;
    await this.page.route(url, (route) =>
      route.fulfill({ contentType: 'image/svg+xml', body: svg.source }),
    );
    await this.page.goto(url);
  }

  /**
   * Browsers replace a malformed XML document with an error page
   * (`parsererror`), so a well-formed file keeps `<svg>` as its root.
   */
  async expectNoXmlErrors(): Promise<void> {
    const rootName = await this.page.evaluate(() =>
      document.getElementsByTagName('parsererror').length > 0
        ? 'parsererror'
        : document.documentElement.localName,
    );
    expect(rootName, this.label('SVG should open without XML errors')).toBe('svg');
  }

  /** Size declared by the root `<svg>` (width/height attributes). */
  async size(): Promise<{ width: number; height: number }> {
    const [width, height] = await Promise.all([
      this.rootElement.getAttribute('width'),
      this.rootElement.getAttribute('height'),
    ]);
    return { width: parseFloat(width!), height: parseFloat(height!) };
  }

  /**
   * Checks that every definition (e.g. `alphaMasks`, `filters`) is used by
   * some element through `attribute="url(#id)"` (e.g. `mask`, `filter`,
   * `clip-path`).
   * @returns how many definitions were found
   */
  async expectDefinitionsReferenced(
    definitions: Locator,
    attribute: string,
  ): Promise<number> {
    await expect(
      definitions.first(),
      this.label(`SVG should contain ${definitions}`),
    ).toBeAttached();
    const ids = await definitions.evaluateAll((elements) =>
      elements.map((el) => el.id),
    );
    for (const id of ids) {
      expect(id, this.label(`${definitions} should have an id`)).toBeTruthy();
      await expect(
        this.page.locator(`[${attribute}="url(#${id})"]`),
        this.label(`An element should use #${id} via ${attribute}`),
      ).not.toHaveCount(0);
    }
    return ids.length;
  }

  /**
   * Each `<mask mask-type="alpha">` is applied by a `<g mask="url(#…)">`
   * wrapping the content, and the mask shape (`maskShapeTag`, e.g. `ellipse`)
   * is only drawn inside `<mask>`, not as visible content.
   */
  async expectAlphaMasksWrapContent(maskShapeTag: string): Promise<void> {
    const masks = await this.expectDefinitionsReferenced(this.alphaMasks, 'mask');
    await expect(
      this.maskedGroups,
      this.label('Each alpha mask should be applied by a <g> wrapper'),
    ).toHaveCount(masks);
    await expect(
      this.drawnOutsideMasks(maskShapeTag),
      this.label(`The mask ${maskShapeTag} should only be drawn inside <mask>`),
    ).toHaveCount(0);
  }

  /**
   * Renders the SVG on a canvas at its own size (1px = 1 SVG unit) and
   * returns the colour at (x, y). As in an `<img>`, linked Penpot images and
   * fonts are not loaded, which matches opening the file outside Penpot.
   */
  async pixelAt(x: number, y: number): Promise<Rgba> {
    const { width, height } = await this.size();
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
      { source: this.svg.source, width, height, x, y },
    );
  }

  /** Checks the colour at (x, y), allowing small anti-aliasing differences between browsers. */
  async expectPixel(
    x: number,
    y: number,
    expected: Rgba | 'transparent',
    message: string,
    tolerance = 4,
  ): Promise<void> {
    const actual = await this.pixelAt(x, y);
    const fullMessage = this.label(
      `${message}; pixel (${x}, ${y}) is rgba(${actual.r}, ${actual.g}, ${actual.b}, ${actual.a})`,
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

  /** Checks the opacity at (x, y) is within [min, max] (0-255), whatever the colour. */
  async expectAlphaBetween(
    x: number,
    y: number,
    min: number,
    max: number,
    message: string,
  ): Promise<void> {
    const { a } = await this.pixelAt(x, y);
    const fullMessage = this.label(`${message}; pixel (${x}, ${y}) alpha is ${a}`);
    expect(a, fullMessage).toBeGreaterThanOrEqual(min);
    expect(a, fullMessage).toBeLessThanOrEqual(max);
  }

  /** Adds a screenshot of the rendered SVG to the report, as evidence of the visual check. */
  async attachScreenshot(testInfo: TestInfo): Promise<void> {
    await testInfo.attach(`${this.svg.fileName} (${this.browserName})`, {
      body: await this.rootElement.screenshot(),
      contentType: 'image/png',
    });
  }
}
