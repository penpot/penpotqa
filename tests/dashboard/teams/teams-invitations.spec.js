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

mainTest(
  qase(1164, 'Team Invitations - open the form via Invitations tab'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.deleteTeam(team);
  },
);

registerTest(
  qase(1165, 'Team Invitations - open the form via Team Hero'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.clickInviteMembersTeamHeroButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.deleteTeam(team);
  },
);

mainTest(
  qase(1166, 'Team Invitations invite via owner single invitation, editor'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.enterEmailToInviteMembersPopUp('testeditor@test.com');
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    await teamPage.isInvitationRecordDisplayed([
      { email: 'testeditor@test.com', role: 'Editor', status: 'Pending' },
    ]);
    await teamPage.deleteTeam(team);
  },
);

mainTest(
  qase(1167, 'Team Invitations - invite via owner single invitation, admin'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.selectInvitationRoleInPopUp('Admin');
    await teamPage.enterEmailToInviteMembersPopUp('testadmin@test.com');
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    await teamPage.isInvitationRecordDisplayed([
      { email: 'testadmin@test.com', role: 'Admin', status: 'Pending' },
    ]);
    await teamPage.deleteTeam(team);
  },
);

mainTest(
  qase(1175, 'Team.Invitations-fail to send invitation to existing team member'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.enterEmailToInviteMembersPopUp(process.env.LOGIN_EMAIL);
    await teamPage.isSendInvitationBtnDisabled();
    await teamPage.isSendInvitationWarningExist(
      "Some members are already on the team. We'll invite the rest.",
    );
    await teamPage.deleteTeam(team);
  },
);

registerTest.describe(
  'As Owner - Invite Members - Send invite (registered but not team member)',
  () => {
    const team = random().concat('autotest');

    registerTest.beforeEach(
      'Create new account, logout, login with main account, create team and open invitations page',
      async () => {
        await registerTest.slow();

        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
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
        1174,
        'Team. Invitations - send invitation to registered user (but not a team member)',
      ),
      async ({ page, email }) => {
        await teamPage.selectInvitationRoleInPopUp('Admin');
        await teamPage.enterEmailToInviteMembersPopUp(email);
        await teamPage.clickSendInvitationButton();
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmailAndClickOnContinue(email);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
        await waitSecondMessage(page, email, 40);
        const invite = await getRegisterMessage(email);
        await page.goto(invite.inviteUrl);
        await teamPage.switchTeam(team);
        await teamPage.isTeamSelected(team);
      },
    );
  },
);

mainTest.describe(
  'As Owner - Invite Members - Send multiple invites (Editor role)',
  () => {
    const team = random().concat('autotest');
    const firstEditor = random().concat('autotest');
    const secondEditor = random().concat('autotest');

    mainTest(
      qase(
        1168,
        'Team. Invitations - invite via owner (multiple invitations, editor)',
      ),
      async ({ page }) => {
        const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}${process.env.GMAIL_DOMAIN}`;
        const secondEmail = `${process.env.GMAIL_NAME}+${secondEditor}${process.env.GMAIL_DOMAIN}`;
        await teamPage.createTeam(team);
        await teamPage.isTeamSelected(team);
        await teamPage.openInvitationsPageViaOptionsMenu();
        await teamPage.clickInviteMembersToTeamButton();
        await teamPage.isInviteMembersPopUpHeaderDisplayed(
          'Invite members to the team',
        );
        await teamPage.enterEmailToInviteMembersPopUp(
          `${firstEmail}, ${secondEmail}`,
        );
        await teamPage.clickSendInvitationButton();
        await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
        await teamPage.isMultipleInvitationRecordDisplayed(
          firstEmail,
          'Editor',
          'Pending',
        );
        await teamPage.isMultipleInvitationRecordDisplayed(
          secondEmail,
          'Editor',
          'Pending',
        );
        const firstInvite = await waitMessage(page, firstEmail, 40);
        const secondInvite = await waitMessage(page, secondEmail, 40);
        const user = process.env.CI ? 'QA Engineer' : 'QA Engineer'; //'k8q6byz';
        await checkInviteText(firstInvite.inviteText, team, user);
        await checkInviteText(secondInvite.inviteText, team, user);
        await profilePage.logout();
        await loginPage.isLoginPageOpened();

        await page.goto(firstInvite.inviteUrl);
        await registerPage.registerAccount(
          firstEditor,
          firstEmail,
          process.env.LOGIN_PWD,
        );
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(team);
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await page.goto(secondInvite.inviteUrl);
        await registerPage.registerAccount(
          secondEditor,
          secondEmail,
          process.env.LOGIN_PWD,
        );
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(team);

        await teamPage.openMembersPageViaOptionsMenu();
        await teamPage.isMultipleMemberRecordDisplayed(
          firstEditor,
          firstEmail,
          'Editor',
        );
        await teamPage.isMultipleMemberRecordDisplayed(
          secondEditor,
          secondEmail,
          'Editor',
        );
      },
    );

    mainTest.afterEach(
      `Logout, login with main account, switch to to "${team}" and delete it`,
      async () => {
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
        await teamPage.switchTeam(team);
        await teamPage.deleteTeam(team);
      },
    );
  },
);

mainTest(qase(1176, 'Resend multiple invitations via owner'), async () => {
  const team = random().concat('autotest');
  const email = 'testeditor@test.com';
  const email2 = 'testeditor2@test.com';
  const email3 = 'testeditor3@test.com';

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp([email, email2, email3]);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  await teamPage.isInvitationRecordDisplayed([
    { email: email, role: 'Editor', status: 'Pending' },
    { email: email2, role: 'Editor', status: 'Pending' },
    { email: email3, role: 'Editor', status: 'Pending' },
  ]);
  await teamPage.resendInvitation([email, email2, email3]);
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  await teamPage.deleteTeam(team);
});

mainTest(qase(1178, 'Team Invitations - delete invitation via owner'), async () => {
  const team = random().concat('autotest');
  const email = 'testeditor@test.com';

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp(email);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  await teamPage.isInvitationRecordDisplayed([
    { email: email, role: 'Editor', status: 'Pending' },
  ]);
  await teamPage.deleteInvitation(email);
  await teamPage.isInvitationRecordRemoved();
  await teamPage.deleteTeam(team);
});

mainTest(
  qase(1181, 'Team Invitations - change role in invitation via owner'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.enterEmailToInviteMembersPopUp('testrole@test.com');
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    await teamPage.isInvitationRecordDisplayed([
      { email: 'testrole@test.com', role: 'Editor', status: 'Pending' },
    ]);
    await teamPage.selectInvitationRoleInInvitationRecord('Admin');
    await teamPage.isInvitationRecordDisplayed([
      { email: 'testrole@test.com', role: 'Admin', status: 'Pending' },
    ]);
    await teamPage.deleteTeam(team);
  },
);
