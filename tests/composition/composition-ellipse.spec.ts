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
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([328], 'Create Ellipse (Shortcut E)'), async () => {
  await mainTest.step(
    'Press E shortcut and verify ellipse tool is active',
    async () => {
      await mainPage.pressKeyboardShortcut('E');
    },
  );

  await mainTest.step(
    'Click on canvas and verify ellipse with default size is created',
    async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Ellipse');
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    mainTest.slow();
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([327], 'Create Ellipse (Toolbar)'), async () => {
    await mainTest.step('Verify ellipse layer is created', async () => {
      await mainPage.isCreatedLayerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([329], 'Rename ellipse with valid name'), async () => {
    await mainTest.step('Rename the ellipse layer', async () => {
      await layersPanelPage.doubleClickLayerOnLayersTab('Ellipse');
      await layersPanelPage.typeNameCreatedLayerAndEnter('renamed ellipse');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify layer has the new name', async () => {
      await layersPanelPage.isLayerNameDisplayed('renamed ellipse', {
        mask: [mainPage.guides, mainPage.guidesFragment],
      });
    });
  });

  mainTest(
    qase([332], 'Add, hide, unhide, change type and delete Shadow to ellipse'),
    async () => {
      await mainTest.step('Add drop shadow and verify default state', async () => {
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'ellipse-drop-shadow-default.png',
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
          'ellipse-drop-shadow-hide.png',
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
          'ellipse-drop-shadow-unhide.png',
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
            'ellipse-inner-shadow-default.png',
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
          'ellipse-inner-shadow-remove.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(qase([333], 'Add and edit Shadow to ellipse'), async () => {
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
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-drop-shadow.png', {
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
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-inner-shadow.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([334], 'Add, hide, unhide and delete Blur to ellipse'), async () => {
    await mainTest.step('Set fill color and add blur', async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
    });

    await mainTest.step('Verify blur is applied', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-default.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Hide blur and verify', async () => {
      await designPanelPage.hideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-hide.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Unhide blur and verify', async () => {
      await designPanelPage.unhideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-unhide.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Remove blur and verify', async () => {
      await designPanelPage.removeBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-remove.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([335], 'Add and edit Blur to ellipse'), async () => {
    await mainTest.step('Add blur and change value', async () => {
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('55');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
    });

    await mainTest.step('Verify blur appearance', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([336], 'Add, edit and delete Stroke to ellipse'), async () => {
    await mainTest.step('Add stroke and verify default state', async () => {
      await designPanelPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-stroke-default.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply inside dotted stroke and verify', async () => {
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
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-stroke-inside-dotted.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply outside dashed stroke and verify', async () => {
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
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-stroke-outside-dashed.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply center solid stroke and verify', async () => {
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
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-stroke-center-solid.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Apply center mixed stroke and verify', async () => {
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
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot(
        'ellipse-stroke-center-mixed.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Remove stroke and verify', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.removeStroke();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-stroke-remove.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([341], 'Click "Focus off" ellipse from shortcut (F)'),
    async ({ page }) => {
      await mainTest.step('Focus on ellipse via right click', async () => {
        await mainPage.focusLayerViaRightClickOnCanvas();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify focus mode is on', async () => {
        await layersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
        await layersPanelPage.isFocusModeOn();
        await expect(page).toHaveScreenshot('ellipse-single-focus-on.png', {
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
        await layersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
        await layersPanelPage.isFocusModeOff();
        await expect(page).toHaveScreenshot('ellipse-single-focus-off.png', {
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

  mainTest(qase([351], 'Delete ellipse (From Rightclick)'), async () => {
    await mainTest.step(
      'Verify ellipse is visible and delete via right click',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify ellipse is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(qase([2539], 'Delete ellipse (From Keyboard)'), async () => {
    await mainTest.step(
      'Verify ellipse is visible and delete via keyboard',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify ellipse is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(qase([353], 'Change rotation (Design page in the right)'), async () => {
    await mainTest.step('Rotate to 90 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-90.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 120 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-120.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 45 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-45.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 360 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-359.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([369], 'Transform ellipse to Path'), async () => {
    await mainTest.step('Transform ellipse to path via right click', async () => {
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

  mainTest(qase([376], 'Selection to board'), async () => {
    await mainTest.step('Move selection to board via right click', async () => {
      await mainPage.selectionToBoardViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify ellipse is placed inside board', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-to-board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});
