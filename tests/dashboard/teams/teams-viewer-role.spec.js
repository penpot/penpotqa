const { mainTest, registerTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { ViewModePage } = require('../../../pages/workspace/view-mode-page.js');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { expect } = require('@playwright/test');
const {
  getRegisterMessage,
  checkInviteText,
  checkMessagesCount,
  waitMessage,
  waitSecondMessage,
  waitRequestMessage,
  checkConfirmAccessText,
  checkDashboardConfirmAccessText,
  checkYourPenpotConfirmAccessText,
  checkYourPenpotViewModeConfirmAccessText,
  checkSigningText,
} = require('../../../helpers/gmail.js');

const maxDiffPixelRatio = 0.001;

let teamPage,
  loginPage,
  registerPage,
  dashboardPage,
  layersPanelPage,
  profilePage,
  mainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  layersPanelPage = new LayersPanelPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
});

mainTest.describe('Viewer Role - Permissions', () => {
  const team = random().concat('autotest');
  const firstAdmin = random().concat('autotest');
  const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;

  mainTest.beforeEach(
    `Create team: "${team}", create a file, invite "${firstEmail}" to the team (Viewer role), accept invite and login with "${firstEmail}"`,
    async ({ page }) => {
      await mainTest.slow();
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Viewer');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      const firstInvite = await waitMessage(page, firstEmail, 40);

      await page.context().clearCookies();
      await loginPage.reloadPage();
      await loginPage.acceptCookie();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstAdmin,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.isHeaderDisplayed('Projects');
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
    },
  );

  mainTest(qase(1870, 'As a viewer user try to edit any layer'), async () => {
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isDesignTabVisible(false);
    await layersPanelPage.clickMainComponentOnLayersTab();
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'right-sidebar-image.png',
      {
        maxDiffPixelRatio: maxDiffPixelRatio,
        mask: [mainPage.usersSection],
      },
    );
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1873, 'As a viewer user import file to Drafts'), async () => {
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.isCreateFileOnDraftsTabButtonVisible(false);
    await dashboardPage.isOptionButtonFromDraftPageVisible(false);
  });

  mainTest(
    qase(1877, 'As a viewer user Add font on  Dashboard > Fonts page'),
    async () => {
      await dashboardPage.openSidebarItem('Fonts');
      await dashboardPage.isAddCustomFontButtonVisible(false);
    },
  );

  mainTest(
    qase(
      1880,
      'As a viewer user check the "Create" buttons of Project and draft pages',
    ),
    async () => {
      await dashboardPage.openSidebarItem('Projects');
      await dashboardPage.isAddProjectButtonVisible(false);
      await dashboardPage.openSidebarItem('Drafts');
      await dashboardPage.isCreateFileOnDraftsTabButtonVisible(false);
    },
  );

  mainTest(qase(1889, 'As a viewer user try to use a toolbar'), async () => {
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isToolBarVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(
    qase(1891, 'As a viewer user try to create, duplicate and delete page'),
    async () => {
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isPageRightClickMenuVisible(false);
      await mainPage.backToDashboardFromFileEditor();
    },
  );

  mainTest(qase(1894, 'As a viewer user right-click created layer'), async () => {
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.checkViewerRightClickMenu();
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1898, 'As a viewer user try to open color palette'), async () => {
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isColorsPaletteButtonVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1906, 'As a viewer user try to open typographies'), async () => {
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isTypographyButtonVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(
    qase(
      1867,
      'Change a role of viewer user to editor and admin after accepting an invitation',
    ),
    async () => {
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(false);

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(firstAdmin, 'Editor');
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Editor',
      );
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(true);
      await mainPage.backToDashboardFromFileEditor();
    },
  );

  mainTest.afterEach(
    `Logout, login with main account, switch to to ${team} and delete it`,
    async () => {
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.deleteTeam(team);
    },
  );
});

mainTest.describe('Viewer Role - As Admin - Change to Viewer role', () => {
  const team = random().concat('autotest');
  const firstAdmin = random().concat('autotest');
  const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
  let profilePage, dashboardPage, loginPage, teamPage, registerPage, mainPage;

  mainTest(
    qase(1869, 'Change a role of admin to viewer after accepting an invitation'),
    async ({ page }) => {
      await mainTest.slow();
      profilePage = new ProfilePage(page);
      dashboardPage = new DashboardPage(page);
      loginPage = new LoginPage(page);
      teamPage = new TeamPage(page);
      registerPage = new RegisterPage(page);
      mainPage = new MainPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.backToDashboardFromFileEditor();

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
      await registerPage.registerAccount(
        firstAdmin,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(true);

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(firstAdmin, 'Viewer');
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Viewer',
      );
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(false);
    },
  );

  mainTest.afterEach(
    `Back to dashboard from file, logout, login with main account, switch to to "${team}" and delete it`,
    async () => {
      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.deleteTeam(team);
    },
  );
});
