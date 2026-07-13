import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

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
  await mainTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await mainTest.step('Open Inspect tab and verify', async () => {
    await viewModePage.openInspectTab();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-inspect-page-image.png',
    );
  });

  await mainTest.step('Open Interactions tab and verify', async () => {
    await viewModePage.openInteractionsTab();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-interactions-page-image.png',
    );
  });
});

mainTest(
  qase([715], 'Inspect functionality - Board elements dropdown in the top left'),
  async () => {
    let inspectPanelPage: InspectPanelPage;

    await mainTest.step('Create board with a rectangle inside it', async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await designPanelPage.changeHeightAndWidthForLayer('200', '200');
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultRectangleByCoordinates(320, 320);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Open view mode', async () => {
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      layersPanelPage = new LayersPanelPage(newPage);
      inspectPanelPage = new InspectPanelPage(newPage);
    });

    await mainTest.step(
      'Select rectangle layer, open code tab and verify',
      async () => {
        await viewModePage.openInspectTab();
        await layersPanelPage.clickLayerOnLayersTab('Rectangle');
        await inspectPanelPage.openCodeTab();
        await viewModePage.page.waitForTimeout(200);
        await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
          'view-mode-code-tab-image.png',
        );
      },
    );
  },
);

mainTest(qase([717], 'Inspect functionality - Export'), async () => {
  let inspectPanelPage: InspectPanelPage;

  await mainTest.step('Create board with a rectangle inside it', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultRectangleByCoordinates(320, 320);
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Open view mode and Inspect > Computed tab', async () => {
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    designPanelPage = new DesignPanelPage(newPage);
    await viewModePage.openInspectTab();
    inspectPanelPage = new InspectPanelPage(newPage);
    await inspectPanelPage.openComputedTab();
  });

  await mainTest.step('Add export for the element and verify', async () => {
    await designPanelPage.clickAddExportButtonForViewMode();
    await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
    await expect(viewModePage.rightSidebar).toHaveScreenshot(
      'view-mode-export-right-sidebar-image.png',
    );
  });

  await mainTest.step('Export the element', async () => {
    await designPanelPage.clickExportElementButton(viewModePage.page);
  });
});

mainTest(qase([1785], 'Switch between layers from left menu'), async () => {
  await mainTest.step(
    'Create board with image, rectangle, ellipse, text and path layers',
    async () => {
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
    },
  );

  await mainTest.step('Open view mode and Inspect tab', async () => {
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    layersPanelPage = new LayersPanelPage(newPage);
    await viewModePage.openInspectTab();
  });

  await mainTest.step('Select Rectangle layer and verify', async () => {
    await layersPanelPage.clickLayerOnLayersTab('Rectangle');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-rectangle-selected-image.png',
    );
  });

  await mainTest.step('Select Ellipse layer and verify', async () => {
    await layersPanelPage.clickLayerOnLayersTab('Ellipse');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-ellipse-selected-image.png',
    );
  });

  await mainTest.step('Select text layer and verify', async () => {
    await layersPanelPage.clickLayerOnLayersTab('Hello world!');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-test-selected-image.png',
    );
  });

  await mainTest.step('Select Path layer and verify', async () => {
    await layersPanelPage.clickLayerOnLayersTab('Path');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-path-selected-image.png',
    );
  });

  await mainTest.step('Select image layer and verify', async () => {
    await layersPanelPage.clickLayerOnLayersTab('mini_sample');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-image-selected-image.png',
    );
  });
});

mainTest(qase([1787], 'Copy layout and paste'), async () => {
  await mainTest.step('Create board', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Open view mode and Inspect > Computed tab', async () => {
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    layersPanelPage = new LayersPanelPage(newPage);
    await viewModePage.openInspectTab();
    const inspectPanelPage = new InspectPanelPage(newPage);
    await inspectPanelPage.openComputedTab();
  });

  await mainTest.step(
    'Copy width and verify it is copied to clipboard',
    async () => {
      await viewModePage.copyWidth();
      await expect(viewModePage.rightSidebar).toHaveScreenshot(
        'view-mode-copy-width-image.png',
      );
      await viewModePage.checkBuffer('width: 200px;', viewModePage.page);
    },
  );
});
