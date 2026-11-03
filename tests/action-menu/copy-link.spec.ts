import { expect } from '@playwright/test';
import { demoAccountFileTest, demoTeamWithInviteeTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';

const defaultNameBoard = 'Board';

// Default inviteeRole is Editor.
demoTeamWithInviteeTest(
  qase([2036], 'Share link of two Boards to a user from your team'),
  async ({ page, mainPage, invitee }) => {
    const layersPanelPage = new LayersPanelPage(page);
    let link = '';

    await demoTeamWithInviteeTest.step(
      'Create two boards and copy their link',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(100, 100);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
        await mainPage.createDefaultBoardByCoordinates(100, 300);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 2);
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();
        await mainPage.waitForChangeIsSaved();
        await mainPage.copyLayerLinkViaRightClick();
        link = await page.evaluate(() => navigator.clipboard.readText());
      },
    );

    await demoTeamWithInviteeTest.step(
      'Team member opens the link and sees both boards',
      async () => {
        const inviteeMainPage = new MainPage(invitee.page);
        await invitee.page.goto(link);
        await inviteeMainPage.isMainPageLoaded();
        await expect(inviteeMainPage.viewport).toHaveScreenshot('2-board-link.png', {
          mask: inviteeMainPage.maskViewport(),
        });
      },
    );
  },
);

demoAccountFileTest(
  qase([2035], 'Share link of Component with a user without team permission'),
  async ({ page, mainPage, secondUserPage }) => {
    let link = '';

    await demoAccountFileTest.step(
      'Create component and copy its link',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(100, 100);
        await mainPage.createComponentViaRightClick();
        await mainPage.copyLayerLinkViaRightClick();
        link = await page.evaluate(() => navigator.clipboard.readText());
      },
    );

    await demoAccountFileTest.step(
      'Verify access is denied to another user via the component link',
      async () => {
        const secondUserTeamPage = new TeamPage(secondUserPage);
        await secondUserPage.goto(link);
        await secondUserTeamPage.isRequestAccessButtonVisible();
        await secondUserTeamPage.clickReturnHomeButton();
        await new DashboardPage(secondUserPage).isDashboardOpenedAfterLogin();
      },
    );
  },
);
