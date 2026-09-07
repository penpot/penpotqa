import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let inspectPanelPage: InspectPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultTextLayer();
  });

  mainAccountFileTest(
    qase([397], 'Click "Focus off" text from shortcut (F)'),
    async ({ mainPage }) => {
      const firstText = 'First text';
      const secondText = 'Second text';

      await mainAccountFileTest.step('Add two text boxes', async () => {
        await mainPage.createTextLayerByCoordinates(200, 200, firstText);
        await layersPanelPage.isLayerNameDisplayed(firstText);
        await mainPage.createTextLayerByCoordinates(600, 500, secondText);
        await layersPanelPage.isLayerNameDisplayed(secondText);
      });

      await mainAccountFileTest.step(
        'Focus on the first text via right click',
        async () => {
          await mainPage.focusLayerViaRightClickOnLayersTab(firstText);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isFocusModeOn();
          await layersPanelPage.isLayerPresentOnLayersTab(secondText, false);
        },
      );

      await mainAccountFileTest.step('Press F to exit focus mode', async () => {
        await mainPage.focusLayerViaShortcut();
        await layersPanelPage.isFocusModeOff();
        await layersPanelPage.isLayerPresentOnLayersTab(secondText, true);
      });
    },
  );

  mainAccountFileTest(
    qase([381], 'Add, hide, unhide, change type and delete Shadow to Text'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Add shadow', async () => {
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainAccountFileTest.step('Hide shadow', async () => {
        await designPanelPage.hideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-hide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainAccountFileTest.step('Unhide shadow', async () => {
        await designPanelPage.unhideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-unhide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainAccountFileTest.step(
        'Change shadow type to Inner Shadow',
        async () => {
          await designPanelPage.selectTypeForShadow('Inner shadow');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await mainPage.focusLayerViaShortcut();
          await expect(mainPage.viewport).toHaveScreenshot(
            'text-inner-shadow-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.focusLayerViaShortcut();
        },
      );

      await mainAccountFileTest.step('Remove shadow', async () => {
        await designPanelPage.removeShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-inner-shadow-remove.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainAccountFileTest(
    qase([382], 'Add and edit Shadow to text'),
    async ({ mainPage }) => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#de1b1b');
      await mainPage.waitForChangeIsSaved();

      await mainAccountFileTest.step('Add a new shadow with settings', async () => {
        await designPanelPage.clickAddShadowButton();
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.changeShadowSettings('2', '7', '0.5', '.5', '50');
        await designPanelPage.clickShadowColorIcon();
        await colorPalettePage.setHex('#304d6a');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickOnLayerOnCanvas();
        await mainPage.focusLayerViaShortcut();
        await mainPage.clickViewportTwice();
        await expect(mainPage.viewport).toHaveScreenshot('text-drop-shadow.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainAccountFileTest.step(
        'Change type of shadow to Inner Shadow and change settings',
        async () => {
          await designPanelPage.selectTypeForShadow('Inner shadow');
          await designPanelPage.clickShadowActionsButton();
          await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
          await designPanelPage.clickShadowColorIcon();
          await colorPalettePage.setHex('#96e637');
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickOnLayerOnCanvas();
          await mainPage.focusLayerViaShortcut();
          await mainPage.clickViewportTwice();
          await expect(mainPage.viewport).toHaveScreenshot('text-inner-shadow.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(qase([383], 'Add 2 Shadows to Text'), async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Add a shadow, change its type to Inner shadow and set its color',
      async () => {
        await designPanelPage.clickAddShadowButton();
        await designPanelPage.selectTypeForShadow('Inner shadow');
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.clickShadowColorIcon();
        await colorPalettePage.setHex('#cbf40f');
        await designPanelPage.changeOpacityForShadow('50');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickOnLayerOnCanvas();
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.isExpectedShadowTypeOption('Inner shadow');
      },
    );

    await mainAccountFileTest.step(
      'Add a second shadow and set its color',
      async () => {
        await designPanelPage.clickAddShadowButton();
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.clickShadowColorIcon();
        await colorPalettePage.setHex('#de1b1b');
        await designPanelPage.changeOpacityForShadow('50');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickOnLayerOnCanvas();
        await designPanelPage.isExpectedShadowTypeOption('Drop shadow');
        await designPanelPage.isExpectedShadowTypeOption('Inner shadow');
        await mainPage.focusLayerViaShortcut();
        await mainPage.clickOnLayerOnCanvas();
        await expect(mainPage.viewport).toHaveScreenshot('text-two-shadows.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      },
    );
  });

  mainAccountFileTest(
    qase([424], 'Change text uppercase, title case, lowercase (Design section)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change text case to Uppercase', async () => {
        await designPanelPage.changeTextCase('Upper');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-upper-case.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainAccountFileTest.step(
        'Change to text case to Title Case',
        async () => {
          await designPanelPage.changeTextCase('Title');
          await mainPage.waitForChangeIsSaved();
          await mainPage.focusLayerViaShortcut();
          await expect(mainPage.viewport).toHaveScreenshot('text-title-case.png', {
            mask: mainPage.maskViewport(),
          });
          await mainPage.focusLayerViaShortcut();
        },
      );

      await mainAccountFileTest.step(
        'Change to text case to Lower Case',
        async () => {
          await designPanelPage.changeTextCase('Lower');
          await mainPage.waitForChangeIsSaved();
          await mainPage.focusLayerViaShortcut();
          await expect(mainPage.viewport).toHaveScreenshot('text-lower-case.png', {
            mask: mainPage.maskViewport(),
          });
          await mainPage.focusLayerViaShortcut();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([425], 'Change alignment (Design section)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change alignment to Middle', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('200', '200');
        await designPanelPage.changeTextOption('Middle');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('text-align-middle.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step('Change alignment to Bottom', async () => {
        await designPanelPage.changeTextOption('Bottom');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('text-align-bottom.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step('Change alignment to Top', async () => {
        await designPanelPage.changeTextOption('Top');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('text-align-top.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([427], 'Change RTL/LTR (Design section)'),
    async ({ mainPage }) => {
      await designPanelPage.changeTextOption('RTL');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-rtl.png', {
        mask: mainPage.maskViewport(),
        maxDiffPixels: 30,
      });
      await mainPage.focusLayerViaShortcut();

      await designPanelPage.changeTextOption('LTR');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-ltr.png', {
        mask: mainPage.maskViewport(),
        maxDiffPixels: 40,
      });
      await mainPage.focusLayerViaShortcut();
    },
  );

  mainAccountFileTest(
    qase([431], 'Change text color and opacity by typing color code'),
    async ({ mainPage }) => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await designPanelPage.changeOpacityForFill('50');
      await mainPage.clickMoveButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickOnLayerOnCanvas();
      await expect(mainPage.viewport).toHaveScreenshot('text-fill-opacity.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openComputedTab();
      await expect(inspectPanelPage.textBlockOnInspect).toHaveScreenshot(
        'inspect-text-block-color.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );
});

mainAccountFileTest(
  qase([422], 'Change font style, size, letter spacing AV (Design section)'),
  async ({ mainPage }) => {
    const text =
      'Class aptent taciti sociosqu ad litora torquent\n' +
      'per conubia nostra, per inceptos himenaeos.\n\n' +
      'Aliquam eu fringilla augue.\n' +
      'Mauris eu tempus enim.';

    await mainAccountFileTest.step('Create long text with paragraphs', async () => {
      await mainPage.clickCreateTextButton();
      await mainPage.clickViewportByCoordinates(200, 200);
      await mainPage.typeTextFromKeyboard(text);
      await mainPage.clickMoveButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-long-text.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainAccountFileTest.step('Change font style', async () => {
      await designPanelPage.changeTextFont('Saira Extra Condensed');
      await designPanelPage.changeTextFontStyle('400');
      await designPanelPage.changeTextFontSize('9');
    });

    await mainAccountFileTest.step('Change AV (letter spacing)', async () => {
      await designPanelPage.changeTextLetterSpacing('5');
    });

    await mainAccountFileTest.step('Change Line Height', async () => {
      await designPanelPage.changeTextLineHeight('5');
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Assert changed font style, size, letter spacing AV',
      async () => {
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-long-text-with-changed-properties.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );
  },
);

mainAccountFileTest(
  qase([418], 'Select 2 texts and change alignment (via Design panel)'),
  async ({ mainPage }) => {
    const firstText = 'First text';
    const secondText = 'Second text';

    await mainAccountFileTest.step('Create two text layers', async () => {
      await mainPage.createTextLayerByCoordinates(200, 200, firstText);
      await mainPage.createTextLayerByCoordinates(600, 500, secondText);
    });

    await mainAccountFileTest.step('Select 2 texts', async () => {
      await layersPanelPage.shiftSelectLayersOnLayersTabByName([
        firstText,
        secondText,
      ]);
    });

    await mainAccountFileTest.step('Align left', async () => {
      await designPanelPage.alignObjects('Left');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-left.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainAccountFileTest.step('Align horizontal center', async () => {
      await designPanelPage.alignObjects('Horizontal center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'layers-align-horizontal-center.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainAccountFileTest.step('Align right', async () => {
      await designPanelPage.alignObjects('Right');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-right.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainAccountFileTest.step('Align top', async () => {
      await designPanelPage.alignObjects('Top');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-top.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainAccountFileTest.step('Align vertical center', async () => {
      await designPanelPage.alignObjects('Vertical center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'layers-align-vertical-center.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainAccountFileTest.step('Align bottom', async () => {
      await designPanelPage.alignObjects('Bottom');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-bottom.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

mainAccountFileTest(
  qase([423], 'Change text centering, align (Design section)'),
  async ({ mainPage }) => {
    const text =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
      'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
      'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ' +
      'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
      'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat ' +
      'non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    await mainAccountFileTest.step(
      'Create large text with several lines',
      async () => {
        await mainPage.createTextLayerByCoordinatesViaPaste(200, 200, text);
        await designPanelPage.changeWidthForLayer('400');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step('Align left', async () => {
      await designPanelPage.changeTextOption('Left');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickOnLayerOnCanvas();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-left.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainAccountFileTest.step('Align center', async () => {
      await designPanelPage.changeTextOption('Center');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickOnLayerOnCanvas();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-center.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainAccountFileTest.step('Align right', async () => {
      await designPanelPage.changeTextOption('Right');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickOnLayerOnCanvas();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-right.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainAccountFileTest.step('Justify', async () => {
      await designPanelPage.changeTextOption('Justify');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickOnLayerOnCanvas();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-justify.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);
