import type { Page } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { waitMessage } from 'helpers/gmail';

/**
 * Registers a brand-new, real Penpot account via the UI (Gmail-alias email)
 * and lands on its dashboard, fully onboarded. Shared by `registerTest`
 * (fixtures.ts) and `createInviteeSession()`, so it can run on any page,
 * not just the test's own.
 */
export async function registerNewAccount(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.acceptCookie();
  await loginPage.clickOnCreateAccount();
  await registerPage.registerAccount(name, email, password);
  await registerPage.isRegisterEmailCorrect(email);
  const invite = await waitMessage(page, email, 40);
  await page.goto(invite!.inviteUrl);
  await dashboardPage.fillOnboardingQuestions();
}
