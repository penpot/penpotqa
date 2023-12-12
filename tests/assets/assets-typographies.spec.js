const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");

const teamName = random().concat("autotest");

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
  "AS-37 Filter Typographies from All Assets drop-down",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.selectTypeFromAllAssetsSelector("Typographies");
    await mainPage.isAssetsTitleDisplayed("Typographies (0)");
  },
);

mainTest(
  "AS-38 Typographic styles - add from Assets panel",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "typographies-add-typography-expanded.png",
    );
    await mainPage.minimizeFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "typographies-add-typography-minimized.png",
    );
    await mainPage.expandFileLibraryTypography();
    await mainPage.clickViewportTwice();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "typographies-add-typography-expanded.png",
    );
  },
);

mainTest("AS-40 Typographic styles - edit", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.editFileLibraryTypography();
  await mainPage.selectFont("Bellefair");
  await mainPage.selectFontSize("12");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-edit-typography-expanded.png",
  );
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-edit-typography-minimized.png",
  );
  await mainPage.expandFileLibraryTypography();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-edit-typography-expanded.png",
  );
});

mainTest("AS-41 Typographic styles - rename", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.renameFileLibraryTypography("Test Font");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-rename-typography-expanded.png",
  );
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-rename-typography-minimized.png",
  );
  await mainPage.expandFileLibraryTypography();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-rename-typography-expanded.png",
  );
});

mainTest("AS-42 Typographic styles - delete", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.deleteFileLibraryTypography();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-deleted-typography.png",
  );
});

mainTest("AS-43 Typographic styles - create group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.createGroupFileLibraryTypographies("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("Test Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot("group-typographies.png");
});

mainTest("AS-45 Typographic styles - rename group", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.createGroupFileLibraryTypographies("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.renameGroupFileLibrary("New Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupCreated("New Group");
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "group-typographies-renamed.png",
  );
});

mainTest("AS-48 Typographic styles - ungroup", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickAssetsTab();
  await mainPage.clickAddFileLibraryTypographyButton();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickViewportTwice();
  await mainPage.minimizeFileLibraryTypography();
  await mainPage.createGroupFileLibraryTypographies("Test Group");
  await mainPage.waitForChangeIsSaved();
  await mainPage.ungroupFileLibrary();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isFileLibraryGroupRemoved();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "typographies-add-typography-minimized.png",
  );
});

mainTest(
  "AS-50 Typographic styles - apply style to text from Assets panel",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await mainPage.minimizeFileLibraryTypography();
    await mainPage.editFileLibraryTypography();
    await mainPage.selectFont("Bad Script");
    await mainPage.selectFontSize("36");
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await mainPage.minimizeFileLibraryTypography();
    await mainPage.createDefaultTextLayer(browserName);
    await mainPage.clickFileLibraryTypographiesTypographyRecord();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot(
      "apply-typography-to-text_from_assets.png",
      {
        mask: [mainPage.guides],
      },
    );
  },
);

mainTest(
  "AS-54 Typographic styles - apply style to text from Typographies panel",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickAssetsTab();
    await mainPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await mainPage.minimizeFileLibraryTypography();
    await mainPage.editFileLibraryTypography();
    await mainPage.selectFont("Bad Script");
    await mainPage.selectFontSize("36");
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await mainPage.minimizeFileLibraryTypography();
    await mainPage.createDefaultTextLayer(browserName);
    await mainPage.pressOpenTypographiesBottomPanelShortcut();
    await mainPage.clickFontRecordOnTypographiesBottomPanel();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportTwice();
    await expect(mainPage.viewport).toHaveScreenshot(
      "apply-typography-to-text.png",
      {
        mask: [mainPage.guides],
      },
    );
  },
);
