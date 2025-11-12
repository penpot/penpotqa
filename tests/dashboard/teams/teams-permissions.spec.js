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

mainTest.describe('Roles permissions (Owner, Admin, Editor)', () => {
  const team = random().concat('autotest');

  mainTest(
    qase(1173, 'Team. Invitations - invite via admin (multiple invitations, admin)'),
    async ({ page }) => {
      await mainTest.slow();
      const mainAdmin = random().concat('autotest');
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const mainEmail = `${process.env.GMAIL_NAME}+${mainAdmin}${process.env.GMAIL_DOMAIN}`;
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(mainEmail);
      await teamPage.clickSendInvitationButton();
      const mainInvite = await waitMessage(page, mainEmail, 40);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(mainInvite.inviteUrl);
      await registerPage.registerAccount(
        mainAdmin,
        mainEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isMultipleInvitationRecordDisplayed(
        firstEmail,
        'Admin',
        'Pending',
      );
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Admin',
        'Pending',
      );
      const firstInvite = await waitMessage(page, firstEmail, 40);
      const secondInvite = await waitMessage(page, secondEmail, 40);
      await checkInviteText(firstInvite.inviteText, team, mainAdmin);
      await checkInviteText(secondInvite.inviteText, team, mainAdmin);
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
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondAdmin,
        secondEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin',
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Admin',
      );
    },
  );

  mainTest(
    qase(1177, 'Team. Invitations - resend invitation via admin'),
    async ({ page }) => {
      await mainTest.slow();
      const mainAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const mainEmail = `${process.env.GMAIL_NAME}+${mainAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(mainEmail);
      await teamPage.clickSendInvitationButton();
      const mainInvite = await waitMessage(page, mainEmail, 40);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(mainInvite.inviteUrl);
      await registerPage.registerAccount(
        mainAdmin,
        mainEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Admin',
        'Pending',
      );
      await page.waitForTimeout(5000);
      await teamPage.resendInvitation(secondEmail);
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

      await waitSecondMessage(page, secondEmail, 40);
      await checkMessagesCount(secondEmail, 2);
    },
  );

  mainTest(
    qase(1184, 'Team. Members - change role via owner (editor to admin)'),
    async ({ page }) => {
      await mainTest.slow();
      const secondUser = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${secondUser}${process.env.GMAIL_DOMAIN}`;

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const secondInvite = await waitMessage(page, secondEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondUser,
        secondEmail,
        process.env.LOGIN_PWD,
      );
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
      await teamPage.selectMemberRoleInPopUp(secondUser, 'Admin');
      await teamPage.isMultipleMemberRecordDisplayed(
        secondUser,
        secondEmail,
        'Admin',
      );

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        secondUser,
        secondEmail,
        'Admin',
      );
    },
  );

  mainTest(
    qase(1187, 'Team. Members - change role via admin(admin to editor)'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);
      const secondInvite = await waitMessage(page, secondEmail, 40);

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
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondAdmin,
        secondEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin',
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Admin',
      );

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
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Editor',
      );
    },
  );

  mainTest(
    qase(1191, 'Team. Members - unable to change roles via editor'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;
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
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);
      const secondInvite = await waitMessage(page, secondEmail, 40);

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
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondAdmin,
        secondEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin',
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Editor',
      );
      await teamPage.isMemberRoleInPopUpNotDisplayed(firstAdmin, 'Editor');
    },
  );

  mainTest(
    qase(1190, 'Team. Members - unable to change role of owner via admin'),
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
      await teamPage.clickInviteMembersToTeamButton();
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

      await teamPage.openMembersPageViaOptionsMenu();
      const owner = process.env.CI ? 'QA Engineer' : 'QA Engineer';
      await teamPage.isMemberRoleInPopUpNotDisplayed(owner, 'Owner');
    },
  );

  mainTest(
    qase(
      1183,
      'Team. Invitations - unable to create, edit and delete invitations via editor',
    ),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;
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
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await waitMessage(page, firstEmail, 40);
      const secondInvite = await waitMessage(page, secondEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondAdmin,
        secondEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.isInviteMembersToTeamButtonDisabled();
      await teamPage.isInvitationRecordOptionsDisabled(firstEmail);
      await teamPage.isInvitationRoleInPopUpNotDisplayed(firstAdmin, 'Editor');
    },
  );

  mainTest(qase(1197, 'Team. Members - leave team (as admin)'), async ({ page }) => {
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
    await registerPage.registerAccount(
      firstAdmin,
      firstEmail,
      process.env.LOGIN_PWD,
    );
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.isTeamSelected(team);

    await teamPage.openMembersPageViaOptionsMenu();
    await teamPage.leaveTeam(team);
    await dashboardPage.clickOnOnboardingContinueWithoutTeamButton();
  });

  mainTest(
    qase(1198, 'Team. Members - leave team (as editor)'),
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
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
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

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.leaveTeam(team);
      await dashboardPage.clickOnOnboardingContinueWithoutTeamButton();
    },
  );

  mainTest(
    qase(1192, 'Team. Members - delete team member (as owner)'),
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

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin',
      );
      await teamPage.deleteTeamMember(firstAdmin);
    },
  );

  mainTest(
    qase(1193, 'Team. Members - delete team member (as admin)'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);
      const secondInvite = await waitMessage(page, secondEmail, 40);

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
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondAdmin,
        secondEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin',
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Admin',
      );
      await teamPage.deleteTeamMember(firstAdmin);
    },
  );

  mainTest(
    qase(1194, 'Team. Members - unable to delete team member (as editor)'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;
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
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);
      const secondInvite = await waitMessage(page, secondEmail, 40);

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
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.registerAccount(
        secondAdmin,
        secondEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin',
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Editor',
      );
      await teamPage.isDeleteTeamMemberDisabled(firstAdmin);
    },
  );

  mainTest(
    qase(1182, 'Team. Invitations - change role in invitation via admin'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}${process.env.GMAIL_DOMAIN}`;
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
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
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
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Editor',
        'Pending',
      );
      await teamPage.changeInvitationRole(secondAdmin, 'Admin');
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Admin',
        'Pending',
      );
    },
  );

  mainTest.afterEach(
    `Logout, login with main account, switch team and delete`,
    async () => {
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.deleteTeam(team);
    },
  );
});

registerTest.describe(
  'User Permissions - Request Access (previous register) - View Mode',
  () => {
    const team = random().concat('autotest');
    let viewModePage;
    let invite;
    let secondRandomName = random().concat('autotest');
    let secondEmail = `${process.env.GMAIL_NAME}+${secondRandomName}${process.env.GMAIL_DOMAIN}`;

    registerTest.beforeEach(async ({ page }) => {
      await registerTest.slow();
      viewModePage = new ViewModePage(page);
    });

    registerTest(
      qase(1827, 'Request access from Workspace (Not Your Penpot)'),
      async ({ page, email }) => {
        await teamPage.createTeam(team);
        await teamPage.isTeamSelected(team);
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.waitForViewportVisible();
        await mainPage.isMainPageLoaded();
        const currentURL = await mainPage.getUrl();
        await mainPage.clickPencilBoxButton();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(process.env.SECOND_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await page.goto(currentURL);
        await expect(teamPage.accessDialog).toHaveScreenshot(
          'request-file-access-dialog-image.png',
        );
        await teamPage.clickOnRequestAccessButton();
        await teamPage.isRequestAccessButtonVisible(false);
        await teamPage.checkRequestSentCorrectlyDialog();
        await teamPage.clickReturnHomeButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(email);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);
        await checkConfirmAccessText(
          requestMessage.inviteText,
          'QA Engineer',
          process.env.SECOND_EMAIL,
          team,
        );

        await page.goto(requestMessage.inviteUrl[1]);

        await viewModePage.waitForViewerSection(45000);
        await viewModePage.isShareButtonVisible();
      },
    );

    registerTest(
      qase(1829, 'Request access from Dashboard (Not Your Penpot)'),
      async ({ page, email }) => {
        await teamPage.createTeam(team);
        await teamPage.isTeamSelected(team);
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.waitForViewportVisible();
        await mainPage.isMainPageLoaded();
        await mainPage.clickPencilBoxButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
        const currentURL = await mainPage.getUrl();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(process.env.SECOND_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await page.goto(currentURL);
        await expect(teamPage.accessDialog).toHaveScreenshot(
          'request-project-access-dialog-image.png',
          { maxDiffPixelRatio: maxDiffPixelRatio },
        );
        await teamPage.clickOnRequestAccessButton();
        await teamPage.isRequestAccessButtonVisible(false);
        await teamPage.checkRequestSentCorrectlyDialog();
        await teamPage.clickReturnHomeButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(email);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);

        await checkDashboardConfirmAccessText(
          requestMessage.inviteText,
          'QA Engineer',
          process.env.SECOND_EMAIL,
          team,
        );
      },
    );

    registerTest(
      qase(1830, 'Request access from Workspace (Your Penpot)'),
      async ({ page, email }) => {
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.waitForViewportVisible();
        await mainPage.isMainPageLoaded();
        const currentURL = await mainPage.getUrl();
        await mainPage.clickPencilBoxButton();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(process.env.SECOND_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await page.goto(currentURL);
        await teamPage.checkRequestFileAccessDialog();
        await teamPage.clickOnRequestAccessButton();
        await teamPage.isRequestAccessButtonVisible(false);
        await teamPage.checkRequestSentCorrectlyDialog();
        await teamPage.clickReturnHomeButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(email);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);
        await checkYourPenpotConfirmAccessText(
          requestMessage.inviteText,
          'QA Engineer',
          process.env.SECOND_EMAIL,
          team,
        );
      },
    );

    registerTest(
      qase(1831, 'Request access from View mode (Your Penpot)'),
      async ({ page, email }) => {
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.waitForViewportVisible();
        await mainPage.isMainPageLoaded();
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await mainPage.waitForChangeIsSaved();
        const newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
        const currentURL = await viewModePage.getUrl();
        await mainPage.clickPencilBoxButton();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(process.env.SECOND_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await page.goto(currentURL);
        await teamPage.checkRequestFileAccessDialog();
        await teamPage.clickOnRequestAccessButton();
        await teamPage.isRequestAccessButtonVisible(false);
        await teamPage.checkRequestSentCorrectlyDialog();
        await teamPage.clickReturnHomeButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmail(email);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);
        await checkYourPenpotViewModeConfirmAccessText(
          requestMessage.inviteText,
          'QA Engineer',
          process.env.SECOND_EMAIL,
          team,
        );
      },
    );

    registerTest(
      qase(1833, 'Auto Join to the team'),
      async ({ page, name, email }) => {
        await teamPage.createTeam(team);
        await teamPage.isTeamSelected(team);
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.waitForViewportVisible();
        await mainPage.isMainPageLoaded();
        const currentURL = await mainPage.getUrl();
        await mainPage.clickPencilBoxButton();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await page.context().clearCookies();
        await mainPage.reloadPage();
        await loginPage.isLoginPageOpened();
        await loginPage.acceptCookie();
        await loginPage.clickOnCreateAccount();
        await registerPage.registerAccount(
          secondRandomName,
          secondEmail,
          process.env.LOGIN_PWD,
        );
        await registerPage.isRegisterEmailCorrect(secondEmail);
        invite = await waitMessage(page, secondEmail, 40);
        await page.goto(invite.inviteUrl);
        await dashboardPage.fillOnboardingQuestions();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await page.goto(currentURL);
        await teamPage.checkRequestFileAccessDialog();
        await teamPage.clickOnRequestAccessButton();
        await teamPage.isRequestAccessButtonVisible(false);
        await teamPage.checkRequestSentCorrectlyDialog();
        await teamPage.clickReturnHomeButton();
        await dashboardPage.isDashboardOpenedAfterLogin();

        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await page.context().clearCookies();
        await mainPage.reloadPage();
        await loginPage.isLoginPageOpened();
        await loginPage.acceptCookie();
        await loginPage.enterEmail(email);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
        await teamPage.switchTeam(team);

        await waitSecondMessage(page, email, 40);
        const requestMessage = await waitRequestMessage(page, email, 40);
        await page.goto(requestMessage.inviteUrl[0]);
        await teamPage.checkFirstInvitedEmail(secondEmail);
        await teamPage.waitForInvitationButtonEnabled(10000);
        await teamPage.clickSendInvitationButton();

        await waitSecondMessage(page, secondEmail, 40);
        const secondRequestMessage = await waitRequestMessage(page, secondEmail, 40);
        await checkSigningText(secondRequestMessage.inviteText, name, team);
      },
    );
  },
);
