import { PathToolbarAction } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import {
  closedPathSegments,
  midpoint,
  type NodesBySide,
  type Point,
} from '@pages/workspace/toolbar/path-editor/path-geometry';
import { pathTest } from '@tests/composition/path/path-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

pathTest.describe(() => {
  let nodes: NodesBySide;

  pathTest.beforeEach(async ({ pathEditorPage, layers }) => {
    const { overlayComp } = pathEditorPage;

    await pathTest.step(
      'Click on the "Ellipse (E)" tool in the toolbar and click on an empty area of the viewport',
      async () => {
        await pathEditorPage.createEllipse();
        await layers.checkLayerRowIsVisible('Ellipse');
      },
    );

    await pathTest.step(
      'Right-click on the ellipse in the viewport and click on the "Flatten" option',
      async () => {
        await pathEditorPage.transformToPathViaRightClick();
        await pathEditorPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible('Ellipse');
        await layers.checkLayerIconIsVisible('Ellipse', 'path');
      },
    );

    await pathTest.step(
      'Right-click on the path in the viewport and click on the "Edit" option',
      async () => {
        await pathEditorPage.openNodesPanelViaRightClick();
        await pathEditorPage.checkPathToolbarVisible();
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelMoveNodesButton,
        );
        await overlayComp.checkNodeCount(4);
        nodes = await overlayComp.getNodesBySide();
      },
    );
  });

  pathTest(
    qase([545], 'Delete node (via Del/Backspace shortcut)'),
    async ({ pathEditorPage }) => {
      const { overlayComp } = pathEditorPage;

      await pathTest.step('Click on the top node', async () => {
        await overlayComp.selectNodes(nodes.top);
        await overlayComp.checkSelectedNodes([nodes.top]);
      });

      await pathTest.step('Press Delete', async () => {
        await pathEditorPage.pressDeleteKeyboardButton();
        await overlayComp.checkNodeCount(3);
        // Closed: the segments around the top node are kept as one (left to right)
        await overlayComp.checkSegments([
          [nodes.right, nodes.bottom],
          [nodes.bottom, nodes.left],
          [nodes.left, nodes.right],
        ]);
      });

      await pathTest.step('Click on the left node', async () => {
        await overlayComp.selectNodes(nodes.left);
        await overlayComp.checkSelectedNodes([nodes.left]);
      });

      await pathTest.step('Press Backspace', async () => {
        await pathEditorPage.pressBackspaceKeyboardButton();
        await overlayComp.checkNodeCount(2);
        // Closed: two segments join the 2 nodes that are left
        await overlayComp.checkSegments([
          [nodes.right, nodes.bottom],
          [nodes.bottom, nodes.right],
        ]);
      });
    },
  );

  pathTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async ({ pathEditorPage }) => {
      const { overlayComp } = pathEditorPage;
      const topRight = midpoint(nodes.top, nodes.right);
      const bottomLeft = midpoint(nodes.bottom, nodes.left);

      await pathTest.step(
        'Click on the top node, then Shift+click on the right node',
        async () => {
          await overlayComp.selectNodes(nodes.top, nodes.right);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.right]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await pathTest.step('Click on the "Merge nodes (Ctrl+J)" button', async () => {
        await pathEditorPage.clickMergeNodesButtonOnNodePanel();
        await overlayComp.checkNodes([topRight, nodes.bottom, nodes.left]);
      });

      await pathTest.step(
        'Click on the bottom node, then Shift+click on the left node',
        async () => {
          await overlayComp.selectNodes(nodes.bottom, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.bottom, nodes.left]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await pathTest.step('Press Ctrl+J', async () => {
        await pathEditorPage.pressCtrlJKeyboardShortcut();
        await overlayComp.checkNodes([topRight, bottomLeft]);
      });

      await pathTest.step(
        'Click on the "Draw nodes (P)" button in the path toolbar',
        async () => {
          await pathEditorPage.clickDrawNodesButtonOnNodePanel();
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.nodePanelDrawNodesButton,
          );
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.nodePanelMoveNodesButton,
            false,
          );
        },
      );

      let newLineNodes: Point[];
      await pathTest.step(
        'Click twice on an empty area of the viewport, away from the path',
        async () => {
          await pathEditorPage.clickViewportByCoordinates(200, 200);
          await pathEditorPage.clickViewportByCoordinates(300, 350);
          await overlayComp.checkNodeCount(4);
          newLineNodes = (await overlayComp.getNodes()).filter(
            (node) =>
              ![topRight, bottomLeft].some(
                (p) => Math.abs(p.x - node.x) < 0.5 && Math.abs(p.y - node.y) < 0.5,
              ),
          );
          await overlayComp.checkSegmentIsCurve(
            newLineNodes[0],
            newLineNodes[1],
            false,
          );
        },
      );

      await pathTest.step('Press Esc', async () => {
        await pathEditorPage.clickOnESC();
        await pathEditorPage.checkPathToolbarVisible();
        await overlayComp.checkNodeCount(4);
      });

      await pathTest.step(
        'Click on the "Move nodes (M)" button in the path toolbar',
        async () => {
          await pathEditorPage.clickMoveNodesButtonOnNodePanel();
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.nodePanelMoveNodesButton,
          );
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.nodePanelDrawNodesButton,
            false,
          );
        },
      );

      await pathTest.step(
        'Click on one end node of the new line, then Shift+click on a node of the initial path',
        async () => {
          await overlayComp.selectNodes(newLineNodes[0], topRight);
          await overlayComp.checkSelectedNodes([newLineNodes[0], topRight]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await pathTest.step('Click on the "Merge nodes (Ctrl+J)" button', async () => {
        await pathEditorPage.clickMergeNodesButtonOnNodePanel();
        await overlayComp.checkNodes([
          midpoint(newLineNodes[0], topRight),
          newLineNodes[1],
          bottomLeft,
        ]);
      });
    },
  );

  pathTest(
    qase([548], 'Join nodes (via Node panel and J shortcut)'),
    async ({ pathEditorPage }) => {
      const { overlayComp } = pathEditorPage;
      const original = closedPathSegments([
        nodes.top,
        nodes.right,
        nodes.bottom,
        nodes.left,
      ]);

      await pathTest.step(
        'Click on the top node, then Shift+click on the bottom node',
        async () => {
          await overlayComp.selectNodes(nodes.top, nodes.bottom);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.bottom]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await pathTest.step('Click on the "Join nodes (J)" button', async () => {
        await pathEditorPage.clickJoinNodesButtonOnNodePanel();
        await overlayComp.checkSegments([...original, [nodes.top, nodes.bottom]]);
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.JoinNodes,
          false,
        );
      });

      await pathTest.step(
        'Click on the right node, then Shift+click on the left node',
        async () => {
          await overlayComp.selectNodes(nodes.right, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.right, nodes.left]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await pathTest.step('Press J', async () => {
        await pathEditorPage.pressKeyboardShortcut('J');
        await overlayComp.checkSegments([
          ...original,
          [nodes.top, nodes.bottom],
          [nodes.right, nodes.left],
        ]);
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.JoinNodes,
          false,
        );
      });
    },
  );

  pathTest(
    qase([549], 'Separate nodes (via Node panel and K shortcut)'),
    async ({ pathEditorPage }) => {
      const { overlayComp } = pathEditorPage;

      await pathTest.step(
        'Click on the top node, then Shift+click on the right node',
        async () => {
          await overlayComp.selectNodes(nodes.top, nodes.right);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.right]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.SeparateNodes,
          );
        },
      );

      await pathTest.step('Click on the "Separate nodes (K)" button', async () => {
        await pathEditorPage.clickSeparateNodesButtonOnNodePanel();
        await overlayComp.checkSegments([
          [nodes.right, nodes.bottom],
          [nodes.bottom, nodes.left],
          [nodes.left, nodes.top],
        ]);
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.SeparateNodes,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.JoinNodes);
      });

      await pathTest.step(
        'Click on the bottom node, then Shift+click on the left node',
        async () => {
          await overlayComp.selectNodes(nodes.bottom, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.bottom, nodes.left]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.SeparateNodes,
          );
        },
      );

      await pathTest.step('Press K', async () => {
        await pathEditorPage.pressKeyboardShortcut('K');
        await overlayComp.checkSegments([
          [nodes.right, nodes.bottom],
          [nodes.left, nodes.top],
        ]);
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.SeparateNodes,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.JoinNodes);
      });
    },
  );

  pathTest(
    qase([550], 'To corner (via Node panel and X shortcut) - single node'),
    async ({ pathEditorPage }) => {
      const { overlayComp } = pathEditorPage;

      await pathTest.step('Click on the top node', async () => {
        await overlayComp.selectNodes(nodes.top);
        await overlayComp.checkSelectedNodes([nodes.top]);
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
      });

      await pathTest.step('Click on the "To corner (X)" button', async () => {
        await pathEditorPage.clickToCornerButtonOnNodePanel();
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.ToCorner,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
      });

      await pathTest.step('Click on the right node', async () => {
        await overlayComp.selectNodes(nodes.right);
        await overlayComp.checkSelectedNodes([nodes.right]);
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
      });

      await pathTest.step('Press X', async () => {
        await pathEditorPage.pressKeyboardShortcut('X');
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.ToCorner,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
      });
    },
  );

  pathTest(
    qase([546], 'Delete multiple nodes (Del/Backspace shortcut)'),
    async ({ pathEditorPage, layers }) => {
      const { overlayComp } = pathEditorPage;

      await pathTest.step('Select 2 nodes (SHIFT + click)', async () => {
        await overlayComp.selectNodes(nodes.top, nodes.right);
        await overlayComp.checkSelectedNodes([nodes.top, nodes.right]);
      });

      await pathTest.step('Press Del on keyboard', async () => {
        await pathEditorPage.pressDeleteKeyboardButton();
        await overlayComp.checkNodes([nodes.bottom, nodes.left]);
        // Closed: the segments around the removed nodes are kept as one
        await overlayComp.checkSegments([
          [nodes.bottom, nodes.left],
          [nodes.left, nodes.bottom],
        ]);
      });

      await pathTest.step(
        'Select 2 other (remaining) nodes (SHIFT + click)',
        async () => {
          await overlayComp.selectNodes(nodes.bottom, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.bottom, nodes.left]);
        },
      );

      await pathTest.step('Press Backspace on keyboard', async () => {
        await pathEditorPage.pressBackspaceKeyboardButton();
        await pathEditorPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible('Ellipse', false);
      });
    },
  );

  pathTest(
    qase(
      [553],
      '"To corner" and "To curve" (via Node panel and X/C shortcuts) - multiple nodes',
    ),
    async ({ pathEditorPage }) => {
      const { overlayComp } = pathEditorPage;

      /** Checks the toolbar and the segment between the 2 nodes after "To corner". */
      async function checkNodesAreCorners() {
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.ToCorner,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
        await overlayComp.checkSegmentIsCurve(nodes.top, nodes.right, false);
      }

      /** Checks the toolbar and the segment between the 2 nodes after "To curve". */
      async function checkNodesAreCurves() {
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.ToCurve,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
        await overlayComp.checkSegmentIsCurve(nodes.top, nodes.right, true);
      }

      await pathTest.step(
        'Select 2 neighboring (joined) nodes (SHIFT + click)',
        async () => {
          await overlayComp.selectNodes(nodes.top, nodes.right);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.right]);
          await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
        },
      );

      await pathTest.step('Click "To corner" icon', async () => {
        await pathEditorPage.clickToCornerButtonOnNodePanel();
        await checkNodesAreCorners();
      });

      await pathTest.step('Click "To curve" icon', async () => {
        await pathEditorPage.clickToCurveButtonOnNodePanel();
        await checkNodesAreCurves();
      });

      await pathTest.step('Press X (to corner) on keyboard', async () => {
        await pathEditorPage.pressKeyboardShortcut('X');
        await checkNodesAreCorners();
      });

      await pathTest.step('Press C (to curve) on keyboard', async () => {
        await pathEditorPage.pressKeyboardShortcut('C');
        await checkNodesAreCurves();
      });
    },
  );
});

