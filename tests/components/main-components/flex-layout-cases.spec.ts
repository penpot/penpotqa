import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(
    'Add a flex layout board, rectangle and ellipse components',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await designPanelPage.changeHeightAndWidthForLayer('300', '300');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.createComponentViaRightClickFromLayerByName('Rectangle');
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultEllipseByCoordinates(300, 300);
      await mainPage.createComponentViaRightClickFromLayerByName('Ellipse');
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickCreatedBoardTitleOnCanvas();
    },
  );

  mainTest(
    qase(
      [1503, 1504],
      'Create flex board with main component and its copy, change direction and alignment',
    ),
    async () => {
      await mainTest.step(
        '(1503) Create flex board with main component and its copy, change direction',
        async () => {
          await designPanelPage.changeLayoutDirection('Column');
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after changing board layout direction',
          ).toHaveScreenshot('main-component-change-board-direction.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        '(1504) Create flex board with main component and its copy, change alignment',
        async () => {
          await designPanelPage.changeLayoutAlignment('Center');
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after changing board layout alignment',
          ).toHaveScreenshot('main-component-change-board-alignment.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();

    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      [1511],
      'Create component with 2 boards with components inside it. change paddings',
    ),
    async () => {
      await mainTest.slow();

      await mainTest.step(
        'Add two boards with elements and create components',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
          await mainPage.waitForChangeIsSaved();

          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeAxisXAndYForLayer('600', '200');

          await mainPage.createDefaultBoardByCoordinates(200, 200, true);
          await designPanelPage.changeHeightAndWidthForLayer('300', '300');
          await mainPage.waitForChangeIsSaved();
          await mainPage.addFlexLayoutViaRightClickForNComponent(1);
          await mainPage.waitForChangeIsSaved();

          await mainPage.createDefaultEllipseByCoordinates(200, 200, true);
          await mainPage.waitForChangeIsSaved();

          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickMainMenuButton();
          await mainPage.clickEditMainMenuItem();
          await mainPage.clickSelectAllMainMenuSubItem();
          await mainPage.waitForChangeIsSaved();
          await mainPage.createComponentsMultipleShapesRightClick(true);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Add flex layout and change paddings', async () => {
        await mainPage.addFlexLayoutViaRightClickForNComponent('0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutPadding('Vertical', '20');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutPadding('Horizontal', '40');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify component padding changes on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after changing component paddings inside flex board',
        ).toHaveScreenshot('component-inside-board-change-paddings.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase([1514], 'Create component inside flex board, change alignment for element'),
    async () => {
      await mainTest.step(
        'Create component inside flex board and change alignment',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeLayoutAlignment('Center');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify alignment change on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after changing component alignment inside flex board',
        ).toHaveScreenshot('component-inside-board-change-alignment.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );
});
