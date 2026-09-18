import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
  });

  demoAccountFileTest(
    qase([544], 'Add nodes (via Node panel and SHIFT++ shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Add node via node panel for two selected nodes',
        async () => {
          await mainPage.holdShiftKeyboardButton();
          await mainPage.clickFirstNode();
          await mainPage.clickSecondNode();
          await mainPage.releaseShiftKeyboardButton();
          await mainPage.clickAddNodeButtonOnNodePanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Verify first node is added', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('path-added-one-node.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step(
        'Add node via SHIFT++ shortcut for two selected nodes',
        async () => {
          await mainPage.clickFourthNode();
          await mainPage.holdShiftKeyboardButton();
          await mainPage.clickFifthNode();
          await mainPage.releaseShiftKeyboardButton();
          await mainPage.pressShiftPlusKeyboardShortcut();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Verify second node is added', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-added-two-nodes.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  demoAccountFileTest(
    qase([545], 'Delete node (via Node panel and Del shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Delete first node via node panel',
        async () => {
          await mainPage.clickFirstNode();
          await mainPage.clickDeleteNodeButtonOnNodePanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Verify first node is deleted', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-deleted-one-node.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await demoAccountFileTest.step(
        'Delete second node via Delete key',
        async () => {
          await mainPage.clickSecondNode();
          await mainPage.pressDeleteKeyboardButton();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Verify second node is deleted', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-deleted-two-nodes.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  demoAccountFileTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Merge two nodes via node panel', async () => {
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickFirstNode();
        await mainPage.clickSecondNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.clickMergeNodesButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step('Verify nodes are merged once', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-merged-nodes-once.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await demoAccountFileTest.step(
        'Merge two nodes via CTRL+J shortcut',
        async () => {
          await mainPage.holdShiftKeyboardButton();
          await mainPage.clickFirstNode();
          await mainPage.clickSecondNode();
          await mainPage.releaseShiftKeyboardButton();
          await mainPage.pressCtrlJKeyboardShortcut();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Verify nodes are merged twice', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-merged-nodes-twice.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  demoAccountFileTest(
    qase([548], 'Join nodes (via Node panel and J shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Draw new nodes on canvas', async () => {
        await mainPage.clickDrawNodesButtonOnNodePanel();
        await mainPage.clickViewportByCoordinates(600, 200, 2);
        await mainPage.clickViewportByCoordinates(750, 300, 2);
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickMoveNodesButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step('Join nodes via node panel', async () => {
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickSixthNode();
        await mainPage.clickThirdNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.clickJoinNodesButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step('Verify nodes are joined once', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-joined-nodes-once.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await demoAccountFileTest.step('Join nodes via J shortcut', async () => {
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickFifthNode();
        await mainPage.clickSecondNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.pressKeyboardShortcut('J');
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step('Verify nodes are joined twice', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-joined-nodes-twice.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  demoAccountFileTest(
    qase([549], 'Separate nodes (via Node panel and K shortcut)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Separate two nodes via node panel',
        async () => {
          await mainPage.holdShiftKeyboardButton();
          await mainPage.clickFirstNode();
          await mainPage.clickSecondNode();
          await mainPage.releaseShiftKeyboardButton();
          await mainPage.clickSeparateNodesButtonOnNodePanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step('Verify nodes are separated once', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-separated-nodes-once.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await demoAccountFileTest.step(
        'Separate two nodes via K shortcut',
        async () => {
          await mainPage.clickSecondNode();
          await mainPage.holdShiftKeyboardButton();
          await mainPage.clickThirdNode();
          await mainPage.releaseShiftKeyboardButton();
          await mainPage.pressKeyboardShortcut('K');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify nodes are separated twice',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'path-separated-nodes-twice.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([550], 'To corner (via Node panel and X shortcut) - single node'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Convert first node to corner via node panel',
        async () => {
          await mainPage.clickFirstNode();
          await mainPage.clickToCornerButtonOnNodePanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify first node is converted to corner',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'path-to-corner-one-node.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Convert second node to corner via X shortcut',
        async () => {
          await mainPage.clickSecondNode();
          await mainPage.pressKeyboardShortcut('X');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify second node is converted to corner',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'path-to-corner-two-nodes.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Create rectangle and transform to path',
      async () => {
        await mainPage.clickCreateRectangleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.transformToPathViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.openNodesPanelViaRightClick();
      },
    );

    await demoAccountFileTest.step(
      'Convert first node to curve via node panel',
      async () => {
        await mainPage.clickFirstNode();
        await mainPage.clickToCurveButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify first node is converted to curve',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-to-curve-one-node.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await demoAccountFileTest.step(
      'Convert second node to curve via C shortcut',
      async () => {
        await mainPage.clickSecondNode();
        await mainPage.pressKeyboardShortcut('C');
        await mainPage.waitForChangeIsSaved();
      },
    );

    await demoAccountFileTest.step(
      'Verify second node is converted to curve',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-to-curve-two-nodes.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
