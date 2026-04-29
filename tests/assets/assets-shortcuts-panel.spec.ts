import { createTeamName } from '../../helpers/teams/create-team-name';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { expect } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { TeamPage } from '@pages/dashboard/team-page';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1020], 'Open panel main menu - help&info'), async () => {
  await mainTest.step('Open shortcuts panel via main menu', async () => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickHelpInfoMainMenuItem();
    await mainPage.clickShortcutsMainMenuSubItem();
  });

  await mainTest.step(
    'Verify shortcuts panel is displayed and matches screenshot',
    async () => {
      await mainPage.isShortcutsPanelDisplayed();
      await mainPage.clickViewportTwice();
      await expect(
        mainPage.shortcutsPanel,
        'Shortcuts panel should match screenshot',
      ).toHaveScreenshot('shortcuts-panel.png');
    },
  );

  await mainTest.step(
    'Close shortcuts panel via main menu and verify it is hidden',
    async () => {
      await mainPage.clickMainMenuButton();
      await mainPage.clickHelpInfoMainMenuItem();
      await mainPage.clickShortcutsMainMenuSubItem();
      await mainPage.isShortcutsPanelNotDisplayed();
    },
  );
});

mainTest(qase([1025], 'Show/hide panel'), async () => {
  await mainTest.step('Open shortcuts panel via keyboard shortcut', async () => {
    await mainPage.pressShortcutsPanelShortcut();
    await mainPage.isShortcutsPanelDisplayed();
  });

  await mainTest.step('Close shortcuts panel and verify it is hidden', async () => {
    await mainPage.clickViewportTwice();
    await mainPage.closeShortcutsPanel();
    await mainPage.isShortcutsPanelNotDisplayed();
  });
});
