const { expect } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { qase } = require('playwright-qase-reporter/playwright');

const teamName = random().concat('autotest');

let teamPage, mainPage, dashboardPage, layersPanelPage, designPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([607], 'Add flex layout to board from right click'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await designPanelPage.isLayoutRemoveButtonExists();
    await expect(mainPage.viewport).toHaveScreenshot('board-with-layout.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(
    qase([608], 'Add flex layout to board from shortcut (SHIFT+A)'),
    async () => {
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await expect(mainPage.viewport).toHaveScreenshot('board-with-layout.png', {
        mask: await mainPage.maskViewport(),
      });
    },
  );

  mainTest(
    qase([610], 'Remove flex layout from board from rightclick'),
    async () => {
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.removeFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
      await designPanelPage.isLayoutRemoveButtonExists(false);
    },
  );

  mainTest(
    qase([611], 'Remove flex layout from board from shortcut (SHIFT+A)'),
    async () => {
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
      await designPanelPage.isLayoutRemoveButtonExists(false);
    },
  );

  mainTest(
    qase([612], 'Remove flex layout from board from Design panel'),
    async () => {
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.removeLayoutFromDesignPanel();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
      await designPanelPage.isLayoutRemoveButtonExists(false);
    },
  );

  mainTest(qase([613], 'Change direction'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutDirection('Row reverse');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-row-reverse-direction.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutDirection('Column');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-direction.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutDirection('Column reverse');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-column-reverse-direction.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutDirection('Row');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-direction.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([615], 'Change alignment'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutAlignment('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-align-center.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-align-end.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutAlignment('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-align-start.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([616], 'Change justification'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutJustification('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-justify-center.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutJustification('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-justify-end.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutJustification('Space between');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-justify-space-between.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutJustification('Space around');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-justify-space-around.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutJustification('Space evenly');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-justify-space-evenly.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutJustification('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-justify-start.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([618], 'Change column gap'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutColumnGap('5');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-5.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutColumnGap('15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-15.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutColumnGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-0.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([619], 'Change row gap'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutDirection('Column');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutRowGap('5');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-5.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutRowGap('15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-15.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutRowGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-0.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([620], 'Change padding (single)'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutPadding('Vertical', '5');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutPadding('Horizontal', '15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-5-15.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeLayoutPadding('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-horizontal_padding-0.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutPadding('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-vertical_padding-0.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
  });

  mainTest(qase([621], 'Change padding (multiple)'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
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
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutJustification('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-padding-10-15-justify.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutIndependentPadding('Right', '20');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-right-padding-justify-align.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeLayoutIndependentPadding('Bottom', '25');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-top-left-right-bottom-padding.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
  });

  mainTest(qase([627], 'Flex elements change - alignment'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await layersPanelPage.selectBoardChildLayer('Rectangle');
    await designPanelPage.isFlexElementSectionOpened();
    await designPanelPage.changeFlexElementAlignment('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-align-center.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeFlexElementAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('flex-element-align-end.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.changeFlexElementAlignment('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-align-start.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
  });

  mainTest(qase([628], 'Flex elements - change margin (single)'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await layersPanelPage.selectBoardChildLayer('Rectangle');
    await designPanelPage.isFlexElementSectionOpened();
    await designPanelPage.changeFlexElementMargin('Vertical', '10');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeFlexElementMargin('Horizontal', '25');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-margin-10-25.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeFlexElementMargin('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-margin-vert-0.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
    await designPanelPage.changeFlexElementMargin('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'flex-element-margin-horizont-0.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([643], 'Set margins and padding to 0'), async () => {
    await designPanelPage.changeLayoutPadding('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutPadding('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutColumnGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.clickLayoutVerticalPaddingField();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.clickLayoutHorizontalPaddingField();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: await mainPage.maskViewport(),
    });
    await designPanelPage.clickLayoutColumnGapField();
    await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
      mask: await mainPage.maskViewport(),
    });
  });

  mainTest(qase([645], 'Gap click highlight'), async () => {
    await designPanelPage.changeLayoutColumnGap('20');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickLayoutColumnGapField();
    await expect(mainPage.viewport).toHaveScreenshot(
      'layout-column-gap-highlighted.png',
      {
        mask: await mainPage.maskViewport(),
      },
    );
  });

  mainTest(
    qase([647], 'Use absolute position and look if element still inside a board'),
    async () => {
      await layersPanelPage.selectBoardChildLayer('Ellipse');
      await designPanelPage.isFlexElementSectionOpened();
      await designPanelPage.setFlexElementPositionAbsolute();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFlexElementPositionAbsoluteChecked();
      await expect(mainPage.viewport).toHaveScreenshot(
        'flex-element-position-absolute.png',
        {
          mask: await mainPage.maskViewport(),
        },
      );
    },
  );
});
