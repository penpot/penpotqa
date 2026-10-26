import type { Page } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';

/** Opens the first file of a team's dashboard in the editor, e.g. from an invitee's
 * own browser context. */
export async function openTeamFile(page: Page, teamId: string): Promise<MainPage> {
  const mainPage = new MainPage(page);
  await new TeamPage(page).goToTeamDashboard(teamId);
  await new DashboardPage(page).openFile();
  await mainPage.isMainPageLoaded();
  return mainPage;
}
