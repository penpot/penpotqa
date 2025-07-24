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
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let mainPage,
  teamPage,
  dashboardPage,
  colorPalettePage,
  designPanelPage,
  layersPanelPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(qase(216, 'CO-1 Change color background'), async () => {
  await designPanelPage.clickCanvasBackgroundColorIcon();
  await colorPalettePage.setHex('#304d6a');
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('color-background.png', {
    mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 20000);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(217, 'CO-2 Create a board from toolbar'), async () => {
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('board.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(
    qase(219, 'Rename board (by double clicking) with valid name'),
    async () => {
      const newName = 'New test board';
      const renamedName = 'renamed board';
      // Rename board by double clicking on the board
      await mainPage.doubleClickCreatedBoardTitleOnCanvas();
      await mainPage.typeNameShapeLabelAndEnter(newName);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isBoardNameDisplayed(newName);
      // Rename board by double clicking on the board layer
      await layersPanelPage.doubleClickLayerOnLayersTab(newName);
      await layersPanelPage.typeNameCreatedLayerAndClickOnViewport(
        renamedName,
        900,
        100,
      );
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isBoardNameDisplayed(renamedName);
    },
  );

  mainTest(qase(1923, 'Rename board (by shortcut) with valid name'), async () => {
    const newName = 'New test board';
    const renamedName = 'renamed board';
    // rename by shortcut while the board is selected
    await layersPanelPage.clickShortcutAltN();
    await layersPanelPage.typeNameCreatedLayerAndClickOnViewport(newName, 900, 100);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed(newName);
    // try to rename by shortcut while nothing is selected
    await layersPanelPage.clickShortcutAltN();
    await layersPanelPage.isNotRenameLayerInputDisplayed();
    // rename by shortcut while the board layer is selected
    await layersPanelPage.selectLayerByName(newName);
    await layersPanelPage.clickShortcutAltN();
    await layersPanelPage.typeNameCreatedLayerAndEnter(renamedName);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed(renamedName);
  });

  mainTest(
    qase(1924, 'Rename board (by context menu) with valid name'),
    async () => {
      const newName = 'New test board';
      const renamedName = 'renamed board';
      // rename by RMB context menu while the board is selected
      await mainPage.renameCreatedBoardViaRightClick();
      await layersPanelPage.typeNameCreatedLayerAndClickOnViewport(
        newName,
        900,
        100,
      );
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isBoardNameDisplayed(newName);
      // rename by RMB context menu while the board layer is selected
      await layersPanelPage.renameLayerViaRightClick(newName);
      await layersPanelPage.typeNameCreatedLayerAndEnter(renamedName);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isBoardNameDisplayed(renamedName);
    },
  );

  mainTest(qase(220, 'CO-5 Rename board with empty field'), async () => {
    const defaultBoardName = 'Board';
    await mainPage.doubleClickCreatedBoardTitleOnCanvas();
    await layersPanelPage.clickOnBackspaceAndEnter();
    await layersPanelPage.isBoardNameDisplayed(defaultBoardName);
  });

  mainTest(
    qase(224, 'CO-9 Add, hide, unhide, change type and delete Shadow to board'),
    async () => {
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-drop-shadow-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-drop-shadow-hide.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-drop-shadow-unhide.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-inner-shadow-default.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-inner-shadow-remove.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(qase(225, 'CO-10 Add and edit Shadow to board'), async () => {
    await designPanelPage.clickAddShadowButton();
    await designPanelPage.clickShadowActionsButton();
    await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-drop-shadow.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-inner-shadow.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(
    qase(227, 'CO-12 Add, hide, unhide and delete Blur to board'),
    async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('board-blur-default.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await designPanelPage.hideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('board-blur-hide.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await designPanelPage.unhideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('board-blur-unhide.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await designPanelPage.removeBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('board-blur-remove.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
    },
  );

  mainTest(qase(228, 'CO-13 Add and edit Blur to board'), async () => {
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-blur.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase(229, 'CO-14 Add, edit and delete Stroke to board'), async () => {
    await designPanelPage.clickAddStrokeButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('board-stroke-default.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeStrokeSettings(
      '#43E50B',
      '60',
      '10',
      'Inside',
      'Dotted',
    );
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-inside-dotted.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-outside-dashed.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-center-solid.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
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
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-stroke-center-mixed.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.removeStroke();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('board-stroke-remove.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase(240, 'CO-25-1 Delete board via rightclick'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase(240, 'CO-25-2 Delete board via shortcut Del'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('empty-canvas.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(qase(243, 'CO-28 Add rotation to board'), async () => {
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-rotated-90.png');
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-rotated-120.png');
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-rotated-45.png');
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-rotated-359.png');
  });

  mainTest(qase(244, 'CO-29 Change border radius multiple values'), async () => {
    await designPanelPage.clickIndividualCornersRadiusButton();
    await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-changed-corners.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });

  mainTest(
    qase(271, "CO-56 Click 'Focus off' board from shortcut F"),
    async ({ page, browserName }) => {
      await mainPage.focusBoardViaRightClickOnCanvas('Board', browserName);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('Board', true);
      await layersPanelPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('board-single-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await mainPage.focusLayerViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab('Board', true);
      await layersPanelPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('board-single-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );

  mainTest(qase(604, 'CO-411 Search board - ignore case'), async () => {
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Test');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isBoardNameDisplayed('Test');
    await layersPanelPage.searchLayer('test');
    await layersPanelPage.isLayerSearched('Test');
  });

  mainTest(qase(1756, 'PENPOT-1756 Absolute positioned board moving'), async () => {
    await designPanelPage.changeHeightAndWidthForLayer('400', '500');
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.doubleClickLayerOnLayersTab('Board');
    await layersPanelPage.typeNameCreatedLayerAndEnter('Main Board');
    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(220, 220);
    await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropElementToElement('Board', 'Main Board');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.setFlexElementPositionAbsolute();
    await expect(mainPage.viewport).toHaveScreenshot('board-in-flex-board.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
    await mainPage.clickViewportByCoordinates(300, 100, 2);
    await layersPanelPage.selectBoardChildLayer('Board');
    await designPanelPage.changeAxisXandYForLayer('100', '100');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'board-in-flex-board-moved.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  });

  mainTest(
    qase(
      241,
      'Change board size, preset and orientation (Design page in the right)',
    ),
    async () => {
      const sizePresetsOptions = [
        'APPLE',
        'iPhone 16393 x 852',
        'iPhone 16 Pro402 x 874',
        'iPhone 16 Pro Max440 x 956',
        'iPhone 16 Plus430 x 932',
        '14/15 Pro Max430 x 932',
        'iPhone 15/15 Pro393 x 852',
        'iPhone 13/14 390 x 844',
        'iPhone 14 Plus428 x 926',
        'iPhone 13 Mini375 x 812',
        'iPhone SE320 x 568',
        'iPhone 12/12 Pro390 x 844',
        'iPhone 12 Mini360 x 780',
        'iPhone 12 Pro Max428 x 926',
        'iPhone X/XS/11 Pro375 x 812',
        'iPhone XS Max/XR/11414 x 896',
        'iPad768 x 1024',
        'iPad Mini 8.3in744 x 1133',
        'iPad Pro 10.5in834 x 1112',
        'iPad Pro 11in834 x 1194',
        'iPad Pro 12.9in1027 x 1366',
        'Watch Series 10416 x 496',
        'Watch 45mm396 x 484',
        'Watch 44mm368 x 448',
        'Watch 42mm312 x 390',
        'Watch 41mm352 x 430',
        'Watch 40mm324 x 394',
        'Watch 38mm272 x 340',
        'MacBook Air1280 x 832',
        'MacBook Pro 14in1512 x 982',
        'MacBook Pro 16in1728 x 1117',
        'ANDROID',
        'Expanded1280 x 800',
        'Compact412 x 917',
        'Large360 x 800',
        'Medium700 x 840',
        'Small360 x 640',
        'Mobile360 x 640',
        'Tablet768 x 1024',
        'Google Pixel 7 Pro1440 x 3120',
        'Google Pixel 6a/61080 x 2400',
        'Google Pixel 4a/5393 x 851',
        'Samsung Galaxy S221080 x 2340',
        'Samsung Galaxy S20+384 x 854',
        'Samsung Galaxy A71/A51412 x 914',
        'MICROSOFT',
        'Surface Pro 31440 x 960',
        'Surface Pro 4/5/6/71368 x 912',
        'Surface Pro 8140 x 960',
        'ReMarkable',
        'Remarkable 21404 x 1872',
        'Remarkable Pro1620 x 2160',
        'WEB',
        'Web 12801280 x 800',
        'Web 13661366 x 768',
        'Web 10241024 x 768',
        'Web 19201920 x 1080',
        'MIXED',
        'Desktop/Wireframe1440 x 1024',
        'TV1280 x 720',
        'Slide 16:91920 x 1080',
        'Slide 4:31027 x 768',
        'PRINT (96dpi)',
        'A03179 x 4494',
        'A12245 x 3179',
        'A21587 x 2245',
        'A31123 x 1587',
        'A4794 x 1123',
        'A5559 x 794',
        'A6397 x 559',
        'Letter816 x 1054',
        'DIN Lang835 x 413',
        'SOCIAL MEDIA',
        'Instagram profile320 x 320',
        'Instagram post1080 x 1350',
        'Instagram story1080 x 1920',
        'Facebook profile720 x 720',
        'Facebook cover820 x 312',
        'Facebook post1200 x 630',
        'LinkedIn profile400 x 400',
        'LinkedIn cover1584 x 396',
        'LinkedIn post520 x 320',
        'Bluesky profile400 x 400',
        'Bluesky cover3000 x 1000',
        'Bluesky post1080 x 1350',
        'X profile400 x 400',
        'X header1500 x 500',
        'X post1024 x 512',
        'YouTube profile800 x 800',
        'YouTube banner2560 x 1440',
        'YouTube cover2048 x 1152',
        'YouTube thumb1280 x 720',
      ];
      await mainPage.isCreatedLayerVisible();
      await designPanelPage.checkSizePresetsOptions(sizePresetsOptions);

      // Select iPhone 13/14 preset
      await designPanelPage.selectSizePresetsOption('iPhone 13/14 ');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('390');
      await designPanelPage.checkSizeHeight('844');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('844');
      await designPanelPage.checkSizeHeight('390');

      // Select iPad preset
      await designPanelPage.selectSizePresetsOption('iPad');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('768');
      await designPanelPage.checkSizeHeight('1024');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkSizeWidth('1024');
      await designPanelPage.checkSizeHeight('768');

      // Select Mobile preset
      await designPanelPage.selectSizePresetsOption('Mobile');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('360');
      await designPanelPage.checkSizeHeight('640');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkSizeWidth('640');
      await designPanelPage.checkSizeHeight('360');

      // Select Google Pixel 6a preset
      await designPanelPage.selectSizePresetsOption('Google Pixel 6a/6');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1080');
      await designPanelPage.checkSizeHeight('2400');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('2400');
      await designPanelPage.checkSizeHeight('1080');

      // Select Samsung S22 preset
      await designPanelPage.selectSizePresetsOption('Samsung Galaxy S22');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1080');
      await designPanelPage.checkSizeHeight('2340');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('2340');
      await designPanelPage.checkSizeHeight('1080');

      // Select Surface Pro 4/5/6/7 preset
      await designPanelPage.selectSizePresetsOption('Surface Pro 4/5/6/7');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1368');
      await designPanelPage.checkSizeHeight('912');
      await designPanelPage.clickOnVerticalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('912');
      await designPanelPage.checkSizeHeight('1368');

      // Select Remarkable 2 preset
      await designPanelPage.selectSizePresetsOption('Remarkable 2');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1404');
      await designPanelPage.checkSizeHeight('1872');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1872');
      await designPanelPage.checkSizeHeight('1404');

      // Select Web 1024 preset
      await designPanelPage.selectSizePresetsOption('Web 1024');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1024');
      await designPanelPage.checkSizeHeight('768');
      await designPanelPage.clickOnVerticalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('768');
      await designPanelPage.checkSizeHeight('1024');

      // Select A4 preset
      await designPanelPage.selectSizePresetsOption('A4');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('794');
      await designPanelPage.checkSizeHeight('1123');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1123');
      await designPanelPage.checkSizeHeight('794');

      // Select Instagram Story preset
      await designPanelPage.selectSizePresetsOption('Instagram story');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1080');
      await designPanelPage.checkSizeHeight('1920');
      await designPanelPage.clickOnHorizontalOrientationButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('1920');
      await designPanelPage.checkSizeHeight('1080');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }, testInfo) => {
    await testInfo.setTimeout(testInfo.timeout + 15000);
    const board1 = 'Board #1';
    const board2 = 'Board #2';
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(100, 150);
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickBoardTitleOnCanvas('Board');
    await mainPage.typeNameShapeLabelAndEnter(board1);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(250, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.doubleClickBoardTitleOnCanvas('Board');
    await mainPage.typeNameShapeLabelAndEnter(board2);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(248, 'CO-33 Zoom to board by double click board icon on the list'),
    async () => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      await layersPanelPage.doubleClickLayerIconOnLayersTab(board1);
      await expect(mainPage.viewport).toHaveScreenshot('board-first-zoom.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await layersPanelPage.doubleClickLayerIconOnLayersTab(board2);
      await expect(mainPage.viewport).toHaveScreenshot('board-second-zoom.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
    },
  );

  mainTest(
    qase(249, 'CO-34 Hide and show board from rightclick and icons'),
    async ({ page }) => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board1);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-first-hide.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
          mainPage.zoomButton,
        ],
      });
      await mainPage.hideLayerViaRightClickOnCanvas(board2);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-second-hide.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
          mainPage.zoomButton,
        ],
      });
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board2, false);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-second-show.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
          mainPage.zoomButton,
        ],
      });
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board1, false);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('board-first-show.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
          mainPage.zoomButton,
        ],
      });
    },
  );

  mainTest(qase(251, 'CO-36 Copy and Paste Board'), async ({ browserName }) => {
    const board1 = 'Board #1';
    await mainPage.copyLayerViaRightClick();
    await mainPage.pasteLayerViaRightClick();
    await layersPanelPage.copyLayerViaRightClick(board1, browserName);
    await mainPage.pasteLayerViaRightClick();
    await mainPage.pressCopyShortcut(browserName);
    await mainPage.pressPasteShortcut(browserName);
    browserName === 'firefox'
      ? await expect(layersPanelPage.sidebarLayerItem).toHaveCount(5)
      : await expect(layersPanelPage.sidebarLayerItem).toHaveCount(5);
  });

  mainTest(
    qase(268, "CO-53 Click 'Focus on' board from right click"),
    async ({ page, browserName }) => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      await mainPage.focusBoardViaRightClickOnCanvas(board2, browserName);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab(board1, false);
      await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
      await layersPanelPage.isFocusModeOn();
      await mainPage.waitForChangeIsSaved();
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
      await layersPanelPage.isLayerPresentOnLayersTab(board1, true);
      await layersPanelPage.isLayerPresentOnLayersTab(board2, false);
      await layersPanelPage.isFocusModeOn();
      await expect(page).toHaveScreenshot('board-first-focus-on.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
      await layersPanelPage.clickOnFocusModeLabel();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayerPresentOnLayersTab(board1, true);
      await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
      await layersPanelPage.isFocusModeOff();
      await expect(page).toHaveScreenshot('board-first-focus-off.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
      });
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('600', '600');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultEllipseByCoordinates(210, 210, true);
  });

  mainTest(qase(2040, 'Resize board to fit 2 elements'), async () => {
    await mainPage.createDefaultRectangleByCoordinates(320, 210, true);
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.clickOnResizeBoardToFitButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'resize-board-to-fit-2-elements.png',
      {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      },
    );
  });

  mainTest(
    qase(
      2050,
      'Resize board to fit content that goes partially outside of the board',
    ),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(180, 350, true);
      await mainPage.clickViewportOnce();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.clickOnResizeBoardToFitButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'resize-board-to-fit-partially-outside.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );
});
