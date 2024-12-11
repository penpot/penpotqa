const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { test } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { HistoryPanelPage } = require('../../pages/workspace/history-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { waitMessage } = require('../../helpers/gmail');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest(
  qase(874, 'PF-156 Perform a change and check the status'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.isUnSavedChangesDisplayed();
    await mainPage.waitForChangeIsSaved();
  },
);

mainTest(
  qase(890, 'PF-172 Open history panel with recent changes'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickHistoryPanelButton();
    await mainPage.clickHistoryActionsButton();
    await mainPage.isActionDisplayedOnHistoryPanel('New board');
  },
);

mainTest(
  qase(1931, 'Open history version panel (via main menu)'),
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const historyPage = new HistoryPanelPage(page);
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.clickShowVersionsMainMenuSubItem();
    await historyPage.isVersionListEmpty();
  },
);

mainTest(
  qase(1930, 'Open history version panel (shortcut Alt+H)'),
  async ({ page }) => {
    const historyPage = new HistoryPanelPage(page);
    await historyPage.clickShortcutAltH();
    await historyPage.isVersionListEmpty();
  },
);

mainTest.describe(() => {
  const versionName = 'test version';

  mainTest.beforeEach(async ({ page }) => {
    const historyPage = new HistoryPanelPage(page);
    await historyPage.createDefaultRectangleByCoordinates(200, 200);
    await historyPage.waitForChangeIsSaved();
    await historyPage.clickHistoryPanelButton();
    await historyPage.clickSaveVersionButton();
    await historyPage.renameVersion(versionName);
  });

  mainTest(qase(1929, 'Save version via history panel'), async ({ page }) => {
    const historyPage = new HistoryPanelPage(page);
    await historyPage.checkVersionName(versionName);
  });

  mainTest(
    qase(1945, 'Check scrolling in the version list (more than 14 versions)'),
    async ({ page }) => {
      const historyPage = new HistoryPanelPage(page);
      await historyPage.multipleSaveDefaultVersions(14);
      await historyPage.checkFirstVersionName(versionName);
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }) => {
    const historyPage = new HistoryPanelPage(page);
    await historyPage.createDefaultRectangleByCoordinates(200, 200);
    await historyPage.waitForChangeIsSaved();
    await historyPage.clickHistoryPanelButton();
    await historyPage.clickSaveVersionButton();
    await historyPage.clickViewportTwice();
  });

  mainTest.describe(() => {
    mainTest.beforeEach(async ({ page }) => {
      const historyPage = new HistoryPanelPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      await layersPanelPage.selectLayerByName('Rectangle');
      await historyPage.pressDeleteKeyboardButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
      await historyPage.selectVersionOption('Restore');
    });

    mainTest(
      qase(
        [1932, 1937],
        'Restore version via history panel' +
          'Verify the creation of an autosaved version after Restore',
      ),
      async ({ page }) => {
        const historyPage = new HistoryPanelPage(page);
        const layersPanelPage = new LayersPanelPage(page);
        await historyPage.clickRestoreVersionButton();
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', true);
        await historyPage.isHistoryPanelVisible(false);
        await historyPage.clickHistoryPanelButton();
        await historyPage.checkAutosaveVersionsCount('1');
      },
    );

    mainTest(
      qase(1933, 'Cancel restore version via history panel'),
      async ({ page }) => {
        const historyPage = new HistoryPanelPage(page);
        const layersPanelPage = new LayersPanelPage(page);
        await historyPage.clickCancelRestoreVersionButton();
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
        await historyPage.isHistoryPanelVisible(true);
      },
    );

    mainTest.describe(() => {
      mainTest.beforeEach(async ({ page }) => {
        const historyPage = new HistoryPanelPage(page);
        const layersPanelPage = new LayersPanelPage(page);
        await historyPage.clickRestoreVersionButton();
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', true);
        await historyPage.isHistoryPanelVisible(false);
        await historyPage.clickHistoryPanelButton();
        await historyPage.clickOnAutosaveVersionsButton();
      });

      mainTest(
        qase(1938, 'Restore autosaved version via history panel'),
        async ({ page }) => {
          const historyPage = new HistoryPanelPage(page);
          const layersPanelPage = new LayersPanelPage(page);
          await historyPage.selectSnapshotOption('Restore version');
          await historyPage.clickRestoreVersionButton();
          await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
          await historyPage.isHistoryPanelVisible(false);
          await historyPage.clickHistoryPanelButton();
          await historyPage.checkAutosaveVersionsCount('2');
        },
      );

      mainTest(
        qase(1943, 'Pin the autosaved version via history panel'),
        async ({ page }) => {
          const versionName = 'pin version';
          const historyPage = new HistoryPanelPage(page);
          const layersPanelPage = new LayersPanelPage(page);
          await historyPage.selectSnapshotOption('Pin version');
          await historyPage.renameVersion(versionName);
          await historyPage.checkLastVersionName(versionName);
          await historyPage.isAutosaveVersionsVisible(false);
        },
      );
    });
  });

  mainTest(qase(1934, 'Rename version via history panel'), async ({ page }) => {
    const versionName = 'renamed version';
    const historyPage = new HistoryPanelPage(page);
    await historyPage.selectVersionOption('Rename');
    await historyPage.renameVersion(versionName);
    await historyPage.checkVersionName(versionName);
  });

  mainTest(qase(1935, 'Delete version via history panel'), async ({ page }) => {
    const historyPage = new HistoryPanelPage(page);
    await historyPage.selectVersionOption('Delete');
    await historyPage.isVersionListEmpty();
  });
});

