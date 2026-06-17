import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { HistoryPanelPage } from '@pages/workspace/history-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { setupAdminRoleUser } from '../../../helpers/user-flows';
import { createTeamName } from 'helpers/teams/create-team-name';
import { ProfilePage } from '@pages/profile-page';
import { LoginPage } from '@pages/login-page';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let historyPage: HistoryPanelPage;
let layersPanelPage: LayersPanelPage;
let profilePage: ProfilePage;
let loginPage: LoginPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  historyPage = new HistoryPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase(874, 'Check if the status at header is "Saved"'), async () => {
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewportTwice();
  await mainPage.isUnSavedChangesDisplayed();
  await mainPage.waitForChangeIsSaved();
});

mainTest(qase(890, 'Open history panel with recent changes'), async () => {
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickHistoryPanelButton();
  await mainPage.clickHistoryActionsButton();
  await mainPage.isActionDisplayedOnHistoryPanel('New board');
});

mainTest(qase(1931, 'Open history version panel (via main menu)'), async () => {
  await mainPage.clickMainMenuButton();
  await mainPage.clickFileMainMenuItem();
  await mainPage.clickShowVersionsMainMenuSubItem();
  await historyPage.isVersionListEmpty();
});

mainTest(qase(1930, 'Open history version panel (shortcut Alt+H)'), async () => {
  await historyPage.clickShortcutCtrlAltH();
  await historyPage.isVersionListEmpty();
});

mainTest.describe(() => {
  const versionName = 'test version';

  mainTest.beforeEach(async () => {
    await historyPage.createDefaultRectangleByCoordinates(200, 200);
    await historyPage.waitForChangeIsSaved();
    await historyPage.clickHistoryPanelButton();
    await historyPage.clickSaveVersionButton();
    await historyPage.renameVersion(versionName);
  });

  mainTest(qase(1929, 'Save version via history panel'), async () => {
    await historyPage.checkLastVersionName(versionName);
  });

  mainTest(
    qase(1945, 'Check scrolling in the version list (more than 14 versions)'),
    async () => {
      await historyPage.multipleSaveDefaultVersions(14);
      await historyPage.checkFirstVersionName(versionName);
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await historyPage.createDefaultRectangleByCoordinates(200, 200);
    await historyPage.waitForChangeIsSaved();
    await historyPage.clickHistoryPanelButton();
    await historyPage.clickSaveVersionButton();
    await historyPage.clickViewportTwice();
  });

  mainTest.describe(() => {
    mainTest.beforeEach(async () => {
      await layersPanelPage.selectLayerByName('Rectangle');
      await historyPage.pressDeleteKeyboardButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
      await historyPage.clickHistoryPanelButton();
      await historyPage.selectVersionOption('Restore');
    });

    mainTest.describe(() => {
      mainTest.beforeEach(async () => {
        await historyPage.clickRestoreVersionButton();
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', true);
        await historyPage.isHistoryPanelVisible(false);
        await historyPage.clickHistoryPanelButton();
      });

      mainTest(
        qase(
          [1932, 1937],
          'Restore version via history panel' +
            'Verify the creation of an autosaved version after Restore',
        ),
        async () => {
          await historyPage.checkAutosaveVersionsCount('2');
        },
      );

      mainTest(
        qase(1938, 'Restore autosaved version via history panel'),
        async () => {
          await historyPage.clickOnAutosaveVersionsButton();
          await historyPage.selectSnapshotOption('Restore version');
          await historyPage.clickRestoreVersionButton();
          await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
          await historyPage.isHistoryPanelVisible(false);
          await historyPage.clickHistoryPanelButton();
          await historyPage.checkAutosaveVersionsCount('3');
        },
      );

      mainTest(
        qase(1943, 'Pin the autosaved version via history panel'),
        async () => {
          const versionName = 'pin version';
          await historyPage.clickOnAutosaveVersionsButton();
          await historyPage.selectSnapshotOption('Pin version');
          await historyPage.renameVersion(versionName);
          await historyPage.clickHistoryPanelButton();
          await historyPage.checkLastVersionName(versionName);
          await historyPage.checkAutosaveVersionsCount('1');
        },
      );
    });

    mainTest(qase(1933, 'Cancel restore version via history panel'), async () => {
      await historyPage.clickCancelRestoreVersionButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
      await historyPage.isHistoryPanelVisible(true);
    });
  });

  mainTest(qase(1934, 'Rename version via history panel'), async () => {
    const versionName = 'renamed version';
    await historyPage.selectVersionOption('Rename');
    await historyPage.renameVersion(versionName);
    await historyPage.checkVersionName(versionName);
  });
});

