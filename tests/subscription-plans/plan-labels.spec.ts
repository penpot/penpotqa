import { registerTest } from 'fixtures';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { StripePage } from '@pages/dashboard/stripe-page';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;
let stripePage: StripePage;

registerTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  stripePage = new StripePage(page);

  await teamPage.createTeam(teamName);
});

registerTest(qase(2283, 'Display & Info for Professional Plan'), async () => {
  const currentPlan = 'Professional';
  await profilePage.openYourAccountPage();
  await profilePage.openSubscriptionTab();
  await profilePage.checkSubscriptionName(currentPlan);
  await profilePage.backToDashboardFromAccount();
  await dashboardPage.checkSubscriptionName(currentPlan + ' plan');
  await teamPage.isSubscriptionIconNotVisible();
  await teamPage.isSubscriptionIconVisibleInTeamDropdown(false);
  await teamPage.openTeamSettingsPageViaOptionsMenu();
  await teamPage.checkSubscriptionName(currentPlan);
});
