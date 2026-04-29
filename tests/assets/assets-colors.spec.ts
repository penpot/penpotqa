import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { expect } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { TeamPage } from '@pages/dashboard/team-page';

const teamName = createTeamName();

let mainPage: MainPage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let assetsPanelPage: AssetsPanelPage;
let colorPalettePopUp: ColorPalettePage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  colorPalettePopUp = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([932], 'Filter Colors from All Assets drop-down'), async () => {
  await mainTest.step('Open assets tab and filter by Colors', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
  });

  await mainTest.step('Verify Colors section shows 0 items', async () => {
    await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePopUp.setHex('#ffff00');
    await colorPalettePopUp.clickSaveColorStyleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([933], 'File library colors - add'), async () => {
    await mainTest.step('Verify color is added to file library', async () => {
      await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00');
    });
  });

  mainTest(qase([934], 'Edit Color Asset After Applying to Element'), async () => {
    await mainTest.step('Create shapes and apply color', async () => {
      await mainPage.createDefaultBoardByCoordinates(500, 200);
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickFileLibraryColorsColorBullet();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickFileLibraryColorsColorBullet();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify color applied to shapes', async () => {
      await expect(
        mainPage.viewport,
        'Color should be applied to shapes',
      ).toHaveScreenshot('apply-color-to-shapes.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Edit color and save', async () => {
      await assetsPanelPage.editFileLibraryColor();
      await colorPalettePopUp.setHex('#00ff00');
      await colorPalettePopUp.clickSaveColorStyleButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
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
  });

  mainTest(qase([935], 'File library colors - rename'), async () => {
    await mainTest.step('Rename color and save', async () => {
      await assetsPanelPage.renameFileLibraryColor('test color');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify renamed color in library', async () => {
      await assetsPanelPage.isColorAddedToFileLibraryColors('test color#ffff00');
    });
  });

  mainTest(qase([936], 'File library colors - delete'), async () => {
    await mainTest.step('Delete color and save', async () => {
      await assetsPanelPage.deleteFileLibraryColor();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify color is removed and Colors shows 0 items',
      async () => {
        await assetsPanelPage.isColorNotAddedToFileLibraryColors();
        await assetsPanelPage.selectTypeFromAllAssetsDropdown('Colors');
        await assetsPanelPage.isAssetsSectionNameDisplayed('Colors', '0');
      },
    );
  });

  mainTest(qase([937], 'File library colors - create group'), async () => {
    await mainTest.step('Create group for color', async () => {
      await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify group is created and color is not visible',
      async () => {
        await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
        await assetsPanelPage.isColorToFileLibraryColorsNotVisible();
      },
    );
  });

  mainTest(qase([939], 'File library colors - rename group'), async () => {
    await mainTest.step('Create and rename group', async () => {
      await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.renameGroupFileLibrary('New Group');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify renamed group and screenshot', async () => {
      await assetsPanelPage.isFileLibraryGroupCreated('New Group');
      await expect(
        assetsPanelPage.assetsPanel,
        'Renamed group should match screenshot',
      ).toHaveScreenshot('group-colors-renamed.png');
    });
  });

  mainTest(qase([942], 'File library colors- ungroup'), async () => {
    await mainTest.step('Create group and ungroup', async () => {
      await assetsPanelPage.createGroupFileLibraryAssets('Colors', 'Test Group');
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.ungroupFileLibrary();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify group is removed and color is restored',
      async () => {
        await assetsPanelPage.isFileLibraryGroupRemoved();
        await assetsPanelPage.isColorAddedToFileLibraryColors('#ffff00');
      },
    );
  });

  mainTest(qase([1027], 'File library colors - apply to stroke'), async () => {
    await mainTest.step('Create board and apply color to stroke', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddStrokeButton();
      await assetsPanelPage.clickAndPressAltFileLibraryColorsColorBullet();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportByCoordinates(900, 100, 3);
    });

    await mainTest.step('Verify color applied to stroke', async () => {
      await expect(
        mainPage.viewport,
        'Color should be applied to board stroke',
      ).toHaveScreenshot('apply-color-to-stroke-board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});
