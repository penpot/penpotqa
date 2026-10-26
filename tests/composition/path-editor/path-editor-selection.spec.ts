import { pathEditorTest } from '@tests/composition/path-editor/path-editor-fixture';
import {
  PATH_NODES,
  PATH_SEGMENTS,
} from '@tests/composition/path-editor/straight-curved-path';
import { qase } from 'playwright-qase-reporter/playwright';

pathEditorTest(
  qase([3719], 'Ctrl/Cmd+Shift+A clears the path selection'),
  async ({ pathEditorPage, layersPanelPage }) => {
    const overlay = pathEditorPage.overlayComp;

    const checkOnlyPathLayerSelected = async () => {
      await layersPanelPage.isLayerWithNameSelected('Path');
      await layersPanelPage.isLayerWithNameSelected('Rectangle', false);
      await layersPanelPage.isLayerWithNameSelected('Ellipse', false);
    };

    await pathEditorTest.step(
      'Add other shapes and open the path in path editing mode',
      async () => {
        await pathEditorPage.createDefaultRectangleByCoordinates(1000, 600);
        await pathEditorPage.createDefaultEllipseByCoordinates(1000, 150);
        await pathEditorPage.waitForChangeIsSaved();
        await pathEditorPage.enterPathEditing();
      },
    );

    await pathEditorTest.step('Press Ctrl/Cmd+A.', async () => {
      await pathEditorPage.pressSelectAllShortcut();
      await overlay.checkSelectedNodes(PATH_NODES);
      await overlay.checkSelectedSegments(PATH_SEGMENTS);
      await checkOnlyPathLayerSelected();
    });

    await pathEditorTest.step('Press Ctrl/Cmd+Shift+A.', async () => {
      await pathEditorPage.pressClearSelectionShortcut();
      await overlay.checkSelectedNodes([]);
      await overlay.checkSelectedSegments([]);
      await overlay.isVisible();
      await checkOnlyPathLayerSelected();
    });
  },
);
