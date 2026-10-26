import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let inspectPanelPage: InspectPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultTextLayer();
  });

  demoAccountFileTest(
    qase([397], 'Click "Focus off" text from shortcut (F)'),
    async ({ mainPage }) => {
      const firstText = 'First text';
      const secondText = 'Second text';

      await demoAccountFileTest.step('Add two text boxes', async () => {
        await mainPage.createTextLayerByCoordinates(200, 200, firstText);
        await layersPanelPage.isLayerNameDisplayed(firstText);
        await mainPage.createTextLayerByCoordinates(600, 500, secondText);
        await layersPanelPage.isLayerNameDisplayed(secondText);
      });

      await demoAccountFileTest.step(
        'Focus on the first text via right click',
        async () => {
          await mainPage.focusLayerViaRightClickOnLayersTab(firstText);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isFocusModeOn();
          await layersPanelPage.isLayerPresentOnLayersTab(secondText, false);
        },
      );

      await demoAccountFileTest.step('Press F to exit focus mode', async () => {
        await mainPage.focusLayerViaShortcut();
        await layersPanelPage.isFocusModeOff();
        await layersPanelPage.isLayerPresentOnLayersTab(secondText, true);
      });
    },
  );

  demoAccountFileTest(
    qase([381], 'Add, hide, unhide, change type and delete Shadow to Text'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Add shadow', async () => {
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

      await demoAccountFileTest.step('Hide shadow', async () => {
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

      await demoAccountFileTest.step('Unhide shadow', async () => {
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

      await demoAccountFileTest.step(
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

      await demoAccountFileTest.step('Remove shadow', async () => {
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

  demoAccountFileTest(
    qase([382], 'Add and edit Shadow to text'),
    async ({ mainPage }) => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#de1b1b');
      await mainPage.waitForChangeIsSaved();

      await demoAccountFileTest.step('Add a new shadow with settings', async () => {
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

      await demoAccountFileTest.step(
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

  demoAccountFileTest(qase([383], 'Add 2 Shadows to Text'), async ({ mainPage }) => {
    await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
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

  demoAccountFileTest(
    qase([424], 'Change text uppercase, title case, lowercase (Design section)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change text case to Uppercase', async () => {
        await designPanelPage.changeTextCase('Upper');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-upper-case.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await demoAccountFileTest.step(
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

      await demoAccountFileTest.step(
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

  demoAccountFileTest(
    qase([425], 'Change alignment (Design section)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change alignment to Middle', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('200', '200');
        await designPanelPage.changeTextOption('Middle');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('text-align-middle.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step('Change alignment to Bottom', async () => {
        await designPanelPage.changeTextOption('Bottom');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('text-align-bottom.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step('Change alignment to Top', async () => {
        await designPanelPage.changeTextOption('Top');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('text-align-top.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  demoAccountFileTest(
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

  demoAccountFileTest(
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

demoAccountFileTest(
  qase([422], 'Change font style, size, letter spacing AV (Design section)'),
  async ({ mainPage }) => {
    const text =
      'Class aptent taciti sociosqu ad litora torquent\n' +
      'per conubia nostra, per inceptos himenaeos.\n\n' +
      'Aliquam eu fringilla augue.\n' +
      'Mauris eu tempus enim.';

    await demoAccountFileTest.step('Create long text with paragraphs', async () => {
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

    await demoAccountFileTest.step('Change font style', async () => {
      await designPanelPage.changeTextFont('Saira Extra Condensed');
      await designPanelPage.changeTextFontStyle('400');
      await designPanelPage.changeTextFontSize('9');
    });

    await demoAccountFileTest.step('Change AV (letter spacing)', async () => {
      await designPanelPage.changeTextLetterSpacing('5');
    });

    await demoAccountFileTest.step('Change Line Height', async () => {
      await designPanelPage.changeTextLineHeight('5');
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
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

demoAccountFileTest(
  qase([418], 'Select 2 texts and change alignment (via Design panel)'),
  async ({ mainPage }) => {
    const firstText = 'First text';
    const secondText = 'Second text';

    await demoAccountFileTest.step('Create two text layers', async () => {
      await mainPage.createTextLayerByCoordinates(200, 200, firstText);
      await mainPage.createTextLayerByCoordinates(600, 500, secondText);
    });

    await demoAccountFileTest.step('Select 2 texts', async () => {
      await layersPanelPage.shiftSelectLayersOnLayersTabByName([
        firstText,
        secondText,
      ]);
    });

    await demoAccountFileTest.step('Align left', async () => {
      await designPanelPage.alignObjects('Left');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-left.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await demoAccountFileTest.step('Align horizontal center', async () => {
      await designPanelPage.alignObjects('Horizontal center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'layers-align-horizontal-center.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await demoAccountFileTest.step('Align right', async () => {
      await designPanelPage.alignObjects('Right');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-right.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await demoAccountFileTest.step('Align top', async () => {
      await designPanelPage.alignObjects('Top');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-top.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await demoAccountFileTest.step('Align vertical center', async () => {
      await designPanelPage.alignObjects('Vertical center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'layers-align-vertical-center.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await demoAccountFileTest.step('Align bottom', async () => {
      await designPanelPage.alignObjects('Bottom');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('layers-align-bottom.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

demoAccountFileTest(
  qase([423], 'Change text centering, align (Design section)'),
  async ({ mainPage }) => {
    const text =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
      'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
      'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ' +
      'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
      'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat ' +
      'non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    await demoAccountFileTest.step(
      'Create large text with several lines',
      async () => {
        await mainPage.createTextLayerByCoordinatesViaPaste(200, 200, text);
        await designPanelPage.changeWidthForLayer('400');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step('Align left', async () => {
      await designPanelPage.changeTextOption('Left');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickOnLayerOnCanvas();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-left.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await demoAccountFileTest.step('Align center', async () => {
      await designPanelPage.changeTextOption('Center');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-center.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await demoAccountFileTest.step('Align right', async () => {
      await designPanelPage.changeTextOption('Right');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-right.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await demoAccountFileTest.step('Justify', async () => {
      await designPanelPage.changeTextOption('Justify');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-justify.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

/** Selects a layer and reads its position and size from the Design tab. */
async function getLayerBounds(name: string) {
  await layersPanelPage.selectLayerByExactName(name);
  return designPanelPage.getSelectedLayerBounds();
}

demoAccountFileTest(
  qase(
    [419],
    'Select 3 texts and distribute horizontal/vertical space (Design tab and shortcuts)',
  ),
  async ({ mainPage }) => {
    let first: Awaited<ReturnType<typeof getLayerBounds>>;
    let third: Awaited<ReturnType<typeof getLayerBounds>>;

    await demoAccountFileTest.step(
      'Create "First", "Second" and "Third" in one row with uneven gaps',
      async () => {
        await mainPage.createTextLayerByCoordinates(200, 300, 'First');
        await mainPage.createTextLayerByCoordinates(260, 300, 'Second');
        await mainPage.createTextLayerByCoordinates(600, 300, 'Third');
        first = await getLayerBounds('First');
        third = await getLayerBounds('Third');
      },
    );

    await demoAccountFileTest.step(
      'Select the three texts → "Distribute horizontal spacing" shows its shortcut in the tooltip',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.pressSelectAllShortcut();
        await designPanelPage.hasDistributeHorizontalSpacingTooltip();
      },
    );

    await demoAccountFileTest.step(
      'Click it → equal horizontal gaps, "First" and "Third" stay in place',
      async () => {
        await designPanelPage.clickDistributeHorizontalSpacingButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.hasEvenHorizontalSpacing([
          await getLayerBounds('First'),
          await getLayerBounds('Second'),
          await getLayerBounds('Third'),
        ]);
        await designPanelPage.checkXAxis(String(third.x));
        await layersPanelPage.selectLayerByExactName('First');
        await designPanelPage.checkXAxis(String(first.x));
      },
    );

    await demoAccountFileTest.step(
      'Move the three texts into one column with uneven vertical gaps',
      async () => {
        for (const [name, y] of [
          ['First', '100'],
          ['Second', '140'],
          ['Third', '400'],
        ]) {
          await layersPanelPage.selectLayerByExactName(name);
          await designPanelPage.changeXAxisForLayer('200');
          await designPanelPage.changeYAxisForLayer(y);
        }
        first = await getLayerBounds('First');
        third = await getLayerBounds('Third');
      },
    );

    await demoAccountFileTest.step(
      'Select them and press Ctrl+Shift+Alt+V → equal vertical gaps, top and bottom texts stay in place',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.pressSelectAllShortcut();
        await mainPage.pressDistributeVerticalSpacingShortcut();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.hasEvenVerticalSpacing([
          await getLayerBounds('First'),
          await getLayerBounds('Second'),
          await getLayerBounds('Third'),
        ]);
        await designPanelPage.checkYAxis(String(third.y));
        await layersPanelPage.selectLayerByExactName('First');
        await designPanelPage.checkYAxis(String(first.y));
      },
    );
  },
);

demoAccountFileTest(
  qase([428], 'Use auto width, height (Design section)'),
  async ({ mainPage }) => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    let singleLine: { width: number; height: number };

    await demoAccountFileTest.step(
      'Create a 300 px wide text that wraps into several lines',
      async () => {
        await mainPage.createTextLayerInBoxViaPaste(200, 200, 500, 260, text);
        await designPanelPage.isTextOptionSelected('Fixed');
      },
    );

    await demoAccountFileTest.step(
      'Click "Auto width" → the box grows wider and the text fits in a single line',
      async () => {
        const fixedHeight = await designPanelPage.getHeightValue();
        await designPanelPage.changeTextOption('Auto width');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isTextOptionSelected('Auto width');
        await designPanelPage.isWidthGreaterThan(300);
        await designPanelPage.isHeightLessThan(fixedHeight);
        singleLine = {
          width: await designPanelPage.getWidthValue(),
          height: await designPanelPage.getHeightValue(),
        };
      },
    );

    await demoAccountFileTest.step(
      'Drag the right edge to make it narrower → the text wraps and the box switches to "Auto height"',
      async () => {
        await mainPage.dragSelectionRightEdge(-150);
        await designPanelPage.isTextOptionSelected('Auto height');
        await designPanelPage.isWidthLessThan(singleLine.width);
        await designPanelPage.isHeightGreaterThan(singleLine.height);
      },
    );

    await demoAccountFileTest.step(
      'Make it "Fixed" and taller, then click "Auto height" → the height fits the text again and the width is kept',
      async () => {
        const width = await designPanelPage.getWidthValue();
        const fittedHeight = await designPanelPage.getHeightValue();
        await designPanelPage.changeTextOption('Fixed');
        await designPanelPage.changeHeightForLayer('100');
        await designPanelPage.changeTextOption('Auto height');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isTextOptionSelected('Auto height');
        await designPanelPage.isHeightValue(fittedHeight);
        await designPanelPage.isWidthValue(width);
      },
    );
  },
);

demoAccountFileTest(
  qase([432], 'Change color, font and size of selected words'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create "Hello brave new world"', async () => {
      await mainPage.createTextLayerByCoordinates(200, 300, 'Hello brave new world');
    });

    await demoAccountFileTest.step('Select "brave new" in the editor', async () => {
      await mainPage.createdLayer.click();
      await mainPage.clickOnEnter();
      await mainPage.doubleClickOnTextAt(0.38);
      for (let i = 0; i < 4; i++) {
        await mainPage.page.keyboard.press('Shift+ArrowRight');
      }
    });

    await demoAccountFileTest.step(
      'Set color FFD700, font "Sofia" and size 36',
      async () => {
        await designPanelPage.typeFillHexCode('FFD700');
        await designPanelPage.changeTextFont('Sofia');
        await designPanelPage.selectTextFontSizeFromDropdown('36');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Leave the editor → the text has mixed fill, font and size, with FFD700 among its colors',
      async () => {
        await mainPage.clickOnESC();
        await designPanelPage.isFillMixed();
        await designPanelPage.isSelectedColorVisible('ffd700');
        await designPanelPage.isSelectedColorVisible('000000');
        await designPanelPage.checkFontName('Mixed Font Families');
        await designPanelPage.isFontSizeMixed();
      },
    );

    await demoAccountFileTest.step(
      '"Hello" keeps the default style (000000, Source Sans Pro, 14)',
      async () => {
        await mainPage.clickOnEnter();
        await mainPage.page.keyboard.press('Home');
        await designPanelPage.isFillHexCodeSet('#000000');
        await designPanelPage.checkFontName('Source Sans Pro');
        await designPanelPage.checkFontSize('14');
      },
    );

    await demoAccountFileTest.step(
      'Only "brave new" is drawn in yellow, Sofia and size 36',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickViewportByCoordinates(900, 700);
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-styled-selected-words.png',
          { mask: mainPage.maskViewport() },
        );
      },
    );
  },
);
