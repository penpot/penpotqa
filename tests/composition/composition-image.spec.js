const { mainTest } = require('../../fixtures');
const { expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { qase } = require('playwright-qase-reporter/playwright');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');

const teamName = random().concat('autotest');

let teamPage,
  mainPage,
  dashboardPage,
  colorPalettePage,
  designPanelPage,
  layersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.uploadImage('images/images.png');
  });

  mainTest(
    qase([436], 'Import PNG image from toolbar and from shortcut (Shift+K)'),
    async () => {
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('image-png.png', {
        mask: await mainPage.maskViewport(),
      });
    },
  );

  mainTest(qase([440], 'Rename image with valid name'), async () => {
    await layersPanelPage.doubleClickLayerOnLayersTab('images');
    await layersPanelPage.typeNameCreatedLayerAndEnter('renamed image');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed image');
  });

  mainTest(
    qase([442], 'Add, hide, unhide, change type and delete Shadow to image'),
    async () => {
      await designPanelPage.clickAddShadowButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-drop-shadow-default.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await designPanelPage.hideShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-drop-shadow-hide.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await designPanelPage.unhideShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-drop-shadow-unhide.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-inner-shadow-default.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await designPanelPage.removeShadow();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-inner-shadow-remove.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest(qase([443], 'Add and edit Shadow to image'), async () => {
    await designPanelPage.clickAddShadowButton();
    await designPanelPage.clickShadowActionsButton();
    await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#304d6a');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-drop-shadow.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.selectTypeForShadow('Inner shadow');
    await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
    await designPanelPage.clickShadowColorIcon();
    await colorPalettePage.setHex('#96e637');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-inner-shadow.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(
    qase([459], 'Change border radius multiple values (Design page in the right)'),
    async () => {
      await designPanelPage.clickIndividualCornersRadiusButton();
      await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('image-changed-corners.png', {
        mask: await mainPage.maskViewport(),
      });
      await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('image-png.png', {
        mask: await mainPage.maskViewport(),
      });
    },
  );

  mainTest(qase([482], 'Selection to board'), async () => {
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-to-board.png', {
      mask: await mainPage.maskViewport(),
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([444], 'Add, hide, unhide and delete Blur to image'), async () => {
    await designPanelPage.clickAddBlurButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('image-blur-default.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.hideBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('image-blur-hide.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.unhideBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('image-blur-unhide.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.removeBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('image-blur-remove.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([446], 'Add, edit and delete Stroke to image'), async () => {
    await designPanelPage.clickAddStrokeButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('image-stroke-default.png', {
      mask: await mainPage.maskViewport(),
    });
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
      'image-stroke-inside-dotted.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
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
      'image-stroke-outside-dashed.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
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
      'image-stroke-center-solid.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
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
      'image-stroke-center-mixed.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.removeStroke();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('image-stroke-remove.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([457], 'Delete image (From right click)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(
    qase([460], 'Change border radius one value (Design page in the right)'),
    async () => {
      await designPanelPage.changeGeneralCornerRadiusForLayer('30');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('image-corners-30.png', {
        mask: await mainPage.maskViewport(),
      });
      await designPanelPage.changeGeneralCornerRadiusForLayer('90');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('image-corners-90.png', {
        mask: await mainPage.maskViewport(),
      });
      await designPanelPage.changeGeneralCornerRadiusForLayer('180');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('image-corners-180.png', {
        mask: await mainPage.maskViewport(),
      });
      await designPanelPage.changeGeneralCornerRadiusForLayer('0');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('image-corners-0.png', {
        mask: await mainPage.maskViewport(),
      });
    },
  );

  mainTest(qase([1270], 'Change rotation (Design page in the right)'), async () => {
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-rotated-90.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-rotated-120.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-rotated-45.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('image-rotated-359.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(
    qase(
      [474],
      'Flip Vertical and Flip Horizontal image (From right click and Shortcut Shift +V Shift + H)',
    ),
    async () => {
      await mainPage.flipVerticalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-flipped-vertical.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.flipHorizontalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-flipped-vertical-horizontal.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.flipVerticalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-flipped-horizontal.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.flipHorizontalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'image-non-flipped-jpeg.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.uploadImage('images/giphy.gif');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase([437], 'Import GIF image from toolbar and from shortcut (Shift+K)'),
    async () => {
      await mainPage.isCreatedLayerVisible();
    },
  );

  mainTest(qase([2542], 'Delete image (From Keyboard)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });
});

mainTest(
  qase(
    [2286],
    'Import rotated Exif JPEG images from toolbar and from shortcut (Shift+K)',
  ),
  async () => {
    await mainPage.uploadImage('images/exif_top_left.jpg');
    await layersPanelPage.isLayerWithNameSelected('exif_top_left');
    await designPanelPage.checkSizeWidth('1800');
    await designPanelPage.checkSizeHeight('1200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.uploadImageViaShortcut('images/exif_top_right.jpg');
    await layersPanelPage.isLayerWithNameSelected('exif_top_right');
    await designPanelPage.checkSizeWidth('1800');
    await designPanelPage.checkSizeHeight('1200');
  },
);
