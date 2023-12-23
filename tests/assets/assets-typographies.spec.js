const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  'AS-37 Filter Typographies from All Assets drop-down',
  async ({ page }) => {
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.selectTypeFromAllAssetsSelector('Typographies');
    await assetsPanelPage.isAssetsSectionNameDisplayed('Typographies', '0');
  },
);

mainTest(
  'AS-38 Typographic styles - add from Assets panel',
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-add-typography-expanded.png',
    );
    await assetsPanelPage.minimizeFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-add-typography-minimized.png',
    );
    await assetsPanelPage.expandFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-add-typography-expanded.png',
    );
  },
);

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.minimizeFileLibraryTypography();
  });

  mainTest('AS-40 Typographic styles - edit', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.editFileLibraryTypography();
    await assetsPanelPage.selectFont('Bellefair');
    await assetsPanelPage.selectFontSize('12');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-edit-typography-expanded.png',
    );
    await assetsPanelPage.minimizeFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-edit-typography-minimized.png',
    );
    await assetsPanelPage.expandFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-edit-typography-expanded.png',
    );
  });

  mainTest('AS-41 Typographic styles - rename', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.renameFileLibraryTypography('Test Font');
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-rename-typography-minimized.png',
    );
    await assetsPanelPage.expandFileLibraryTypography();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-rename-typography-expanded.png',
    );
  });

  mainTest('AS-42 Typographic styles - delete', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.deleteFileLibraryTypography();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-deleted-typography.png',
    );
  });

  mainTest('AS-43 Typographic styles - create group', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.createGroupFileLibraryAssets(
      'Typographies',
      'Test Group',
    );
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-typographies.png',
    );
  });

  mainTest('AS-45 Typographic styles - rename group', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.createGroupFileLibraryAssets(
      'Typographies',
      'Test Group',
    );
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-typographies-renamed.png',
    );
  });

  mainTest('AS-48 Typographic styles - ungroup', async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.createGroupFileLibraryAssets(
      'Typographies',
      'Test Group',
    );
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.ungroupFileLibrary();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupRemoved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-add-typography-minimized.png',
    );
  });

  mainTest(
    'AS-50 Typographic styles - apply style to text from Assets panel',
    async ({ page, browserName }) => {
      const mainPage = new MainPage(page);
      const assetsPanelPage = new AssetsPanelPage(page);
      await assetsPanelPage.editFileLibraryTypography();
      await assetsPanelPage.selectFont('Bad Script');
      await assetsPanelPage.selectFontSize('36');
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.minimizeFileLibraryTypography();
      await mainPage.createDefaultTextLayer(browserName);
      await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportTwice();
      await expect(mainPage.viewport).toHaveScreenshot(
        'apply-typography-to-text_from_assets.png',
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest(
    'AS-54 Typographic styles - apply style to text from Typographies panel',
    async ({ page, browserName }) => {
      const mainPage = new MainPage(page);
      const assetsPanelPage = new AssetsPanelPage(page);
      await assetsPanelPage.editFileLibraryTypography();
      await assetsPanelPage.selectFont('Bad Script');
      await assetsPanelPage.selectFontSize('36');
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.minimizeFileLibraryTypography();
      await mainPage.createDefaultTextLayer(browserName);
      await mainPage.pressOpenTypographiesBottomPanelShortcut();
      await mainPage.clickFontRecordOnTypographiesBottomPanel();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportTwice();
      await expect(mainPage.viewport).toHaveScreenshot(
        'apply-typography-to-text.png',
        {
          mask: [mainPage.guides, mainPage.typographiesColorsBottomPanel],
        },
      );
    },
  );
});
