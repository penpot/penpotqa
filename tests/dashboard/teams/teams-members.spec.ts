import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { mainTest, registerTest } from 'fixtures';
import {
  getVerificationMessage,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

const team = createTeamName();

let dashboardPage: DashboardPage;
let loginPage: LoginPage;
let profilePage: ProfilePage;
let registerPage: RegisterPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
});

registerTest.describe('Members - As Owner - Change roles', () => {
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
      [1188],
      'Team. Members - change role via owner (transfer ownership to admin)',
    ),
    async ({ email, name, page }) => {
      await registerTest.step(
        'Invite user as admin and complete invited user registration',
        async () => {
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
          const invite = await getVerificationMessage(email);
          if (!invite) {
            throw new Error(
              'Verification message was not received for invited admin',
            );
          }
          await page.goto(invite.inviteUrl);
          await teamPage.switchTeam(team);
          await teamPage.isTeamSelected(team);
        },
      );

      await registerTest.step(
        'Transfer ownership to invited admin and verify',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await teamPage.switchTeam(team);
          await teamPage.isTeamSelected(team);
          await teamPage.openMembersPageViaOptionsMenu();
          await teamPage.selectMemberRoleInPopUp(name, 'Owner');
          await teamPage.clickOnTransferOwnershipButton();
          await teamPage.isMultipleMemberRecordDisplayed(name, email, 'Owner');
        },
      );

      await registerTest.step(
        'Login with invited admin and delete team',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(email);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await teamPage.deleteTeam(team);
        },
      );
    },
  );

  registerTest(
    qase(
      [1189],
      'Team. Members - change role via owner (transfer ownership to editor)',
    ),
    async ({ email, name, page }) => {
      await registerTest.step(
        'Invite user as editor and complete invited user registration',
        async () => {
          await teamPage.enterEmailToInviteMembersPopUp(email);
          await teamPage.clickSendInvitationButton();
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(email);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await waitSecondMessage(page, email, 40);
          const invite = await getVerificationMessage(email);
          if (!invite) {
            throw new Error(
              'Verification message was not received for invited editor',
            );
          }
          await page.goto(invite.inviteUrl);
          await teamPage.switchTeam(team);
          await teamPage.isTeamSelected(team);
        },
      );

      await registerTest.step(
        'Transfer ownership to invited editor and verify',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await teamPage.switchTeam(team);
          await teamPage.isTeamSelected(team);
          await teamPage.openMembersPageViaOptionsMenu();
          await teamPage.selectMemberRoleInPopUp(name, 'Owner');
          await teamPage.clickOnTransferOwnershipButton();
          await teamPage.isMultipleMemberRecordDisplayed(name, email, 'Owner');
        },
      );

      await registerTest.step(
        'Login with invited editor and delete team',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(email);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await teamPage.deleteTeam(team);
        },
      );
    },
  );
});

mainTest(qase([1196], 'Team. Members - leave team (as owner)'), async ({ page }) => {
  await mainTest.slow();
  const firstAdmin = random().concat('autotest');
  const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;

  await mainTest.step('Create team and invite admin member', async () => {
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
    await teamPage.selectInvitationRoleInPopUp('Admin');
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  });

  await mainTest.step(
    'Register invited admin account from email invitation',
    async () => {
      const firstInvite = await waitMessage(page, firstEmail, 40);
      if (!firstInvite) {
        throw new Error('Invitation message was not received for first admin');
      }

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstAdmin,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await waitSecondMessage(page, firstEmail, 40);
      const verificationMessage = await getVerificationMessage(firstEmail);
      if (!verificationMessage) {
        throw new Error('Verification message was not received for first admin');
      }
      await page.goto(verificationMessage.inviteUrl);
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
    },
  );

  await mainTest.step('Login as owner and leave the team', async () => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openMembersPageViaOptionsMenu();
    await teamPage.isMultipleMemberRecordDisplayed(firstAdmin, firstEmail, 'Admin');
    await teamPage.leaveTeam(team, 'Owner', firstAdmin);
  });
});
