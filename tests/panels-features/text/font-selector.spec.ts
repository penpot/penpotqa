import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';
import { expect } from 'playwright/test';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.createDefaultTextLayer();
});

mainTest(
  qase([3486], 'Font family names render using their own family in the selector'),
  async () => {
    await designPanelPage.openTypographyFontDropdown();
    await designPanelPage.isTypographyFontDropdownFullSizeVisible();
    await expect(designPanelPage.textFontDropdownFullSize).toHaveScreenshot(
      'font-dropdown-full-size.png',
    );
  },
);
