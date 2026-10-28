import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let viewModePage: ViewModePage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  viewModePage = new ViewModePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await demoAccountFileTest.slow();
});

demoAccountFileTest(qase([706], 'Switch to Inspect view'), async ({ mainPage }) => {
  await demoAccountFileTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await layersPanelPage.isNumLayerNameVisible('Board', 1);
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await demoAccountFileTest.step('Open Inspect tab and verify', async () => {
    await viewModePage.openInspectTab();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-inspect-page-image.png',
    );
  });

  await demoAccountFileTest.step('Open Interactions tab and verify', async () => {
    await viewModePage.openInteractionsTab();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-interactions-page-image.png',
    );
  });
});

demoAccountFileTest(
  qase([717], 'Inspect functionality - Export'),
  async ({ mainPage }) => {
    let inspectPanelPage: InspectPanelPage;

    await demoAccountFileTest.step(
      'Create board with a rectangle inside it',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await designPanelPage.changeHeightAndWidthForLayer('200', '200');
        await mainPage.waitForChangeIsSaved();
        await mainPage.createDefaultRectangleByCoordinates(320, 320);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Open view mode and Inspect > Computed tab',
      async () => {
        const newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
        designPanelPage = new DesignPanelPage(newPage);
        await viewModePage.openInspectTab();
        inspectPanelPage = new InspectPanelPage(newPage);
        await inspectPanelPage.openComputedTab();
      },
    );

    await demoAccountFileTest.step(
      'Add export for the element and verify',
      async () => {
        await designPanelPage.clickAddExportButtonForViewMode();
        await designPanelPage.isViewModeExportRowVisible('PNG', '1x');
        await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
      },
    );

    await demoAccountFileTest.step('Export the element', async () => {
      await designPanelPage.clickExportElementButton(viewModePage.page);
    });
  },
);

demoAccountFileTest(
  qase([1785], 'Switch between layers from left menu'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
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

    let inspectPanelPage: InspectPanelPage;

    await demoAccountFileTest.step('Open view mode and Inspect tab', async () => {
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      layersPanelPage = new LayersPanelPage(newPage);
      inspectPanelPage = new InspectPanelPage(newPage);
      await viewModePage.openInspectTab();
    });

    await demoAccountFileTest.step('Select Rectangle layer and verify', async () => {
      await layersPanelPage.clickLayerOnLayersTab('Rectangle');
      await inspectPanelPage.checkSelectedLayerName('Rectangle');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Height');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Left');
    });

    await demoAccountFileTest.step('Select Ellipse layer and verify', async () => {
      await layersPanelPage.clickLayerOnLayersTab('Ellipse');
      await inspectPanelPage.checkSelectedLayerName('Ellipse');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Height');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Left');
    });

    await demoAccountFileTest.step('Select text layer and verify', async () => {
      await layersPanelPage.clickLayerOnLayersTab('Hello world!');
      await inspectPanelPage.checkSelectedLayerName('Hello world!');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Height');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Left');
    });

    await demoAccountFileTest.step('Select Path layer and verify', async () => {
      await layersPanelPage.clickLayerOnLayersTab('Path');
      await inspectPanelPage.checkSelectedLayerName('Path');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Height');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Left');
    });

    await demoAccountFileTest.step('Select image layer and verify', async () => {
      await layersPanelPage.clickLayerOnLayersTab('mini_sample');
      await inspectPanelPage.checkSelectedLayerName('mini_sample');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Height');
      await inspectPanelPage.checkPropertyRowHasPixelValue('Left');
    });
  },
);

demoAccountFileTest(qase([1787], 'Copy layout and paste'), async ({ mainPage }) => {
  await demoAccountFileTest.step('Create board', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
  });

  await demoAccountFileTest.step(
    'Open view mode and Inspect > Computed tab',
    async () => {
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      layersPanelPage = new LayersPanelPage(newPage);
      await viewModePage.openInspectTab();
      const inspectPanelPage = new InspectPanelPage(newPage);
      await inspectPanelPage.openComputedTab();
    },
  );

  await demoAccountFileTest.step(
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
