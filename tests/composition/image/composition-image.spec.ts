import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = random().concat('autotest');

let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
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

mainTest.describe('PNG image', () => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.uploadImage('images/images.png');
  });

  mainTest(
    qase([436], 'Import PNG image from toolbar and from shortcut (Shift+K)'),
    async () => {
      await mainTest.step(
        'Wait for image to be saved and verify layer',
        async () => {
          await mainPage.waitForChangeIsSaved();
          await mainPage.isCreatedLayerVisible();
        },
      );

      await mainTest.step('Verify PNG image screenshot', async () => {
        await expect(
          mainPage.viewport,
          'PNG image should match snapshot',
        ).toHaveScreenshot('image-png.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([440], 'Rename image with valid name'), async () => {
    await mainTest.step('Rename image layer', async () => {
      await layersPanelPage.doubleClickLayerOnLayersTab('images');
      await layersPanelPage.typeNameCreatedLayerAndEnter('renamed image');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify layer name is updated', async () => {
      await layersPanelPage.isLayerNameDisplayed('renamed image');
    });
  });

  mainTest(
    qase([442], 'Add, hide, unhide, change type and delete Shadow to image'),
    async () => {
      await mainTest.step('Add shadow and verify default state', async () => {
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(
          mainPage.viewport,
          'Drop shadow default should match snapshot',
        ).toHaveScreenshot('image-drop-shadow-default.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Hide shadow and verify', async () => {
        await designPanelPage.hideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(
          mainPage.viewport,
          'Hidden drop shadow should match snapshot',
        ).toHaveScreenshot('image-drop-shadow-hide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Unhide shadow and verify', async () => {
        await designPanelPage.unhideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(
          mainPage.viewport,
          'Unhidden drop shadow should match snapshot',
        ).toHaveScreenshot('image-drop-shadow-unhide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step(
        'Change shadow type to inner shadow and verify',
        async () => {
          await designPanelPage.selectTypeForShadow('Inner shadow');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(
            mainPage.viewport,
            'Inner shadow default should match snapshot',
          ).toHaveScreenshot('image-inner-shadow-default.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step('Remove shadow and verify', async () => {
        await designPanelPage.removeShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(
          mainPage.viewport,
          'Removed inner shadow should match snapshot',
        ).toHaveScreenshot('image-inner-shadow-remove.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([443], 'Add and edit Shadow to image'), async () => {
    await mainTest.step('Add and configure drop shadow', async () => {
      await designPanelPage.clickAddShadowButton();
      await designPanelPage.clickShadowActionsButton();
      await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify drop shadow screenshot', async () => {
      await expect(
        mainPage.viewport,
        'Drop shadow should match snapshot',
      ).toHaveScreenshot('image-drop-shadow.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change to inner shadow and configure', async () => {
      await designPanelPage.selectTypeForShadow('Inner shadow');
      await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#96e637');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify inner shadow screenshot', async () => {
      await expect(
        mainPage.viewport,
        'Inner shadow should match snapshot',
      ).toHaveScreenshot('image-inner-shadow.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([459], 'Change border radius multiple values (Design page in the right)'),
    async () => {
      await mainTest.step('Set individual corner radii and verify', async () => {
        await designPanelPage.clickIndividualCornersRadiusButton();
        await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Changed corners should match snapshot',
        ).toHaveScreenshot('image-changed-corners.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Reset corners to 0 and verify', async () => {
        await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Reset corners should match PNG snapshot',
        ).toHaveScreenshot('image-png.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([482], 'Selection to board'), async () => {
    await mainTest.step('Convert selection to board', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.selectionToBoardViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify image converted to board screenshot', async () => {
      await expect(
        mainPage.viewport,
        'Image converted to board should match snapshot',
      ).toHaveScreenshot('image-to-board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});

mainTest.describe('JPEG image', () => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([444], 'Add, hide, unhide and delete Blur to image'), async () => {
    await mainTest.step('Add blur and verify default state', async () => {
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Blur default should match snapshot',
      ).toHaveScreenshot('image-blur-default.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Hide blur and verify', async () => {
      await designPanelPage.hideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Hidden blur should match snapshot',
      ).toHaveScreenshot('image-blur-hide.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Unhide blur and verify', async () => {
      await designPanelPage.unhideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Unhidden blur should match snapshot',
      ).toHaveScreenshot('image-blur-unhide.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Remove blur and verify', async () => {
      await designPanelPage.removeBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Removed blur should match snapshot',
      ).toHaveScreenshot('image-blur-remove.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([446], 'Add, edit and delete Stroke to image'), async () => {
    await mainTest.step('Add stroke and verify default state', async () => {
      await designPanelPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Default stroke should match snapshot',
      ).toHaveScreenshot('image-stroke-default.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change stroke to inside dotted and verify', async () => {
      await designPanelPage.changeStrokeSettings(
        '#43E50B',
        '60',
        '10',
        'Inside',
        'Dotted',
      );
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Inside dotted stroke should match snapshot',
      ).toHaveScreenshot('image-stroke-inside-dotted.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change stroke to outside dashed and verify', async () => {
      await designPanelPage.changeStrokeSettings(
        '#F5358F',
        '80',
        '5',
        'Outside',
        'Dashed',
      );
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Outside dashed stroke should match snapshot',
      ).toHaveScreenshot('image-stroke-outside-dashed.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change stroke to center solid and verify', async () => {
      await designPanelPage.changeStrokeSettings(
        '#F5358F',
        '100',
        '3',
        'Center',
        'Solid',
      );
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Center solid stroke should match snapshot',
      ).toHaveScreenshot('image-stroke-center-solid.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change stroke to center mixed and verify', async () => {
      await designPanelPage.changeStrokeSettings(
        '#F5358F',
        '40',
        '4',
        'Center',
        'Mixed',
      );
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Center mixed stroke should match snapshot',
      ).toHaveScreenshot('image-stroke-center-mixed.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Remove stroke and verify', async () => {
      await designPanelPage.removeStroke();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(
        mainPage.viewport,
        'Removed stroke should match snapshot',
      ).toHaveScreenshot('image-stroke-remove.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([457], 'Delete image (From right click)'), async () => {
    await mainTest.step('Verify image layer is visible', async () => {
      await mainPage.isCreatedLayerVisible();
    });

    await mainTest.step(
      'Delete image via right click and verify removal',
      async () => {
        await mainPage.deleteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible(false);
      },
    );
  });

  mainTest(
    qase([460], 'Change border radius one value (Design page in the right)'),
    async () => {
      await mainTest.step('Set corner radius to 30 and verify', async () => {
        await designPanelPage.changeGeneralCornerRadiusForLayer('30');
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Corner radius 30 should match snapshot',
        ).toHaveScreenshot('image-corners-30.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Set corner radius to 90 and verify', async () => {
        await designPanelPage.changeGeneralCornerRadiusForLayer('90');
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Corner radius 90 should match snapshot',
        ).toHaveScreenshot('image-corners-90.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Set corner radius to 180 and verify', async () => {
        await designPanelPage.changeGeneralCornerRadiusForLayer('180');
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Corner radius 180 should match snapshot',
        ).toHaveScreenshot('image-corners-180.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Reset corner radius to 0 and verify', async () => {
        await designPanelPage.changeGeneralCornerRadiusForLayer('0');
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Corner radius 0 should match snapshot',
        ).toHaveScreenshot('image-corners-0.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([1270], 'Change rotation (Design page in the right)'), async () => {
    await mainTest.step('Set rotation to 90 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 90 should match snapshot',
      ).toHaveScreenshot('image-rotated-90.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Set rotation to 120 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 120 should match snapshot',
      ).toHaveScreenshot('image-rotated-120.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Set rotation to 45 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 45 should match snapshot',
      ).toHaveScreenshot('image-rotated-45.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Set rotation to 360 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 360 should match snapshot',
      ).toHaveScreenshot('image-rotated-359.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase(
      [474],
      'Flip Vertical and Flip Horizontal image (From right click and Shortcut Shift +V Shift + H)',
    ),
    async () => {
      await mainTest.step(
        'Flip image vertically via right click and verify',
        async () => {
          await mainPage.flipVerticalViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped vertical should match snapshot',
          ).toHaveScreenshot('image-flipped-vertical.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        'Flip image horizontally via right click and verify',
        async () => {
          await mainPage.flipHorizontalViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped vertical and horizontal should match snapshot',
          ).toHaveScreenshot('image-flipped-vertical-horizontal.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        'Flip image vertically via shortcut and verify',
        async () => {
          await mainPage.flipVerticalViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped horizontal should match snapshot',
          ).toHaveScreenshot('image-flipped-horizontal.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        'Flip image horizontally via shortcut and verify',
        async () => {
          await mainPage.flipHorizontalViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Non-flipped JPEG should match snapshot',
          ).toHaveScreenshot('image-non-flipped-jpeg.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});

mainTest.describe('GIF image', () => {
  mainTest.beforeEach(async () => {
    await mainPage.uploadImage('images/giphy.gif');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase([437], 'Import GIF image from toolbar and from shortcut (Shift+K)'),
    async () => {
      await mainTest.step('Verify GIF layer is visible', async () => {
        await mainPage.isCreatedLayerVisible();
      });
    },
  );

  mainTest(qase([2542], 'Delete image (From Keyboard)'), async () => {
    await mainTest.step('Verify layer is visible', async () => {
      await mainPage.isCreatedLayerVisible();
    });

    await mainTest.step(
      'Delete image via keyboard shortcut and verify removal',
      async () => {
        await mainPage.deleteLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible(false);
      },
    );
  });
});

mainTest(
  qase(
    [2286],
    'Import rotated Exif JPEG images from toolbar and from shortcut (Shift+K)',
  ),
  async () => {
    await mainTest.step(
      'Upload exif_top_left.jpg and verify dimensions',
      async () => {
        await mainPage.uploadImage('images/exif_top_left.jpg');
        await layersPanelPage.isLayerWithNameSelected('exif_top_left');
        await designPanelPage.checkSizeWidth('1800');
        await designPanelPage.checkSizeHeight('1200');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Upload exif_top_right.jpg via shortcut and verify dimensions',
      async () => {
        await mainPage.uploadImageViaShortcut('images/exif_top_right.jpg');
        await layersPanelPage.isLayerWithNameSelected('exif_top_right');
        await designPanelPage.checkSizeWidth('1800');
        await designPanelPage.checkSizeHeight('1200');
      },
    );
  },
);