pathTest(
  qase([538], 'Edit Rectangle - move nodes'),
  async ({ workspacePage, pathEditorPage, layers }) => {
    const { overlayComp } = pathEditorPage;
    const { contextMenu } = workspacePage;
    let topLeft: Point;

    await pathTest.step('Create a rectangle', async () => {
      await pathEditorPage.clickCreateRectangleButton();
      await pathEditorPage.clickViewportTwice();
      await pathEditorPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Rectangle');
    });

    await pathTest.step('Right-click', async () => {
      await layers.openLayerContextMenu('Rectangle');
      await contextMenu.checkItemsAreVisible(['Edit']);
    });

    await pathTest.step('Select "Edit" option', async () => {
      await contextMenu.clickItem('Edit');
      await pathEditorPage.checkPathToolbarVisible();
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
      );
      await overlayComp.checkNodeCount(4);
      topLeft = await overlayComp.getTopLeftNode();
    });

    await pathTest.step('Click and drag one of the nodes', async () => {
      await overlayComp.moveNode(topLeft, { x: -40, y: -40 });
      await pathEditorPage.waitForChangeIsSaved();
      await pathEditorPage.clickOnESC();
      await layers.checkLayerIconIsVisible('Rectangle', 'path');
    });
  },
);

pathTest(
  qase([543], 'Draw/Move nodes (via M and P shorcuts)'),
  async ({ workspacePage, pathEditorPage, layers }) => {
    const { overlayComp } = pathEditorPage;
    const { contextMenu } = workspacePage;
    let nodes: NodesBySide;
    let newNodes: Point[];
    let expectedNodes: Point[];

    await pathTest.step('Create an ellipse', async () => {
      await pathEditorPage.createEllipse();
      await layers.checkLayerRowIsVisible('Ellipse');
    });

    await pathTest.step('Right-click created ellipse', async () => {
      await layers.openLayerContextMenu('Ellipse');
      await contextMenu.checkItemsAreVisible(['Flatten']);
    });

    await pathTest.step('Select "Flatten"', async () => {
      await contextMenu.clickItem('Flatten');
      await pathEditorPage.waitForChangeIsSaved();
      await layers.checkLayerIconIsVisible('Ellipse', 'path');
    });

    await pathTest.step('Right-click', async () => {
      await layers.openLayerContextMenu('Ellipse');
      await contextMenu.checkItemsAreVisible(['Edit']);
    });

    await pathTest.step('Select "Edit" option', async () => {
      await contextMenu.clickItem('Edit');
      await pathEditorPage.checkPathToolbarVisible();
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
      );
      await overlayComp.checkNodeCount(4);
      nodes = await overlayComp.getNodesBySide();
      newNodes = [
        { x: nodes.right.x + 100, y: nodes.top.y },
        { x: nodes.right.x + 200, y: nodes.top.y },
      ];
    });

    await pathTest.step('Press P on keyboard', async () => {
      await pathEditorPage.pressKeyboardShortcut('P');
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelDrawNodesButton,
      );
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
        false,
      );
    });

    await pathTest.step(
      'Click on the canvas 2 times in the different points',
      async () => {
        for (const node of newNodes) {
          await overlayComp.clickAt(node);
        }
        await overlayComp.checkNodeCount(6);
        // Fails if there's no segment between them, not only if it's curved
        await overlayComp.checkSegmentIsCurve(newNodes[0], newNodes[1], false);
      },
    );

    await pathTest.step('Press M on keyboard', async () => {
      await pathEditorPage.pressKeyboardShortcut('M');
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
      );
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelDrawNodesButton,
        false,
      );
    });

    await pathTest.step('Click and drag one of the nodes', async () => {
      expectedNodes = await overlayComp.moveNode(nodes.top, { x: 0, y: -40 });
    });

    await pathTest.step('Click on an empty area of the canvas', async () => {
      await overlayComp.clickAt({
        x: nodes.left.x - 150,
        y: nodes.bottom.y + 150,
      });
      await overlayComp.checkNodes(expectedNodes);
    });
  },
);

