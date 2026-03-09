import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([2440], 'Create variants by design panel'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickOnComponentMenuButton();
  await designPanelPage.clickOnCreateVariantOption();
  await mainPage.waitForChangeIsSaved();

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
});

mainTest(qase([2396], 'Creating variants from a component group'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(100, 300);
  await designPanelPage.clickFillColorIcon();
  await colorPalettePage.setHex('#0ea27a');
  await mainPage.clickViewportOnce();
  await mainPage.clickOnLayerOnCanvas();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.isFillHexCodeSet('#0ea27a');
  await mainPage.createComponentViaRightClick();
  await mainPage.createDefaultRectangleByCoordinates(300, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.createGroupViaSelectAssets('Components', 'Test Group');
  await assetsPanelPage.combineAsVariantsGroup();
  await assetsPanelPage.expandComponentsGroupOnAssetsTab();
  await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
});

mainTest(
  qase([2425], 'Create variants by copying an existing component'),
  async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.copyLayerViaRightClick();
    await mainPage.pressPasteShortcut(browserName);
    await mainPage.clickViewportOnce();
    await expect(mainPage.viewport).toHaveScreenshot('copy-paste-variants.png', {
      mask: mainPage.maskViewport(),
    });
  },
);

mainTest(
  qase([2570], 'Create a variant by "+" button on Viewport (Component selected)'),
  async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaShortcut(browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createVariantViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.clickOnAddVariantViewportButton();
    await layersPanelPage.checkVariantLayerCount(3);
  },
);
