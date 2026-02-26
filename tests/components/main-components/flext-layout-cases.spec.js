const { mainTest } = require('../../../fixtures');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../../pages/dashboard/team-page');
const { MainPage } = require('../../../pages/workspace/main-page');
const { random } = require('../../../helpers/string-generator');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../../pages/workspace/color-palette-page');
const { DesignPanelPage } = require('../../../pages/workspace/design-panel-page');
const { AssetsPanelPage } = require('../../../pages/workspace/assets-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let dashboardPage,
  teamPage,
  mainPage,
  layersPanelPage,
  designPanelPage,
  colorPalettePage,
  assetsPanelPage;
mainTest.beforeEach(async ({ page }) => {
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

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(
    'Add a flex layout board, rectangle and ellipse components',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await designPanelPage.changeHeightAndWidthForLayer('300', '300');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.createComponentViaRightClickFromLayerByName('Rectangle');
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultEllipseByCoordinates(300, 300);
      await mainPage.createComponentViaRightClickFromLayerByName('Ellipse');
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickCreatedBoardTitleOnCanvas();
    },
  );

  mainTest(
    qase(
      [1503, 1504],
      'Create flex board with main component and its copy, change direction and alignment',
    ),
    async () => {
      await mainTest.step(
        '(1503) Create flex board with main component and its copy, change direction',
        async () => {
          await designPanelPage.changeLayoutDirection('Column');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-component-change-board-direction.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await mainTest.step(
        '(1504) Create flex board with main component and its copy, change alingment',
        async () => {
          await designPanelPage.changeLayoutAlignment('Center');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-component-change-board-alignment.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();

    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      [1511],
      'Create component with 2 boards with components inside it. change paddings',
    ),
    async () => {
      await mainTest.slow();

      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeAxisXAndYForLayer('600', '200');

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
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest(
    qase([1514], 'Create component inside flex board, change alignment for element'),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutAlignment('Center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'component-inside-board-change-alignment.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );
});
