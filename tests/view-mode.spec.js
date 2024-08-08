const { expect, test } = require('@playwright/test');
const { mainTest } = require('../fixtures');
const { MainPage } = require('../pages/workspace/main-page');
const { random } = require('../helpers/string-generator');
const { TeamPage } = require('../pages/dashboard/team-page');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { ViewModePage } = require('../pages/workspace/view-mode-page');
const { PrototypePanelPage } = require('../pages/workspace/prototype-panel-page');
const { CommentsPanelPage } = require('../pages/workspace/comments-panel-page');
const { DesignPanelPage } = require('../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../pages/workspace/layers-panel-page');
const { InspectPanelPage } = require('../pages/workspace/inspect-panel-page');

const teamName = random().concat('autotest');

let teamPage,dashboardPage,mainPage,viewModePage,prototypePanelPage,designPanelPage,layersPanelPage;
test.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  viewModePage = new ViewModePage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry)
});

mainTest(qase([685],'CO-364 Click view mode (From right top click) - no boards created'), async () => {
  const newPage = await viewModePage.clickViewModeButton();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'no-board-view-mode-page-image.png'
  );
});

mainTest(qase([688],'CO-367 Click view mode (From shortcut G+V) - board is created'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-image.png'
  );
});

mainTest(qase([690],'CO-369 Full screen on/off'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickFullScreenButton();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'view-mode-full-screen-image.png'
  );
  await viewModePage.clickOnESC();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-image.png'
  );
});

mainTest(qase([698],'CO-377 Click arrows to navigate to other boards'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png'
  );
  await viewModePage.clickPrevButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png'
  );
  await viewModePage.clickPrevButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
});

mainTest(qase([700],'CO-379 Click Back icon to reset view'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(100, 100, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png'
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'third-board-view-mode-page-image.png'
  );
  await viewModePage.clickResetButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png'
  );
});

mainTest(qase([699],'CO-378 Click board dropdown to navigate to other boards'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickSelectBoardDropdown();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'board-dropdown-view-mode-page-image.png'
  );
  await viewModePage.selectSecondBoard();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'second-board-selected-view-mode-page-image.png'
  );
  await viewModePage.selectFirstBoard();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'first-board-selected-view-mode-page-image.png'
  );
});

// mainTest(qase([689],'CO-368 Interactions dropdown'), async ({ page }) => {
//   await mainPage.createDefaultBoardByCoordinates(300, 300);
//   await mainPage.createDefaultBoardByCoordinates(500, 500, true);
//   await mainPage.waitForChangeIsSaved();
//   await prototypePanelPage.clickPrototypeTab();
//   await prototypePanelPage.dragAndDropPrototypeArrowConnector(300, 300);
//   const newPage = await viewModePage.clickViewModeShortcut();
//   viewModePage = new ViewModePage(newPage);
//   await viewModePage.clickInteractionsDropdown();
//   await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
//     'interactions-dont-show-options-image.png'
//   );
//   await viewModePage.selectShowInteractionsOptions();
//   await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
//     'show-interactions-board-view-mode-page-image.png'
//   );
//   // await viewModePage.clickInteractionsDropdown();
//   await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
//     'interactions-show-options-image.png'
//   );
//   await viewModePage.selectShowOnClickInteractionsOptions();
//   await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
//     'show-on-click-interactions-board-view-mode-page-image.png'
//   );
//   await viewModePage.clickOnBoardCounter();
//   await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
//     'show-on-click-interactions-board-view-mode-page-image2.png'
//   );
// });

mainTest(qase([691],'CO-370 Change scale'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.openScaleDropdown();
  await expect(viewModePage.scaleDropdownOptions).toHaveScreenshot(
    'scale-dropdown-view-mode-page-image.png'
  );
  await viewModePage.clickDownscaleButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'downscale-board-view-mode-page-image.png'
  );
  await viewModePage.clickResetScaleButton();
  await viewModePage.clickUpscaleButton();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'upscale-board-view-mode-page-image.png'
  );
  await viewModePage.selectFitScaleOptions();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'fit-scale-board-view-mode-page-image.png'
  );
  await viewModePage.selectFillScaleOptions();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'fill-scale-board-view-mode-page-image.png'
  );
  await viewModePage.selectFullScreenScaleOptions();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'full-screen-scale-board-view-mode-page-image.png'
  );
  await viewModePage.clickResetScaleButton();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'full-screen-default-scale-board-view-mode-page-image.png'
  );
});

