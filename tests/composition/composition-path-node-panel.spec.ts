import {
  PathEditorPage,
  PathToolbarAction,
} from '@pages/workspace/toolbar/path-editor/path-editor-page';
import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

/** Nodes of the flattened ellipse, named by their position as in the Qase cases. */
async function getEllipseNodes() {
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

let pathEditorPage: PathEditorPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  pathEditorPage = new PathEditorPage(page);
});

demoAccountFileTest.describe(() => {
  let nodes: Record<'top' | 'right' | 'bottom' | 'left', Point>;

  demoAccountFileTest.beforeEach(async () => {
    await pathEditorPage.clickCreateEllipseButton();
    await pathEditorPage.clickViewportTwice();
    await pathEditorPage.waitForChangeIsSaved();
    await pathEditorPage.transformToPathViaRightClick();
    await pathEditorPage.waitForChangeIsSaved();
    await pathEditorPage.layersPanelPage.isLayerNameDisplayed('Ellipse');
    await pathEditorPage.openNodesPanelViaRightClick();
    await pathEditorPage.checkPathToolbarVisible();
    await pathEditorPage.isToolbarButtonToggled(
      pathEditorPage.nodePanelMoveNodesButton,
    );
    await pathEditorPage.overlayComp.checkNodeCount(4);
    nodes = await getEllipseNodes();
  });

  demoAccountFileTest(
    qase([545], 'Delete node (via Del/Backspace shortcut)'),
    async () => {
      await demoAccountFileTest.step('Click on the top node', async () => {
        await selectNodes(nodes.top);
      });

      await demoAccountFileTest.step('Press Delete', async () => {
        await pathEditorPage.pressDeleteKeyboardButton();
        await pathEditorPage.overlayComp.checkNodeCount(3);
      });

      await demoAccountFileTest.step('Click on the left node', async () => {
        await selectNodes(nodes.left);
      });

      await demoAccountFileTest.step('Press Backspace', async () => {
        await pathEditorPage.pressBackspaceKeyboardButton();
        await pathEditorPage.overlayComp.checkNodeCount(2);
      });
    },
  );

  demoAccountFileTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async () => {
      await demoAccountFileTest.step(
        'Click on the top node, then Shift+click on the right node',
        async () => {
          await selectNodes(nodes.top, nodes.right);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Merge nodes (Ctrl+J)" button',
        async () => {
          await pathEditorPage.clickMergeNodesButtonOnNodePanel();
          await pathEditorPage.overlayComp.checkNodeCount(3);
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
        'Click on the bottom node, then Shift+click on the left node',
        async () => {
          await selectNodes(nodes.bottom, nodes.left);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await demoAccountFileTest.step('Press Ctrl+J', async () => {
        await pathEditorPage.pressCtrlJKeyboardShortcut();
        await pathEditorPage.overlayComp.checkNodeCount(2);
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelMoveNodesButton,
        );
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelDrawNodesButton,
          false,
        );
      });

      let pathNodes: Point[];
      let newLineNodes: Point[];
      await demoAccountFileTest.step(
        'Click on the "Draw nodes (P)" button',
        async () => {
          pathNodes = await pathEditorPage.overlayComp.getNodes();
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

      await demoAccountFileTest.step(
        'Click twice on an empty area of the viewport, away from the path',
        async () => {
          await pathEditorPage.clickViewportByCoordinates(200, 200);
          await pathEditorPage.clickViewportByCoordinates(300, 350);
        },
      );

      await demoAccountFileTest.step('Press Esc', async () => {
        await pathEditorPage.clickOnESC();
        await pathEditorPage.checkPathToolbarVisible();
        await pathEditorPage.overlayComp.checkNodeCount(4);
        newLineNodes = (await pathEditorPage.overlayComp.getNodes()).filter(
          (node) => !pathNodes.some((p) => p.x === node.x && p.y === node.y),
        );
      });

      await demoAccountFileTest.step(
        'Click on the "Move nodes (M)" button',
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
          await selectNodes(newLineNodes[0], pathNodes[0]);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.MergeNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Merge nodes (Ctrl+J)" button',
        async () => {
          await pathEditorPage.clickMergeNodesButtonOnNodePanel();
          await pathEditorPage.overlayComp.checkNodeCount(3);
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.nodePanelMoveNodesButton,
          );
          await pathEditorPage.isToolbarButtonToggled(
            pathEditorPage.nodePanelDrawNodesButton,
            false,
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([548], 'Join nodes (via Node panel and J shortcut)'),
    async () => {
      await demoAccountFileTest.step(
        'Click on the top node, then Shift+click on the bottom node',
        async () => {
          await selectNodes(nodes.top, nodes.bottom);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Join nodes (J)" button',
        async () => {
          await pathEditorPage.clickJoinNodesButtonOnNodePanel();
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
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.JoinNodes,
          );
        },
      );

      await demoAccountFileTest.step('Press J', async () => {
        await pathEditorPage.pressKeyboardShortcut('J');
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
      await demoAccountFileTest.step(
        'Click on the top node, then Shift+click on the right node',
        async () => {
          await selectNodes(nodes.top, nodes.right);
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.SeparateNodes,
          );
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Separate nodes (K)" button',
        async () => {
          await pathEditorPage.clickSeparateNodesButtonOnNodePanel();
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
          await pathEditorPage.checkToolbarButtonVisible(
            PathToolbarAction.SeparateNodes,
          );
        },
      );

      await demoAccountFileTest.step('Press K', async () => {
        await pathEditorPage.pressKeyboardShortcut('K');
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
      await demoAccountFileTest.step('Click on the top node', async () => {
        await selectNodes(nodes.top);
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
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async () => {
    let triangleNodes: Point[];

    await demoAccountFileTest.step('Click on the "Path (P)" tool', async () => {
      await pathEditorPage.clickCreatePathButton();
      await pathEditorPage.checkPathToolActive();
    });

    await demoAccountFileTest.step(
      'Click on an empty area of the viewport',
      async () => {
        await pathEditorPage.clickViewportByCoordinates(500, 200);
        await pathEditorPage.checkPathToolbarVisible();
      },
    );

    await demoAccountFileTest.step(
      'Click on another area of the viewport',
      async () => {
        await pathEditorPage.clickViewportByCoordinates(1200, 700);
      },
    );

    await demoAccountFileTest.step(
      'Click on a third area of the viewport',
      async () => {
        await pathEditorPage.clickViewportByCoordinates(1000, 400);
      },
    );

    await demoAccountFileTest.step('Click on the starting node', async () => {
      await pathEditorPage.clickViewportByCoordinates(500, 200);
      await pathEditorPage.checkPathToolbarVisible();
    });

    await demoAccountFileTest.step(
      'Click on the "Move nodes (M)" button',
      async () => {
        await pathEditorPage.clickMoveNodesButtonOnNodePanel();
        await pathEditorPage.isToolbarButtonToggled(
          pathEditorPage.nodePanelMoveNodesButton,
        );
        await pathEditorPage.overlayComp.checkNodeCount(3);
        triangleNodes = await pathEditorPage.overlayComp.getNodes();
      },
    );

    await demoAccountFileTest.step(
      'Click on the second node of the path',
      async () => {
        await pathEditorPage.overlayComp.clickNode(triangleNodes[1]);
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
        await pathEditorPage.overlayComp.clickNode(triangleNodes[2]);
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
