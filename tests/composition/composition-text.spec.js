const { mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { InspectPanelPage } = require('../../pages/workspace/inspect-panel-page');
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
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 20000);
    const mainPage = new MainPage(page);
    await mainPage.createDefaultTextLayer(browserName);
  });

  mainTest(qase(377,'CO-162 Create a text from toolbar'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('text.png');
  });

  mainTest(qase(380,'CO-165 Add rotation to text'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rotated-90.png');
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rotated-120.png');
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rotated-45.png');
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rotated-359.png');
  });

  mainTest(
    qase(381,'CO-166 Add, hide, unhide, change type and delete Shadow to Text'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-drop-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-drop-shadow-hide.png', {
        mask: [mainPage.guides],
      });
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-drop-shadow-unhide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-inner-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-inner-shadow-remove.png',
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest(qase(382,'CO-167 Add and edit Shadow to text'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddShadowButton();
    await designPanelPage.clickShadowActionsButton();
    await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.clickMoveButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-drop-shadow.png');
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-inner-shadow.png');
  });

  mainTest(qase(384,'CO-169 Add, hide, unhide and delete Blur to text'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickAddBlurButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-blur-default.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.hideBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-blur-hide.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.unhideBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-blur-unhide.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.removeBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-blur-remove.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(385,'CO-170 Add and edit Blur to text'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-blur.png');
  });

  mainTest(qase(386,'CO-171 Add, edit and delete Stroke to Text'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddStrokeButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-stroke-default.png', {
      mask: [mainPage.guides],
    });
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings('#43E50B', '60', '10', 'Inside');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'text-stroke-inside-dotted.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings('#F5358F', '80', '5', 'Outside');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'text-stroke-outside-dashed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings('#F5358F', '100', '3', 'Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'text-stroke-center-solid.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.changeStrokeSettings('#F5358F', '40', '4', 'Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'text-stroke-center-mixed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.removeStroke();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-stroke-remove.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(388,'CO-173-1 Delete text via rightclick'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest(qase(388,'CO-173-2 Delete text via shortcut Del'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest(qase(392,'CO-177 Rename text with valid name'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await layersPanelPage.doubleClickLayerOnLayersTab('Hello World!');
    await layersPanelPage.renameCreatedLayer('renamed text');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed text');
  });

  mainTest(qase(424,'CO-209 Change text uppercase, lowercase'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeTextCase('Upper');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-upper-case.png');
    await designPanelPage.changeTextCase('Title');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-title-case.png');
    await designPanelPage.changeTextCase('Lower');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-lower-case.png');
  });

  mainTest(qase(425,'CO-210 Change alignment'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await designPanelPage.changeTextAlignment('Middle');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-align-middle.png');
    await designPanelPage.changeTextAlignment('Bottom');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-align-bottom.png');
    await designPanelPage.changeTextAlignment('Top');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-align-top.png');
  });

  mainTest(qase(427,'CO-212 Change RTL/LTR'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeTextDirection('RTL');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rtl.png', {
      maxDiffPixels: 30,
    });
    await designPanelPage.changeTextDirection('LTR');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-ltr.png', {
      maxDiffPixels: 40,
    });
  });

  mainTest(
    qase(431,'CO-216 Change text color and opacity by typing color code, PENPOT-1753 Check text color in inspect mode'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const colorPalettePage = new ColorPalettePage(page);
      const designPanelPage = new DesignPanelPage(page);
      const inspectPanelPage = new InspectPanelPage(page);
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await designPanelPage.changeOpacityForFill('50');
      await mainPage.clickMoveButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-fill-opacity.png');
      await inspectPanelPage.openInspectTab();
      await expect(inspectPanelPage.textBlockOnInspect).toHaveScreenshot(
        'inspect-text-block-color.png',
      );
    },
  );

  mainTest(qase(434,'CO-219 Selection to board'), async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-to-board.png', {
      mask: [mainPage.guides],
    });
  });
});
