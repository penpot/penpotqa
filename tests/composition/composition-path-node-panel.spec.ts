import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

type Point = { x: number; y: number };

/** Nodes of the flattened ellipse, named by their position as in the Qase cases. */
async function getEllipseNodes(mainPage: MainPage) {
  const nodes = await mainPage.getPathNodePositions();
  const byX = [...nodes].sort((a, b) => a.x - b.x);
  const byY = [...nodes].sort((a, b) => a.y - b.y);
  return {
    top: byY[0],
    bottom: byY[byY.length - 1],
    left: byX[0],
    right: byX[byX.length - 1],
  };
}

async function selectNodes(mainPage: MainPage, first: Point, second?: Point) {
  await mainPage.clickPathNode(first);
  if (second) {
    await mainPage.clickPathNode(second, { shift: true });
  }
}

demoAccountFileTest.describe(() => {
  let nodes: Record<'top' | 'right' | 'bottom' | 'left', Point>;

  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
    await mainPage.checkPathNodeCount(4);
    nodes = await getEllipseNodes(mainPage);
  });

  demoAccountFileTest(
    qase([545], 'Delete node (via Del/Backspace shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Delete the top node with Delete', async () => {
        await selectNodes(mainPage, nodes.top);
        await mainPage.pressDeleteKeyboardButton();
        await mainPage.checkPathNodeCount(3);
      });

      await demoAccountFileTest.step(
        'Delete the left node with Backspace',
        async () => {
          await selectNodes(mainPage, nodes.left);
          await mainPage.pressBackspaceKeyboardButton();
          await mainPage.checkPathNodeCount(2);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Merge the top and right nodes via the node panel',
        async () => {
          await selectNodes(mainPage, nodes.top, nodes.right);
          await expect(
            mainPage.nodePanelMergeNodesButton,
            'Merge nodes button should appear for 2 selected nodes',
          ).toBeVisible();
          await mainPage.clickMergeNodesButtonOnNodePanel();
          await mainPage.checkPathNodeCount(3);
        },
      );

      await demoAccountFileTest.step(
        'Merge the bottom and left nodes with Ctrl+J',
        async () => {
          await selectNodes(mainPage, nodes.bottom, nodes.left);
          await expect(
            mainPage.nodePanelMergeNodesButton,
            'Merge nodes button should appear for 2 selected nodes',
          ).toBeVisible();
          await mainPage.pressCtrlJKeyboardShortcut();
          await mainPage.checkPathNodeCount(2);
        },
      );

      let pathNodes: Point[];
      let newLineNodes: Point[];
      await demoAccountFileTest.step(
        'Draw a separate line in Draw nodes mode',
        async () => {
          pathNodes = await mainPage.getPathNodePositions();
          await mainPage.clickDrawNodesButtonOnNodePanel();
          await mainPage.clickViewportByCoordinates(200, 200);
          await mainPage.clickViewportByCoordinates(300, 350);
          await mainPage.clickOnESC();
          await expect(
            mainPage.pathActionsBlock,
            'Path editor should stay open after Esc',
          ).toBeVisible();
          await mainPage.checkPathNodeCount(4);
          newLineNodes = (await mainPage.getPathNodePositions()).filter(
            (node) => !pathNodes.some((p) => p.x === node.x && p.y === node.y),
          );
        },
      );

      await demoAccountFileTest.step(
        'Merge a node of the new line with a node of the initial path',
        async () => {
          await mainPage.clickMoveNodesButtonOnNodePanel();
          await selectNodes(mainPage, newLineNodes[0], pathNodes[0]);
          await expect(
            mainPage.nodePanelMergeNodesButton,
            'Merge nodes button should appear for nodes of 2 subpaths',
          ).toBeVisible();
          await mainPage.clickMergeNodesButtonOnNodePanel();
          await mainPage.checkPathNodeCount(3);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([548], 'Join nodes (via Node panel and J shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Join the top and bottom nodes via the node panel',
        async () => {
          await selectNodes(mainPage, nodes.top, nodes.bottom);
          await expect(
            mainPage.nodePanelJoinNodesButton,
            'Join nodes button should appear for 2 unjoined nodes',
          ).toBeVisible();
          await mainPage.clickJoinNodesButtonOnNodePanel();
          await expect(
            mainPage.nodePanelJoinNodesButton,
            'Join nodes button should disappear once the nodes are joined',
          ).toBeHidden();
        },
      );

      await demoAccountFileTest.step(
        'Join the right and left nodes with J',
        async () => {
          await selectNodes(mainPage, nodes.right, nodes.left);
          await expect(
            mainPage.nodePanelJoinNodesButton,
            'Join nodes button should appear for 2 unjoined nodes',
          ).toBeVisible();
          await mainPage.pressKeyboardShortcut('J');
          await expect(
            mainPage.nodePanelJoinNodesButton,
            'Join nodes button should disappear once the nodes are joined',
          ).toBeHidden();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([549], 'Separate nodes (via Node panel and K shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Separate the top and right nodes via the node panel',
        async () => {
          await selectNodes(mainPage, nodes.top, nodes.right);
          await expect(
            mainPage.nodePanelSeparateNodesButton,
            'Separate nodes button should appear for 2 joined nodes',
          ).toBeVisible();
          await mainPage.clickSeparateNodesButtonOnNodePanel();
          await expect(
            mainPage.nodePanelSeparateNodesButton,
            'Separate nodes button should disappear once the nodes are separated',
          ).toBeHidden();
          await expect(
            mainPage.nodePanelJoinNodesButton,
            'Join nodes button should appear once the nodes are separated',
          ).toBeVisible();
        },
      );

      await demoAccountFileTest.step(
        'Separate the bottom and left nodes with K',
        async () => {
          await selectNodes(mainPage, nodes.bottom, nodes.left);
          await expect(
            mainPage.nodePanelSeparateNodesButton,
            'Separate nodes button should appear for 2 joined nodes',
          ).toBeVisible();
          await mainPage.pressKeyboardShortcut('K');
          await expect(
            mainPage.nodePanelSeparateNodesButton,
            'Separate nodes button should disappear once the nodes are separated',
          ).toBeHidden();
          await expect(
            mainPage.nodePanelJoinNodesButton,
            'Join nodes button should appear once the nodes are separated',
          ).toBeVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([550], 'To corner (via Node panel and X shortcut) - single node'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Change the top node to corner via the node panel',
        async () => {
          await selectNodes(mainPage, nodes.top);
          await expect(
            mainPage.nodePanelToCornerButton,
            'To corner button should appear for a curve node',
          ).toBeVisible();
          await mainPage.clickToCornerButtonOnNodePanel();
          await expect(
            mainPage.nodePanelToCornerButton,
            'To corner button should disappear once the node is a corner',
          ).toBeHidden();
          await expect(
            mainPage.nodePanelToCurveButton,
            'To curve button should appear once the node is a corner',
          ).toBeVisible();
        },
      );

      await demoAccountFileTest.step(
        'Change the right node to corner with X',
        async () => {
          await selectNodes(mainPage, nodes.right);
          await expect(
            mainPage.nodePanelToCornerButton,
            'To corner button should appear for a curve node',
          ).toBeVisible();
          await mainPage.pressKeyboardShortcut('X');
          await expect(
            mainPage.nodePanelToCornerButton,
            'To corner button should disappear once the node is a corner',
          ).toBeHidden();
          await expect(
            mainPage.nodePanelToCurveButton,
            'To curve button should appear once the node is a corner',
          ).toBeVisible();
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async ({ mainPage }) => {
    let triangleNodes: Point[];
    await demoAccountFileTest.step(
      'Draw a closed path with 3 corner nodes',
      async () => {
        await mainPage.clickCreatePathButton();
        await mainPage.clickViewportByCoordinates(500, 200);
        await mainPage.clickViewportByCoordinates(1200, 700);
        await mainPage.clickViewportByCoordinates(1000, 400);
        await mainPage.clickViewportByCoordinates(500, 200);
        await expect(
          mainPage.pathActionsBlock,
          'Path should stay open for editing once closed',
        ).toBeVisible();
        await mainPage.clickMoveNodesButtonOnNodePanel();
        await mainPage.checkPathNodeCount(3);
        triangleNodes = await mainPage.getPathNodePositions();
      },
    );

    await demoAccountFileTest.step(
      'Change the second node to curve via the node panel',
      async () => {
        await mainPage.clickPathNode(triangleNodes[1]);
        await expect(
          mainPage.nodePanelToCurveButton,
          'To curve button should appear for a corner node',
        ).toBeVisible();
        await mainPage.clickToCurveButtonOnNodePanel();
        await expect(
          mainPage.nodePanelToCurveButton,
          'To curve button should disappear once the node is a curve',
        ).toBeHidden();
        await expect(
          mainPage.nodePanelToCornerButton,
          'To corner button should appear once the node is a curve',
        ).toBeVisible();
      },
    );

    await demoAccountFileTest.step(
      'Change the third node to curve with C',
      async () => {
        await mainPage.clickPathNode(triangleNodes[2]);
        await expect(
          mainPage.nodePanelToCurveButton,
          'To curve button should appear for a corner node',
        ).toBeVisible();
        await mainPage.pressKeyboardShortcut('C');
        await expect(
          mainPage.nodePanelToCurveButton,
          'To curve button should disappear once the node is a curve',
        ).toBeHidden();
        await expect(
          mainPage.nodePanelToCornerButton,
          'To corner button should appear once the node is a curve',
        ).toBeVisible();
      },
    );
  },
);
