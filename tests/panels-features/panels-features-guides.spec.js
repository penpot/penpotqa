const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { createTeamName } = require('../../helpers/teams/create-team-name');

const teamName = createTeamName();

let teamPage, mainPage, designPanelPage, dashboardPage;

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

  // TODO: Does not exist in Qase
  mainTest(qase([719], 'Set square guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([720], 'Square guides - change size'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeSizeForGuides('8');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'square-guide-changed-size.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });

  // TODO: Does not exist in Qase
  mainTest(qase([721], 'Square guides - change opacity'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGuidesActionsButton();
    await designPanelPage.changeOpacityForGuides('70');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'square-guide-changed-opacity.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });
  // TODO: Does not exist in Qase
  mainTest(qase([722], 'Use default square guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeSizeForGuides('8');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGuidesActionsButton();
    await designPanelPage.clickUseDefaultGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(
    qase([724], 'Hide and unhide square guides via Design panel'),
    async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.clickHideGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-hide.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.clickUnhideGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('square-guide-unhide.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  // TODO: Does not exist in Qase
  mainTest(qase([725], 'Hide and unhide square guides via Main menu'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('square-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickOnMainThenViewMenuItem();
    await mainPage.clickHideGuidesMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
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

  // TODO: Does not exist in Qase
  mainTest(qase([729], 'Remove square guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([730], 'Set columns guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Columns');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('columns-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([731], 'Columns guides - change columns number'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGuides('8');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'columns-guide-changed-columns.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });

  // TODO: Does not exist in Qase
  mainTest(qase([732], 'Columns guides - change width'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGuidesActionsButton();
    await designPanelPage.changeWidthForGuides('10');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'columns-guide-changed-width.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });

  // TODO: Does not exist in Qase
  mainTest(qase([735], 'Columns guides - change opacity'), async () => {
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

  // TODO: Does not exist in Qase
  mainTest(qase([736], 'Use default columns guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
    await designPanelPage.clickGuidesActionsButton();
    await designPanelPage.clickUseDefaultGuidesButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('columns-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(
    qase([738], 'Hide and unhide columns guides via Design panel'),
    async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('columns-guide-default.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.clickHideGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('columns-guide-hide.png', {
        mask: mainPage.maskViewport(),
      });
      await designPanelPage.clickUnhideGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('columns-guide-unhide.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  // TODO: Does not exist in Qase
  mainTest(qase([743], 'Remove columns guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([744], 'Set rows guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Rows');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([745], 'Rows guides - change rows number'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Rows');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGuides('12');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-changed-rows.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([746], 'Rows guides - change height'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Rows');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickGuidesActionsButton();
    await designPanelPage.changeHeightForGuides('20');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'rows-guide-changed-height.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
  });

  // TODO: Does not exist in Qase
  mainTest(qase([749], 'Rows guides - change opacity'), async () => {
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
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-opacity-50.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.changeOpacityForGuides('100');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-opacity-100.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([750], 'Use default rows guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Rows');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
    await designPanelPage.clickGuidesActionsButton();
    await designPanelPage.clickUseDefaultGuidesButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([753], 'Hide and unhide rows guides via Main menu'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Rows');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickOnMainThenViewMenuItem();
    await mainPage.clickHideGuidesMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-hide.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickOnMainThenViewMenuItem();
    await mainPage.clickShowGuidesMainMenuSubItem();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('rows-guide-unhide.png', {
      mask: mainPage.maskViewport(),
    });
  });

  // TODO: Does not exist in Qase
  mainTest(qase([757], 'Remove rows guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await designPanelPage.selectGuidesType('Columns');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickRemoveGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase([1864], 'Duplicate board with guides'), async () => {
    await designPanelPage.clickAddGuidesButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickShortcutCtrlD();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('two-board-with-guide.png', {
      mask: mainPage.maskViewport(),
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
