import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  layersPanelPage = new LayersPanelPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultTextLayer();
  });

  mainTest(qase([2545], 'Delete text (From Keyboard)'), async () => {
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([434], 'Selection to board'), async () => {
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.focusLayerViaShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('text-to-board.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase([394], 'Click "Focus on" text from right click'), async () => {
    const firstText = 'Hello world!';
    const secondText = 'Second text';

    await mainPage.createTextLayerByCoordinates(100, 200, secondText);
    await mainPage.focusLayerViaRightClickOnLayersTab(firstText);
    await expect(mainPage.viewport).toHaveScreenshot('first-text-focused.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickFocusModeTag();
    await mainPage.focusLayerViaRightClickOnLayersTab(secondText);
    await expect(mainPage.viewport).toHaveScreenshot('second-text-focused.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickFocusModeTag();
    await expect(mainPage.viewport).toHaveScreenshot(
      'first-and-second-text-not-focused.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });
});
