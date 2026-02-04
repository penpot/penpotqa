const { mainTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { waitMessage } = require('../../../helpers/gmail.js');

// TO REMOVE
mainTest.skip(true, 'Temporarily disabled due to unrelated to new render');

let teamPage, loginPage, registerPage, dashboardPage, profilePage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
});

mainTest.describe('Rename a team', () => {
  const team = random().concat('autotest');
  const teamNew = random().concat('autotest');

  mainTest(qase(1205, 'Rename a team via owner'), async () => {
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.renameTeam(teamNew);
    await teamPage.isTeamSelected(teamNew);
    await teamPage.deleteTeams([team, teamNew]);
  });

  mainTest(
    qase(1207, 'Team. Unable to rename team (as editor)'),
    async ({ page }) => {
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
      await teamPage.openTeamOptionsMenu();
      await teamPage.assertRenameItemNotVisible();
    },
  );
});
