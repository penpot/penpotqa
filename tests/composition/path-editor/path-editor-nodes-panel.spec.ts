import { PathToolbarAction } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import { pathEditorTest } from '@tests/composition/path-editor/path-editor-fixture';
import {
  A,
  B,
  C,
  C_HANDLER,
} from '@tests/composition/path-editor/straight-curved-path';
import { qase } from 'playwright-qase-reporter/playwright';

const { DrawNodes, MoveNodes, SnapNodes, HandlerBehaviour } = PathToolbarAction;

pathEditorTest.beforeEach(async ({ pathEditorPage }) => {
  await pathEditorPage.enterPathEditing();
});

pathEditorTest(
  qase([3782], 'Path toolbar shows only applicable actions'),
  async ({ pathEditorPage }) => {
    const overlay = pathEditorPage.overlayComp;

    await pathEditorTest.step(
      'Enter path editing with nothing selected.',
      async () => {
        await pathEditorPage.checkToolbarActions([DrawNodes, MoveNodes, SnapNodes]);
      },
    );

    await pathEditorTest.step(
      'Select one node, then several nodes, then a segment, then a handler.',
      async () => {
        await overlay.clickNode(B);
        await pathEditorPage.checkToolbarActions([
          DrawNodes,
          MoveNodes,
          PathToolbarAction.SeparateNodes,
          PathToolbarAction.ToCurve,
          SnapNodes,
        ]);

        await overlay.clickNode(C, ['Shift']);
        await pathEditorPage.checkToolbarActions([
          DrawNodes,
          MoveNodes,
          PathToolbarAction.MergeNodes,
          PathToolbarAction.SeparateNodes,
          PathToolbarAction.ToCorner,
          PathToolbarAction.ToCurve,
          HandlerBehaviour,
          SnapNodes,
        ]);

        await pathEditorPage.pressClearSelectionShortcut();
        await overlay.clickSegment(A, B);
        await pathEditorPage.checkToolbarActions([
          DrawNodes,
          MoveNodes,
          PathToolbarAction.MergeNodes,
          PathToolbarAction.SeparateNodes,
          PathToolbarAction.ToCurve,
          SnapNodes,
        ]);

        await pathEditorPage.pressClearSelectionShortcut();
        await overlay.clickAt(C_HANDLER);
        await pathEditorPage.checkToolbarActions([
          DrawNodes,
          MoveNodes,
          HandlerBehaviour,
          SnapNodes,
        ]);
      },
    );

    await pathEditorTest.step('Check for greyed out buttons.', async () => {
      await pathEditorPage.checkNoDisabledToolbarActions();
    });
  },
);
