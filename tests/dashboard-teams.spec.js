const { dashboardTest } = require("../fixtures");
const { DashboardPage } = require("../pages/dashboard-page");
const { test } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.deleteTeamsIfExist();
});

dashboardTest("Create a team", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createTeam("New Test Team");
  await dashboardPage.isTeamSelected("New Test Team");
});

dashboardTest("Delete a team", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createTeam("QA Team");
  await dashboardPage.isTeamSelected("QA Team");
  await dashboardPage.deleteTeam("QA Team");
  await dashboardPage.isTeamDeleted("QA Team");
});
