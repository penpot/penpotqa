import { pathEditorTest } from '@tests/composition/path-editor/path-editor-fixture';
import {
  A,
  B,
  C,
  D,
  EMPTY_POINT,
  PATH_NODES,
  POINTER_POINT,
} from '@tests/composition/path-editor/straight-curved-path';
import { qase } from 'playwright-qase-reporter/playwright';

pathEditorTest.beforeEach(async ({ pathEditorPage }) => {
  await pathEditorPage.enterPathEditing();
  await pathEditorPage.clickDrawNodesButtonOnNodePanel();
  await pathEditorPage.isToolbarButtonToggled(
    pathEditorPage.nodePanelDrawNodesButton,
  );
});

pathEditorTest(
  qase([3700], 'Pending line joins an existing segment at the exact click point'),
  async ({ pathEditorPage }) => {
    const overlay = pathEditorPage.overlayComp;

    await pathEditorTest.step(
      'Click an empty area of the canvas to start a new line.',
      async () => {
        await overlay.clickAt(EMPTY_POINT);
        await overlay.hoverAt(POINTER_POINT);
        await overlay.checkPendingSegment(EMPTY_POINT, POINTER_POINT);
      },
    );

    await pathEditorTest.step('Click on an existing segment.', async () => {
      const clickPoint = await overlay.getSegmentPoint(A, B, 0.3);
      await overlay.clickAt(clickPoint);
      await overlay.checkNodes([...PATH_NODES, EMPTY_POINT, clickPoint]);
      await overlay.checkSegments([
        [A, clickPoint],
        [clickPoint, B],
        [B, C],
        [C, D],
        [D, A],
        [EMPTY_POINT, clickPoint],
      ]);
    });
  },
);
