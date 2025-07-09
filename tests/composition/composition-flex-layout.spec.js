const { expect, test } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');

const teamName = random().concat('autotest');

let teamPage, mainPage, dashboardPage, layersPanelPage, designPanelPage;

test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  const projectFirst = 'QA Project';

  await teamPage.goToTeam();
  await dashboardPage.openProjectFromLeftSidebar(projectFirst);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  // await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(607, 'FL-1 Add flex layout to board from rightclick'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await designPanelPage.isLayoutRemoveButtonExists();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-with-layout.png');
  });

  mainTest(qase(608, 'FL-2 Add flex layout to board from shortcut'), async () => {
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await designPanelPage.isLayoutRemoveButtonExists();
    await expect(mainPage.createdLayer).toHaveScreenshot('board-with-layout.png');
  });

  mainTest(
    qase(610, 'FL-4 Remove flex layout from board from rightclick'),
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
    qase(611, 'FL-5 Remove flex layout from board from shortcut'),
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
    qase(612, 'FL-6 Remove flex layout from board from Design panel'),
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

  mainTest(qase(613, 'FL-7 Change direction'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutDirection('Row reverse');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-row-reverse-direction.png',
    );
    await designPanelPage.changeLayoutDirection('Column');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-column-direction.png',
    );
    await designPanelPage.changeLayoutDirection('Column reverse');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-column-reverse-direction.png',
    );
    await designPanelPage.changeLayoutDirection('Row');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-row-direction.png');
  });

  mainTest(qase(615, 'FL-9 Change alignment'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutAlignment('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-align-center.png');
    await designPanelPage.changeLayoutAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-align-end.png');
    await designPanelPage.changeLayoutAlignment('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-align-start.png');
  });

  mainTest(qase(616, 'FL-10 Change justification'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutJustification('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-justify-center.png',
    );
    await designPanelPage.changeLayoutJustification('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-justify-end.png');
    await designPanelPage.changeLayoutJustification('Space between');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-justify-space-between.png',
    );
    await designPanelPage.changeLayoutJustification('Space around');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-justify-space-around.png',
    );
    await designPanelPage.changeLayoutJustification('Space evenly');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-justify-space-evenly.png',
    );
    await designPanelPage.changeLayoutJustification('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-justify-start.png');
  });

  mainTest(qase(618, 'FL-12 Change column gap'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutColumnGap('5');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-column-gap-5.png');
    await designPanelPage.changeLayoutColumnGap('15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-column-gap-15.png');
    await designPanelPage.changeLayoutColumnGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-column-gap-0.png');
  });

  mainTest(qase(619, 'FL-13 Change row gap'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutDirection('Column');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutRowGap('5');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-row-gap-5.png');
    await designPanelPage.changeLayoutRowGap('15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-row-gap-15.png');
    await designPanelPage.changeLayoutRowGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-row-gap-0.png');
  });

  mainTest(qase(620, 'FL-14 Change single padding'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.changeLayoutPadding('Vertical', '5');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutPadding('Horizontal', '15');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-padding-5-15.png');
    await designPanelPage.changeLayoutPadding('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-horizontal_padding-0.png',
    );
    await designPanelPage.changeLayoutPadding('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-vertical_padding-0.png',
    );
  });

  mainTest(qase(621, 'FL-15 Change multiple padding'), async () => {
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
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-top-left-padding-10-15.png',
    );
    await designPanelPage.changeLayoutJustification('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-top-left-padding-10-15-justify.png',
    );
    await designPanelPage.changeLayoutIndependentPadding('Right', '20');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-top-left-right-padding-justify-align.png',
    );
    await designPanelPage.changeLayoutIndependentPadding('Bottom', '25');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-top-left-right-bottom-padding.png',
    );
  });

  mainTest(qase(627, 'FL-21 Flex elements change - alignment'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await layersPanelPage.selectBoardChildLayer('Rectangle');
    await designPanelPage.isFlexElementSectionOpened();
    await designPanelPage.changeFlexElementAlignment('Center');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'flex-element-align-center.png',
    );
    await designPanelPage.changeFlexElementAlignment('End');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'flex-element-align-end.png',
    );
    await designPanelPage.changeFlexElementAlignment('Start');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'flex-element-align-start.png',
    );
  });

  mainTest(qase(628, 'FL-22 Flex elements - change margin single'), async () => {
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
    await layersPanelPage.selectBoardChildLayer('Rectangle');
    await designPanelPage.isFlexElementSectionOpened();
    await designPanelPage.changeFlexElementMargin('Vertical', '10');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeFlexElementMargin('Horizontal', '25');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'flex-element-margin-10-25.png',
    );
    await designPanelPage.changeFlexElementMargin('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'flex-element-margin-vert-0.png',
    );
    await designPanelPage.changeFlexElementMargin('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'flex-element-margin-horizont-0.png',
    );
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      await testInfo.setTimeout(testInfo.timeout + 20000);
    } else {
      await testInfo.setTimeout(testInfo.timeout + 15000);
    }
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(643, 'FL-37 Set margins and padding to 0'), async () => {
    await designPanelPage.changeLayoutPadding('Vertical', '0');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutPadding('Horizontal', '0');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeLayoutColumnGap('0');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-padding-gap-0.png');
    await designPanelPage.clickLayoutVerticalPaddingField();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-padding-gap-0.png');
    await designPanelPage.clickLayoutHorizontalPaddingField();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-padding-gap-0.png');
    await designPanelPage.clickLayoutColumnGapField();
    await expect(mainPage.createdLayer).toHaveScreenshot('layout-padding-gap-0.png');
  });

  mainTest(qase(645, 'FL-39 Gap click highlight'), async () => {
    await designPanelPage.changeLayoutColumnGap('20');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickLayoutColumnGapField();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'layout-column-gap-highlighted.png',
    );
  });

  mainTest(
    qase(
      647,
      'FL-42 Use absolute position and look if element still inside a board',
    ),
    async () => {
      await layersPanelPage.selectBoardChildLayer('Ellipse');
      await designPanelPage.isFlexElementSectionOpened();
      await designPanelPage.setFlexElementPositionAbsolute();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFlexElementPositionAbsoluteChecked();
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'flex-element-position-absolute.png',
      );
    },
  );
});
