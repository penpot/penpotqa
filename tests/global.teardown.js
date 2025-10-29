import { test as teardown } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard/dashboard-page';
import { TeamPage } from '../pages/dashboard/team-page';

teardown('delete autotest teams', async ({ page }) => {
  console.log('🌍 Cleaning up autotest teams...');

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);

  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  await loginPage.enterPwd(process.env.LOGIN_PWD);
  await loginPage.clickLoginButton();
  await dashboardPage.isDashboardOpenedAfterLogin();

  const autotestRegex = /autotest/i;

  while (true) {
    await teamPage.openTeamsListIfClosed();

    const teamMenuItems = page.getByRole('menuitem');
    const teamCount = await teamMenuItems.count();

    let deletedOne = false;

    for (let i = 0; i < teamCount; i++) {
      const teamItem = teamMenuItems.nth(i);

      if (!(await teamItem.isVisible())) continue;

      const teamText = (await teamItem.textContent())?.trim();
      if (!teamText || teamText === 'Your Penpot') continue;
      if (!autotestRegex.test(teamText)) continue;

      const teamName = teamText;
      console.log(`🧹 Deleting team: ${teamName}`);

      await teamPage.deleteTeam(teamName);

      deletedOne = true;
      break; // re-fetch menu items after deletion
    }

    // Exit the loop if no autotest teams were found
    if (!deletedOne) break;
  }

  console.log('✅ All autotest teams deleted.');
});
