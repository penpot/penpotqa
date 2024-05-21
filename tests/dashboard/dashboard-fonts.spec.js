const { mainTest } = require('../../fixtures');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(qase(1152,'DA-66 Upload single font'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Pacifico.ttf');
  await dashboardPage.isFontExists('Pacifico', 'Regular');
});

mainTest(qase(1154,'DA-68 Fonts - upload fail invalid file format'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFontWithInvalidFormat('images/images.png');
});

mainTest(qase(1155,'DA-69 Search font'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/ArialTh.ttf');
  await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
  await dashboardPage.searchFont('Arial Th');
  await dashboardPage.isFontExists('Arial Th', 'Regular');
  await dashboardPage.isFontNotExist('Allura-Regular');
});

mainTest(qase(1157,'DA-71 Edit font BUG'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
  await dashboardPage.isFontExists('Allura', 'Regular');
  await dashboardPage.editFont('New Test Font');
  await dashboardPage.isFontExists('New Test Font', 'Regular');
});

mainTest(qase(1158,'DA-72 Delete font'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Pacifico.ttf');
  await dashboardPage.isFontExists('Pacifico', 'Regular');
  await dashboardPage.deleteFont();
  await dashboardPage.isFontsTablePlaceholderDisplayed(
    'Custom fonts you upload will appear here.',
  );
});

mainTest(qase(1159,'DA-73 Delete font - Cancel button check'), async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Pacifico.ttf');
  await dashboardPage.isFontExists('Pacifico', 'Regular');
  await dashboardPage.cancelDeleteFont();
  await dashboardPage.isFontExists('Pacifico', 'Regular');
});
