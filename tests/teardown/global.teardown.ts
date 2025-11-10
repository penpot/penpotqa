import { chromium, Page, BrowserContext } from 'playwright';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { TeamPage } from '../../pages/dashboard/team-page';
import path from 'path';

export default async function globalTeardown() {
  console.log('🌍 Cleaning up autotest teams...');

  const browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext();

  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true });

  const page: Page = await context.newPage();
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
      break;
    }

    if (!deletedOne) break;
  }

  await browser.close();
}

// import { test as teardown, Page } from '@playwright/test';
// import { LoginPage } from '../../pages/login-page';
// import { DashboardPage } from '../../pages/dashboard/dashboard-page';
// import { TeamPage } from '../../pages/dashboard/team-page';

// const LOGIN_EMAIL = process.env.LOGIN_EMAIL ?? '';
// const LOGIN_PWD = process.env.LOGIN_PWD ?? '';

// teardown(
//   'delete autotest teams',
//   {
//     tag: '@teardown',
//   },
//   async ({ page }: { page: Page }) => {
//     console.log('🌍 Cleaning up autotest teams...');

//     const loginPage = new LoginPage(page);
//     const dashboardPage = new DashboardPage(page);
//     const teamPage = new TeamPage(page);

//     // Log in
//     await loginPage.goto();
//     await loginPage.acceptCookie();
//     await loginPage.enterEmail(LOGIN_EMAIL);
//     await loginPage.enterPwd(LOGIN_PWD);
//     await loginPage.clickLoginButton();
//     await dashboardPage.isDashboardOpenedAfterLogin();

//     const autotestRegex = /autotest/i;

//     while (true) {
//       await teamPage.openTeamsListIfClosed();

//       const teamMenuItems = page.getByRole('menuitem');
//       const teamCount = await teamMenuItems.count();

//       let deletedOne = false;

//       for (let i = 0; i < teamCount; i++) {
//         const teamItem = teamMenuItems.nth(i);

//         if (!(await teamItem.isVisible())) continue;

//         const teamText = (await teamItem.textContent())?.trim();
//         if (!teamText || teamText === 'Your Penpot') continue;
//         if (!autotestRegex.test(teamText)) continue;

//         const teamName = teamText;
//         console.log(`🧹 Deleting team: ${teamName}`);

//         await teamPage.deleteTeam(teamName);

//         deletedOne = true;
//         break;
//       }

//       // Exit loop if no more autotest teams are found
//       if (!deletedOne) break;
//     }

//     console.log('✅ All autotest teams deleted.');
//   },
// );
