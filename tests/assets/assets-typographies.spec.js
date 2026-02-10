const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, dashboardPage, mainPage, assetsPanelPage;

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
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.selectTypeFromAllAssetsDropdown('Typographies');
  await assetsPanelPage.isAssetsSectionNameDisplayed('Typographies', '0');
});

mainTest(qase([948], 'Typographic styles - add from Assets panel'), async () => {
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
    'typographies-add-typography-expanded.png',
    { maxDiffPixels: 10 },
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
      await mainPage.createDefaultTextLayerByCoordinates(200, 200);
      await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
      await mainPage.clickViewportTwice();
      await mainPage.createDefaultTextLayerByCoordinates(200, 400);
      await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'apply-typography-to-text_from_assets.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
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
      await expect(mainPage.viewport).toHaveScreenshot(
        'edited-typography-to-text_from_assets.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest(qase([951], 'Typographic styles - rename'), async () => {
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

  mainTest(qase([952], 'Typographic styles - delete'), async () => {
    await assetsPanelPage.deleteFileLibraryTypography();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-deleted-typography.png',
    );
  });

  mainTest(qase([953], 'Typographic styles - create group'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Typographies', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-typographies.png',
    );
  });

  mainTest(qase([955], 'Typographic styles - rename group'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Typographies', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-typographies-renamed.png',
    );
  });

  mainTest(qase([958], 'Typographic styles - ungroup'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Typographies', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.ungroupFileLibrary();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupRemoved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-add-typography-minimized.png',
    );
  });

  mainTest(
    qase([964], 'Typographic styles - apply style to text from Typographies panel'),
    async ({ browserName }) => {
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
          mask: [
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
            mainPage.typographiesColorsBottomPanel,
          ],
        },
      );
    },
  );
});
