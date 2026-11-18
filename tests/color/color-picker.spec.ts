import { demoAccountFileTest } from 'fixtures';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { expect } from '@playwright/test';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest.describe('Color Picker', () => {
  demoAccountFileTest(
    qase([1029], 'Open color picker from Stroke menu'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Create default closed path', async () => {
        await mainPage.createDefaultClosedPath();
      });

      await demoAccountFileTest.step(
        'Open color picker from stroke menu and verify it is displayed',
        async () => {
          await designPanelPage.clickStrokeColorBullet();
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1030], 'Open color picker from Fill menu'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Create board', async () => {
        await mainPage.clickCreateBoardButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Open color picker from fill menu and verify it is displayed',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1031], 'Open color picker from Canvas background menu'),
    async () => {
      await demoAccountFileTest.step(
        'Open color picker from canvas background menu',
        async () => {
          await designPanelPage.clickCanvasBackgroundColorIcon();
        },
      );

      await demoAccountFileTest.step(
        'Verify color picker is displayed',
        async () => {
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  demoAccountFileTest(qase(1035, 'Use Recent colors'), async ({ mainPage }) => {
    const color1 = '#FF0000';
    const color2 = '#B1B2B5';

    await demoAccountFileTest.step(
      'Create rectangle and set first fill color',
      async () => {
        await mainPage.clickCreateRectangleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex(color1);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Set second fill color to ${color2}`,
      async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex(color2);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      `Apply recent color and verify board appearance`,
      async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.clickColorBullet(color1);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Board should display the recent color applied',
        ).toHaveScreenshot('board-recent-color.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });

  demoAccountFileTest(
    qase(1036, 'Use colors from File library'),
    async ({ mainPage }) => {
      const color = '#ffff00';

      await demoAccountFileTest.step('Add color to file library', async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickAddFileLibraryColorButton();
        await colorPalettePage.setHex(color);
        await colorPalettePage.clickSaveColorStyleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Apply file library color to board',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(200, 300);
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.selectFileLibraryOption();
          await colorPalettePage.clickColorBullet(color);
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify board displays file library color',
        async () => {
          await expect(
            mainPage.viewport,
            'Rectangle should display the file library color',
          ).toHaveScreenshot('rectangle-file-library-color.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1054], 'Open color picker from add or edit color in assets'),
    async () => {
      await demoAccountFileTest.step(
        'Open color picker from assets panel',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.clickAddFileLibraryColorButton();
        },
      );

      await demoAccountFileTest.step(
        'Verify color picker is displayed',
        async () => {
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1996], 'Delete linear gradient stop (from color picker stops list)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create board and open gradient color picker',
        async () => {
          await mainPage.clickCreateBoardButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
          await colorPalettePage.selectColorGradient();
        },
      );

      await demoAccountFileTest.step('Add gradient stop', async () => {
        await colorPalettePage.colorPaletteAddStop();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Remove gradient stop and verify two stops remain',
        async () => {
          await colorPalettePage.colorPaletteRemoveStop(1);
          await colorPalettePage.checkGradientStops(2);
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [2025, 2279],
      'Change fill from Gradient to Solid and back, and from Gradient to Image',
    ),
    async ({ page, mainPage }) => {
      const workspacePage = new WorkspacePage(page);
      const { colorPicker } = workspacePage;

      await demoAccountFileTest.step(
        'Create a rectangle with a linear gradient fill (PENPOT-1042)',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(300, 300);
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
          await colorPalettePage.setHex('#304d6a');
          await mainPage.waitForChangeIsSaved();
          await colorPicker.selectFillType('Gradient');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isGradientFillSetByIndex(0, 'Linear');
        },
      );

      await demoAccountFileTest.step(
        'Switch from Gradient to Solid: the fill is solid',
        async () => {
          await colorPicker.selectFillType('Solid');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isFillHexCodeSet('#304d6a');
        },
      );

      await demoAccountFileTest.step(
        'Switch from Solid to Gradient: the fill is a gradient again',
        async () => {
          await colorPicker.selectFillType('Gradient');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isGradientFillSetByIndex(0, 'Linear');
        },
      );

      await demoAccountFileTest.step(
        'Switch from Gradient to Image and upload an image: the fill is the image',
        async () => {
          await colorPicker.selectFillType('Image');
          await colorPicker.uploadImage('images/images.png');
          await mainPage.waitForChangeIsSaved();
          await workspacePage.rightSidebar.design.fill.checkImageFillIsVisible(
            'images.png',
          );
          // Deselect, so the picker and the handles aren't in the snapshot
          await mainPage.clickViewportTwice();
          await expect(mainPage.viewport).toHaveScreenshot(
            'rectangle-image-fill.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2010], "Reorder radial gradient's stop (from color picker's stops list)"),
    async ({ page, mainPage }) => {
      const { colorPicker } = new WorkspacePage(page);

      await demoAccountFileTest.step('Create a text and select it', async () => {
        await mainPage.createTextLayerByCoordinates(300, 300, 'Gradient text');
        await layersPanelPage.selectLayerByExactName('Gradient text');
      });

      await demoAccountFileTest.step(
        'Open the Fill color picker, pick a color and switch to a radial gradient',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
          await colorPalettePage.setHex('#304d6a');
          await mainPage.waitForChangeIsSaved();
          await colorPalettePage.selectColorGradient();
          await colorPalettePage.selectGradientType('Radial');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isGradientFillSetByIndex(0, 'Radial');
        },
      );

      await demoAccountFileTest.step(
        'Give the second stop another color, to tell the stops apart',
        async () => {
          await colorPicker.setGradientStopColor(1, 'ff0000');
          await mainPage.waitForChangeIsSaved();
          await colorPicker.checkGradientStopColors(['304d6a', 'ff0000']);
        },
      );

      await demoAccountFileTest.step(
        'Drag the second stop above the first one: the stops swap positions',
        async () => {
          await colorPicker.reorderGradientStop(1, 0);
          await mainPage.waitForChangeIsSaved();
          await colorPicker.checkGradientStopColors(['ff0000', '304d6a']);
        },
      );

      await demoAccountFileTest.step(
        'Change the opacity of the center stop from 100% to 50%',
        async () => {
          await colorPicker.setGradientStopOpacity(0, '50');
          await mainPage.waitForChangeIsSaved();
          await colorPicker.checkGradientStopOpacity(0, '50');
          await designPanelPage.isGradientFillSetByIndex(0, 'Radial');
          await mainPage.clickViewportTwice();
          await expect(mainPage.viewport).toHaveScreenshot(
            'text-radial-gradient-reordered-stops.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase(2962, 'List view displays each color with visible swatch and visible name'),
    async ({ mainPage }) => {
      const color1 = '#ffff00';
      const color2 = '#cdc548';

      await demoAccountFileTest.step('Add two colors to file library', async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickAddFileLibraryColorButton();
        await colorPalettePage.setHex(color1);
        await colorPalettePage.clickSaveColorStyleButton();
        await mainPage.clickViewportOnce();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAddFileLibraryColorButton();
        await colorPalettePage.setHex(color2);
        await colorPalettePage.clickSaveColorStyleButton();
        await mainPage.clickViewportOnce();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Create a rectangle, open color picker and switch to Recent colors',
        async () => {
          await layersPanelPage.openLayersTab();
          await mainPage.createDefaultRectangleByCoordinates(200, 300);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.selectLayerByName('Rectangle');
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.selectRecentColorsOption();
          await colorPalettePage.areFileLibraryColorBulletsVisible([color1, color2]);
        },
      );

      await demoAccountFileTest.step(
        'Click on List View icon and assert colors are displayed as list showing each color as a row with swatch + name visible',
        async () => {
          await colorPalettePage.clickListViewButton();
          await colorPalettePage.areFileLibraryColorBulletsVisible([color1, color2]);
          await expect(colorPalettePage.colorsSection).toHaveScreenshot(
            'list-view-colors.png',
          );
        },
      );
    },
  );
});

demoAccountFileTest.describe('Palette', () => {
  demoAccountFileTest(
    qase([1045], 'Open Color palette from shortcut'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create board and add recent colors',
        async () => {
          await mainPage.clickCreateBoardButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#FF0000');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#B1B2B5');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Open color palette via shortcut and verify it is displayed',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteDisplayed();
          await expect(
            mainPage.typographiesColorsBottomPanel,
            'Colors panel should be visible',
          ).toHaveScreenshot('colors-panel.png');
        },
      );

      await demoAccountFileTest.step(
        'Close color palette via shortcut and verify it is hidden',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1046, 1040], 'Open Color palette from toolbar. Type valid color code.'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create board and add recent colors',
        async () => {
          await mainPage.clickCreateBoardButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#FF0000');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#B1B2B5');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Open color palette from sidebar and verify it is displayed',
        async () => {
          await mainPage.openCloseColorsPaletteFromSidebar();
          await mainPage.isColorsPaletteDisplayed();
          await expect(
            mainPage.typographiesColorsBottomPanel,
            'Colors panel should be visible',
          ).toHaveScreenshot('colors-panel.png');
        },
      );

      await demoAccountFileTest.step(
        'Close color palette from sidebar and verify it is hidden',
        async () => {
          await mainPage.openCloseColorsPaletteFromSidebar();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );

      await demoAccountFileTest.step('Create rectangle', async () => {
        await mainPage.clickCreateRectangleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Open color picker from fill section and type valid color code #FF0000',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
          await colorPalettePage.setHex('#FF0000');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify rectangle fill color changed to red',
        async () => {
          await designPanelPage.isFillHexCodeSet('#FF0000');
        },
      );
    },
  );

  demoAccountFileTest(
    qase(1048, 'Choose file library colors'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Add two colors to file library', async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickAddFileLibraryColorButton();
        await colorPalettePage.setHex('#ffff00');
        await colorPalettePage.clickSaveColorStyleButton();
        await mainPage.clickViewportOnce();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAddFileLibraryColorButton();
        await colorPalettePage.setHex('#cdc548');
        await colorPalettePage.clickSaveColorStyleButton();
        await mainPage.clickViewportOnce();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Open color palette and switch to file library',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteDisplayed();
          await colorPalettePage.openColorPaletteMenu();
          await colorPalettePage.isPaletteRecentColorsOptExist();
          await colorPalettePage.isPaletteFileLibraryOptExist();
          await colorPalettePage.selectColorPaletteMenuOption('File library');
        },
      );

      await demoAccountFileTest.step(
        'Verify file library colors are displayed in palette',
        async () => {
          await expect(
            mainPage.typographiesColorsBottomPanel,
            'File library colors should be visible in palette',
          ).toHaveScreenshot('colors-file-library.png');
        },
      );

      await demoAccountFileTest.step(
        'Close color palette and verify it is hidden',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(1049, 'Click any layer and change Fill color from palette'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create rectangle and set fill colors',
        async () => {
          await mainPage.clickCreateRectangleButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#FF0000');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#B1B2B5');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify rectangle displays color #B1B2B5',
        async () => {
          await expect(
            mainPage.viewport,
            'Rectangle should display color #B1B2B5',
          ).toHaveScreenshot('rectangle-color-B1B2B5.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step(
        'Open color palette and verify recent colors',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteDisplayed();
          await expect(
            mainPage.typographiesColorsBottomPanel,
            'Colors panel should be visible',
          ).toHaveScreenshot('colors-panel.png');
        },
      );

      await demoAccountFileTest.step(
        'Select color #FF0000 from palette and verify rectangle color changed',
        async () => {
          await colorPalettePage.selectColorBulletFromPalette('#FF0000');
          await expect(
            mainPage.viewport,
            'Rectangle should display color #FF0000 after selection',
          ).toHaveScreenshot('rectangle-color-FF0000.png', {
            mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          });
        },
      );

      await demoAccountFileTest.step(
        'Close color palette and verify it is hidden',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );
    },
  );
});
