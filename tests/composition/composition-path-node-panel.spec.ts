import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightClick();
  });

  mainTest(
    qase([544], 'Add nodes (via Node panel and SHIFT++ shortcut)'),
    async () => {
      await mainTest.step(
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

      await mainTest.step('Verify first node is added', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('path-added-one-node.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step(
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

      await mainTest.step('Verify second node is added', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-added-two-nodes.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(
    qase([545], 'Delete node (via Node panel and Del shortcut)'),
    async () => {
      await mainTest.step('Delete first node via node panel', async () => {
        await mainPage.clickFirstNode();
        await mainPage.clickDeleteNodeButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify first node is deleted', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-deleted-one-node.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Delete second node via Delete key', async () => {
        await mainPage.clickSecondNode();
        await mainPage.pressDeleteKeyboardButton();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify second node is deleted', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-deleted-two-nodes.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(
    qase([547], 'Merge nodes (via Node panel and CTRL+J shortcut)'),
    async () => {
      await mainTest.step('Merge two nodes via node panel', async () => {
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickFirstNode();
        await mainPage.clickSecondNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.clickMergeNodesButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify nodes are merged once', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-merged-nodes-once.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Merge two nodes via CTRL+J shortcut', async () => {
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickFirstNode();
        await mainPage.clickSecondNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.pressCtrlJKeyboardShortcut();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify nodes are merged twice', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-merged-nodes-twice.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(qase([548], 'Join nodes (via Node panel and J shortcut)'), async () => {
    await mainTest.step('Draw new nodes on canvas', async () => {
      await mainPage.clickDrawNodesButtonOnNodePanel();
      await mainPage.clickViewportByCoordinates(600, 200, 2);
      await mainPage.clickViewportByCoordinates(750, 300, 2);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickMoveNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Join nodes via node panel', async () => {
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickSixthNode();
      await mainPage.clickThirdNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.clickJoinNodesButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify nodes are joined once', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-joined-nodes-once.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Join nodes via J shortcut', async () => {
      await mainPage.holdShiftKeyboardButton();
      await mainPage.clickFifthNode();
      await mainPage.clickSecondNode();
      await mainPage.releaseShiftKeyboardButton();
      await mainPage.pressKeyboardShortcut('J');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify nodes are joined twice', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-joined-nodes-twice.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(
    qase([549], 'Separate nodes (via Node panel and K shortcut)'),
    async () => {
      await mainTest.step('Separate two nodes via node panel', async () => {
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickFirstNode();
        await mainPage.clickSecondNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.clickSeparateNodesButtonOnNodePanel();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify nodes are separated once', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-separated-nodes-once.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step('Separate two nodes via K shortcut', async () => {
        await mainPage.clickSecondNode();
        await mainPage.holdShiftKeyboardButton();
        await mainPage.clickThirdNode();
        await mainPage.releaseShiftKeyboardButton();
        await mainPage.pressKeyboardShortcut('K');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify nodes are separated twice', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-separated-nodes-twice.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainTest(
    qase([550], 'To corner (via Node panel and X shortcut) - single node'),
    async () => {
      await mainTest.step(
        'Convert first node to corner via node panel',
        async () => {
          await mainPage.clickFirstNode();
          await mainPage.clickToCornerButtonOnNodePanel();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify first node is converted to corner', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-to-corner-one-node.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await mainTest.step(
        'Convert second node to corner via X shortcut',
        async () => {
          await mainPage.clickSecondNode();
          await mainPage.pressKeyboardShortcut('X');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify second node is converted to corner', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-to-corner-two-nodes.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );
});

mainTest(
  qase([552], 'To curve (via Node panel and C shortcut) - single node'),
  async () => {
    await mainTest.step('Create rectangle and transform to path', async () => {
      await mainPage.clickCreateRectangleButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.transformToPathViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.openNodesPanelViaRightClick();
    });

    await mainTest.step('Convert first node to curve via node panel', async () => {
      await mainPage.clickFirstNode();
      await mainPage.clickToCurveButtonOnNodePanel();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify first node is converted to curve', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-to-curve-one-node.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step('Convert second node to curve via C shortcut', async () => {
      await mainPage.clickSecondNode();
      await mainPage.pressKeyboardShortcut('C');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify second node is converted to curve', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-to-curve-two-nodes.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  },
);
