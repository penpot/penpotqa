import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';
import { pathEditorTest } from '@tests/composition/path-editor/path-editor-fixture';
import {
  A,
  B,
  C,
  C_HANDLER,
  D,
  PATH_NODES,
  PATH_SEGMENTS,
} from '@tests/composition/path-editor/straight-curved-path';
import { qase } from 'playwright-qase-reporter/playwright';

pathEditorTest(
  qase([3776], 'Edits are preserved on exit and reverted with one workspace undo'),
  async ({ pathEditorPage, designPanelPage }) => {
    const overlay = pathEditorPage.overlayComp;
    let editedNodes: Point[];

    await pathEditorTest.step(
      'Open the path in path editing and make several edits.',
      async () => {
        await pathEditorPage.enterPathEditing();
        const curveMiddle = await overlay.getSegmentPoint(C, D, 0.5);
        await overlay.clickAt(curveMiddle);
        await overlay.dragNode(B, { x: 0, y: -60 });
        editedNodes = [A, { x: 880, y: 222 }, C, D, curveMiddle];
        await overlay.checkNodes(editedNodes);
      },
    );

    await pathEditorTest.step('Exit path editing.', async () => {
      await pathEditorPage.exitPathEditing();
      await pathEditorPage.waitForChangeIsSaved();
      // Moving B 60 up raises the top of the path from 282 to 222.
      await designPanelPage.checkYAxis('222');
      await designPanelPage.checkSizeHeight('545.25');
      // The inserted node doesn't change the bounding box: reopen the path to
      // check that every edit was kept, not only B's move.
      await pathEditorPage.enterPathEditing();
      await overlay.checkNodes(editedNodes);
      await pathEditorPage.exitPathEditing();
    });

    await pathEditorTest.step('Press Ctrl/Cmd+Z once.', async () => {
      await pathEditorPage.clickShortcutCtrlZ();
      await designPanelPage.checkYAxis('282');
      await designPanelPage.checkSizeHeight('485.25');
      await pathEditorPage.enterPathEditing();
      await overlay.checkNodes(PATH_NODES);
    });
  },
);

pathEditorTest.describe('In path editing mode', () => {
  pathEditorTest.beforeEach(async ({ pathEditorPage }) => {
    await pathEditorPage.enterPathEditing();
  });

  pathEditorTest(
    qase([3766], 'Copy and paste path fragment within the same path'),
    async ({ pathEditorPage }) => {
      const overlay = pathEditorPage.overlayComp;
      // Pasted nodes are centred on the pointer: B-C is centred on (880, 462),
      // so pasting at (1100, 300) shifts it by (220, -162).
      const pastePoint = { x: 1100, y: 300 };
      const pastedB = { x: 1100, y: 120 };
      const pastedC = { x: 1100, y: 480 };

      await pathEditorTest.step(
        'Select nodes or segments and press Ctrl/Cmd+C.',
        async () => {
          await overlay.clickNode(B);
          await overlay.clickNode(C, ['Shift']);
          await overlay.checkSelectedNodes([B, C]);
          await pathEditorPage.pressCopyShortcut();
        },
      );

      await pathEditorTest.step(
        'Move the pointer to another area and press Ctrl/Cmd+V.',
        async () => {
          await overlay.hoverAt(pastePoint);
          await pathEditorPage.pressPasteShortcut();
          await overlay.checkNodes([...PATH_NODES, pastedB, pastedC]);
          await overlay.checkSegments([...PATH_SEGMENTS, [pastedB, pastedC]]);
        },
      );

      await pathEditorTest.step('Check the selection.', async () => {
        await overlay.checkSelectedNodes([pastedB, pastedC]);
      });
    },
  );

  pathEditorTest(
    qase([3772], 'Path-local undo and redo reverse edits in order'),
    async ({ pathEditorPage }) => {
      const overlay = pathEditorPage.overlayComp;
      // Path state before any edit, then after each of the four edits.
      const states: string[] = [];

      await pathEditorTest.step(
        'Insert a node, change a handler, draw a segment and separate a node without leaving the editor.',
        async () => {
          states.push(await overlay.getStateKey());

          const curveMiddle = await overlay.getSegmentPoint(C, D, 0.5);
          await overlay.clickAt(curveMiddle);
          await overlay.checkNodes([...PATH_NODES, curveMiddle]);
          states.push(await overlay.getStateKey());

          const movedHandler = { x: C_HANDLER.x - 40, y: C_HANDLER.y - 40 };
          await overlay.dragHandler(C_HANDLER, { x: -40, y: -40 });
          await overlay.checkHandlerAt(movedHandler);
          states.push(await overlay.getStateKey());

          // Clear of the other nodes' X and Y, to avoid node snapping.
          const segmentStart = { x: 700, y: 150 };
          await pathEditorPage.clickDrawNodesButtonOnNodePanel();
          await overlay.clickAt(segmentStart);
          await overlay.clickNode(B);
          await pathEditorPage.clickMoveNodesButtonOnNodePanel();
          await overlay.checkSegments([
            [A, B],
            [B, C],
            [C, curveMiddle],
            [curveMiddle, D],
            [D, A],
            [segmentStart, B],
          ]);
          states.push(await overlay.getStateKey());

          // Separating A splits it into two nodes, one per segment.
          await overlay.clickNode(A);
          await pathEditorPage.clickSeparateNodesButtonOnNodePanel();
          await overlay.checkNodeCount(7);
          states.push(await overlay.getStateKey());
        },
      );

      await pathEditorTest.step('Press Ctrl/Cmd+Z repeatedly.', async () => {
        for (let edit = 4; edit >= 1; edit--) {
          await pathEditorPage.undoUntilState(
            states[edit - 1],
            `Undo reverts edit ${edit} and keeps the previous ones`,
          );
        }
      });

      await pathEditorTest.step(
        'Press Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y repeatedly.',
        async () => {
          for (let edit = 1; edit <= 4; edit++) {
            await pathEditorPage.redoUntilState(
              states[edit],
              `Redo brings back edit ${edit}`,
            );
          }
        },
      );
    },
  );
});
