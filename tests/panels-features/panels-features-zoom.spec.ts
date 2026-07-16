import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

mainTest.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest(qase([850], 'Zoom via top right menu'), async ({ page }) => {
  await mainTest.step('Zoom in and verify screenshot', async () => {
    await mainPage.increaseZoom(1);
    await mainPage.clickViewportOnce();
    await expect(page).toHaveScreenshot('canvas-zoom-in.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });

  await mainTest.step('Zoom out and verify screenshot', async () => {
    await mainPage.decreaseZoom(2);
    await mainPage.clickViewportOnce();
    await expect(page).toHaveScreenshot('canvas-zoom-out.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });
});

mainTest(qase([852], 'Reset zoom via top right menu'), async ({ page }) => {
  await mainTest.step('Zoom in and verify screenshot', async () => {
    await mainPage.increaseZoom(1);
    await mainPage.clickViewportOnce();
    await expect(page).toHaveScreenshot('canvas-zoom-in.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });

  await mainTest.step('Reset zoom and verify default screenshot', async () => {
    await mainPage.resetZoom();
    await expect(page).toHaveScreenshot('canvas-zoom-default.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });
});

mainTest(qase([854], 'Zoom to fit all via top right menu'), async ({ page }) => {
  await mainTest.step('Create board and ellipse', async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await page.mouse.wheel(0, 1000);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Zoom to fit all and verify screenshot', async () => {
    await mainPage.zoomToFitAll();
    await mainPage.clickViewportTwice();
    await expect(page).toHaveScreenshot('canvas-zoom-to-fit-all.png', {
      mask: [
        mainPage.usersSection,
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
      ],
    });
  });
});

mainTest(qase([856], 'Zoom to selected via top right menu'), async () => {
  await mainTest.step('Create board and zoom to selected', async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportByCoordinates(900, 100);
    await mainPage.waitForChangeIsSaved();
    await mainPage.zoomToFitSelected();
    await mainPage.clickViewportTwice();
  });

  await mainTest.step('Verify zoom to selected screenshot', async () => {
    await expect(mainPage.viewport).toHaveScreenshot('canvas-zoom-to-selected.png', {
      mask: mainPage.maskViewport(),
    });
  });
});
