import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let teamPage: TeamPage;
let mainPage: MainPage;
let designPanelPage: DesignPanelPage;
let dashboardPage: DashboardPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase([3258], 'Set square guides'), async () => {
    await mainTest.step('Add square guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify default square guides screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([3259], 'Square guides - change size'), async () => {
    await mainTest.step('Change square guides size', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeSizeForGuides('8');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed square guides size', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'square-guide-changed-size.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([3260], 'Square guides - change opacity'), async () => {
    await mainTest.step('Change square guides opacity', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.changeOpacityForGuides('70');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed square guides opacity', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'square-guide-changed-opacity.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([3261], 'Use default square guides'), async () => {
    await mainTest.step('Reset square guides to default values', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeSizeForGuides('8');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.clickUseDefaultGuidesButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify square guides default screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([725], 'Hide and unhide square guides via Main menu'), async () => {
    await mainTest.step('Hide square guides from main menu', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.clickOnMainThenViewMenuItem();
      await mainPage.clickHideGuidesMainMenuSubItem();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Show square guides again from main menu', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-hide.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.clickOnMainThenViewMenuItem();
      await mainPage.clickShowGuidesMainMenuSubItem();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-unhide.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([729], 'Remove square guides'), async () => {
    await mainTest.step('Remove square guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickRemoveGuidesButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify board without guides', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([730], 'Set columns guides'), async () => {
    await mainTest.step('Add columns guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify default columns guides screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('columns-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([731], 'Columns guides - change columns number'), async () => {
    await mainTest.step('Change columns guides count', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeColumnsOrRowsNumberForGuides('8');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed columns guides count', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'columns-guide-changed-columns.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([732], 'Columns guides - change width'), async () => {
    await mainTest.step('Change columns guides width', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.changeWidthForGuides('10');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed columns guides width', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'columns-guide-changed-width.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([735], 'Columns guides - change opacity'), async () => {
    await mainTest.step('Change columns guides opacity to 50', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('columns-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.changeOpacityForGuides('50');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Change columns guides opacity back to 100', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'columns-guide-opacity-50.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await designPanelPage.changeOpacityForGuides('100');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'columns-guide-opacity-100.png',
        { mask: mainPage.maskViewport() },
      );
    });
  });

  mainTest(qase([736], 'Use default columns guides'), async () => {
    await mainTest.step('Reset columns guides to default values', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.clickUseDefaultGuidesButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify default columns guides screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('columns-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([743], 'Remove columns guides'), async () => {
    await mainTest.step('Remove columns guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickRemoveGuidesButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify board without guides', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([744], 'Set rows guides'), async () => {
    await mainTest.step('Add rows guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Rows');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify default rows guides screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([745], 'Rows guides - change rows number'), async () => {
    await mainTest.step('Change rows guides count', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Rows');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeColumnsOrRowsNumberForGuides('12');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed rows guides count', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'rows-guide-changed-rows.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([746], 'Rows guides - change height'), async () => {
    await mainTest.step('Change rows guides height', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Rows');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.changeHeightForGuides('20');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed rows guides height', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'rows-guide-changed-height.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([749], 'Rows guides - change opacity'), async () => {
    await mainTest.step('Change rows guides opacity to 50', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Rows');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.changeOpacityForGuides('50');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Change rows guides opacity back to 100', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rows-guide-opacity-50.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.changeOpacityForGuides('100');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'rows-guide-opacity-100.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([750], 'Use default rows guides'), async () => {
    await mainTest.step('Reset rows guides to default values', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Rows');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
      await designPanelPage.clickGuidesActionsButton();
      await designPanelPage.clickUseDefaultGuidesButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify default rows guides screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([3257], 'Duplicate board with guides'), async () => {
    await mainTest.step('Duplicate board with square guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickShortcutCtrlD();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify duplicated board keeps guides', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('two-board-with-guide.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([2842], 'Clear guides for a given board'), async () => {
    const viewportBox = await mainPage.viewport.boundingBox();
    const dropX = viewportBox.x + viewportBox.width / 2;
    const dropY = viewportBox.y + viewportBox.height / 2;

    await mainTest.step('Drag ruler guides onto the board', async () => {
      await mainPage.dragHorizontalGuideFromRuler(dropX, dropY);
      await mainPage.dragVerticalGuideFromRuler(dropX, dropY);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-with-ruler-guides.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await mainTest.step(
      'Clear board guides via right-click context menu',
      async () => {
        await mainPage.clearBoardGuidesViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-without-ruler-guides.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  });
});
