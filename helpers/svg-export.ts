import {
  chromium,
  expect,
  firefox,
  type BrowserType,
  type Download,
  type TestInfo,
} from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { ExportedSvgPage } from '@pages/exported-svg-page';

export type Rgba = { r: number; g: number; b: number; a: number };
export type SvgBrowserName = 'chromium' | 'firefox';

const browserTypes: Record<SvgBrowserName, BrowserType> = { chromium, firefox };

/**
 * An SVG file downloaded from Penpot, read straight from the Playwright
 * download (no files are written by the test).
 */
export class ExportedSvg {
  private constructor(
    readonly fileName: string,
    readonly source: string,
  ) {}

  static async fromDownload(download: Download): Promise<ExportedSvg> {
    return new ExportedSvg(
      download.suggestedFilename(),
      // Playwright keeps the download in its own artifacts folder until the test ends
      await readFile(await download.path(), 'utf-8'),
    );
  }

  expectFileName(expected: string): void {
    expect(this.fileName, 'Downloaded file name').toBe(expected);
  }

  expectXmlDeclaration(): void {
    expect(
      this.source.trimStart().startsWith('<?xml'),
      `${this.fileName} should start with an XML declaration`,
    ).toBe(true);
  }
}

/**
 * Opens the SVG in a fresh, session-less instance of each browser, checks it
 * has no XML errors and runs the same `check` in all of them. A screenshot of
 * each render is attached to the report when `testInfo` is passed.
 *
 * Only Chrome by default: it catches most export regressions and it's the only
 * browser installed in CI. Pass `browsers: ['chromium', 'firefox']` to also
 * check Firefox locally (`npx playwright install firefox`).
 */
export async function checkSvgInBrowsers(
  svg: ExportedSvg,
  check: (svgPage: ExportedSvgPage) => Promise<void>,
  {
    browsers = ['chromium'],
    testInfo,
  }: { browsers?: SvgBrowserName[]; testInfo?: TestInfo } = {},
): Promise<void> {
  for (const browserName of browsers) {
    // The runner merges the project's options (channel: 'chrome', clipboard
    // permissions) into every launch and context, so reset them here
    const browser = await browserTypes[browserName].launch({
      channel: browserName === 'chromium' ? 'chrome' : undefined,
    });
    try {
      const svgPage = new ExportedSvgPage(
        await browser.newPage({ permissions: [] }),
        browserName,
      );
      await svgPage.open(svg);
      await svgPage.expectNoXmlErrors();
      if (testInfo) await svgPage.attachScreenshot(testInfo);
      await check(svgPage);
    } finally {
      await browser.close();
    }
  }
}

export function hexToRgba(hex: string, alpha = 255): Rgba {
  const value = parseInt(hex.replace('#', ''), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255, a: alpha };
}
