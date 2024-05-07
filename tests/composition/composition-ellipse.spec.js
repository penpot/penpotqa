const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(testInfo.timeout + 20000);
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(327,'CO-112 Create an ellipse from toolbar'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse.png');
  });

  mainTest(qase(329,'CO-114 Rename ellipse with valid name'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await layersPanelPage.doubleClickLayerOnLayersTab('Ellipse');
    await layersPanelPage.renameCreatedLayer('renamed ellipse');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed ellipse');
  });

  mainTest(
    qase(332,'CO-117 Add, hide, unhide, change type and delete Shadow to ellipse'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-drop-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-drop-shadow-hide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-drop-shadow-unhide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-inner-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-inner-shadow-remove.png',
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest(qase(333,'CO-118 Add and edit Shadow to ellipse'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddShadowButton();
    await designPanelPage.clickShadowActionsButton();
    await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-drop-shadow.png');

    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-inner-shadow.png');
  });

  mainTest(
    qase(334,'CO-119 Add, hide, unhide and delete Blur to ellipse'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const colorPalettePage = new ColorPalettePage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-default.png', {
        mask: [mainPage.guides],
      });
      await designPanelPage.hideBlur();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-hide.png', {
        mask: [mainPage.guides],
      });
      await designPanelPage.unhideBlur();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-unhide.png', {
        mask: [mainPage.guides],
      });
      await designPanelPage.removeBlur();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-remove.png', {
        mask: [mainPage.guides],
      });
    },
  );

  mainTest(qase(335,'CO-120 Add and edit Blur to ellipse'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur.png');
  });

  mainTest(qase(336,'CO-121 Add, edit and delete Stroke to ellipse'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddStrokeButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-stroke-default.png', {
      mask: [mainPage.guides],
    });
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeStrokeSettings(
      '#43E50B',
      '70',
      '13',
      'Inside',
      'Dotted',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-stroke-inside-dotted.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '80',
      '5',
      'Outside',
      'Dashed',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-stroke-outside-dashed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '100',
      '3',
      'Center',
      'Solid',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-stroke-center-solid.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '40',
      '4',
      'Center',
      'Mixed',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'ellipse-stroke-center-mixed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.removeStroke();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-stroke-remove.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(
    qase(341,"CO-126 Click 'Focus off' ellipse from shortcut F"),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      await mainPage.focusLayerViaRightClickOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
      await layersPanelPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('ellipse-single-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await mainPage.focusLayerViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
      await layersPanelPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('ellipse-single-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );

  mainTest(qase(351,'CO-136-1 Delete ellipse via rightclick'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest(qase(351,'CO-136-2 Delete ellipse via shortcut Del'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest(qase(353,'CO-138 Add rotation to ellipse'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-90.png');
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-120.png');
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-45.png');
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-359.png');
  });

  mainTest(qase(369,'CO-154 Transform ellipse to path'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot('ellipse-to-path.png', {
      mask: [mainPage.usersSection, mainPage.guides],
    });
  });

  mainTest(qase(376,'CO-161 Selection to board'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('ellipse-to-board.png', {
      mask: [mainPage.guides],
    });
  });
});
