const { mainTest } = require("../../../fixtures");
const { MainPage } = require("../../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { random } = require("../../../helpers/string-generator");
const { DashboardPage } = require("../../../pages/dashboard/dashboard-page");
const { TeamPage } = require("../../../pages/dashboard/team-page");

const teamName = random().concat("autotest");

test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const teamPage = new TeamPage(page);
    const mainPage = new MainPage(page);
    await teamPage.createTeam(teamName);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    const mainPage = new MainPage(page);
    await mainPage.backToDashboardFromFileEditor();
    await teamPage.deleteTeam(teamName);
});

mainTest("Undo deleted component", async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.deleteLayerViaRightClick();
    await expect(mainPage.viewport).toHaveScreenshot("rectangle-component-delete.png");
    await mainPage.clickShortcutCtrlZ(browserName);
    await expect(mainPage.viewport).toHaveScreenshot("rectangle-component-delete-undo.png");
});
