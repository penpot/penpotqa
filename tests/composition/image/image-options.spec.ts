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
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.describe('PNG image', () => {
  mainTest.beforeEach(async () => {
    await mainPage.uploadImage('images/images.png');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([482], 'Selection to board'), async () => {
    await mainTest.step('Convert selection to board', async () => {
      await mainPage.selectionToBoardViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify image converted to board screenshot', async () => {
      await expect(
        mainPage.viewport,
        'Image converted to board should match snapshot',
      ).toHaveScreenshot('image-to-board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([457], 'Delete image (From right click)'), async () => {
    await mainTest.step('Verify image layer is visible', async () => {
      await mainPage.isCreatedLayerVisible();
    });

    await mainTest.step(
      'Delete image via right click and verify removal',
      async () => {
        await mainPage.deleteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible(false);
      },
    );
  });

  mainTest(
    qase(
      [466, 468],
      'Copy/Paste and Cut/Paste image (from context menu and shortcut)',
    ),
    async () => {
      await mainTest.step(
        '466 Copy and Paste image (from context menu and shortcut)',
        async () => {
          await mainTest.step('Copy and paste image from context menu', async () => {
            await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
              'images',
              'copy',
              0,
            );
            await layersPanelPage.pasteLayerViaRightClick();
            await mainPage.waitForChangeIsSaved();
            await layersPanelPage.isVisibleLayersCount(2);
          });

          await mainTest.step('Copy and paste image from shortcut', async () => {
            await layersPanelPage.selectLayerByName('images');
            await layersPanelPage.pressCopyShortcut();
            await mainPage.clickViewportByCoordinates(800, 800);
            await layersPanelPage.pressPasteShortcut();
            await mainPage.waitForChangeIsSaved();
            await layersPanelPage.isVisibleLayersCount(3);
          });
        },
      );
      await mainTest.step(
        '468 Cut image (From rightclick and Shortcut Ctrl+X)',
        async () => {
          await mainTest.step('Cut and paste image from context menu', async () => {
            await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
              'images',
              'cut',
              1,
            );
            await layersPanelPage.isVisibleLayersCount(2);
            await mainPage.clickViewportByCoordinates(800, 600);
            await layersPanelPage.pasteLayerViaRightClick();
            await mainPage.waitForChangeIsSaved();
            await layersPanelPage.isVisibleLayersCount(3);
          });
          await mainTest.step(
            'Cut & paste image by shortcuts (Ctrl+X / Ctrl+V)',
            async () => {
              await layersPanelPage.pressCutShortcut();
              await layersPanelPage.isVisibleLayersCount(2);
              await mainPage.clickViewportByCoordinates(800, 300);
              await layersPanelPage.pressPasteShortcut();
              await mainPage.waitForChangeIsSaved();
              await layersPanelPage.isVisibleLayersCount(3);
            },
          );
        },
      );
    },
  );
});
