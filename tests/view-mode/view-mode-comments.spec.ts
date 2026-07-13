import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let viewModePage: ViewModePage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  viewModePage = new ViewModePage(page);
  await mainTest.slow();
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([701], 'Create comment'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
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

mainTest(qase([709], 'Reply comment'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
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

mainTest(qase([710], 'Edit comment'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
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
  await commentsPanelPage.clickCommentThreadIconByNumber('1');
  await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
  await expect(newPage).toHaveScreenshot('comment-edited.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([711], 'Delete thread'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await viewModePage.clickCommentsButton();
  await viewModePage.addComment();

  const commentsPanelPage = new CommentsPanelPage(newPage);
  await commentsPanelPage.enterCommentText('Test Comment');
  await commentsPanelPage.clickPostCommentButton();

  await commentsPanelPage.clickCommentHeaderOptionsButton();
  await commentsPanelPage.clickDeleteCommentOption();
  await commentsPanelPage.clickDeleteThreadButton();
  await commentsPanelPage.isCommentThreadIconNotDisplayed();
  await expect(newPage).toHaveScreenshot('comment-removed.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});

mainTest(qase([703], 'Comments dropdown (Hide resolved comments)'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
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

mainTest(qase([704], 'Comments dropdown (Show comments list)'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
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
  await expect(viewModePage.commentsRightPanel).toHaveScreenshot(
    'comments-list.png',
    {
      mask: [commentsPanelPage.commentsAuthorSection],
    },
  );
  await viewModePage.openCommentsDropdown();
  await viewModePage.selectShowCommentsListOption();
  await viewModePage.isCommentInListVisible(false);
  await expect(newPage).toHaveScreenshot('comments-list-hidden.png', {
    mask: [commentsPanelPage.commentsAuthorSection],
  });
});
