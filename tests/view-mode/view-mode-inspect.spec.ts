import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let viewModePage: ViewModePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  viewModePage = new ViewModePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainTest.slow();
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([706], 'Switch to Inspect view'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await viewModePage.openInspectTab();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-inspect-page-image.png',
  );
  await viewModePage.openInteractionsTab();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-interactions-page-image.png',
  );
});

mainTest(
  qase([715], 'Inspect functionality - Board elements dropdown in the top left'),
  async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultRectangleByCoordinates(320, 320);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();

    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    layersPanelPage = new LayersPanelPage(newPage);
    const inspectPanelPage = new InspectPanelPage(newPage);
    await viewModePage.openInspectTab();
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await inspectPanelPage.openCodeTab();
    await newPage.waitForTimeout(200);
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-code-tab-image.png',
    );
  },
);

mainTest(qase([717], 'Inspect functionality - Export'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await designPanelPage.changeHeightAndWidthForLayer('200', '200');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultRectangleByCoordinates(320, 320);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  designPanelPage = new DesignPanelPage(newPage);
  await viewModePage.openInspectTab();
  const inspectPanelPage = new InspectPanelPage(newPage);
  await inspectPanelPage.openComputedTab();

  await designPanelPage.clickAddExportButtonForViewMode();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
  await expect(viewModePage.rightSidebar).toHaveScreenshot(
    'view-mode-export-right-sidebar-image.png',
  );

  await designPanelPage.clickExportElementButton(newPage);
});

mainTest(qase([1785], 'Switch between layers from left menu'), async () => {
  await mainPage.createDefaultBoardByCoordinates(200, 200);
  await designPanelPage.changeHeightAndWidthForLayer('500', '700');
  await mainPage.waitForChangeIsSaved();
  await mainPage.uploadImage('images/mini_sample.jpg');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultRectangleByCoordinates(220, 220);
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultEllipseByCoordinates(330, 220, true);
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultTextLayerByCoordinates(220, 330);
  await layersPanelPage.dragAndDropComponentToBoard('Hello world!');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createSmallClosedPathByCoordinates(330, 330);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.dragAndDropComponentToBoard('Path');
  await mainPage.waitForChangeIsUnsaved();
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  layersPanelPage = new LayersPanelPage(newPage);
  await viewModePage.openInspectTab();
  await layersPanelPage.clickLayerOnLayersTab('Rectangle');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-rectangle-selected-image.png',
  );
  await layersPanelPage.clickLayerOnLayersTab('Ellipse');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-ellipse-selected-image.png',
  );
  await layersPanelPage.clickLayerOnLayersTab('Hello world!');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-test-selected-image.png',
  );
  await layersPanelPage.clickLayerOnLayersTab('Path');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-path-selected-image.png',
  );
  await layersPanelPage.clickLayerOnLayersTab('mini_sample');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-image-selected-image.png',
  );
});

mainTest(qase([1787], 'Copy layout and paste'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await designPanelPage.changeHeightAndWidthForLayer('200', '200');
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  layersPanelPage = new LayersPanelPage(newPage);
  await viewModePage.openInspectTab();
  const inspectPanelPage = new InspectPanelPage(newPage);
  await inspectPanelPage.openComputedTab();
  await viewModePage.copyWidth();
  await expect(viewModePage.rightSidebar).toHaveScreenshot(
    'view-mode-copy-width-image.png',
  );
  await viewModePage.checkBuffer('width: 200px;', newPage);
});
