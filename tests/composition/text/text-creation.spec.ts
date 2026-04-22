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

mainTest(qase([377], 'Create Text(Toolbar)'), async () => {
  await mainPage.createDefaultTextLayer();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('text-creation-toolbar.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase([378], 'Create Text (Shortcut T)'), async () => {
  await mainPage.createDefaultTextLayerViaShortcut();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('text-creation-shortcut.png', {
    mask: mainPage.maskViewport(),
  });
});