mainTest(qase([713],'CO-392 Zoom by pressing + and - keys'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickOnAdd();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-add-button-image.png'
  );
  await viewModePage.clickOnSubtract();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-page-subtract-button-image.png'
  );
});

mainTest(qase([708],'CO-387 Page dropdown'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.openPageDropdown();
  await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
    'page-list-image.png'
  );
  await viewModePage.selectPageByName("Page 2");
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-2page-image.png'
  );
  await viewModePage.openPageDropdown();
  await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
    'page-list-image2.png'
  );
  await viewModePage.selectPageByName("Page 1");
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-1page-image.png'
  );
});

mainTest(qase([701],'CO-380 Create comment'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();

  const comment = 'Test Comment';
  const commentsPanelPage = new CommentsPanelPage(newPage);
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();
  await commentsPanelPage.isCommentDisplayedInPopUp(comment);
  await expect(newPage).toHaveScreenshot('comment-opened-pop-up.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
  await viewModePage.clickOnViewport();
  await commentsPanelPage.isCommentThreadIconDisplayed();
  await expect(newPage).toHaveScreenshot('comment-closed-pop-up.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([709],'CO-388 Reply comment'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();

  const replyComment =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry';
  const commentsPanelPage = new CommentsPanelPage(newPage);
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();

  await commentsPanelPage.enterReplyText(replyComment);
  await commentsPanelPage.clickPostCommentButton();
  await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
  await expect(newPage).toHaveScreenshot('comment-reply.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([710],'CO-389 Edit comment'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();

  const editedComment = 'Edited Test Comment';
  const commentsPanelPage = new CommentsPanelPage(newPage);
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();

  await commentsPanelPage.clickCommentOptionsButton();
  await commentsPanelPage.clickEditCommentOption();
  await commentsPanelPage.enterCommentText(editedComment, true);
  await commentsPanelPage.clickPostCommentButton();
  await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
  await commentsPanelPage.reloadPage();
  await commentsPanelPage.clickCommentThreadIcon();
  await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
  await expect(newPage).toHaveScreenshot('comment-edited.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([711],'CO-390 Delete thread'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();

  const commentsPanelPage = new CommentsPanelPage(newPage);
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();

  await commentsPanelPage.clickCommentOptionsButton();
  await commentsPanelPage.clickDeleteCommentOption();
  await commentsPanelPage.clickDeleteThreadButton();
  await commentsPanelPage.isCommentThreadIconNotDisplayed();
  await expect(newPage).toHaveScreenshot('comment-removed.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([703],'CO-382 Comments dropdown (Hide resolved comments)'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  const commentsPanelPage = new CommentsPanelPage(newPage);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();
  await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
  await commentsPanelPage.clickResolveCommentCheckbox();
  await commentsPanelPage.clickResolvedCommentThreadIcon();
  await viewModePage.addComment(true);
  await commentsPanelPage.enterCommentText('Test Comment 2');
  await commentsPanelPage.clickPostCommentButton();
  await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment 2');
  await viewModePage.clickCommentsButton();

  await viewModePage.openCommentsDropdown();
  await viewModePage.selectHideResolvedCommentsOption();
  await commentsPanelPage.isCommentResolvedThreadIconNotDisplayed();
  await expect(newPage).toHaveScreenshot('resolved-comments-hidden.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
  await viewModePage.openCommentsDropdown();
  await viewModePage.selectHideResolvedCommentsOption();
  await commentsPanelPage.isCommentResolvedThreadIconDisplayed();
  await expect(newPage).toHaveScreenshot('resolved-comments-show.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([704],'CO-383 Comments dropdown (Show comments list)'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  const commentsPanelPage = new CommentsPanelPage(newPage);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();
  await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
  await viewModePage.clickOnViewport();

  await viewModePage.openCommentsDropdown();
  await viewModePage.selectShowCommentsListOption();
  await viewModePage.isCommentInListVisible(true);
  await expect(viewModePage.commentsRightPanel).toHaveScreenshot('comments-list.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
  await viewModePage.openCommentsDropdown();
  await viewModePage.selectShowCommentsListOption();
  await viewModePage.isCommentInListVisible(false);
  await expect(newPage).toHaveScreenshot('comments-list-hidden.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([706],'CO-385 Switch to Inspect view'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.openInspectTab();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-inspect-page-image.png');
  await viewModePage.openInteractionsTab();
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-interactions-page-image.png');
});

mainTest(qase([715],'CO-394 Inspect functionality - Board elements dropdown in the top left'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await designPanelPage.changeHeightAndWidthForLayer('200', '200');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultRectangleByCoordinates(220, 220);
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  layersPanelPage = new LayersPanelPage(newPage);
  const inspectPanelPage = new InspectPanelPage(newPage);
  await viewModePage.openInspectTab();
  await layersPanelPage.clickLayerOnLayersTab('Rectangle');
  await inspectPanelPage.openCodeTab();
  await newPage.waitForTimeout(200);
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-code-tab-image.png');
});

mainTest(qase([717],'CO-396 Inspect functionality- Export'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await designPanelPage.changeHeightAndWidthForLayer('200', '200');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultRectangleByCoordinates(220, 220);
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  designPanelPage = new DesignPanelPage(newPage);
  await viewModePage.openInspectTab();

  await designPanelPage.clickAddExportButton();
  await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
  await expect(viewModePage.rightSidebar).toHaveScreenshot(
    'view-mode-export-right-sidebar-image.png');

  await designPanelPage.clickExportElementButton(newPage);
});

mainTest(qase([1785],'CO-387 Switch between layers from left menu'), async ({browserName}) => {
  await mainPage.createDefaultBoardByCoordinates(200, 200);
  await designPanelPage.changeHeightAndWidthForLayer('500', '700');
  await mainPage.waitForChangeIsSaved();
  await mainPage.uploadImage('images/mini_sample.jpg');
  await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultRectangleByCoordinates(220, 220);
  await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultEllipseByCoordinates(330, 220,true);
  await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultTextLayerByCoordinates(220, 330, browserName);
  await layersPanelPage.dragAndDropComponentToBoard('Hello World!');
  await mainPage.waitForChangeIsSaved();
  await mainPage.createSmallClosedPathByCoordinates(330, 330);
  await layersPanelPage.dragAndDropComponentToBoard('Path');
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  layersPanelPage = new LayersPanelPage(newPage);
  await viewModePage.openInspectTab();
  await layersPanelPage.clickLayerOnLayersTab('Rectangle');
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-rectangle-selected-image.png');
  await layersPanelPage.clickLayerOnLayersTab('Ellipse');
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-ellipse-selected-image.png');
  await layersPanelPage.clickLayerOnLayersTab('Hello World!');
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-test-selected-image.png');
  await layersPanelPage.clickLayerOnLayersTab('Path');
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-path-selected-image.png');
  await layersPanelPage.clickLayerOnLayersTab('mini_sample');
  await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
    'view-mode-image-selected-image.png');
});

mainTest(qase([1787],'CO-389 Copy layout and paste'), async ({page, browserName}) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await designPanelPage.changeHeightAndWidthForLayer('200', '200');
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  layersPanelPage = new LayersPanelPage(newPage);
  await viewModePage.openInspectTab();
  await viewModePage.copyWidth();
  await expect(viewModePage.rightSidebar).toHaveScreenshot(
    'view-mode-copy-width-image.png');
  await viewModePage.checkBuffer('width: 200px;', newPage, browserName);
});

mainTest(qase([705],'CO-384 Edit file'), async ({page, browserName}) => {
  if(browserName === 'webkit'){

  } else {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();

    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    layersPanelPage = new LayersPanelPage(newPage);

    await viewModePage.clickEditButton();
    await newPage.waitForTimeout(200);
    await viewModePage.isPageSwitched(newPage);

    await page.close();
    await viewModePage.clickEditButton();
    const oldPage = await viewModePage.clickEditButton(false);
    mainPage = new MainPage(oldPage);
    teamPage = new TeamPage(oldPage);
    await mainPage.waitForViewportVisible();
    await expect(mainPage.viewport).toHaveScreenshot(
      'main-page-opened.png',
    );
  }
});
