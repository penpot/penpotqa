import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PathEditorPage, type Point } from '@pages/workspace/path-editor-page';
import { expect } from '@playwright/test';
import { demoAccountApiFixture, demoAccountFileTest } from 'fixtures';
import { importDraftFile } from 'helpers/files/import-draft-file';
import { qase } from 'playwright-qase-reporter/playwright';

// documents/straight-curved-path.penpot: one closed path "Path" with four nodes,
// a straight top segment A-B and curved segments B-C, C-D and D-A.
const A: Point = { x: 375, y: 282 };
const B: Point = { x: 880, y: 282 };
const C: Point = { x: 880, y: 642 };
const D: Point = { x: 375, y: 642 };
const PATH_NODES = [A, B, C, D];
const PATH_SEGMENTS: [Point, Point][] = [
  [A, B],
  [B, C],
  [C, D],
  [D, A],
];
// End of the B-C handle of node C.
const C_HANDLER: Point = { x: 687.4445190429688, y: 488.888916015625 };
// Empty canvas spots, clear of the path toolbar (top of the viewport) and far
// enough from any node to avoid node snapping.
const EMPTY_POINT: Point = { x: 620, y: 180 };
const POINTER_POINT: Point = { x: 700, y: 210 };

let pathEditorPage: PathEditorPage;

