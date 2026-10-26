import { pathEditorTest } from '@tests/composition/path-editor/path-editor-fixture';
import {
  A,
  B,
  C,
  D,
  PATH_NODES,
} from '@tests/composition/path-editor/straight-curved-path';
import { qase } from 'playwright-qase-reporter/playwright';

pathEditorTest.beforeEach(async ({ pathEditorPage }) => {
  await pathEditorPage.enterPathEditing();
});

pathEditorTest(
  qase([3724], 'Drag a single selected segment'),
  async ({ pathEditorPage }) => {
    const overlay = pathEditorPage.overlayComp;

    await pathEditorTest.step('Click a segment to select it.', async () => {
      await overlay.clickSegment(A, B);
      await overlay.checkSelectedSegments([[A, B]]);
    });

    await pathEditorTest.step('Drag the segment to a new position.', async () => {
      const movedA = { x: 375, y: 222 };
      const movedB = { x: 880, y: 222 };
      await overlay.dragSegment(A, B, { x: 0, y: -60 });
      await overlay.checkNodes([movedA, movedB, C, D]);
      await overlay.checkSegments([
        [movedA, movedB],
        [movedB, C],
        [C, D],
        [D, movedA],
      ]);
      await overlay.checkSegmentIsCurve(movedA, movedB, false);
    });
  },
);

pathEditorTest(
  qase([3729], 'Insert a node at the visual middle of a curved segment'),
  async ({ pathEditorPage }) => {
    const overlay = pathEditorPage.overlayComp;
    const middle = await overlay.getSegmentPoint(C, D, 0.5);
    const nearMiddle = { x: middle.x + 3, y: middle.y + 3 };

    await pathEditorTest.step(
      'Hover near the visual middle of a curved segment.',
      async () => {
        await overlay.hoverAt(nearMiddle);
        await overlay.checkInsertionPreviewAt(middle);
      },
    );

    await pathEditorTest.step('Click.', async () => {
      await overlay.clickAt(nearMiddle);
      await overlay.checkNodes([...PATH_NODES, middle]);
      await overlay.checkSegments([
        [A, B],
        [B, C],
        [C, middle],
        [middle, D],
        [D, A],
      ]);
    });
  },
);
