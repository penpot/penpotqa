const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage,
  colorPalettePage,
  teamPage,
  dashboardPage,
  layersPanelPage,
  designPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  colorPalettePage = new ColorPalettePage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([487], 'Create Path (Toolbar) - closed'), async () => {
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-closed.png', {
    mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
  });
});

mainTest(qase([489], 'Create Path (Toolbar) - opened'), async () => {
  await mainPage.createDefaultOpenPath();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-opened.png', {
    mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
  });
});

mainTest(qase([1755], 'Add a cap for path'), async () => {
  await mainPage.createDefaultOpenPath();
  await mainPage.isCreatedLayerVisible();
  await designPanelPage.changeCap('Arrow', 'first');
  await designPanelPage.changeCap('Triangle', 'second');
  await mainPage.waitForChangeIsSaved();
  await mainPage.waitForResizeHandlerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-opened-with-cap.png', {
    mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultClosedPath();
  });

  mainTest(qase([492], 'Rename path with valid name'), async () => {
    await layersPanelPage.doubleClickLayerOnLayersTab('Path');
    await layersPanelPage.typeNameCreatedLayerAndEnter('renamed path');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed path');
  });

  mainTest(qase([497], 'Add, hide, unhide and delete Blur to Path'), async () => {
    await designPanelPage.clickAddBlurButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-default.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.hideBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-hide.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.unhideBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-unhide.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.removeBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-remove.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase([498], 'Add and edit Blur to Path'), async () => {
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase([512], 'Change rotation (Design page in the right)'), async () => {
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-90.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-120.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-45.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-359.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase([513], 'Delete Path (From right click)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([2543], 'Delete Path (From Keyboard)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(
    qase([518], 'Hide and show path (From right click and icons)'),
    async ({ page }) => {
      const path1 = 'Path #1';
      const path2 = 'Path #2';
      await layersPanelPage.doubleClickLayerOnLayersTab('Path');
      await layersPanelPage.typeNameCreatedLayerAndEnter(path1);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickCreatePathButton();
      await mainPage.clickViewportByCoordinates(200, 300);
      await mainPage.clickViewportByCoordinates(300, 500);
      await mainPage.clickViewportByCoordinates(100, 200);
      await mainPage.clickViewportByCoordinates(200, 300);
      await mainPage.clickOnDesignTab();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.doubleClickLayerOnLayersTab('Path');
      await layersPanelPage.typeNameCreatedLayerAndEnter(path2);
      await mainPage.clickViewportOnce();
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(path1);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('path-first-hide.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
      await layersPanelPage.hideLayerViaRightClickOnLayersTab(path2);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('path-second-hide.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(path2, false);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('path-second-show.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
      await layersPanelPage.unHideLayerViaRightClickOnLayersTab(path1);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('path-first-show.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
    },
  );

  mainTest(
    qase(
      [525],
      'Flip Vertical and Flip Horizontal path (From right click and Shortcut Shift +V Shift + H)',
    ),
    async () => {
      await mainPage.flipVerticalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-flipped-vertical.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await mainPage.flipHorizontalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-flipped-vertical-horizontal.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.flipVerticalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-flipped-horizontal.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await mainPage.flipHorizontalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-non-flipped-jpeg.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
    },
  );

  mainTest(qase([537], 'Selection to board'), async () => {
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-board.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultOpenPath();
  });

  mainTest(
    qase([494], 'Add, hide, unhide, change type and delete Shadow to Path'),
    async () => {
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-drop-shadow-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-drop-shadow-hide.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-drop-shadow-unhide.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-inner-shadow-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-inner-shadow-remove.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(qase([495], 'Add and edit Shadow to Path'), async () => {
    await designPanelPage.clickAddShadowButton();
    await designPanelPage.clickShadowActionsButton();
    await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.clickMoveButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-drop-shadow.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickMoveButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-inner-shadow.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });
});
