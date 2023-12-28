const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');

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

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 20000);
    const mainPage = new MainPage(page);
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest('CO-59 Create a rectangle from toolbar', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle.png');
  });

  mainTest.skip(
    // todo bug 6359 > need to update after fix
    "CO-68 Click 'Focus off' rectangle from shortcut F",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.focusLayerViaRightClickOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerPresentOnLayersTab('Rectangle', true);
      await mainPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('rectangle-single-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await mainPage.focusLayerViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerPresentOnLayersTab('Rectangle', true);
      await mainPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('rectangle-single-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );

  mainTest(
    'CO-69 Add, hide, unhide, change type and delete Shadow to rectangle',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-drop-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-drop-shadow-hide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-drop-shadow-unhide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-inner-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-inner-shadow-remove.png',
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest(
    'CO-72 Add, hide, unhide and delete Blur to rectangle',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const colorPalettePage = new ColorPalettePage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-blur-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.hideBlur();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-blur-hide.png', {
        mask: [mainPage.guides],
      });
      await designPanelPage.unhideBlur();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-blur-unhide.png', {
        mask: [mainPage.guides],
      });
      await designPanelPage.removeBlur();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-blur-remove.png', {
        mask: [mainPage.guides],
      });
    },
  );

  mainTest('CO-74 Add, edit and delete Stroke to rectangle', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddStrokeButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-stroke-default.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#43E50B',
      '60',
      '10',
      'Inside',
      'Dotted',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-stroke-inside-dotted.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '80',
      '5',
      'Outside',
      'Dashed',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-stroke-outside-dashed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '100',
      '3',
      'Center',
      'Solid',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-stroke-center-solid.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '40',
      '4',
      'Center',
      'Mixed',
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-stroke-center-mixed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.removeStroke();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-stroke-remove.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('CO-80 Rename rectangle with valid name', async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await layersPanelPage.doubleClickLayerOnLayersTab('Rectangle');
    await layersPanelPage.renameCreatedLayer('renamed rectangle');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed rectangle');
  });

  mainTest('CO-70 Add and edit Shadow to rectangle', async ({ page }) => {
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
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-drop-shadow.png');
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-inner-shadow.png');
  });

  mainTest('CO-73 Add and edit Blur to rectangle', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-blur.png');
  });

  mainTest('CO-76-1 Delete rectangle via rightclick', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest('CO-76-2 Delete rectangle via shortcut Del', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest('CO-62 Add rotation to rectangle', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-90.png');
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-120.png');
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-45.png');
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-359.png');
  });

  mainTest('CO-63 Change border radius multiple values', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickIndividualCornersRadiusButton();
    await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rectangle-changed-corners.png',
    );
    await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle.png');
  });

  mainTest('CO-104 Transform rectangle to path', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot('rectangle-to-path.png', {
      mask: [mainPage.usersSection],
    });
  });

  mainTest('CO-111 Selection to board', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rectangle-to-board.png', {
      mask: [mainPage.guides],
    });
  });
});