demoAccountApiFixture.describe('Path editor', () => {
  demoAccountApiFixture.beforeEach(async ({ page }) => {
    pathEditorPage = new PathEditorPage(page);
    const { teamId, fileId } = await importDraftFile(
      page.context().request,
      'documents/straight-curved-path.penpot',
    );
    await page.goto(`/?screen=workspace&team-id=${teamId}&file-id=${fileId}`);
    await pathEditorPage.isMainPageLoaded();
  });

  demoAccountApiFixture(
    qase([3719], 'Ctrl/Cmd+Shift+A clears the path selection'),
    async ({ page }) => {
      const layersPanelPage = new LayersPanelPage(page);

      await demoAccountApiFixture.step(
        'Add other shapes and open the path in path editing mode',
        async () => {
          await page.keyboard.press('R');
          await pathEditorPage.dragOnViewport(1000, 600, 1100, 700);
          await page.keyboard.press('E');
          await pathEditorPage.dragOnViewport(1000, 150, 1100, 250);
          await pathEditorPage.waitForChangeIsSaved();
          await pathEditorPage.enterPathEditing();
        },
      );

      await demoAccountApiFixture.step('Press Ctrl/Cmd+A.', async () => {
        await pathEditorPage.pressSelectAllShortcut();
        await pathEditorPage.checkSelectedNodes(PATH_NODES);
        await pathEditorPage.checkSelectedSegments(PATH_SEGMENTS);
        await expect(
          layersPanelPage.getSelectedLayerCheckboxByName('Path'),
        ).toBeVisible();
        await expect(
          layersPanelPage.getSelectedLayerCheckboxByName('Rectangle'),
        ).toBeHidden();
        await expect(
          layersPanelPage.getSelectedLayerCheckboxByName('Ellipse'),
        ).toBeHidden();
      });

      await demoAccountApiFixture.step('Press Ctrl/Cmd+Shift+A.', async () => {
        await pathEditorPage.clickShortcutCtrlShiftA();
        await pathEditorPage.checkSelectedNodes([]);
        await pathEditorPage.checkSelectedSegments([]);
        await pathEditorPage.isPathEditorOpen();
        await expect(
          layersPanelPage.getSelectedLayerCheckboxByName('Path'),
        ).toBeVisible();
        await expect(
          layersPanelPage.getSelectedLayerCheckboxByName('Rectangle'),
        ).toBeHidden();
        await expect(
          layersPanelPage.getSelectedLayerCheckboxByName('Ellipse'),
        ).toBeHidden();
      });
    },
  );

  demoAccountApiFixture(
    qase([3776], 'Edits are preserved on exit and reverted with one workspace undo'),
    async ({ page }) => {
      const designPanelPage = new DesignPanelPage(page);
      await demoAccountApiFixture.step(
        'Open the path in path editing and make several edits.',
        async () => {
          await pathEditorPage.enterPathEditing();
          const curveMiddle = await pathEditorPage.getSegmentPoint(C, D, 0.5);
          await pathEditorPage.clickAt(curveMiddle);
          await pathEditorPage.dragNode(B, { x: 0, y: -60 });
          await pathEditorPage.checkNodes([
            A,
            { x: 880, y: 222 },
            C,
            D,
            curveMiddle,
          ]);
        },
      );

      await demoAccountApiFixture.step('Exit path editing.', async () => {
        await pathEditorPage.exitPathEditing();
        await pathEditorPage.waitForChangeIsSaved();
        // Moving B 60 up raises the top of the path from 282 to 222.
        await designPanelPage.checkYAxis('222');
        await designPanelPage.checkSizeHeight('545.25');
      });

      await demoAccountApiFixture.step('Press Ctrl/Cmd+Z once.', async () => {
        await pathEditorPage.clickShortcutCtrlZ();
        await designPanelPage.checkYAxis('282');
        await designPanelPage.checkSizeHeight('485.25');
        await pathEditorPage.enterPathEditing();
        await pathEditorPage.checkNodes(PATH_NODES);
      });
    },
  );

  demoAccountApiFixture.describe('In path editing mode', () => {
    demoAccountApiFixture.beforeEach(async () => {
      await pathEditorPage.enterPathEditing();
    });

    demoAccountApiFixture(
      qase([3699], 'Pending line joins an existing node'),
      async () => {
        await demoAccountApiFixture.step('Activate Draw mode', async () => {
          await pathEditorPage.drawNodesButton.click();
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.drawNodesButton,
          );
        });

        await demoAccountApiFixture.step(
          'Click an empty area of the canvas to start a new line.',
          async () => {
            await pathEditorPage.clickAt(EMPTY_POINT);
            await pathEditorPage.hoverAt(POINTER_POINT);
            await pathEditorPage.checkPendingSegment(EMPTY_POINT, POINTER_POINT);
          },
        );

        await demoAccountApiFixture.step(
          'Click a different existing node of the path.',
          async () => {
            await pathEditorPage.clickNode(B);
            await pathEditorPage.checkSegments([...PATH_SEGMENTS, [EMPTY_POINT, B]]);
            // No duplicate node next to B: only the new start node is added.
            await pathEditorPage.checkNodes([...PATH_NODES, EMPTY_POINT]);
          },
        );
      },
    );

    demoAccountApiFixture(
      qase(
        [3700],
        'Pending line joins an existing segment at the exact click point',
      ),
      async () => {
        await demoAccountApiFixture.step('Activate Draw mode', async () => {
          await pathEditorPage.drawNodesButton.click();
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.drawNodesButton,
          );
        });

        await demoAccountApiFixture.step(
          'Click an empty area of the canvas to start a new line.',
          async () => {
            await pathEditorPage.clickAt(EMPTY_POINT);
            await pathEditorPage.hoverAt(POINTER_POINT);
            await pathEditorPage.checkPendingSegment(EMPTY_POINT, POINTER_POINT);
          },
        );

        await demoAccountApiFixture.step(
          'Click on an existing segment.',
          async () => {
            const clickPoint = await pathEditorPage.getSegmentPoint(A, B, 0.3);
            await pathEditorPage.clickAt(clickPoint);
            await pathEditorPage.checkNodes([
              ...PATH_NODES,
              EMPTY_POINT,
              clickPoint,
            ]);
            await pathEditorPage.checkSegments([
              [A, clickPoint],
              [clickPoint, B],
              [B, C],
              [C, D],
              [D, A],
              [EMPTY_POINT, clickPoint],
            ]);
          },
        );
      },
    );

    demoAccountApiFixture(
      qase(
        [3710],
        'Escape cancels only the pending segment when editing an existing path',
      ),
      async () => {
        await demoAccountApiFixture.step('Activate Draw mode', async () => {
          await pathEditorPage.drawNodesButton.click();
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.drawNodesButton,
          );
        });

        await demoAccountApiFixture.step(
          'Click to start a new segment.',
          async () => {
            await pathEditorPage.clickAt(EMPTY_POINT);
            await pathEditorPage.hoverAt(POINTER_POINT);
            await pathEditorPage.checkPendingSegment(EMPTY_POINT, POINTER_POINT);
          },
        );

        await demoAccountApiFixture.step('Press Escape.', async () => {
          await pathEditorPage.clickOnESC();
          await pathEditorPage.checkNoPendingSegment();
          await pathEditorPage.isPathEditorOpen();
          await pathEditorPage.checkNodes(PATH_NODES);
          await pathEditorPage.checkSegments(PATH_SEGMENTS);
        });

        await demoAccountApiFixture.step(
          'Press Escape again with no pending segment.',
          async () => {
            await pathEditorPage.clickOnESC();
            await pathEditorPage.isPathEditorClosed();
          },
        );
      },
    );

    demoAccountApiFixture(
      qase([3724], 'Drag a single selected segment'),
      async () => {
        await demoAccountApiFixture.step(
          'Click a segment to select it.',
          async () => {
            await pathEditorPage.clickSegment(A, B);
            await pathEditorPage.checkSelectedSegments([[A, B]]);
          },
        );

        await demoAccountApiFixture.step(
          'Drag the segment to a new position.',
          async () => {
            const movedA = { x: 375, y: 222 };
            const movedB = { x: 880, y: 222 };
            await pathEditorPage.dragSegment(A, B, { x: 0, y: -60 });
            await pathEditorPage.checkNodes([movedA, movedB, C, D]);
            await pathEditorPage.checkSegments([
              [movedA, movedB],
              [movedB, C],
              [C, D],
              [D, movedA],
            ]);
            await pathEditorPage.checkSegmentIsCurve(movedA, movedB, false);
          },
        );
      },
    );

    demoAccountApiFixture(
      qase([3729], 'Insert a node at the visual middle of a curved segment'),
      async () => {
        const middle = await pathEditorPage.getSegmentPoint(C, D, 0.5);
        const nearMiddle = { x: middle.x + 3, y: middle.y + 3 };

        await demoAccountApiFixture.step(
          'Hover near the visual middle of a curved segment.',
          async () => {
            await pathEditorPage.hoverAt(nearMiddle);
            await pathEditorPage.checkInsertionPreviewAt(middle);
          },
        );

        await demoAccountApiFixture.step('Click.', async () => {
          await pathEditorPage.clickAt(nearMiddle);
          await pathEditorPage.checkNodes([...PATH_NODES, middle]);
          await pathEditorPage.checkSegments([
            [A, B],
            [B, C],
            [C, middle],
            [middle, D],
            [D, A],
          ]);
        });
      },
    );

    demoAccountApiFixture(
      qase([3733], 'Delete a middle segment opens the path without healing'),
      async () => {
        await demoAccountApiFixture.step(
          'Select only a middle segment.',
          async () => {
            await pathEditorPage.clickSegment(B, C);
            await pathEditorPage.checkSelectedSegments([[B, C]]);
            await pathEditorPage.checkSelectedNodes([]);
          },
        );

        await demoAccountApiFixture.step('Press Delete or Backspace.', async () => {
          await pathEditorPage.pressDeleteKeyboardButton();
          await pathEditorPage.checkNodes(PATH_NODES);
        });

        await demoAccountApiFixture.step('Inspect the gap.', async () => {
          await pathEditorPage.checkSegments([
            [A, B],
            [C, D],
            [D, A],
          ]);
        });
      },
    );

    demoAccountApiFixture(
      qase([3743], 'Shift+Delete removes a node and its adjacent segments'),
      async () => {
        await demoAccountApiFixture.step(
          'Select an interior node and press Shift+Delete.',
          async () => {
            await pathEditorPage.clickNode(B);
            await pathEditorPage.checkSelectedNodes([B]);
            await pathEditorPage.clickShortcutShiftDelete();
            await pathEditorPage.checkNodes([A, C, D]);
            await pathEditorPage.checkSegments([
              [C, D],
              [D, A],
            ]);
          },
        );
      },
    );

    demoAccountApiFixture(
      qase([3753], 'Edit a single node coordinate in the right sidebar'),
      async () => {
        await demoAccountApiFixture.step('Select one node.', async () => {
          await pathEditorPage.clickNode(B);
          await pathEditorPage.checkNodePositionFields(B);
        });

        await demoAccountApiFixture.step(
          'Change the X value and press Enter.',
          async () => {
            await pathEditorPage.setNodeX(900);
            await pathEditorPage.checkNodes([A, { x: 900, y: 282 }, C, D]);
          },
        );

        await demoAccountApiFixture.step(
          'Change the Y value and press Enter.',
          async () => {
            await pathEditorPage.setNodeY(300);
            await pathEditorPage.checkNodes([A, { x: 900, y: 300 }, C, D]);
          },
        );
      },
    );

    demoAccountApiFixture(
      qase([3766], 'Copy and paste path fragment within the same path'),
      async () => {
        // Pasted nodes are centred on the pointer: B-C is centred on (880, 462),
        // so pasting at (1100, 300) shifts it by (220, -162).
        const pastePoint = { x: 1100, y: 300 };
        const pastedB = { x: 1100, y: 120 };
        const pastedC = { x: 1100, y: 480 };

        await demoAccountApiFixture.step(
          'Select nodes or segments and press Ctrl/Cmd+C.',
          async () => {
            await pathEditorPage.clickNode(B);
            await pathEditorPage.clickNode(C, ['Shift']);
            await pathEditorPage.checkSelectedNodes([B, C]);
            await pathEditorPage.pressCopyShortcut();
          },
        );

        await demoAccountApiFixture.step(
          'Move the pointer to another area and press Ctrl/Cmd+V.',
          async () => {
            await pathEditorPage.hoverAt(pastePoint);
            await pathEditorPage.pressPasteShortcut();
            await pathEditorPage.checkNodes([...PATH_NODES, pastedB, pastedC]);
            await pathEditorPage.checkSegments([
              ...PATH_SEGMENTS,
              [pastedB, pastedC],
            ]);
          },
        );

        await demoAccountApiFixture.step('Check the selection.', async () => {
          await pathEditorPage.checkSelectedNodes([pastedB, pastedC]);
        });
      },
    );

    demoAccountApiFixture(
      qase([3782], 'Path toolbar shows only applicable actions'),
      async () => {
        const draw = 'Draw nodes (P)';
        const move = 'Move nodes (M)';
        const snap = "Snap nodes (Ctrl+')";
        // Dropdown holding the Equal/Aligned/Independent modes (collapsed).
        const handlerModes = 'Handler behaviour';

        await demoAccountApiFixture.step(
          'Enter path editing with nothing selected.',
          async () => {
            await pathEditorPage.checkToolbarActions([draw, move, snap]);
          },
        );

        await demoAccountApiFixture.step(
          'Select one node, then several nodes, then a segment, then a handler.',
          async () => {
            await pathEditorPage.clickNode(B);
            await pathEditorPage.checkToolbarActions([
              draw,
              move,
              'Separate nodes (K)',
              'To curve (C)',
              snap,
            ]);

            await pathEditorPage.clickNode(C, ['Shift']);
            await pathEditorPage.checkToolbarActions([
              draw,
              move,
              'Merge nodes (Ctrl+J)',
              'Separate nodes (K)',
              'To corner (X)',
              'To curve (C)',
              handlerModes,
              snap,
            ]);

            await pathEditorPage.clickShortcutCtrlShiftA();
            await pathEditorPage.clickSegment(A, B);
            await pathEditorPage.checkToolbarActions([
              draw,
              move,
              'Merge nodes (Ctrl+J)',
              'Separate nodes (K)',
              'To curve (C)',
              snap,
            ]);

            await pathEditorPage.clickShortcutCtrlShiftA();
            await pathEditorPage.clickAt(C_HANDLER);
            await pathEditorPage.checkToolbarActions([
              draw,
              move,
              handlerModes,
              snap,
            ]);
          },
        );

        await demoAccountApiFixture.step(
          'Check for greyed out buttons.',
          async () => {
            await expect(
              pathEditorPage.pathToolbarButtons.and(
                pathEditorPage.page.getByRole('button', { disabled: true }),
              ),
            ).toHaveCount(0);
          },
        );
      },
    );
  });
});

