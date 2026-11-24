import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import {
  PathEditorPage,
  PathToolbarAction,
} from '@pages/workspace/toolbar/path-editor/path-editor-page';
import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

type EllipseNodes = Record<'top' | 'right' | 'bottom' | 'left', Point>;

/** Nodes of the flattened ellipse, named by their position as in the Qase cases. */
async function getEllipseNodes(): Promise<EllipseNodes> {
  const nodes = await pathEditorPage.overlayComp.getNodes();
  const byX = [...nodes].sort((a, b) => a.x - b.x);
  const byY = [...nodes].sort((a, b) => a.y - b.y);
  return {
    top: byY[0],
    bottom: byY[byY.length - 1],
    left: byX[0],
    right: byX[byX.length - 1],
  };
}

async function selectNodes(first: Point, second?: Point) {
  await pathEditorPage.overlayComp.clickNode(first);
  if (second) {
    await pathEditorPage.overlayComp.clickNode(second, ['Shift']);
  }
}

/** Point in the middle between two nodes, where merging them leaves the new node. */
function middle(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Segments of the flattened ellipse, between its consecutive nodes. */
function ellipseSegments({
  top,
  right,
  bottom,
  left,
}: EllipseNodes): [Point, Point][] {
  return [
    [top, right],
    [right, bottom],
    [bottom, left],
    [left, top],
  ];
}

/** Clicks the Ellipse tool and the viewport, and waits for the "Ellipse" layer. */
async function createEllipse() {
  await pathEditorPage.clickCreateEllipseButton();
  await pathEditorPage.clickViewportTwice();
  await pathEditorPage.waitForChangeIsSaved();
  await layers.checkLayerRowIsVisible('Ellipse');
}

let pathEditorPage: PathEditorPage;
let layers: LayersPanelComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  pathEditorPage = new PathEditorPage(page);
  layers = new WorkspacePage(page).leftSidebar.layers;
});

