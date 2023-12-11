const base = require("@playwright/test");
const { LoginPage } = require("./pages/login-page.js");
const { DashboardPage } = require("./pages/dashboard/dashboard-page.js");

const mainTest = base.test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.isHeaderDisplayed("Projects");
    await use(page);
  },
});

const dashboardTest = base.test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.isDashboardOpenedAfterLogin();
    await dashboardPage.isHeaderDisplayed("Projects");
    await use(page);
  },
});

const performanceTest = base.test.extend({
  workingFile: [
    "documents/Penpot - Design System v2.0.penpot",
    { option: true },
  ],
  workingShapes: [
    {
      pageId: "582296a0-d6b1-11ec-a04a-cf2544e40df7",
      singleId: "#shape-5bb9c720-d6b1-11ec-a04a-cf2544e40df7",
      multipleFrameTitleId: "#frame-title-5bb92ae0-d6b1-11ec-a04a-cf2544e40df7",
      multipleIds: [
        "#shape-5bb951f0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bb97900-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bb9a010-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bb9c720-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bb9ee30-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bba3c50-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbab180-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbad890-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbaffa0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbb26b0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbb4dc0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbb74d0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbc1111-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbc8640-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbcad51-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbd4990-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbd70a0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbdbec0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbe8211-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbef741-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bbfe1a0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc02fc1-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc14131-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc22b91-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc2eee0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc33d00-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc38b20-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc3d941-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc49c91-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc55fe1-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc64a40-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc69861-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc7d0e0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bc90961-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bcade20-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bcb2c41-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bcbef91-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bccd9f1-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bce1270-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bce6091-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bcf4af1-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd05c61-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd146c0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd194e0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd1bbf0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd390b0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd42cf0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd51750-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd56570-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd58c80-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd628c0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd6ec10-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd7af60-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd899c0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bd98420-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bda6e80-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bdae3b0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bdb7ff0-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bdc4340-d6b1-11ec-a04a-cf2544e40df7",
        "#shape-5bdd2da0-d6b1-11ec-a04a-cf2544e40df7",
      ],
      frameTitleId: "#frame-title-5b3247a0-d6b1-11ec-a04a-cf2544e40df7",
      frameId: "#frame-container-5b3247a0-d6b1-11ec-a04a-cf2544e40df7",
    },
    { option: true },
  ],
  page: async ({ page, workingFile }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForPageLoaded();
    await dashboardPage.isHeaderDisplayed("Projects");
    await dashboardPage.deleteProjectsIfExist();
    await dashboardPage.deleteFilesIfExist();
    await dashboardPage.importAndOpenFile(workingFile);
    await use(page);
  },
});

exports.mainTest = mainTest;
exports.dashboardTest = dashboardTest;
exports.performanceTest = performanceTest;
