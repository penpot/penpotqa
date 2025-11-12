import { chromium } from 'playwright';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';

export default async function globalTeardown() {
  console.log('🌍 Cleaning up autotest teams...');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await context.tracing.start({ screenshots: false, snapshots: true });

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const teamPage = new TeamPage(page);

    await page.goto(`${process.env.BASE_URL}#/auth/login`);
    await loginPage.acceptCookie();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    const autotestRegex = /autotest/i;
    let deletedOne = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      await teamPage.openTeamsListIfClosed();
      const teamMenuItems = page.getByRole('menuitem');
      const teamCount = await teamMenuItems.count();
      deletedOne = false;

      for (let i = 0; i < teamCount; i++) {
        const teamItem = teamMenuItems.nth(i);
        if (!(await teamItem.isVisible())) continue;
        const teamText = (await teamItem.textContent())?.trim();
        if (!teamText || teamText === 'Your Penpot') continue;
        if (!autotestRegex.test(teamText)) continue;

        console.log(`🧹 Deleting team: ${teamText}`);
        await teamPage.deleteTeam(teamText);
        deletedOne = true;
        break;
      }

      if (!deletedOne) break;
    }

    console.log('✅ Global teardown complete.');
  } catch (err) {
    console.error('❌ Global teardown failed:', err);
    await context.tracing.stop({
      path: 'playwright-report/trace/global-teardown-failure.zip',
    });
  } finally {
    await browser.close();
  }
}
