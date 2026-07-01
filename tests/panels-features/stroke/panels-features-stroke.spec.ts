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
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(
  qase(2971, 'Live preview updates when adjusting both Dash and Gap sequentially'),
  async () => {
    const dashValue = '5';
    const gapValue = '2';

    await mainTest.step(
      'Create a Rectangle and add stroke and verify default state',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await designPanelPage.clickAddStrokeButton();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Apply outside dashed stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings(
        '#F5358F',
        '80',
        '5',
        'Outside',
        'Dashed',
      );
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      `Set dash value ${dashValue} and assert changes`,
      async () => {
        await designPanelPage.setStrokeDashValue(dashValue);
        await designPanelPage.hasStrokeDashInputValue(dashValue);
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          `rectangle-stroke-outside-dashed-${dashValue}.png`,
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await mainTest.step(`Set gap value ${gapValue} and assert changes`, async () => {
      await designPanelPage.setStrokeGapValue(gapValue);
      await designPanelPage.hasStrokeGapInputValue(gapValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        `rectangle-stroke-outside-dashed-${dashValue}-gap-${gapValue}.png`,
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  },
);
