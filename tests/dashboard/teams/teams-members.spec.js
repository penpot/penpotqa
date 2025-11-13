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

registerTest.describe('Members - As Owner - Change roles', () => {
  const team = random().concat('autotest');

  registerTest.beforeEach(
    'Create new account, logout, login with main account, create team and open invitations page',
    async () => {
      await registerTest.slow();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
    },
  );

  registerTest(
    qase(
      1188,
      'Team. Members - change role via owner (transfer ownership to admin)',
    ),
    async ({ page, name, email }) => {
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(email);
      await teamPage.clickSendInvitationButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await waitSecondMessage(page, email, 40);
      const invite = await getRegisterMessage(email);
      await page.goto(invite.inviteUrl);
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(name, 'Owner');
      await teamPage.clickOnTransferOwnershipButton();
      await teamPage.isMultipleMemberRecordDisplayed(name, email, 'Owner');
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.deleteTeam(team);
    },
  );

  registerTest(
    qase(
      1189,
      'Team. Members - change role via owner (transfer ownership to editor)',
    ),
    async ({ page, name, email }) => {
      await teamPage.enterEmailToInviteMembersPopUp(email);
      await teamPage.clickSendInvitationButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await waitSecondMessage(page, email, 40);
      const invite = await getRegisterMessage(email);
      await page.goto(invite.inviteUrl);
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(name, 'Owner');
      await teamPage.clickOnTransferOwnershipButton();
      await teamPage.isMultipleMemberRecordDisplayed(name, email, 'Owner');
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(email);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.deleteTeam(team);
    },
  );
});

mainTest(qase(1196, 'Team. Members - leave team (as owner)'), async ({ page }) => {
  const team = random().concat('autotest');

  await mainTest.slow();
  const firstAdmin = random().concat('autotest');
  const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
  await teamPage.selectInvitationRoleInPopUp('Admin');
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  const firstInvite = await waitMessage(page, firstEmail, 40);

  await profilePage.logout();
  await loginPage.isLoginPageOpened();

  await page.goto(firstInvite.inviteUrl);
  await registerPage.registerAccount(firstAdmin, firstEmail, process.env.LOGIN_PWD);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.isTeamSelected(team);

  await profilePage.logout();
  await loginPage.isLoginPageOpened();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();
  await teamPage.switchTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openMembersPageViaOptionsMenu();
  await teamPage.isMultipleMemberRecordDisplayed(firstAdmin, firstEmail, 'Admin');
  await teamPage.leaveTeam(team, 'Owner', firstAdmin);
});

mainTest.describe('Validate bad URL', () => {
  const team = random().concat('autotest');

  mainTest.beforeEach('Create a team and create a file', async () => {
    await mainTest.slow();
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
  });

  mainTest(qase(1822, 'Workspace bad URL check with login'), async ({ page }) => {
    const currentURL = await mainPage.getUrl();
    const badURL = await mainPage.makeBadUrl(currentURL);
    await mainPage.clickPencilBoxButton();

    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.SECOND_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    await page.goto(badURL);
    await teamPage.isInviteMessageDisplayed('Oops!');
    await teamPage.isErrorMessageDisplayed("This page doesn't exist");
    await teamPage.isGoToPenpotButtonVisible();
  });

  mainTest(qase(1824, 'View mode bad URL check with login'), async ({ page }) => {
    let viewModePage = new ViewModePage(page);
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    const currentURL = await viewModePage.getUrl();
    const badURL = await viewModePage.makeBadUrl(currentURL);

    await mainPage.clickPencilBoxButton();
    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.SECOND_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    await page.goto(badURL);
    await teamPage.isInviteMessageDisplayed('Oops!');
    await teamPage.isErrorMessageDisplayed("This page doesn't exist");
    await teamPage.isGoToPenpotButtonVisible();
  });

  mainTest(qase(1826, 'Dashboard bad URL check with login'), async ({ page }) => {
    await mainPage.clickPencilBoxButton();
    const currentURL = await mainPage.getUrl();
    const badURL = await mainPage.makeBadDashboardUrl(currentURL);

    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.SECOND_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    await page.goto(badURL);
    await teamPage.isInviteMessageDisplayed('Oops!');
    await teamPage.isErrorMessageDisplayed("This page doesn't exist");
    await teamPage.isGoToPenpotButtonVisible();
  });

  mainTest.afterEach(async () => {
    await teamPage.clickGoToPenpotButton();
    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(team);
    await teamPage.deleteTeam(team);
  });
});

mainTest.describe('User Permissions (including delete invitation)', () => {
  const team = random().concat('autotest');

  mainTest(
    qase(1180, 'Team. Invitations- delete team invitation'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.deleteInvitation(firstEmail);
      await teamPage.isInvitationRecordRemoved();
      const firstInvite = await waitMessage(page, firstEmail, 40);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await teamPage.isInviteMessageDisplayed('Invite invalid');
    },
  );

  mainTest(qase(1821, 'Workspace bad URL check without login'), async ({ page }) => {
    await mainTest.slow();
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    const currentURL = await mainPage.getUrl();
    const badURL = await mainPage.makeBadUrl(currentURL);
    await mainPage.clickPencilBoxButton();

    await profilePage.logout();
    await loginPage.isLoginPageOpened();

    await page.goto(badURL);
    await loginPage.isEmailInputVisible();
  });

  mainTest(qase(1823, 'View mode bad URL check without login'), async ({ page }) => {
    await mainTest.slow();
    let viewModePage = new ViewModePage(page);
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();

    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    const currentURL = await viewModePage.getUrl();
    const badURL = await viewModePage.makeBadUrl(currentURL);

    await mainPage.clickPencilBoxButton();
    await profilePage.logout();
    await loginPage.isLoginPageOpened();

    await page.goto(badURL);
    await loginPage.isEmailInputVisible();
  });

  mainTest.afterEach(async () => {
    await loginPage.goto();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(team);
    await teamPage.deleteTeam(team);
  });
});
