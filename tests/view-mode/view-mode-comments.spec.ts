import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { expect, Page } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

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
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;
  const comment = 'Test Comment';

  await mainTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    commentsPanelPage = new CommentsPanelPage(newPage);
  });

  await mainTest.step(
    `Create comment "${comment}" and verify it is displayed`,
    async () => {
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp(comment);
      await expect(newPage).toHaveScreenshot('comment-opened-pop-up.png', {
        mask: [commentsPanelPage.commentsAuthorSection],
      });
    },
  );

  await mainTest.step('Close comment popup and verify thread icon', async () => {
    await viewModePage.clickOnViewport();
    await commentsPanelPage.isCommentThreadIconDisplayed();
    await expect(newPage).toHaveScreenshot('comment-closed-pop-up.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });
});

mainTest(qase([709], 'Reply comment'), async () => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;
  const replyComment =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry';

  await mainTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
    },
  );

  await mainTest.step(
    `Reply "${replyComment}" and verify it is displayed`,
    async () => {
      await commentsPanelPage.enterReplyText(replyComment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      await expect(newPage).toHaveScreenshot('comment-reply.png', {
        mask: [commentsPanelPage.commentsAuthorSection],
      });
    },
  );
});

mainTest(qase([710], 'Edit comment'), async () => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;
  const editedComment = 'Edited Test Comment';

  await mainTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
    },
  );

  await mainTest.step(`Edit comment to "${editedComment}"`, async () => {
    await commentsPanelPage.clickCommentOptionsButton();
    await commentsPanelPage.clickEditCommentOption();
    await commentsPanelPage.enterCommentText(editedComment, true);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
  });

  await mainTest.step('Reload page and verify edited comment persists', async () => {
    await commentsPanelPage.reloadPage();
    await commentsPanelPage.clickCommentThreadIconByNumber('1');
    await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
    await expect(newPage).toHaveScreenshot('comment-edited.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });
});

mainTest(qase([711], 'Delete thread'), async () => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;

  await mainTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
    },
  );

  await mainTest.step('Delete comment thread and verify it is removed', async () => {
    await commentsPanelPage.clickCommentHeaderOptionsButton();
    await commentsPanelPage.clickDeleteCommentOption();
    await commentsPanelPage.clickDeleteThreadButton();
    await commentsPanelPage.isCommentThreadIconNotDisplayed();
    await expect(newPage).toHaveScreenshot('comment-removed.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });
});

mainTest(qase([703], 'Comments dropdown (Hide resolved comments)'), async () => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;

  await mainTest.step(
    'Create board, open view mode and post a resolved comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      commentsPanelPage = new CommentsPanelPage(newPage);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
      await commentsPanelPage.clickResolveCommentCheckbox();
      await commentsPanelPage.clickResolvedCommentThreadIcon();
    },
  );

  await mainTest.step('Post a second, unresolved comment', async () => {
    await viewModePage.addComment(true);
    await commentsPanelPage.enterCommentText('Test Comment 2');
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment 2');
    await viewModePage.clickCommentsButton();
  });

  await mainTest.step('Hide resolved comments and verify', async () => {
    await viewModePage.openCommentsDropdown();
    await viewModePage.selectHideResolvedCommentsOption();
    await commentsPanelPage.isCommentResolvedThreadIconNotDisplayed();
    await expect(newPage).toHaveScreenshot('resolved-comments-hidden.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });

  await mainTest.step('Show resolved comments again and verify', async () => {
    await viewModePage.openCommentsDropdown();
    await viewModePage.selectHideResolvedCommentsOption();
    await commentsPanelPage.isCommentResolvedThreadIconDisplayed();
    await expect(newPage).toHaveScreenshot('resolved-comments-show.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });
});

mainTest(qase([704], 'Comments dropdown (Show comments list)'), async () => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;

  await mainTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      commentsPanelPage = new CommentsPanelPage(newPage);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
      await viewModePage.clickOnViewport();
    },
  );

  await mainTest.step('Show comments list and verify', async () => {
    await viewModePage.openCommentsDropdown();
    await viewModePage.selectShowCommentsListOption();
    await viewModePage.isCommentInListVisible(true);
    await expect(viewModePage.commentsRightPanel).toHaveScreenshot(
      'comments-list.png',
      {
        mask: [commentsPanelPage.commentsAuthorSection],
      },
    );
  });

  await mainTest.step('Hide comments list and verify', async () => {
    await viewModePage.openCommentsDropdown();
    await viewModePage.selectShowCommentsListOption();
    await viewModePage.isCommentInListVisible(false);
    await expect(newPage).toHaveScreenshot('comments-list-hidden.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });
});
