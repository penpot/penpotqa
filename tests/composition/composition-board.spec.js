const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');

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

mainTest('CO-1 Change color background', async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePage = new ColorPalettePage(page);
  const designPanelPage = new DesignPanelPage(page);
  await designPanelPage.clickCanvasBackgroundColorIcon();
  await colorPalettePage.setHex('#304d6a');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('color-background.png');
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 20000);
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest('CO-2 Create a board from toolbar', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('board.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('CO-4 Rename board with valid name', async ({ page }) => {
    const newName = 'New test board';
    const renamedName = 'renamed board';
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.doubleClickCreatedBoardTitleOnCanvas();
    await layersPanelPage.renameCreatedLayer(newName);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed(newName);

    await layersPanelPage.doubleClickLayerOnLayersTab(newName);
    await layersPanelPage.renameCreatedLayer(renamedName);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed(renamedName);
  });

  mainTest(
    'CO-9 Add, hide, unhide, change type and delete Shadow to board',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-drop-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-drop-shadow-hide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-drop-shadow-unhide.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-inner-shadow-default.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-inner-shadow-remove.png',
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest('CO-10 Add and edit Shadow to board', async ({ page }) => {
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
    await expect(mainPage.viewport).toHaveScreenshot('board-drop-shadow.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-inner-shadow.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('CO-12 Add, hide, unhide and delete Blur to board', async ({ page }) => {
    const mainPage = new MainPage(page);
    const colorPalettePage = new ColorPalettePage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickAddBlurButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-blur-default.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.hideBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-blur-hide.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.unhideBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-blur-unhide.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.removeBlur();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-blur-remove.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('CO-13 Add and edit Blur to board', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-blur.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('CO-14 Add, edit and delete Stroke to board', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickAddStrokeButton();
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-stroke-default.png', {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#43E50B',
      '60',
      '10',
      'Inside',
      'Dotted',
    );
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-inside-dotted.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '80',
      '5',
      'Outside',
      'Dashed',
    );
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-outside-dashed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '100',
      '3',
      'Center',
      'Solid',
    );
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-center-solid.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#F5358F',
      '40',
      '4',
      'Center',
      'Mixed',
    );
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-center-mixed.png',
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.removeStroke();
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-stroke-remove.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest('CO-25-1 Delete board via rightclick', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest('CO-25-2 Delete board via shortcut Del', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png');
  });

  mainTest('CO-28 Add rotation to board', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-rotated-90.png');
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-rotated-120.png');
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-rotated-45.png');
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-rotated-359.png');
  });

  mainTest('CO-29 Change border radius multiple values', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.clickIndividualCornersRadiusButton();
    await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-changed-corners.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest.skip(
    "CO-56 Click 'Focus off' board from shortcut F",
    async ({ page }) => {
      // todo bug 6359 > need to update after fix
      const mainPage = new MainPage(page);
      await mainPage.focusBoardViaRightClickOnCanvas('Board');
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerPresentOnLayersTab('Board', true);
      await mainPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('board-single-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await mainPage.focusLayerViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerPresentOnLayersTab('Board', true);
      await mainPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('board-single-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );

  mainTest('CO-411 Search board - ignore case', async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.doubleClickCreatedBoardTitleOnCanvas();
    await layersPanelPage.renameCreatedLayer('Test');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed('Test');
    await layersPanelPage.searchLayer('test');
    await layersPanelPage.isLayerSearched('Test');
  });

  mainTest('PENPOT-1756 Absolute positioned board moving', async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await designPanelPage.changeHeightAndWidthForLayer('400', '500');
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickCreatedBoardTitleOnCanvas();
    await layersPanelPage.renameCreatedLayer('Main Board');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(220, 220);
    await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropElementToElement('Board', 'Main Board');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.setFlexElementPositionAbsolute();
    await expect(mainPage.viewport).toHaveScreenshot('board-in-flex-board.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeAxisXandYForLayer('700', '600');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-in-flex-board-moved.png', {
      mask: [mainPage.guides],
    });
  });
});

test.describe(() => {
  test.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const board1 = 'Board #1';
    const board2 = 'Board #2';
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(100, 150);
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickBoardTitleOnCanvas('Board');
    await layersPanelPage.renameCreatedLayer(board1);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(250, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickBoardTitleOnCanvas('Board');
    await layersPanelPage.renameCreatedLayer(board2);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    'CO-33 Zoom to board by double click board icon on the list',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      await layersPanelPage.doubleClickLayerIconOnLayersTab(board1);
      await expect(mainPage.viewport).toHaveScreenshot('board-first-zoom.png', {
        mask: [mainPage.guides],
      });
      await layersPanelPage.doubleClickLayerIconOnLayersTab(board2);
      await expect(mainPage.viewport).toHaveScreenshot('board-second-zoom.png', {
        mask: [mainPage.guides],
      });
    },
  );

  mainTest(
    'CO-34 Hide and show board from rightclick and icons',
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board1);
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-first-hide.png', {
        mask: [mainPage.guides, mainPage.usersSection],
      });
      await mainPage.hideLayerViaRightClickOnCanvas(board2);
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-second-hide.png', {
        mask: [mainPage.guides, mainPage.usersSection],
      });
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board2, false);
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-second-show.png', {
        mask: [mainPage.guides, mainPage.usersSection],
      });
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board1, false);
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-first-show.png', {
        mask: [mainPage.guides, mainPage.usersSection],
      });
    },
  );

  mainTest.skip(
    "CO-53 Click 'Focus on' board from right click",
    async ({ page }) => {
      // todo bug 6359 > need to update after fix
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      await mainPage.focusBoardViaRightClickOnCanvas(board2);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab(board1, false);
      await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
      await layersPanelPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('board-second-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await layersPanelPage.clickOnFocusModeLabel();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab(board1, true);
      await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
      await layersPanelPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('board-second-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await mainPage.focusLayerViaRightClickOnLayersTab(board1);
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerPresentOnLayersTab(board1, true);
      await mainPage.isLayerPresentOnLayersTab(board2, false);
      await mainPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('board-first-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await mainPage.clickOnFocusModeLabel();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayerPresentOnLayersTab(board1, true);
      await mainPage.isLayerPresentOnLayersTab(board2, true);
      await mainPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('board-first-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );
});
