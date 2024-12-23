const { mainTest } = require('../../../fixtures');
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { MainPage } = require('../../../pages/workspace/main-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { updateTestResults } = require('./../../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let dashboardPage,
  teamPage,
  mainPage,
  layersPanelPage,
  designPanelPage,
  colorPalettePage,
  assetsPanelPage;
test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({}, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);

    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await mainPage.createDefaultBoardByCoordinates(400, 200);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');

    await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickLayerOnLayersTab('Ellipse');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await designPanelPage.changeAxisXandYForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      1503,
      'PENPOT-1503 Create flex board with main component and its copy, change direction',
    ),
    async () => {
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutDirection('Column');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-component-change-board-direction.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase(
      1504,
      'PENPOT-1504 Create flex board with main component and its copy, change alingment',
    ),
    async () => {
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutAlignment('Center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'main-component-change-board-alignment.png',
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);

    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      1511,
      'PENPOT-1511 Create component with 2 boards with components inside it. change paddings',
    ),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 20000);

      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeAxisXandYForLayer('600', '200');

      await mainPage.createDefaultBoardByCoordinates(200, 200, true);
      await designPanelPage.changeHeightAndWidthForLayer('300', '300');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addFlexLayoutViaRightClickForNComponent(1);
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultEllipseByCoordinates(200, 200, true);
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickMainMenuButton();
      await mainPage.clickEditMainMenuItem();
      await mainPage.clickSelectAllMainMenuSubItem();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createComponentsMultipleShapesRightClick(true);
      await mainPage.waitForChangeIsSaved();

      await mainPage.addFlexLayoutViaRightClickForNComponent('0');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeLayoutPadding('Vertical', '20');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeLayoutPadding('Horizontal', '40');
      await mainPage.waitForChangeIsSaved();

      await expect(mainPage.viewport).toHaveScreenshot(
        'component-inside-board-change-paddings.png',
      );
    },
  );

  mainTest(
    qase(
      1514,
      'PENPOT-1514 Create component inside flex board, change alignment for element',
    ),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutAlignment('Center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-inside-board-change-alignment.png',
      );
    },
  );
});
