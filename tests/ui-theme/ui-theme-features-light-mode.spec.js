const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
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

test.describe('Settings - UI THEME', () => {
  mainTest(
    '1677 Check Projects page' +
      '1678 Check Fonts page' +
      '1679 Check Teams page (Settings tab)' +
      '1680 Check "Your Account" page (Profile tab)',
    async ({}) => {
      await profilePage.clickOnProfileTab();
      await expect(profilePage.profileSection).toHaveScreenshot(
        'profile-image.png',
        {
          mask: [
            profilePage.profileAvatarBlock,
            profilePage.profileEmailInput,
            profilePage.profileNameInput,
          ],
        },
      );
      await profilePage.backToDashboardFromAccount();
      await expect(dashboardPage.dashboardSection).toHaveScreenshot(
        'dashboard-image.png',
        {
          mask: [profilePage.profileMenuButton, teamPage.teamCurrentNameDiv],
        },
      );
      await dashboardPage.openSidebarItem('Fonts');
      await expect(teamPage.teamSettingsSection).toHaveScreenshot('fonts-image.png');
      await teamPage.openTeamSettingsPageViaOptionsMenu();
      await expect(teamPage.teamSettingsSection).toHaveScreenshot(
        'team-settings-image.png',
        {
          mask: [
            teamPage.teamIcon,
            teamPage.teamOwnerSection,
            teamPage.teamNameLabel,
          ],
        },
      );
    },
  );

  mainTest(
    'PENPOT-1681 Check Layers tab' +
      'PENPOT-1682 Check Design tab' +
      'PENPOT-1683 Check Assets tab' +
      'PENPOT-1685 Check Inspect tab',
    async ({}) => {
      await profilePage.backToDashboardFromAccount();
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
      await mainPage.createDefaultRectangleByCoordinates(300, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.fileLeftSidebarAside).toHaveScreenshot(
        'layers-file-left-sidebar-image.png',
        {
          mask: [mainPage.fileNameSpan],
        },
      );
      await assetsPanelPage.clickAssetsTab();
      await expect(mainPage.fileLeftSidebarAside).toHaveScreenshot(
        'assets-file-left-sidebar-image.png',
        {
          mask: [mainPage.fileNameSpan],
        },
      );
      await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
        'assets-file-right-sidebar-image.png',
        {
          mask: [mainPage.usersSection],
        },
      );
      await inspectPanelPage.openInspectTab();
      await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
        'inspect-file-right-sidebar-image.png',
        {
          mask: [mainPage.usersSection],
        },
      );
    },
  );

  mainTest(
    'PENPOT-1686 Check Inspect tab' + 'PENPOT-1687 Check Interactions tab',
    async ({}) => {
      await profilePage.backToDashboardFromAccount();
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeButton();
      viewModePage = new ViewModePage(newPage);
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-page-image.png',
        { maxDiffPixelRatio: 0 },
      );
      await viewModePage.openInspectTab();
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-inspect-page-image.png',
        { maxDiffPixelRatio: 0 },
      );
    },
  );
});

test.afterEach(async ({}) => {
  await profilePage.goToAccountPage();
  await profilePage.openSettingsTab();
  await profilePage.selectDarkTheme();
  await profilePage.backToDashboardFromAccount();
  await teamPage.deleteTeam(teamName);
});
