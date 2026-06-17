import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  dashboardPage = new DashboardPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([275], 'Create Rectangle (Shortcut R)'), async () => {
  await mainTest.step(
    'Press R shortcut and verify rectangle tool is active',
    async () => {
      await mainPage.pressKeyboardShortcut('R');
    },
  );

  await mainTest.step(
    'Click on canvas and verify rectangle with default size is created',
    async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([274], 'Create Rectangle (Toolbar)'), async () => {
    await mainTest.step('Verify rectangle layer is created', async () => {
      await mainPage.isCreatedLayerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([283], 'Click "Focus off" rectangle from shortcut (F)'),
    async ({ page }) => {
      await mainTest.step('Focus on rectangle via right click', async () => {
        await mainPage.focusLayerViaRightClickOnCanvas();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify focus mode is on', async () => {
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', true);
        await layersPanelPage.isFocusModeOn();
        await expect(page).toHaveScreenshot('rectangle-single-focus-on.png', {
          mask: [
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
            mainPage.usersSection,
            mainPage.zoomButton,
          ],
        });
      });

      await mainTest.step('Focus off via F shortcut', async () => {
        await mainPage.focusLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify focus mode is off', async () => {
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', true);
        await layersPanelPage.isFocusModeOff();
        await expect(page).toHaveScreenshot('rectangle-single-focus-off.png', {
          mask: [
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
            mainPage.usersSection,
            mainPage.zoomButton,
          ],
        });
      });
    },
  );

  mainTest(
    qase([284], 'Add, hide, unhide, change type and delete Shadow to rectangle'),
    async () => {
      await mainTest.step('Add drop shadow and verify default state', async () => {
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-drop-shadow-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Hide shadow and verify', async () => {
        await designPanelPage.hideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-drop-shadow-hide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Unhide shadow and verify', async () => {
        await designPanelPage.unhideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-drop-shadow-unhide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step(
        'Change shadow type to inner shadow and verify',
        async () => {
          await designPanelPage.selectTypeForShadow('Inner shadow');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-inner-shadow-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await mainTest.step('Remove shadow and verify', async () => {
        await designPanelPage.removeShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-inner-shadow-remove.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(
    qase([287], 'Add, hide, unhide and delete Blur to rectangle'),
    async () => {
      await mainTest.step('Set fill color and add blur', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#304d6a');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickAddBlurButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await mainTest.step('Verify blur is applied', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-blur-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Hide blur and verify', async () => {
        await designPanelPage.hideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('rectangle-blur-hide.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Unhide blur and verify', async () => {
        await designPanelPage.unhideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-blur-unhide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Remove blur and verify', async () => {
        await designPanelPage.removeBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-blur-remove.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(qase([289], 'Add, edit and delete Stroke to rectangle'), async () => {
    await mainTest.step('Add stroke and verify default state', async () => {
      await designPanelPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-stroke-default.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply inside dotted stroke and verify', async () => {
      await mainPage.clickOnLayerOnCanvas();
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
        'rectangle-stroke-inside-dotted.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply outside dashed stroke and verify', async () => {
      await mainPage.clickOnLayerOnCanvas();
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
        'rectangle-stroke-outside-dashed.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply center solid stroke and verify', async () => {
      await mainPage.clickOnLayerOnCanvas();
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
        'rectangle-stroke-center-solid.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply center mixed stroke and verify', async () => {
      await mainPage.clickOnLayerOnCanvas();
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
        'rectangle-stroke-center-mixed.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Remove stroke and verify', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.removeStroke();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-stroke-remove.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([295], 'Rename rectangle with valid name'), async () => {
    await mainTest.step('Rename the rectangle layer', async () => {
      await layersPanelPage.doubleClickLayerOnLayersTab('Rectangle');
      await layersPanelPage.typeNameCreatedLayerAndEnter('renamed rectangle');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify layer has the new name', async () => {
      await layersPanelPage.isLayerNameDisplayed('renamed rectangle');
    });
  });

  mainTest(qase([285], 'Add and edit Shadow to rectangle'), async () => {
    await mainTest.step('Add and configure drop shadow', async () => {
      await designPanelPage.clickAddShadowButton();
      await designPanelPage.clickShadowActionsButton();
      await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify drop shadow appearance', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-drop-shadow.png', {
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

    await mainTest.step('Verify inner shadow appearance', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-inner-shadow.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([288], 'Add and edit Blur to rectangle'), async () => {
    await mainTest.step('Add blur and change value', async () => {
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('55');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
    });

    await mainTest.step('Verify blur appearance', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-blur.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([291], 'Delete Rectangle (From right click)'), async () => {
    await mainTest.step(
      'Verify rectangle is visible and delete via right click',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify rectangle is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(qase([2544], 'Delete Rectangle (From Keyboard)'), async () => {
    await mainTest.step(
      'Verify rectangle is visible and delete via keyboard',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify rectangle is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(qase([277], 'Change rotation (Design page in the right)'), async () => {
    await mainTest.step('Rotate to 90 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-90.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 120 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-120.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 45 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-45.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 360 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-rotated-359.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([278], 'Change border radius multiple values (Design page in the right)'),
    async () => {
      await mainTest.step('Set independent corner radii and verify', async () => {
        await designPanelPage.clickIndividualCornersRadiusButton();
        await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-changed-corners.png',
          { mask: mainPage.maskViewport() },
        );
      });

      await mainTest.step('Reset corner radii and verify default', async () => {
        await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([319], 'Transform Rectangle to Path'), async () => {
    await mainTest.step('Transform rectangle to path via right click', async () => {
      await mainPage.transformToPathViaRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify path component is visible on layers tab',
      async () => {
        await layersPanelPage.isPathComponentOnLayersTabVisible();
      },
    );
  });

  mainTest(qase([326], 'Selection to board'), async () => {
    await mainTest.step('Move selection to board via right click', async () => {
      await mainPage.selectionToBoardViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify rectangle is placed inside board', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-to-board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});

mainTest(qase([2255], 'Select and deselect rectangles'), async ({ browserName }) => {
  await mainTest.step('Create four rectangles on canvas', async () => {
    await mainPage.createDefaultRectangleByCoordinates(400, 800);
    await mainPage.createDefaultRectangleByCoordinates(400, 200, true);
    await mainPage.createDefaultRectangleByCoordinates(100, 600, true);
    await mainPage.createDefaultRectangleByCoordinates(700, 600, true);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Select all and deselect one, verify three selected',
    async () => {
      await mainPage.pressSelectAllShortcut(browserName);
      await mainPage.deselectElement();
      await expect(mainPage.viewport).toHaveScreenshot(
        'three-rectangle-selected.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  await mainTest.step('Deselect further and verify one selected', async () => {
    await mainPage.deselectElement();
    await mainPage.deselectElement();
    await expect(mainPage.viewport).toHaveScreenshot('one-rectangle-selected.png', {
      mask: mainPage.maskViewport(),
    });
  });
});
