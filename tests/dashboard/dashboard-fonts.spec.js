const { mainTest } = require('../../fixtures');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, dashboardPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

mainTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(1152, 'DA-66 Upload single font'), async () => {
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Pacifico.ttf');
  await dashboardPage.isFontExists('Pacifico', 'Regular');
});

mainTest(qase(1154, 'DA-68 Fonts - upload fail invalid file format'), async () => {
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFontWithInvalidFormat('images/images.png');
});

mainTest(qase(1155, 'DA-69 Search font'), async () => {
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/ArialTh.ttf');
  await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
  await dashboardPage.searchFont('Arial Th');
  await dashboardPage.isFontExists('Arial Th', 'Regular');
  await dashboardPage.isFontNotExist('Allura-Regular');
});

mainTest(qase(1157, 'DA-71 Edit font BUG'), async () => {
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
  await dashboardPage.isFontExists('Allura', 'Regular');
  await dashboardPage.editFont('New Test Font');
  await dashboardPage.isFontExists('New Test Font', 'Regular');
});

mainTest(qase(1158, 'DA-72 Delete font'), async () => {
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Pacifico.ttf');
  await dashboardPage.isFontExists('Pacifico', 'Regular');
  await dashboardPage.deleteFont();
  await dashboardPage.isFontsTablePlaceholderDisplayed(
    'Custom fonts you upload will appear here.',
  );
});

mainTest(qase(1159, 'DA-73 Delete font - Cancel button check'), async () => {
  await dashboardPage.openSidebarItem('Fonts');
  await dashboardPage.uploadFont('fonts/Pacifico.ttf');
  await dashboardPage.isFontExists('Pacifico', 'Regular');
  await dashboardPage.cancelDeleteFont();
  await dashboardPage.isFontExists('Pacifico', 'Regular');
});
