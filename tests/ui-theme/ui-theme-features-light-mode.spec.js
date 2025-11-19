const { mainTest } = require('../../fixtures');
const { expect, test } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');
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

/**
 * Initialize all page objects for a given browser page
 * @param {import('playwright').Page} page - The browser page instance
 * @returns {Object} Object containing all initialized page objects
 */
function initializePageObjects(page) {
  return {
    profilePage: new ProfilePage(page),
    teamPage: new TeamPage(page),
    dashboardPage: new DashboardPage(page),
    mainPage: new MainPage(page),
    assetsPanelPage: new AssetsPanelPage(page),
    inspectPanelPage: new InspectPanelPage(page),
    viewModePage: new ViewModePage(page),
  };
}

/**
 * Setup light theme for testing
 * @param {ProfilePage} profilePageInstance - Profile page instance
 * @param {TeamPage} teamPageInstance - Team page instance
 */
async function setupLightTheme(profilePageInstance, teamPageInstance) {
  await teamPageInstance.createTeam(teamName);
  await teamPageInstance.isTeamSelected(teamName);
  await profilePageInstance.openYourAccountPage();
  await profilePageInstance.openSettingsTab();
  await profilePageInstance.selectLightTheme();
}

mainTest.beforeEach(async ({ page }) => {
  const pages = initializePageObjects(page);
  ({
    profilePage,
    teamPage,
    dashboardPage,
    mainPage,
    assetsPanelPage,
    inspectPanelPage,
    viewModePage,
  } = pages);

  await setupLightTheme(profilePage, teamPage);
});

mainTest.afterEach(async () => {
  try {
    await profilePage.goToAccountPage();
    await profilePage.openSettingsTab();
    await profilePage.selectDarkTheme();
    await profilePage.backToDashboardFromAccount();
  } catch (e) {
    console.log('Error in theme cleanup:', e.message);
  }
});

mainTest(
  qase(
    [1677, 1678, 1679, 1680],
    'Check Projects page, Check Fonts page, Check Teams page (Settings tab), Check "Your Account" page (Profile tab)',
  ),
  async ({}) => {
    await test.step('(1680) Check "Your Account" page (Profile tab)', async () => {
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
    });

    await test.step('(1677) Check Projects page', async () => {
      await profilePage.backToDashboardFromAccount();
      await expect(dashboardPage.dashboardSection).toHaveScreenshot(
        'dashboard-image.png',
        {
          mask: [profilePage.profileMenuButton, teamPage.teamCurrentNameDiv],
          maxDiffPixelRatio: 0.01,
        },
      );
    });

    await test.step('(1678) Check Fonts page', async () => {
      await dashboardPage.openSidebarItem('Fonts');
      await expect(teamPage.teamSettingsSection).toHaveScreenshot('fonts-image.png');
    });

    await test.step('(1679) Check Teams page (Settings tab)', async () => {
      await teamPage.openTeamSettingsPageViaOptionsMenu();
      await teamPage.checkTeamSettingsTabContent();
    });
  },
);

mainTest(
  qase(
    [1681, 1682, 1683, 1685],
    'Check Layers tab, Check Design tab, Check Assets tab, Check Inspect tab',
  ),
  async ({}) => {
    await test.step('(1681, 1682) Check Layers and Design tab', async () => {
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
    });

    await test.step('(1683) Check Assets tab', async () => {
      await assetsPanelPage.clickAssetsTab();
      await expect(mainPage.fileLeftSidebarAside).toHaveScreenshot(
        'assets-file-left-sidebar-image.png',
        {
          mask: [mainPage.fileNameSpan, assetsPanelPage.librariesOpenModalButton],
        },
      );
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
        'assets-file-right-sidebar-image.png',
        {
          mask: [mainPage.usersSection],
        },
      );
    });

    await test.step('(1685) Check Inspect tab', async () => {
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.waitForCodeButtonVisible();
      await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
        'inspect-file-right-sidebar-image.png',
        {
          mask: [mainPage.usersSection],
        },
      );
    });
  },
);

mainTest(
  qase([1686, 1687], 'Check Inspect tab, Check Interactions tab'),
  async ({}) => {
    await test.step('(1687) Check Interactions tab', async () => {
      await profilePage.backToDashboardFromAccount();
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeButton();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(15000);
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'view-mode-page-image.png',
        { maxDiffPixelRatio: 0.0002 },
      );
    });

    await test.step('(1686) Check Inspect tab', async () => {
      await viewModePage.openInspectTab();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'view-mode-inspect-page-image.png',
        { maxDiffPixelRatio: 0.0002 },
      );
    });
  },
);