mainTest.describe(() => {
  mainTest.afterEach(async ({ page }, testInfo) => {
    const teamPage = new TeamPage(page);
    const mainPage = new MainPage(page);
    const profilePage = new ProfilePage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    await mainPage.backToDashboardFromFileEditor();
    await profilePage.logout();
    await loginPage.waitLoginPage();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(teamName);
    await dashboardPage.openFile();
  });

  mainTest(
    qase(
      [1939, 1940, 1941],
      "Verification of displaying other users' versions in the version list" +
        'Setting "My Versions/ All Versions" filters in the version list',
    ),
    async ({ page }, testInfo) => {
      const versionName = 'test version';
      await testInfo.setTimeout(testInfo.timeout + 30000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      const historyPage = new HistoryPanelPage(page);
      const layersPanelPage = new LayersPanelPage(page);

      await historyPage.createDefaultBoardByCoordinates(200, 200);
      await historyPage.waitForChangeIsSaved();
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickSaveVersionButton();
      await historyPage.renameVersion(versionName);
      await layersPanelPage.selectLayerByName('Board');
      await historyPage.pressDeleteKeyboardButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Board', false);
      await historyPage.selectVersionOption('Restore');
      await historyPage.clickRestoreVersionButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Board', true);
      await historyPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await dashboardPage.openFile();
      await historyPage.waitForViewportVisible();

      await historyPage.createDefaultEllipseByCoordinates(400, 200);
      await historyPage.waitForChangeIsSaved();
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickSaveVersionButton();
      await historyPage.renameVersion(versionName);
      await layersPanelPage.selectLayerByName('Ellipse');
      await historyPage.pressDeleteKeyboardButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Ellipse', false);
      await historyPage.selectVersionOption('Restore');
      await historyPage.clickRestoreVersionButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
      await historyPage.isHistoryPanelVisible(false);
      await historyPage.clickHistoryPanelButton();

      await historyPage.isOtherUserVersionVisible(true);
      await historyPage.changeVersionFilter('My versions');
      await historyPage.isOtherUserVersionVisible(false);
      await historyPage.isAutosaveVersionsVisible(false);
      await historyPage.changeVersionFilter('All versions');
      await historyPage.isOtherUserVersionVisible(true);
      await historyPage.isAutosaveVersionsVisible(true);
    },
  );
});
