import { pathEditorTest } from '@tests/composition/path-editor/path-editor-fixture';
import { A, B, C, D } from '@tests/composition/path-editor/straight-curved-path';
import { qase } from 'playwright-qase-reporter/playwright';

pathEditorTest.beforeEach(async ({ pathEditorPage }) => {
  await pathEditorPage.enterPathEditing();
});

pathEditorTest(
  qase([3743], 'Shift+Delete removes a node and its adjacent segments'),
  async ({ pathEditorPage }) => {
    const overlay = pathEditorPage.overlayComp;

    await pathEditorTest.step(
      'Select an interior node and press Shift+Delete.',
      async () => {
        await overlay.clickNode(B);
        await overlay.checkSelectedNodes([B]);
        await pathEditorPage.pressDeleteWithSegmentsShortcut();
        await overlay.checkNodes([A, C, D]);
        await overlay.checkSegments([
          [C, D],
          [D, A],
        ]);
      },
    );
  },
);
