import { mainTest } from 'fixtures';
import { expect } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';
import { random } from 'helpers/string-generator';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = random().concat('autotest');

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let assetsPanelPage: AssetsPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([947], 'Filter Typographies from All Assets drop-down'), async () => {
  await mainTest.step('Open assets tab and filter by Typographies', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Typographies');
  });

  await mainTest.step('Verify Typographies section shows 0 items', async () => {
    await assetsPanelPage.isAssetsSectionNameDisplayed('Typographies', '0');
  });
});

mainTest(qase([948], 'Typographic styles - add from Assets panel'), async () => {
  await mainTest.step('Add typography from assets panel', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify typography added in expanded state', async () => {
    await expect(
      assetsPanelPage.assetsPanel,
      'Added typography should be visible in expanded state',
    ).toHaveScreenshot('typographies-add-typography-expanded.png', {
      maxDiffPixels: 10,
    });
  });

  await mainTest.step('Minimize, expand and verify screenshots match', async () => {
    await assetsPanelPage.minimizeFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(
      assetsPanelPage.assetsPanel,
      'Minimized typography should match screenshot',
    ).toHaveScreenshot('typographies-add-typography-minimized.png');
    await assetsPanelPage.expandFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(
      assetsPanelPage.assetsPanel,
      'Expanded typography should match screenshot',
    ).toHaveScreenshot('typographies-add-typography-expanded.png');
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.minimizeFileLibraryTypography();
  });

  mainTest(
    qase([950], 'Edit Typography Asset After Applying to Element'),
    async () => {
      await mainTest.step('Create text layers and apply typography', async () => {
        await mainPage.createDefaultTextLayerByCoordinates(200, 200);
        await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
        await mainPage.clickViewportTwice();
        await mainPage.createDefaultTextLayerByCoordinates(200, 400);
        await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify typography applied to text layers', async () => {
        await expect(
          mainPage.viewport,
          'Typography should be applied to text layers',
        ).toHaveScreenshot('apply-typography-to-text_from_assets.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Edit typography font and size', async () => {
        await assetsPanelPage.editFileLibraryTypography();
        await assetsPanelPage.selectFont('Bellefair');
        await assetsPanelPage.selectFontSize('12');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportTwice();
      });

      await mainTest.step('Verify edited typography screenshots', async () => {
        await expect(
          assetsPanelPage.assetsPanel,
          'Edited typography should match expanded screenshot',
        ).toHaveScreenshot('typographies-edit-typography-expanded.png');
        await assetsPanelPage.minimizeFileLibraryTypography();
        await mainPage.clickViewportTwice();
        await expect(
          assetsPanelPage.assetsPanel,
          'Edited typography should match minimized screenshot',
        ).toHaveScreenshot('typographies-edit-typography-minimized.png');
        await assetsPanelPage.expandFileLibraryTypography();
        await mainPage.clickViewportTwice();
        await expect(
          assetsPanelPage.assetsPanel,
          'Edited typography should match expanded screenshot',
        ).toHaveScreenshot('typographies-edit-typography-expanded.png');
        await expect(
          mainPage.viewport,
          'Edited typography should be reflected on text layers',
        ).toHaveScreenshot('edited-typography-to-text_from_assets.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([951], 'Typographic styles - rename'), async () => {
    await mainTest.step('Rename typography and save', async () => {
      await assetsPanelPage.renameFileLibraryTypography('Test Font');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportTwice();
    });

    await mainTest.step('Verify renamed typography screenshots', async () => {
      await expect(
        assetsPanelPage.assetsPanel,
        'Renamed typography should match minimized screenshot',
      ).toHaveScreenshot('typographies-rename-typography-minimized.png');
      await assetsPanelPage.expandFileLibraryTypography();
      await mainPage.waitForChangeIsSaved();
      await expect(
        assetsPanelPage.assetsPanel,
        'Renamed typography should match expanded screenshot',
      ).toHaveScreenshot('typographies-rename-typography-expanded.png');
    });
  });

  mainTest(qase([952], 'Typographic styles - delete'), async () => {
    await mainTest.step('Delete typography and save', async () => {
      await assetsPanelPage.deleteFileLibraryTypography();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify typography is deleted', async () => {
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should show empty typographies',
      ).toHaveScreenshot('typographies-deleted-typography.png');
    });
  });

  mainTest(qase([953], 'Typographic styles - create group'), async () => {
    await mainTest.step('Create group for typography', async () => {
      await assetsPanelPage.createGroupFileLibraryAssets(
        'Typographies',
        'Test Group',
      );
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify group is created and screenshot matches',
      async () => {
        await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
        await expect(
          assetsPanelPage.assetsPanel,
          'Grouped typography should match screenshot',
        ).toHaveScreenshot('group-typographies.png');
      },
    );
  });

  mainTest(qase([955], 'Typographic styles - rename group'), async () => {
    await mainTest.step('Create and rename group', async () => {
      await assetsPanelPage.createGroupFileLibraryAssets(
        'Typographies',
        'Test Group',
      );
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.renameGroupFileLibrary('New Group');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify renamed group and screenshot', async () => {
      await assetsPanelPage.isFileLibraryGroupCreated('New Group');
      await expect(
        assetsPanelPage.assetsPanel,
        'Renamed group typography should match screenshot',
      ).toHaveScreenshot('group-typographies-renamed.png');
    });
  });

  mainTest(qase([958], 'Typographic styles - ungroup'), async () => {
    await mainTest.step('Create group and ungroup', async () => {
      await assetsPanelPage.createGroupFileLibraryAssets(
        'Typographies',
        'Test Group',
      );
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.ungroupFileLibrary();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify group is removed', async () => {
      await assetsPanelPage.isFileLibraryGroupRemoved();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should show ungrouped typography',
      ).toHaveScreenshot('typographies-add-typography-minimized.png');
    });
  });

  mainTest(
    qase([964], 'Typographic styles - apply style to text from Typographies panel'),
    async () => {
      await mainTest.step('Edit typography font and size', async () => {
        await assetsPanelPage.editFileLibraryTypography();
        await assetsPanelPage.selectFont('Bad Script');
        await assetsPanelPage.selectFontSize('36');
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.minimizeFileLibraryTypography();
      });

      await mainTest.step(
        'Create text layer and apply typography from bottom panel',
        async () => {
          await mainPage.createDefaultTextLayer();
          await mainPage.pressOpenTypographiesBottomPanelShortcut();
          await mainPage.clickFontRecordOnTypographiesBottomPanel();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickViewportTwice();
        },
      );

      await mainTest.step('Verify typography applied to text', async () => {
        await expect(
          mainPage.viewport,
          'Typography should be applied to text layer',
        ).toHaveScreenshot('apply-typography-to-text.png', {
          mask: [
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
            mainPage.typographiesColorsBottomPanel,
          ],
        });
      });
    },
  );
});
