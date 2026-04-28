import { Page } from '@playwright/test';
import { mainTest, registerTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { LoginPage } from 'pages/login-page';
import { RegisterPage } from 'pages/register-page';
import { ProfilePage } from 'pages/profile-page';
import { DashboardPage } from 'pages/dashboard/dashboard-page';
import { TeamPage } from 'pages/dashboard/team-page';
import { random } from 'helpers/string-generator';
import {
  getRegisterMessage,
  checkInviteText,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createInviteEmail } from 'helpers/teams/invite-email';

let teamPage: TeamPage;
let loginPage: LoginPage;
let registerPage: RegisterPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;

mainTest.beforeEach(async ({ page }: { page: Page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
});

mainTest(qase(1164, 'Open the form via Invitations tab'), async () => {
  const team = random().concat('autotest');

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.deleteTeam(team);
});

registerTest(
  qase(1165, 'Open the form via Team Hero ("Invite members" button)'),
  async () => {
    const team = random().concat('autotest');

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.clickInviteMembersTeamHeroButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.deleteTeam(team);
  },
);

mainTest(qase(1166, 'Invite via owner (single invitation, editor)'), async () => {
  const team = random().concat('autotest');
  const email = createInviteEmail('editor');

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

  await teamPage.deleteTeam(team);
});

mainTest(qase(1167, 'Invite via owner (single invitation, admin)'), async () => {
  const team = random().concat('autotest');
  const email = createInviteEmail('admin');

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');

  await teamPage.selectInvitationRoleInPopUp('Admin');
  await teamPage.enterEmailToInviteMembersPopUp(email);

  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  await teamPage.isInvitationRecordDisplayed([
    { email: email, role: 'Admin', status: 'Pending' },
  ]);

  await teamPage.deleteTeam(team);
});

mainTest(qase(1175, 'Fail to send invitation to existing team member'), async () => {
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
});

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
      qase(1174, 'Invite to a registered user (not a team member)'),
      async ({ page, email }: { page: Page; email: string }) => {
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

        await page.goto(invite!.inviteUrl);

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
      qase(1168, 'Invite via owner (multiple invitations, editor)'),
      async ({ page }) => {
        const firstEmail = createInviteEmail('editor', firstEditor);
        const secondEmail = createInviteEmail('editor', secondEditor);

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
        await checkInviteText(firstInvite!.inviteText, team, user);
        await checkInviteText(secondInvite!.inviteText, team, user);
        await profilePage.logout();
        await loginPage.isLoginPageOpened();

        await page.goto(firstInvite!.inviteUrl);
        await registerPage.registerAccount(
          firstEditor,
          firstEmail,
          process.env.LOGIN_PWD,
        );
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(team);
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await page.goto(secondInvite!.inviteUrl);
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
  const email1 = createInviteEmail('editor', 'editor1');
  const email2 = createInviteEmail('editor', 'editor2');
  const email3 = createInviteEmail('editor', 'editor3');

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp([email1, email2, email3]);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  await teamPage.isInvitationRecordDisplayed([
    { email: email1, role: 'Editor', status: 'Pending' },
    { email: email2, role: 'Editor', status: 'Pending' },
    { email: email3, role: 'Editor', status: 'Pending' },
  ]);
  await teamPage.resendInvitation([email1, email2, email3]);
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  await teamPage.deleteTeam(team);
});

mainTest(qase(1178, 'Delete multiple invitations via owner'), async () => {
  const team = random().concat('autotest');
  const email1 = createInviteEmail('editor', 'editor1');
  const email2 = createInviteEmail('editor', 'editor2');
  const email3 = createInviteEmail('editor', 'editor3');

  await teamPage.createTeam(team);
  await teamPage.isTeamSelected(team);
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp([email1, email2, email3]);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  await teamPage.isInvitationRecordDisplayed([
    { email: email1, role: 'Editor', status: 'Pending' },
    { email: email2, role: 'Editor', status: 'Pending' },
    { email: email3, role: 'Editor', status: 'Pending' },
  ]);
  await teamPage.deleteInvitation([email1, email2, email3]);
  await teamPage.isInvitationRecordRemoved([email1, email2, email3]);
  await teamPage.deleteTeam(team);
});

mainTest(qase(1181, 'Change role in invitation via owner'), async () => {
  const team = random().concat('autotest');
  const email = createInviteEmail('editor', 'role');

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
  await teamPage.selectInvitationRoleInInvitationRecord('Admin');
  await teamPage.isInvitationRecordDisplayed([
    { email: email, role: 'Admin', status: 'Pending' },
  ]);
  await teamPage.deleteTeam(team);
});
