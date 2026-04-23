import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let colorPalettePage: ColorPalettePage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let inspectPanelPage: InspectPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultTextLayer();
  });

  mainTest(qase([388], 'Delete text (From right click)'), async () => {
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([2545], 'Delete text (From Keyboard)'), async () => {
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([392], 'Rename text with valid name'), async () => {
    await layersPanelPage.doubleClickLayerOnLayersTab('Hello world!');
    await layersPanelPage.typeNameCreatedLayerAndEnter('renamed text');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed text');
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