pathTest(
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async ({ pathEditorPage }) => {
    const { overlayComp } = pathEditorPage;
    let first: Point;
    let second: Point;
    let third: Point;

    await pathTest.step(
      'Click on the "Path (P)" tool in the toolbar at the top of the viewport',
      async () => {
        await pathEditorPage.clickCreatePathButton();
        await pathEditorPage.checkPathToolActive();
      },
    );

    await pathTest.step('Click on an empty area of the viewport', async () => {
      await pathEditorPage.clickViewportByCoordinates(500, 200);
      await pathEditorPage.checkPathToolbarVisible();
      await overlayComp.checkNodeCount(1);
    });

    await pathTest.step('Click on another area of the viewport', async () => {
      await pathEditorPage.clickViewportByCoordinates(1200, 700);
      await overlayComp.checkNodeCount(2);
      // The nodes were clicked from left to right: 500, 1200, then 1000
      [first, second] = [...(await overlayComp.getNodes())].sort(
        (a, b) => a.x - b.x,
      );
      await overlayComp.checkSegmentIsCurve(first, second, false);
    });

    await pathTest.step('Click on a third area of the viewport', async () => {
      await pathEditorPage.clickViewportByCoordinates(1000, 400);
      await overlayComp.checkNodeCount(3);
      // Left to right they are the first, the third and the second node
      [first, third, second] = [...(await overlayComp.getNodes())].sort(
        (a, b) => a.x - b.x,
      );
      await overlayComp.checkSegmentIsCurve(second, third, false);
    });

    await pathTest.step('Click on the starting node', async () => {
      await pathEditorPage.clickViewportByCoordinates(500, 200);
      await pathEditorPage.checkPathToolbarVisible();
      await overlayComp.checkNodeCount(3);
      await overlayComp.checkSegments([
        [first, second],
        [second, third],
        [third, first],
      ]);
    });

    await pathTest.step(
      'Click on the "Move nodes (M)" button in the path toolbar',
      async () => {
        await pathEditorPage.clickMoveNodesButtonOnNodePanel();
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelMoveNodesButton,
        );
      },
    );

    await pathTest.step('Click on the second node of the path', async () => {
      await overlayComp.clickNode(second);
      await overlayComp.checkSelectedNodes([second]);
      await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
    });

    await pathTest.step('Click on the "To curve (C)" button', async () => {
      await pathEditorPage.clickToCurveButtonOnNodePanel();
      await pathEditorPage.checkToolbarButtonVisible(
        PathToolbarAction.ToCurve,
        false,
      );
      await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
      await pathEditorPage.checkHandlerBehaviourVisible();
    });

    await pathTest.step('Click on the third node of the path', async () => {
      await overlayComp.clickNode(third);
      await overlayComp.checkSelectedNodes([third]);
      await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
    });

    await pathTest.step('Press C', async () => {
      await pathEditorPage.pressKeyboardShortcut('C');
      await pathEditorPage.checkToolbarButtonVisible(
        PathToolbarAction.ToCurve,
        false,
      );
      await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
      await pathEditorPage.checkHandlerBehaviourVisible();
    });
  },
);
