import { PathEditorPage } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';
import { expect } from '@playwright/test';
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
    await pathEditorPage.openNodesPanelViaRightClick();
    await pathEditorPage.overlayComp.checkNodeCount(4);
    nodes = await getEllipseNodes();
  });

  demoAccountFileTest(
    qase([545], 'Delete node (via Del/Backspace shortcut)'),
    async () => {
      await demoAccountFileTest.step('Delete the top node with Delete', async () => {
        await selectNodes(nodes.top);
        await pathEditorPage.pressDeleteKeyboardButton();
        await pathEditorPage.overlayComp.checkNodeCount(3);
      });

      await demoAccountFileTest.step(
        'Delete the left node with Backspace',
        async () => {
          await selectNodes(nodes.left);
          await pathEditorPage.pressBackspaceKeyboardButton();
          await pathEditorPage.overlayComp.checkNodeCount(2);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async () => {
      await demoAccountFileTest.step(
        'Merge the top and right nodes via the node panel',
        async () => {
          await selectNodes(nodes.top, nodes.right);
          await expect(
            pathEditorPage.nodePanelMergeNodesButton,
            'Merge nodes button should appear for 2 selected nodes',
          ).toBeVisible();
          await pathEditorPage.clickMergeNodesButtonOnNodePanel();
          await pathEditorPage.overlayComp.checkNodeCount(3);
        },
      );

      await demoAccountFileTest.step(
        'Merge the bottom and left nodes with Ctrl+J',
        async () => {
          await selectNodes(nodes.bottom, nodes.left);
          await expect(
            pathEditorPage.nodePanelMergeNodesButton,
            'Merge nodes button should appear for 2 selected nodes',
          ).toBeVisible();
          await pathEditorPage.pressCtrlJKeyboardShortcut();
          await pathEditorPage.overlayComp.checkNodeCount(2);
        },
      );

      let pathNodes: Point[];
      let newLineNodes: Point[];
      await demoAccountFileTest.step(
        'Draw a separate line in Draw nodes mode',
        async () => {
          pathNodes = await pathEditorPage.overlayComp.getNodes();
          await pathEditorPage.clickDrawNodesButtonOnNodePanel();
          await pathEditorPage.clickViewportByCoordinates(200, 200);
          await pathEditorPage.clickViewportByCoordinates(300, 350);
          await pathEditorPage.clickOnESC();
          await expect(
            pathEditorPage.pathActionsBlock,
            'Path editor should stay open after Esc',
          ).toBeVisible();
          await pathEditorPage.overlayComp.checkNodeCount(4);
          newLineNodes = (await pathEditorPage.overlayComp.getNodes()).filter(
            (node) => !pathNodes.some((p) => p.x === node.x && p.y === node.y),
          );
        },
      );

      await demoAccountFileTest.step(
        'Merge a node of the new line with a node of the initial path',
        async () => {
          await pathEditorPage.clickMoveNodesButtonOnNodePanel();
          await selectNodes(newLineNodes[0], pathNodes[0]);
          await expect(
            pathEditorPage.nodePanelMergeNodesButton,
            'Merge nodes button should appear for nodes of 2 subpaths',
          ).toBeVisible();
          await pathEditorPage.clickMergeNodesButtonOnNodePanel();
          await pathEditorPage.overlayComp.checkNodeCount(3);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([548], 'Join nodes (via Node panel and J shortcut)'),
    async () => {
      await demoAccountFileTest.step(
        'Join the top and bottom nodes via the node panel',
        async () => {
          await selectNodes(nodes.top, nodes.bottom);
          await expect(
            pathEditorPage.nodePanelJoinNodesButton,
            'Join nodes button should appear for 2 unjoined nodes',
          ).toBeVisible();
          await pathEditorPage.clickJoinNodesButtonOnNodePanel();
          await expect(
            pathEditorPage.nodePanelJoinNodesButton,
            'Join nodes button should disappear once the nodes are joined',
          ).toBeHidden();
        },
      );

      await demoAccountFileTest.step(
        'Join the right and left nodes with J',
        async () => {
          await selectNodes(nodes.right, nodes.left);
          await expect(
            pathEditorPage.nodePanelJoinNodesButton,
            'Join nodes button should appear for 2 unjoined nodes',
          ).toBeVisible();
          await pathEditorPage.pressKeyboardShortcut('J');
          await expect(
            pathEditorPage.nodePanelJoinNodesButton,
            'Join nodes button should disappear once the nodes are joined',
          ).toBeHidden();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([549], 'Separate nodes (via Node panel and K shortcut)'),
    async () => {
      await demoAccountFileTest.step(
        'Separate the top and right nodes via the node panel',
        async () => {
          await selectNodes(nodes.top, nodes.right);
          await expect(
            pathEditorPage.nodePanelSeparateNodesButton,
            'Separate nodes button should appear for 2 joined nodes',
          ).toBeVisible();
          await pathEditorPage.clickSeparateNodesButtonOnNodePanel();
          await expect(
            pathEditorPage.nodePanelSeparateNodesButton,
            'Separate nodes button should disappear once the nodes are separated',
          ).toBeHidden();
          await expect(
            pathEditorPage.nodePanelJoinNodesButton,
            'Join nodes button should appear once the nodes are separated',
          ).toBeVisible();
        },
      );

      await demoAccountFileTest.step(
        'Separate the bottom and left nodes with K',
        async () => {
          await selectNodes(nodes.bottom, nodes.left);
          await expect(
            pathEditorPage.nodePanelSeparateNodesButton,
            'Separate nodes button should appear for 2 joined nodes',
          ).toBeVisible();
          await pathEditorPage.pressKeyboardShortcut('K');
          await expect(
            pathEditorPage.nodePanelSeparateNodesButton,
            'Separate nodes button should disappear once the nodes are separated',
          ).toBeHidden();
          await expect(
            pathEditorPage.nodePanelJoinNodesButton,
            'Join nodes button should appear once the nodes are separated',
          ).toBeVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([550], 'To corner (via Node panel and X shortcut) - single node'),
    async () => {
      await demoAccountFileTest.step(
        'Change the top node to corner via the node panel',
        async () => {
          await selectNodes(nodes.top);
          await expect(
            pathEditorPage.nodePanelToCornerButton,
            'To corner button should appear for a curve node',
          ).toBeVisible();
          await pathEditorPage.clickToCornerButtonOnNodePanel();
          await expect(
            pathEditorPage.nodePanelToCornerButton,
            'To corner button should disappear once the node is a corner',
          ).toBeHidden();
          await expect(
            pathEditorPage.nodePanelToCurveButton,
            'To curve button should appear once the node is a corner',
          ).toBeVisible();
        },
      );

      await demoAccountFileTest.step(
        'Change the right node to corner with X',
        async () => {
          await selectNodes(nodes.right);
          await expect(
            pathEditorPage.nodePanelToCornerButton,
            'To corner button should appear for a curve node',
          ).toBeVisible();
          await pathEditorPage.pressKeyboardShortcut('X');
          await expect(
            pathEditorPage.nodePanelToCornerButton,
            'To corner button should disappear once the node is a corner',
          ).toBeHidden();
          await expect(
            pathEditorPage.nodePanelToCurveButton,
            'To curve button should appear once the node is a corner',
          ).toBeVisible();
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async () => {
    let triangleNodes: Point[];
    await demoAccountFileTest.step(
      'Draw a closed path with 3 corner nodes',
      async () => {
        await pathEditorPage.clickCreatePathButton();
        await pathEditorPage.clickViewportByCoordinates(500, 200);
        await pathEditorPage.clickViewportByCoordinates(1200, 700);
        await pathEditorPage.clickViewportByCoordinates(1000, 400);
        await pathEditorPage.clickViewportByCoordinates(500, 200);
        await expect(
          pathEditorPage.pathActionsBlock,
          'Path should stay open for editing once closed',
        ).toBeVisible();
        await pathEditorPage.clickMoveNodesButtonOnNodePanel();
        await pathEditorPage.overlayComp.checkNodeCount(3);
        triangleNodes = await pathEditorPage.overlayComp.getNodes();
      },
    );

    await demoAccountFileTest.step(
      'Change the second node to curve via the node panel',
      async () => {
        await pathEditorPage.overlayComp.clickNode(triangleNodes[1]);
        await expect(
          pathEditorPage.nodePanelToCurveButton,
          'To curve button should appear for a corner node',
        ).toBeVisible();
        await pathEditorPage.clickToCurveButtonOnNodePanel();
        await expect(
          pathEditorPage.nodePanelToCurveButton,
          'To curve button should disappear once the node is a curve',
        ).toBeHidden();
        await expect(
          pathEditorPage.nodePanelToCornerButton,
          'To corner button should appear once the node is a curve',
        ).toBeVisible();
      },
    );

    await demoAccountFileTest.step(
      'Change the third node to curve with C',
      async () => {
        await pathEditorPage.overlayComp.clickNode(triangleNodes[2]);
        await expect(
          pathEditorPage.nodePanelToCurveButton,
          'To curve button should appear for a corner node',
        ).toBeVisible();
        await pathEditorPage.pressKeyboardShortcut('C');
        await expect(
          pathEditorPage.nodePanelToCurveButton,
          'To curve button should disappear once the node is a curve',
        ).toBeHidden();
        await expect(
          pathEditorPage.nodePanelToCornerButton,
          'To corner button should appear once the node is a curve',
        ).toBeVisible();
      },
    );
  },
);