demoAccountFileTest(
  qase([3695], 'Path toolbar appears while drawing a new path'),
  async ({ page }) => {
    const pathEditorPage = new PathEditorPage(page);

    await demoAccountFileTest.step(
      'Select the Path tool and click twice on the canvas to place two nodes.',
      async () => {
        await pathEditorPage.selectPathTool();
        await pathEditorPage.clickViewportByCoordinates(400, 400);
        await pathEditorPage.clickViewportByCoordinates(700, 500);
        await expect.poll(() => pathEditorPage.getNodes()).toHaveLength(2);
        await expect.poll(() => pathEditorPage.getSegments()).toHaveLength(1);
      },
    );

    await demoAccountFileTest.step(
      'Observe the toolbars at the top of the workspace.',
      async () => {
        await expect(pathEditorPage.pathActionsBlock).toBeVisible();
        await expect(pathEditorPage.toolBarWindow).toHaveClass(/toolbar__hidden/);
      },
    );

    await demoAccountFileTest.step(
      'Check the state of the Draw mode and node snapping buttons in the path toolbar.',
      async () => {
        await pathEditorPage.isToolbarButtonToggled(pathEditorPage.drawNodesButton);
        await pathEditorPage.isToolbarButtonToggled(pathEditorPage.snapNodesButton);
      },
    );
  },
);
