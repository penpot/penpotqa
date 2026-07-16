import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { mainTest } from 'fixtures';
import {
  getVerificationMessage,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

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

mainTest.describe('Rename a team', () => {
  const team = createTeamName();
  const teamNew = createTeamName();

  mainTest(qase([1205], 'Rename a team via owner'), async () => {
    await mainTest.step('Create and rename the team as owner', async () => {
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.renameTeam(teamNew);
      await teamPage.isTeamSelected(teamNew);
    });

    await mainTest.step('Delete old and new team names', async () => {
      await teamPage.deleteTeams([team, teamNew]);
    });
  });

  mainTest(
    qase([1207], 'Team. Unable to rename team (as editor)'),
    async ({ page }) => {
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;

      await mainTest.step('Create team and invite editor user', async () => {
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
      });

      await mainTest.step('Register invited user and open team menu', async () => {
        const firstInvite = await waitMessage(page, firstEmail, 40);
        if (!firstInvite) {
          throw new Error('Invitation message was not received for invited editor');
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
          throw new Error(
            'Verification message was not received for invited editor',
          );
        }
        await page.goto(verificationMessage.inviteUrl);
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(team);
        await teamPage.openTeamOptionsMenu();
      });

      await mainTest.step(
        'Verify rename option is not visible for editor',
        async () => {
          await teamPage.assertRenameItemNotVisible();
        },
      );
    },
  );
});