mainTest(qase(1935, 'Delete version via history panel'), async () => {
  await historyPage.clickHistoryPanelButton();
  await historyPage.clickSaveVersionButton();
  await historyPage.clickViewportTwice();
  await historyPage.selectVersionOption('Delete');
  await historyPage.isVersionListEmpty();
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }) => {
    historyPage = new HistoryPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    dashboardPage = new DashboardPage(page);
    teamPage = new TeamPage(page);
    mainPage = new MainPage(page);
  });

  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
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
    async ({ page }) => {
      const versionName = 'test version';
      await mainTest.slow();

      // First user (owner): create a board, save a version, restore it, go back to dashboard
      await historyPage.createDefaultBoardByCoordinates(200, 200);
      await historyPage.waitForChangeIsSaved();
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickSaveVersionButton();
      await historyPage.renameVersion(versionName);
      await layersPanelPage.selectLayerByName('Board');
      await historyPage.pressDeleteKeyboardButton();
      await historyPage.clickHistoryPanelButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Board', false);
      await historyPage.selectVersionOption('Restore');
      await historyPage.clickRestoreVersionButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Board', true);
      await historyPage.backToDashboardFromFileEditor();

      // Invite and register a second user as Admin into the same team, then open the file
      const { dashboardPage: adminDashboardPage } = await setupAdminRoleUser(page, {
        existingTeamName: teamName,
      });
      await adminDashboardPage.openFile();

      const adminHistoryPage = new HistoryPanelPage(page);
      const adminLayersPanelPage = new LayersPanelPage(page);

      await adminHistoryPage.waitForViewportVisible();

      // Second user (admin): create an ellipse, save a version, restore it
      await adminHistoryPage.createDefaultEllipseByCoordinates(400, 200);
      await adminHistoryPage.waitForChangeIsSaved();
      await adminHistoryPage.clickHistoryPanelButton();
      await adminHistoryPage.clickSaveVersionButton();
      await adminHistoryPage.renameVersion(versionName);
      await adminLayersPanelPage.selectLayerByName('Ellipse');
      await adminHistoryPage.pressDeleteKeyboardButton();
      await adminHistoryPage.clickHistoryPanelButton();
      await adminLayersPanelPage.isLayerPresentOnLayersTab('Ellipse', false);
      await adminHistoryPage.selectVersionOption('Restore');
      await adminHistoryPage.clickRestoreVersionButton();
      await adminLayersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
      await adminHistoryPage.isHistoryPanelVisible(false);
      await adminHistoryPage.clickHistoryPanelButton();

      // Verify version filters
      await adminHistoryPage.isAutosaveVersionsVisible(true);
      await adminHistoryPage.isOtherUserVersionVisible(true);
      await adminHistoryPage.changeVersionFilter('My versions');
      await adminHistoryPage.isAutosaveVersionsVisible(false);
      await adminHistoryPage.isOtherUserVersionVisible(false);
      await adminHistoryPage.changeVersionFilter('All versions');
      await adminHistoryPage.isAutosaveVersionsVisible(true);
      await adminHistoryPage.isOtherUserVersionVisible(true);
    },
  );
});
