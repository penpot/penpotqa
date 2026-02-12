const { mainTest } = require('../../fixtures');
const { expect } = require('@playwright/test');
const { MainPage } = require('../../pages/workspace/main-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { InspectPanelPage } = require('../../pages/workspace/inspect-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let mainPage,
  colorPalettePage,
  teamPage,
  dashboardPage,
  designPanelPage,
  layersPanelPage,
  inspectPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
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

mainTest.describe(() => {
  mainTest.beforeEach(async ({ browserName }) => {
    browserName === 'webkit' ? await mainPage.waitForViewportVisible() : null;
    await mainPage.createDefaultTextLayer();
  });

  mainTest(qase([377], 'Create Text(Toolbar)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('text.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([380], 'Change rotation (Design page in the right)'), async () => {
    await mainTest.step('Change rotation to 90', async () => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-rotated-90.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change rotation to 120', async () => {
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-rotated-120.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change rotation to 45', async () => {
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-rotated-45.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change rotation to 360', async () => {
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-rotated-359.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });
  });

  mainTest(
    qase([381], 'Add, hide, unhide, change type and delete Shadow to Text'),
    async () => {
      await mainTest.step('Add shadow', async () => {
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-default.png',
          {
            mask: await mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Hide shadow', async () => {
        await designPanelPage.hideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-hide.png',
          {
            mask: await mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Unhide shadow', async () => {
        await designPanelPage.unhideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-unhide.png',
          {
            mask: await mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change shadow type to Inner Shadow', async () => {
        await designPanelPage.selectTypeForShadow('Inner shadow');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-inner-shadow-default.png',
          {
            mask: await mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Remove shadow', async () => {
        await designPanelPage.removeShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-inner-shadow-remove.png',
          {
            mask: await mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(qase([382], 'Add and edit Shadow to text'), async ({ browserName }) => {
    await mainTest.step('Add a new shadow with settings', async () => {
      await designPanelPage.clickAddShadowButton();
      await designPanelPage.clickShadowActionsButton();
      await designPanelPage.changeShadowSettings('10', '15', '10', '20', '50');
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickOnLayerOnCanvas();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-drop-shadow.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step(
      'Change type of shadow to Inner Shadow and change settings',
      async () => {
        await designPanelPage.selectTypeForShadow('Inner shadow');
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
        await designPanelPage.clickShadowColorIcon();
        await colorPalettePage.setHex('#96e637');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickOnLayerOnCanvas();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-inner-shadow.png', {
          mask: await mainPage.maskViewport(),
        });
      },
    );
  });

  mainTest(
    qase([384, 385], 'Add, change value, hide, unhide and delete Blur to text'),
    async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();

      await mainTest.step('Add blur', async () => {
        await designPanelPage.clickAddBlurButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-default.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change blur value', async () => {
        await designPanelPage.changeValueForBlur('55');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Hide blur', async () => {
        await designPanelPage.hideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-hide.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Unhide blur', async () => {
        await designPanelPage.unhideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-unhide.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Remove blur', async () => {
        await designPanelPage.removeBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-remove.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(qase([386], 'Add, edit and delete Stroke to Text'), async () => {
    await mainTest.step('Add stroke with default settings', async () => {
      await designPanelPage.clickAddStrokeButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-stroke-default.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change stroke settings to inside dotted', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#43E50B', '60', '10', 'Inside');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-inside-dotted.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change stroke settings to outside dashed', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#F5358F', '80', '5', 'Outside');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-outside-dashed.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change to center solid stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#F5358F', '100', '3', 'Center');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-center-solid.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change to center mixed stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#F5358F', '40', '4', 'Center');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-center-mixed.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Remove stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.removeStroke();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-stroke-remove.png', {
        mask: await mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([388], 'Delete text (From right click)'), async () => {
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([2545], 'Delete text (From Keyboard)'), async () => {
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([392], 'Rename text with valid name'), async () => {
    await layersPanelPage.doubleClickLayerOnLayersTab('Hello world!');
    await layersPanelPage.typeNameCreatedLayerAndEnter('renamed text');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed text');
  });

  mainTest(
    qase([424], 'Change text uppercase, title case, lowercase (Design section)'),
    async () => {
      await mainTest.step('Change text case to Uppercase', async () => {
        await designPanelPage.changeTextCase('Upper');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-upper-case.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change to text case to Title Case', async () => {
        await designPanelPage.changeTextCase('Title');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-title-case.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change to text case to Lower Case', async () => {
        await designPanelPage.changeTextCase('Lower');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-lower-case.png', {
          mask: await mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(qase([425], 'Change alignment (Design section)'), async () => {
    await mainTest.step('Change alignment to Middle', async () => {
      await designPanelPage.changeHeightAndWidthForLayer('200', '200');
      await designPanelPage.changeTextAlignment('Middle');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-middle.png', {
        mask: await mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change alignment to Bottom', async () => {
      await designPanelPage.changeTextAlignment('Bottom');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-bottom.png', {
        mask: await mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change alignment to Top', async () => {
      await designPanelPage.changeTextAlignment('Top');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-top.png', {
        mask: await mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([427], 'Change RTL/LTR (Design section)'), async () => {
    await designPanelPage.changeTextDirection('RTL');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rtl.png', {
      mask: await mainPage.maskViewport(),
      maxDiffPixels: 30,
    });
    await designPanelPage.changeTextDirection('LTR');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-ltr.png', {
      mask: await mainPage.maskViewport(),
      maxDiffPixels: 40,
    });
  });

  mainTest(
    qase([431], 'Change text color and opacity by typing color code'),
    async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await designPanelPage.changeOpacityForFill('50');
      await mainPage.clickMoveButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-fill-opacity.png', {
        mask: await mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openComputedTab();
      await expect(inspectPanelPage.textBlockOnInspect).toHaveScreenshot(
        'inspect-text-block-color.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest(qase([434], 'Selection to board'), async () => {
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.focusLayerViaShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('text-to-board.png', {
      mask: await mainPage.maskViewport(),
    });
  });
});
