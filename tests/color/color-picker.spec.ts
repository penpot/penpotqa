import { mainAccountFileTest } from 'fixtures';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { expect } from '@playwright/test';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let assetsPanelPage: AssetsPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest.describe('Color Picker', () => {
  mainAccountFileTest(
    qase([1029], 'Open color picker from Stroke menu'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create default closed path', async () => {
        await mainPage.createDefaultClosedPath();
      });

      await mainAccountFileTest.step(
        'Open color picker from stroke menu and verify it is displayed',
        async () => {
          await designPanelPage.clickStrokeColorBullet();
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1030], 'Open color picker from Fill menu'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create board', async () => {
        await mainPage.clickCreateBoardButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Open color picker from fill menu and verify it is displayed',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1031], 'Open color picker from Canvas background menu'),
    async () => {
      await mainAccountFileTest.step(
        'Open color picker from canvas background menu',
        async () => {
          await designPanelPage.clickCanvasBackgroundColorIcon();
        },
      );

      await mainAccountFileTest.step(
        'Verify color picker is displayed',
        async () => {
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  mainAccountFileTest(qase(1035, 'Use Recent colors'), async ({ mainPage }) => {
    const color1 = '#FF0000';
    const color2 = '#B1B2B5';

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
      `Set second fill color to ${color2}`,
      async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex(color2);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
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

  mainAccountFileTest(
    qase(1036, 'Use colors from File library'),
    async ({ mainPage }) => {
      const color = '#ffff00';

      await mainAccountFileTest.step('Add color to file library', async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickAddFileLibraryColorButton();
        await colorPalettePage.setHex(color);
        await colorPalettePage.clickSaveColorStyleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

  mainAccountFileTest(
    qase([1054], 'Open color picker from add or edit color in assets'),
    async () => {
      await mainAccountFileTest.step(
        'Open color picker from assets panel',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await assetsPanelPage.clickAddFileLibraryColorButton();
        },
      );

      await mainAccountFileTest.step(
        'Verify color picker is displayed',
        async () => {
          await colorPalettePage.isColorPalettePopUpOpened();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1996], 'Delete linear gradient stop (from color picker stops list)'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step('Add gradient stop', async () => {
        await colorPalettePage.colorPaletteAddStop();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Remove gradient stop and verify two stops remain',
        async () => {
          await colorPalettePage.colorPaletteRemoveStop(1);
          await colorPalettePage.checkGradientStops(2);
        },
      );
    },
  );

  mainAccountFileTest(
    qase(2962, 'List view displays each color with visible swatch and visible name'),
    async ({ mainPage }) => {
      const color1 = '#ffff00';
      const color2 = '#cdc548';

      await mainAccountFileTest.step('Add two colors to file library', async () => {
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

mainAccountFileTest.describe('Palette', () => {
  mainAccountFileTest(
    qase([1045], 'Open Color palette from shortcut'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
        'Close color palette via shortcut and verify it is hidden',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1046, 1040], 'Open Color palette from toolbar. Type valid color code.'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
        'Close color palette from sidebar and verify it is hidden',
        async () => {
          await mainPage.openCloseColorsPaletteFromSidebar();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );

      await mainAccountFileTest.step('Create rectangle', async () => {
        await mainPage.clickCreateRectangleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Open color picker from fill section and type valid color code #FF0000',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.isColorPalettePopUpOpened();
          await colorPalettePage.setHex('#FF0000');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify rectangle fill color changed to red',
        async () => {
          await designPanelPage.isFillHexCodeSet('#FF0000');
        },
      );
    },
  );

  mainAccountFileTest(
    qase(1048, 'Choose file library colors'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Add two colors to file library', async () => {
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
        'Verify file library colors are displayed in palette',
        async () => {
          await expect(
            mainPage.typographiesColorsBottomPanel,
            'File library colors should be visible in palette',
          ).toHaveScreenshot('colors-file-library.png');
        },
      );

      await mainAccountFileTest.step(
        'Close color palette and verify it is hidden',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );
    },
  );

  mainAccountFileTest(
    qase(1049, 'Click any layer and change Fill color from palette'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
        'Close color palette and verify it is hidden',
        async () => {
          await mainPage.pressColorsPaletteShortcut();
          await mainPage.isColorsPaletteNotDisplayed();
        },
      );
    },
  );
});
