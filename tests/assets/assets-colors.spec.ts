import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const hexColor: string = '#ffff00';

let assetsPanelPage: AssetsPanelPage;
let colorPalettePopUp: ColorPalettePage;
let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePopUp = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([932], 'Filter Colors from All Assets drop-down'),
  async () => {
    await mainAccountFileTest.step(
      'Open assets tab and filter by Colors',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
      },
    );

    await mainAccountFileTest.step(
      'Verify Colors section shows 0 items',
      async () => {
        await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
      },
    );
  },
);

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.setHex(hexColor);
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(qase([933], 'File library colors - add'), async () => {
    await mainAccountFileTest.step(
      'Verify color is added to file library',
      async () => {
        await assetsPanelPage.isColorAddedToFileLibraryColors(hexColor);
      },
    );
  });

  mainAccountFileTest(
    qase([934], 'Edit Color Asset After Applying to Element'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create shapes and apply color', async () => {
        await mainPage.createDefaultBoardByCoordinates(500, 200);
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickFileLibraryColorsColorBullet();
        await mainPage.waitForChangeIsSaved();
        await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickFileLibraryColorsColorBullet();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify color applied to shapes', async () => {
        await expect(
          mainPage.viewport,
          'Color should be applied to shapes',
        ).toHaveScreenshot('apply-color-to-shapes.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainAccountFileTest.step('Edit color and save', async () => {
        await assetsPanelPage.editFileLibraryColor();
        await colorPalettePopUp.setHex('#00ff00');
        await colorPalettePopUp.clickSaveColorStyleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify updated color in library and on shapes',
        async () => {
          await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00#00ff00');
          await expect(
            mainPage.viewport,
            'Edited color should be applied to shapes',
          ).toHaveScreenshot('edited-color-to-shapes.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([935], 'File library colors - rename'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Rename color and save', async () => {
        await assetsPanelPage.renameFileLibraryColor('test color');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify renamed color in library', async () => {
        await assetsPanelPage.isColorAddedToFileLibraryColors('test color#ffff00');
      });
    },
  );

  mainAccountFileTest(
    qase([936], 'File library colors - delete'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Delete color and save', async () => {
        await assetsPanelPage.deleteFileLibraryColor();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify color is removed and Colors shows 0 items',
        async () => {
          await assetsPanelPage.isColorNotAddedToFileLibraryColors();
          await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
          await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
        },
      );
    },
  );

  mainAccountFileTest(qase([2909], 'File library colors - duplicate'), async () => {
    await mainAccountFileTest.step('Duplicate color', async () => {
      await assetsPanelPage.duplicateFileLibraryColor();
    });

    await mainAccountFileTest.step('Verify the color is duplicated', async () => {
      const count: number = 2;
      await assetsPanelPage.checkCountLibraryColorWithName(hexColor, count);
    });
  });

  mainAccountFileTest(
    qase([937], 'File library colors - create group'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create group for color', async () => {
        await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify group is created and color is not visible',
        async () => {
          await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
          await assetsPanelPage.isColorToFileLibraryColorsNotVisible();
        },
      );
    },
  );

  mainAccountFileTest(
    qase([939], 'File library colors - rename group'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create and rename group', async () => {
        await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.renameGroupFileLibrary('New Group');
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify renamed group and screenshot',
        async () => {
          await assetsPanelPage.isFileLibraryGroupCreated('New Group');
          await expect(
            assetsPanelPage.assetsPanel,
            'Renamed group should match screenshot',
          ).toHaveScreenshot('group-colors-renamed.png');
        },
      );
    },
  );

  mainAccountFileTest(
    qase([942], 'File library colors- ungroup'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Create group and ungroup', async () => {
        await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.ungroupFileLibrary();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step(
        'Verify group is removed and color is restored',
        async () => {
          await assetsPanelPage.isFileLibraryGroupRemoved();
          await assetsPanelPage.isColorAddedToFileLibraryColors(hexColor);
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1027], 'File library colors - apply to stroke'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Create board and apply color to stroke',
        async () => {
          await mainPage.clickCreateBoardButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickAddStrokeButton();
          await assetsPanelPage.clickAndPressAltFileLibraryColorsColorBullet();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickViewportByCoordinates(900, 100, 3);
        },
      );

      await mainAccountFileTest.step('Verify color applied to stroke', async () => {
        await expect(
          mainPage.viewport,
          'Color should be applied to board stroke',
        ).toHaveScreenshot('apply-color-to-stroke-board.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );
});
