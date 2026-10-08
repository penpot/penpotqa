import { expect } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { MainPage } from '@pages/workspace/main-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { ProfilePage } from '@pages/profile-page';
import { ExportedSvg, checkSvgInBrowsers, hexToRgba } from 'helpers/svg-export';

// Helper file shared by the "Export (WebGL) > Export SVG" Qase suite
const exporterFile = 'documents/test_exporter_file.penpot';
const exporterPage = 'Export QA';
const maskFill = hexToRgba('#3D7BFF');

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let pagesPanelPage: PagesPanelPage;
let profilePage: ProfilePage;

demoAccountApiFixture.beforeEach(
  'Enable WebGL rendering and open the helper file',
  async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);
    pagesPanelPage = new PagesPanelPage(page);
    profilePage = new ProfilePage(page);

    await profilePage.enableWebglRendering();
    await profilePage.backToDashboardFromAccount();
    await dashboardPage.importAndOpenFile(exporterFile);
    await mainPage.isMainPageLoaded();
  },
);

demoAccountApiFixture(
  qase(
    [3937],
    'SVG export of masked groups uses alpha masks, including soft masks and masks with shadows',
  ),
  async ({}, testInfo) => {
    await demoAccountApiFixture.step(
      'Open the "Export QA" page of the helper file',
      async () => {
        await pagesPanelPage.getPageListItemByName(exporterPage).click();
        await expect(
          pagesPanelPage.selectedPageItems,
          `"${exporterPage}" page should be selected`,
        ).toHaveText(exporterPage);
      },
    );

    await demoAccountApiFixture.step(
      'Export "Masked" as SVG and check it',
      async () => {
        await layersPanelPage.clickLayerOnLayersTab('Masked');
        await layersPanelPage.isLayerWithNameSelected('Masked');
        const svg = await ExportedSvg.fromDownload(
          await designPanelPage.exportSelectionAs('SVG'),
        );
        svg.expectFileName('Masked.svg');
        svg.expectXmlDeclaration();
        // 120x80 export; the mask ellipse fills it (centre 60,40). The blue fill
        // is under the whole group and the photo covers its right half.
        await checkSvgInBrowsers(
          svg,
          async (svgPage) => {
            await svgPage.expectAlphaMasksWrapContent('ellipse');
            await expect(
              svgPage.maskedGroups.locator(svgPage.penpotImages),
              'The photo should be an <image> linked to the Penpot instance, inside the masked group',
            ).toHaveCount(1);
            await svgPage.expectPixel(
              30,
              40,
              maskFill,
              'Blue fill should show inside the ellipse',
            );
            await svgPage.expectPixel(
              3,
              3,
              'transparent',
              'Nothing should show outside the ellipse',
            );
            // Penpot images are not served outside Penpot, so the fill behind shows
            await svgPage.expectPixel(
              90,
              40,
              maskFill,
              'The photo should not load outside Penpot (expected)',
            );
          },
          { testInfo },
        );
      },
    );

    await demoAccountApiFixture.step(
      'Export "Soft mask" as SVG and check it',
      async () => {
        await layersPanelPage.clickLayerOnLayersTab('Soft mask');
        await layersPanelPage.isLayerWithNameSelected('Soft mask');
        const svg = await ExportedSvg.fromDownload(
          await designPanelPage.exportSelectionAs('SVG'),
        );
        svg.expectFileName('Soft mask.svg');
        // Same geometry as "Masked"; the mask ellipse has 40% fill opacity
        await checkSvgInBrowsers(
          svg,
          async (svgPage) => {
            await svgPage.expectAlphaMasksWrapContent('ellipse');
            await svgPage.expectAlphaBetween(
              60,
              40,
              0.4 * 255 - 5,
              0.4 * 255 + 5,
              'Content should be partly see-through (40% mask opacity), as on the canvas',
            );
            await svgPage.expectPixel(
              3,
              3,
              'transparent',
              'Nothing should show outside the ellipse',
            );
          },
          { testInfo },
        );
      },
    );

    await demoAccountApiFixture.step(
      'Export "Masked shadow" as SVG and check it',
      async () => {
        await layersPanelPage.clickLayerOnLayersTab('Masked shadow');
        await layersPanelPage.isLayerWithNameSelected('Masked shadow');
        const svg = await ExportedSvg.fromDownload(
          await designPanelPage.exportSelectionAs('SVG'),
        );
        svg.expectFileName('Masked shadow.svg');
        // The masked ellipse (centre 73,53, 120x80) has an inner shadow and a
        // drop shadow that sits 10px lower-right (ellipse centre 83,63, so its
        // bounding box ends at 143,103).
        await checkSvgInBrowsers(
          svg,
          async (svgPage) => {
            await svgPage.expectAlphaMasksWrapContent('ellipse');
            await svgPage.expectDefinitionsReferenced(svgPage.filters, 'filter');
            await svgPage.expectPixel(
              73,
              53,
              maskFill,
              'Blue fill should show inside the ellipse',
            );
            await svgPage.expectAlphaBetween(
              138,
              63,
              60,
              160,
              'Drop shadow should show past the right edge of the ellipse',
            );
            await svgPage.expectAlphaBetween(
              100,
              98,
              60,
              160,
              'Drop shadow should show below the bottom edge of the ellipse',
            );
            await svgPage.expectPixel(
              140,
              98,
              'transparent',
              'Drop shadow should follow the ellipse, not a rectangle (empty corner)',
            );
          },
          { testInfo },
        );
      },
    );
  },
);
