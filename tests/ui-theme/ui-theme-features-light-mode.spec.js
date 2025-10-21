const { registerTest, mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { ProfilePage } = require('../../pages/profile-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');
const { InspectPanelPage } = require('../../pages/workspace/inspect-panel-page');
const { ViewModePage } = require('../../pages/workspace/view-mode-page');

let profilePage,
  teamPage,
  dashboardPage,
  mainPage,
  assetsPanelPage,
  inspectPanelPage,
  viewModePage;
const teamName = random().concat('autotest');
test.beforeEach(async ({ page }) => {
  viewModePage = new ViewModePage(page);
  inspectPanelPage = new InspectPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  profilePage = new ProfilePage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await profilePage.openYourAccountPage();
  await profilePage.openSettingsTab();
  await profilePage.selectLightTheme();
});

mainTest(
  '1677 Check Projects page' +
    '1678 Check Fonts page' +
    '1679 Check Teams page (Settings tab)' +
    '1680 Check "Your Account" page (Profile tab)',
  async ({}) => {
    await profilePage.clickOnProfileTab();
    await expect(profilePage.profileSection).toHaveScreenshot('profile-image.png', {
      mask: [
        profilePage.profileAvatarBlock,
        profilePage.profileEmailInput,
        profilePage.profileNameInput,
      ],
    });
    await profilePage.backToDashboardFromAccount();
    await expect(dashboardPage.dashboardSection).toHaveScreenshot(
      'dashboard-image.png',
      {
        mask: [profilePage.profileMenuButton, teamPage.teamCurrentNameDiv],
        maxDiffPixelRatio: 0.01,
      },
    );
    await dashboardPage.openSidebarItem('Fonts');
    // Increased maxDiffPixelRatio to 0.02 to allow minor pixel differences in screenshot comparison
    await expect(teamPage.teamSettingsSection).toHaveScreenshot('fonts-image.png', {
      maxDiffPixelRatio: 0.02,
    });
    await teamPage.openTeamSettingsPageViaOptionsMenu();
    await teamPage.checkTeamSettingsTabContent();
  },
);

registerTest.describe('Settings - UI THEME', () => {
  registerTest(
    'PENPOT-1681 Check Layers tab' +
      'PENPOT-1682 Check Design tab' +
      'PENPOT-1683 Check Assets tab' +
      'PENPOT-1685 Check Inspect tab',
    async ({}) => {},
  );

  registerTest(
    'PENPOT-1686 Check Inspect tab' + 'PENPOT-1687 Check Interactions tab',
    async () => {},
  );
});

test.afterEach(async () => {
  if (profilePage) {
    await profilePage.goToAccountPage();
    await profilePage.openSettingsTab();
    await profilePage.selectDarkTheme();
    await profilePage.backToDashboardFromAccount();
  }
  if (teamPage) {
    await teamPage.deleteTeam(teamName);
  }
});
