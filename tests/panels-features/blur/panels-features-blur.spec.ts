import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultTextLayerByCoordinates(100, 100);
    await mainPage.createDefaultEllipseByCoordinates(100, 100);
  });

  mainTest(
    qase([3056, 3049], 'Create a background blur and add shadow'),
    async () => {
      await mainTest.step('3056 Create a background blur', async () => {
        await mainTest.step('Add a background blur to the ellipse', async () => {
          await designPanelPage.clickAddBlurButton();
          await designPanelPage.selectTypeForBlurEffects('Background blur');
          await mainPage.waitForChangeIsSaved();
        });

        await mainTest.step('Change the opacity fill in the ellipse', async () => {
          await designPanelPage.changeOpacityForFill('30');
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickViewportTwice();
        });

        await mainTest.step('Check the background blur', async () => {
          await expect(mainPage.viewport).toHaveScreenshot('background-blur.png', {
            mask: mainPage.maskViewport(),
          });
        });
      });

      await mainTest.step(
        '3049 Shadow renders correctly with background blur',
        async () => {
          await mainTest.step('Add shadow to the ellipse', async () => {
            await layersPanelPage.selectLayerByName('Ellipse');
            await designPanelPage.clickAddShadowButton();
            await mainPage.waitForChangeIsSaved();
            await mainPage.clickViewportTwice();
          });

          await mainTest.step('Check the background blur with shadow', async () => {
            await expect(mainPage.viewport).toHaveScreenshot(
              'background-blur-with-shadow.png',
              {
                mask: mainPage.maskViewport(),
              },
            );
          });
        },
      );
    },
  );
});
