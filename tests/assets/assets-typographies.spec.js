const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, dashboardPage, mainPage, assetsPanelPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(
  qase(947, 'AS-37 Filter Typographies from All Assets drop-down'),
  async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Typographies');
    await assetsPanelPage.isAssetsSectionNameDisplayed('Typographies', '0');
  },
);

mainTest(qase(948, 'AS-38 Typographic styles - add from Assets panel'), async () => {
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
    qase(950, 'Edit Typography Asset After Applying to Element'),
    async ({ browserName }) => {
      await mainPage.createDefaultTextLayerByCoordinates(200, 200, browserName);
      await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
      await mainPage.clickViewportTwice();
      await mainPage.createDefaultTextLayerByCoordinates(200, 400, browserName);
      await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'apply-typography-to-text_from_assets.png',
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
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'edited-typography-to-text_from_assets.png',
      );
    },
  );

  mainTest(qase(951, 'AS-41 Typographic styles - rename'), async () => {
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

  mainTest(qase(952, 'AS-42 Typographic styles - delete'), async () => {
    await assetsPanelPage.deleteFileLibraryTypography();
    await mainPage.waitForChangeIsSaved();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'typographies-deleted-typography.png',
    );
  });

  mainTest(qase(953, 'AS-43 Typographic styles - create group'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Typographies', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-typographies.png',
    );
  });

  mainTest(qase(955, 'AS-45 Typographic styles - rename group'), async () => {
    await assetsPanelPage.createGroupFileLibraryAssets('Typographies', 'Test Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.renameGroupFileLibrary('New Group');
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isFileLibraryGroupCreated('New Group');
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      'group-typographies-renamed.png',
    );
  });

  mainTest(qase(958, 'AS-48 Typographic styles - ungroup'), async () => {
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
    qase(
      964,
      'AS-54 Typographic styles - apply style to text from Typographies panel',
    ),
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
