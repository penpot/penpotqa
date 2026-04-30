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

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe('PNG image', () => {
  mainTest.beforeEach(async () => {
    await mainPage.uploadImage('images/images.png');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([440], 'Rename image with valid name'), async () => {
    await mainTest.step('Rename image layer', async () => {
      await layersPanelPage.doubleClickLayerOnLayersTab('images');
      await layersPanelPage.typeNameCreatedLayerAndEnter('renamed image');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify layer name is updated', async () => {
      await layersPanelPage.isLayerNameDisplayed('renamed image');
    });
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
    qase([466], 'Copy and Paste image (from context menu and shortcut)'),
    async () => {
      await mainTest.step('Copy and paste image from context menu', async () => {
        await layersPanelPage.copyLayerViaRightClick('images');
        await mainPage.clickViewportByCoordinates(300, 300);
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
});