demoAccountFileTest.describe(() => {
  let nodes: EllipseNodes;

  demoAccountFileTest.beforeEach(async () => {
    await demoAccountFileTest.step(
      'Click on the "Ellipse (E)" tool in the toolbar and click on an empty area of the viewport',
      createEllipse,
    );

    await demoAccountFileTest.step(
      'Right-click on the ellipse in the viewport and click on the "Flatten" option',
      async () => {
        await pathEditorPage.transformToPathViaRightClick();
        await pathEditorPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible('Ellipse');
        await layers.checkLayerIcon('Ellipse', 'path');
      },
    );

    await demoAccountFileTest.step(
      'Right-click on the path in the viewport and click on the "Edit" option',
      async () => {
        await pathEditorPage.openNodesPanelViaRightClick();
        await pathEditorPage.checkPathToolbarVisible();
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelMoveNodesButton,
        );
        await pathEditorPage.overlayComp.checkNodeCount(4);
        nodes = await getEllipseNodes();
      },
    );
  });

  demoAccountFileTest(
    qase([545], 'Delete node (via Del/Backspace shortcut)'),
    async () => {
      const { overlayComp } = pathEditorPage;

      await demoAccountFileTest.step('Click on the top node', async () => {
        await selectNodes(nodes.top);
        await overlayComp.checkSelectedNodes([nodes.top]);
      });

      await demoAccountFileTest.step('Press Delete', async () => {
        await pathEditorPage.pressDeleteKeyboardButton();
        await overlayComp.checkNodeCount(3);
        // Closed: the segments around the top node are kept as one (left to right)
        await overlayComp.checkSegments([
          [nodes.right, nodes.bottom],
          [nodes.bottom, nodes.left],
          [nodes.left, nodes.right],
        ]);
      });

      await demoAccountFileTest.step('Click on the left node', async () => {
        await selectNodes(nodes.left);
        await overlayComp.checkSelectedNodes([nodes.left]);
      });

      await demoAccountFileTest.step('Press Backspace', async () => {
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

  demoAccountFileTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async () => {
      const { overlayComp } = pathEditorPage;
      const topRight = middle(nodes.top, nodes.right);
      const bottomLeft = middle(nodes.bottom, nodes.left);

      await demoAccountFileTest.step(
        'Click on the top node, then Shift+click on the right node',
        async () => {
          await selectNodes(nodes.top, nodes.right);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.right]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Merge nodes (Ctrl+J)" button',
        async () => {
          await pathEditorPage.clickMergeNodesButtonOnNodePanel();
          await overlayComp.checkNodes([topRight, nodes.bottom, nodes.left]);
        },
      );

      await demoAccountFileTest.step(
        'Click on the bottom node, then Shift+click on the left node',
        async () => {
          await selectNodes(nodes.bottom, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.bottom, nodes.left]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await demoAccountFileTest.step('Press Ctrl+J', async () => {
        await pathEditorPage.pressCtrlJKeyboardShortcut();
        await overlayComp.checkNodes([topRight, bottomLeft]);
      });

      await demoAccountFileTest.step(
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
      await demoAccountFileTest.step(
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

      await demoAccountFileTest.step('Press Esc', async () => {
        await pathEditorPage.clickOnESC();
        await pathEditorPage.checkPathToolbarVisible();
        await overlayComp.checkNodeCount(4);
      });

      await demoAccountFileTest.step(
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

      await demoAccountFileTest.step(
        'Click on one end node of the new line, then Shift+click on a node of the initial path',
        async () => {
          await selectNodes(newLineNodes[0], topRight);
          await overlayComp.checkSelectedNodes([newLineNodes[0], topRight]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Merge nodes (Ctrl+J)" button',
        async () => {
          await pathEditorPage.clickMergeNodesButtonOnNodePanel();
          await overlayComp.checkNodes([
            middle(newLineNodes[0], topRight),
            newLineNodes[1],
            bottomLeft,
          ]);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([548], 'Join nodes (via Node panel and J shortcut)'),
    async () => {
      const { overlayComp } = pathEditorPage;
      const original = ellipseSegments(nodes);

      await demoAccountFileTest.step(
        'Click on the top node, then Shift+click on the bottom node',
        async () => {
          await selectNodes(nodes.top, nodes.bottom);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.bottom]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Join nodes (J)" button',
        async () => {
          await pathEditorPage.clickJoinNodesButtonOnNodePanel();
          await overlayComp.checkSegments([...original, [nodes.top, nodes.bottom]]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
            false,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the right node, then Shift+click on the left node',
        async () => {
          await selectNodes(nodes.right, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.right, nodes.left]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await demoAccountFileTest.step('Press J', async () => {
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

  demoAccountFileTest(
    qase([549], 'Separate nodes (via Node panel and K shortcut)'),
    async () => {
      const { overlayComp } = pathEditorPage;

      await demoAccountFileTest.step(
        'Click on the top node, then Shift+click on the right node',
        async () => {
          await selectNodes(nodes.top, nodes.right);
          await overlayComp.checkSelectedNodes([nodes.top, nodes.right]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.SeparateNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Separate nodes (K)" button',
        async () => {
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
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the bottom node, then Shift+click on the left node',
        async () => {
          await selectNodes(nodes.bottom, nodes.left);
          await overlayComp.checkSelectedNodes([nodes.bottom, nodes.left]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.SeparateNodes,
          );
        },
      );

      await demoAccountFileTest.step('Press K', async () => {
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

  demoAccountFileTest(
    qase([550], 'To corner (via Node panel and X shortcut) - single node'),
    async () => {
      const { overlayComp } = pathEditorPage;

      await demoAccountFileTest.step('Click on the top node', async () => {
        await selectNodes(nodes.top);
        await overlayComp.checkSelectedNodes([nodes.top]);
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
      });

      await demoAccountFileTest.step(
        'Click on the "To corner (X)" button',
        async () => {
          await pathEditorPage.clickToCornerButtonOnNodePanel();
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.ToCorner,
            false,
          );
          await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
        },
      );

      await demoAccountFileTest.step('Click on the right node', async () => {
        await selectNodes(nodes.right);
        await overlayComp.checkSelectedNodes([nodes.right]);
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
      });

      await demoAccountFileTest.step('Press X', async () => {
        await pathEditorPage.pressKeyboardShortcut('X');
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.ToCorner,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
      });
    },
  );
});

demoAccountFileTest(
  qase([543], 'Draw/Move nodes (via M and P shorcuts)'),
  async () => {
    const { overlayComp } = pathEditorPage;
    let nodes: EllipseNodes;
    let newNodes: Point[];
    let expectedNodes: Point[];

    await demoAccountFileTest.step('Create an ellipse', createEllipse);

    await demoAccountFileTest.step('Right-click created ellipse', async () => {
      await pathEditorPage.createdLayer.click({ button: 'right', force: true });
      await pathEditorPage.transformToPathMenuItem.waitFor({ state: 'visible' });
    });

    await demoAccountFileTest.step('Select "Flatten"', async () => {
      await pathEditorPage.transformToPathMenuItem.click();
      await pathEditorPage.waitForChangeIsSaved();
      await layers.checkLayerIcon('Ellipse', 'path');
    });

    await demoAccountFileTest.step('Right-click', async () => {
      await pathEditorPage.createdLayer.click({ button: 'right', force: true });
      await pathEditorPage.editPathMenuItem.waitFor({ state: 'visible' });
    });

    await demoAccountFileTest.step('Select "Edit" option', async () => {
      await pathEditorPage.editPathMenuItem.click();
      await pathEditorPage.checkPathToolbarVisible();
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
      );
      await overlayComp.checkNodeCount(4);
      nodes = await getEllipseNodes();
      newNodes = [
        { x: nodes.right.x + 100, y: nodes.top.y },
        { x: nodes.right.x + 200, y: nodes.top.y },
      ];
    });

    await demoAccountFileTest.step('Press P on keyboard', async () => {
      await pathEditorPage.pressKeyboardShortcut('P');
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelDrawNodesButton,
      );
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
        false,
      );
    });

    await demoAccountFileTest.step(
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

    await demoAccountFileTest.step('Press M on keyboard', async () => {
      await pathEditorPage.pressKeyboardShortcut('M');
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelMoveNodesButton,
      );
      await pathEditorPage.isToolbarButtonToggled(
        pathEditorPage.nodePanelDrawNodesButton,
        false,
      );
    });

    await demoAccountFileTest.step('Click and drag one of the nodes', async () => {
      expectedNodes = await overlayComp.moveNode(nodes.top, { x: 0, y: -40 });
    });

    await demoAccountFileTest.step(
      'click on an empty area of the canvas',
      async () => {
        await overlayComp.clickAt({
          x: nodes.left.x - 150,
          y: nodes.bottom.y + 150,
        });
        await overlayComp.checkNodes(expectedNodes);
      },
    );
  },
);

demoAccountFileTest(
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async () => {
    const { overlayComp } = pathEditorPage;
    let first: Point;
    let second: Point;
    let third: Point;

    await demoAccountFileTest.step(
      'Click on the "Path (P)" tool in the toolbar at the top of the viewport',
      async () => {
        await pathEditorPage.clickCreatePathButton();
        await pathEditorPage.checkPathToolActive();
      },
    );

    await demoAccountFileTest.step(
      'Click on an empty area of the viewport',
      async () => {
        await pathEditorPage.clickViewportByCoordinates(500, 200);
        await pathEditorPage.checkPathToolbarVisible();
        await overlayComp.checkNodeCount(1);
      },
    );

    await demoAccountFileTest.step(
      'Click on another area of the viewport',
      async () => {
        await pathEditorPage.clickViewportByCoordinates(1200, 700);
        await overlayComp.checkNodeCount(2);
        // The nodes were clicked from left to right: 500, 1200, then 1000
        [first, second] = [...(await overlayComp.getNodes())].sort(
          (a, b) => a.x - b.x,
        );
        await overlayComp.checkSegmentIsCurve(first, second, false);
      },
    );

    await demoAccountFileTest.step(
      'Click on a third area of the viewport',
      async () => {
        await pathEditorPage.clickViewportByCoordinates(1000, 400);
        await overlayComp.checkNodeCount(3);
        // Left to right they are the first, the third and the second node
        [first, third, second] = [...(await overlayComp.getNodes())].sort(
          (a, b) => a.x - b.x,
        );
        await overlayComp.checkSegmentIsCurve(second, third, false);
      },
    );

    await demoAccountFileTest.step('Click on the starting node', async () => {
      await pathEditorPage.clickViewportByCoordinates(500, 200);
      await pathEditorPage.checkPathToolbarVisible();
      await overlayComp.checkNodeCount(3);
      await overlayComp.checkSegments([
        [first, second],
        [second, third],
        [third, first],
      ]);
    });

    await demoAccountFileTest.step(
      'Click on the "Move nodes (M)" button in the path toolbar',
      async () => {
        await pathEditorPage.clickMoveNodesButtonOnNodePanel();
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelMoveNodesButton,
        );
      },
    );

    await demoAccountFileTest.step(
      'Click on the second node of the path',
      async () => {
        await overlayComp.clickNode(second);
        await overlayComp.checkSelectedNodes([second]);
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
      },
    );

    await demoAccountFileTest.step(
      'Click on the "To curve (C)" button',
      async () => {
        await pathEditorPage.clickToCurveButtonOnNodePanel();
        await pathEditorPage.checkToolbarButtonVisible(
          PathToolbarAction.ToCurve,
          false,
        );
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCorner);
        await pathEditorPage.checkHandlerBehaviourVisible();
      },
    );

    await demoAccountFileTest.step(
      'Click on the third node of the path',
      async () => {
        await overlayComp.clickNode(third);
        await overlayComp.checkSelectedNodes([third]);
        await pathEditorPage.checkToolbarButtonVisible(PathToolbarAction.ToCurve);
      },
    );

    await demoAccountFileTest.step('Press C', async () => {
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
