const { expect, test } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(607, 'FL-1 Add flex layout to board from rightclick'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await expect(mainPage.viewport).toHaveScreenshot('board-with-layout.png', {
        mask: [mainPage.guides],
      });
    },
  );

  mainTest(
    qase(608, 'FL-2 Add flex layout to board from shortcut'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await expect(mainPage.viewport).toHaveScreenshot('board-with-layout.png', {
        mask: [mainPage.guides],
      });
    },
  );

  mainTest(
    qase(610, 'FL-4 Remove flex layout from board from rightclick'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.removeFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer(false);
      await designPanelPage.isLayoutRemoveButtonExists(false);
    },
  );

  mainTest(
    qase(611, 'FL-5 Remove flex layout from board from shortcut'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer(false);
      await designPanelPage.isLayoutRemoveButtonExists(false);
    },
  );

  mainTest(
    qase(612, 'FL-6 Remove flex layout from board from Design panel'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.removeLayoutFromDesignPanel();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer(false);
      await designPanelPage.isLayoutRemoveButtonExists(false);
    },
  );

  mainTest(qase(613, 'FL-7 Change direction'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutDirection('Row reverse');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-row-reverse-direction.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutDirection('Column');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-direction.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutDirection('Column reverse');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-column-reverse-direction.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutDirection('Row');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-direction.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(615, 'FL-9 Change alignment'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutAlignment('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-align-center.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-align-end.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutAlignment('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-align-start.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(616, 'FL-10 Change justification'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutJustification('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-justify-center.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutJustification('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-justify-end.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutJustification('Space between');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-justify-space-between.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutJustification('Space around');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-justify-space-around.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutJustification('Space evenly');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-justify-space-evenly.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutJustification('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-justify-start.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(618, 'FL-12 Change column gap'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutColumnGap('5');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-5.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutColumnGap('15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-15.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutColumnGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-0.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(619, 'FL-13 Change row gap'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutDirection('Column');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutRowGap('5');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-5.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutRowGap('15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-15.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutRowGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-0.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(620, 'FL-14 Change single padding'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutPadding('Vertical', '5');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutPadding('Horizontal', '15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-5-15.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeLayoutPadding('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-horizontal_padding-0.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutPadding('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-vertical_padding-0.png',
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest(qase(621, 'FL-15 Change multiple padding'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.switchToIndependentPadding();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPadding('Top', '10');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutIndependentPadding('Left', '15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-padding-10-15.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutJustification('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-padding-10-15-justify.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutIndependentPadding('Right', '20');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-right-padding-justify-align.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeLayoutIndependentPadding('Bottom', '25');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-right-bottom-padding.png',
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest(qase(627, 'FL-21 Flex elements change - alignment'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayoutIconVisibleOnLayer();
    await layersPanelPage.selectBoardChildLayer('Rectangle');
    await designPanelPage.isFlexElementSectionOpened();
    await designPanelPage.changeFlexElementAlignment('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-align-center.png',
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeFlexElementAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('flex-element-align-end.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.changeFlexElementAlignment('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-align-start.png',
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest(
    qase(628, 'FL-22 Flex elements - change margin single'),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isLayoutIconVisibleOnLayer();
      await layersPanelPage.selectBoardChildLayer('Rectangle');
      await designPanelPage.isFlexElementSectionOpened();
      await designPanelPage.changeFlexElementMargin('Vertical', '10');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.changeFlexElementMargin('Horizontal', '25');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'flex-element-margin-10-25.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.changeFlexElementMargin('Vertical', '0');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'flex-element-margin-vert-0.png',
        {
          mask: [mainPage.guides],
        },
      );
      await designPanelPage.changeFlexElementMargin('Horizontal', '0');
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'flex-element-margin-horizont-0.png',
        {
          mask: [mainPage.guides],
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(643, 'FL-37 Set margins and padding to 0'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeLayoutPadding('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutPadding('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutColumnGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.clickLayoutVerticalPaddingField();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.clickLayoutHorizontalPaddingField();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: [mainPage.guides],
    });
    await designPanelPage.clickLayoutColumnGapField();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: [mainPage.guides],
    });
  });

  mainTest(qase(645, 'FL-39 Gap click highlight'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await designPanelPage.changeLayoutColumnGap('20');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickLayoutColumnGapField();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-column-gap-highlighted.png',
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest(
    qase(
      647,
      'FL-42 Use absolute position and look if element still inside a board',
    ),
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await layersPanelPage.selectBoardChildLayer('Ellipse');
      await designPanelPage.isFlexElementSectionOpened();
      await designPanelPage.setFlexElementPositionAbsolute();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(page).toHaveScreenshot('flex-element-position-absolute.png', {
        mask: [mainPage.guides, mainPage.usersSection, mainPage.toolBarWindow],
      });
    },
  );
});
