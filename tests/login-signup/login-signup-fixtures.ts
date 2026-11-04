import { test } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createDemoUser } from 'helpers/accounts/create-demo-user';

type DemoAccountFixtures = {
  demoAccount: { email: string; password: string };
};

// Plain `test` (the page starts logged out) plus `demoAccount`: the credentials of a
// fresh demo account, for login/sign-up form tests that need an existing account.
// It's created through the standalone `request` context, not the page's, so the
// browser stays logged out. Only created when a test uses it.
export const demoCredentialsTest = test.extend<DemoAccountFixtures>({
  demoAccount: async ({ request }, use) => {
    await use(await createDemoUser(request));
  },
});

type DemoOnboardingFixtures = {
  dashboardPage: DashboardPage;
};

// A fresh demo account created with onboarding on, logged in and on its dashboard
// with the onboarding survey open — instead of signing up a Gmail account just to
// reach it.
export const demoOnboardingTest = test.extend<DemoOnboardingFixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);

    await createDemoUser(page.context().request, { skipOnboarding: false });
    await page.goto('/');
    await dashboardPage.acceptCookie();
    await dashboardPage.isOnboardingFirstQuestionsVisible();

    await use(dashboardPage);
  },
});
