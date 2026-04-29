import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
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
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
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
});

mainTest(qase([457], 'Delete image (From right click)'), async () => {
  await mainTest.step('Verify image layer is visible', async () => {
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
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

mainTest(qase([2542], 'Delete image (From Keyboard)'), async () => {
  await mainTest.step('Verify layer is visible', async () => {
    await mainPage.uploadImage('images/giphy.gif');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  await mainTest.step(
    'Delete image via keyboard shortcut and verify removal',
    async () => {
      await mainPage.deleteLayerViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible(false);
    },
  );
});
