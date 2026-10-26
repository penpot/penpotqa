import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect, Page } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';

const defaultNameBoard = 'Board';
let viewModePage: ViewModePage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  viewModePage = new ViewModePage(page);
  layersPanelPage = new LayersPanelPage(page);
  await demoAccountFileTest.slow();
  // A fixed, short name keeps the comment author inside its box (the default
  // demo name is long and changes width every run).
  await setDemoUserName(page.context().request, 'QA Tester');
  await page.reload();
  await mainPage.isMainPageLoaded();
});

demoAccountFileTest(qase([701], 'Create comment'), async ({ mainPage }) => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;
  const comment = 'Test Comment';

  await demoAccountFileTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
    newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    commentsPanelPage = new CommentsPanelPage(newPage);
  });

  await demoAccountFileTest.step(
    `Create comment "${comment}" and verify it is displayed`,
    async () => {
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      await commentsPanelPage.postComment(comment);
      await commentsPanelPage.isCommentDisplayedInPopUp(comment);
      await expect(newPage).toHaveScreenshot('comment-opened-pop-up.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    },
  );

  await demoAccountFileTest.step(
    'Close comment popup and verify thread icon',
    async () => {
      await viewModePage.clickOnViewport();
      await commentsPanelPage.isCommentThreadIconVisible();
      await expect(newPage).toHaveScreenshot('comment-closed-pop-up.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    },
  );
});

demoAccountFileTest(qase([709], 'Reply comment'), async ({ mainPage }) => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;
  const replyComment =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry';

  await demoAccountFileTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.postComment('Test Comment');
    },
  );

  await demoAccountFileTest.step(
    `Reply "${replyComment}" and verify it is displayed`,
    async () => {
      await commentsPanelPage.postComment(replyComment);
      await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      await expect(newPage).toHaveScreenshot('comment-reply.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    },
  );
});

demoAccountFileTest(qase([710], 'Edit comment'), async ({ mainPage }) => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;
  const editedComment = 'Edited Test Comment';

  await demoAccountFileTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.postComment('Test Comment');
    },
  );

  await demoAccountFileTest.step(`Edit comment to "${editedComment}"`, async () => {
    await commentsPanelPage.clickCommentOptionsButton();
    await commentsPanelPage.clickEditCommentOption();
    await commentsPanelPage.editComment(editedComment);
    await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
  });

  await demoAccountFileTest.step(
    'Reload page and verify edited comment persists',
    async () => {
      await commentsPanelPage.reloadPage();
      await commentsPanelPage.openCommentThread('1');
      await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
      await expect(newPage).toHaveScreenshot('comment-edited.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    },
  );
});

demoAccountFileTest(qase([711], 'Delete thread'), async ({ mainPage }) => {
  let newPage: Page;
  let commentsPanelPage: CommentsPanelPage;

  await demoAccountFileTest.step(
    'Create board, open view mode and post a comment',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
      newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.postComment('Test Comment');
    },
  );

  await demoAccountFileTest.step(
    'Delete comment thread and verify it is removed',
    async () => {
      await commentsPanelPage.clickCommentHeaderOptionsButton();
      await commentsPanelPage.clickDeleteCommentOption();
      await commentsPanelPage.clickDeleteThreadButton();
      await commentsPanelPage.isCommentThreadIconVisible(false);
      await expect(newPage).toHaveScreenshot('comment-removed.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    },
  );
});

demoAccountFileTest(
  qase([703], 'Comments dropdown (Hide resolved comments)'),
  async ({ mainPage }) => {
    let newPage: Page;
    let commentsPanelPage: CommentsPanelPage;

    await demoAccountFileTest.step(
      'Create board, open view mode and post a resolved comment',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
        newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
        commentsPanelPage = new CommentsPanelPage(newPage);
        await viewModePage.clickCommentsButton();
        await viewModePage.addComment();
        await commentsPanelPage.postComment('Test Comment');
        await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
        await commentsPanelPage.clickResolveCommentCheckbox();
        await commentsPanelPage.clickResolvedCommentThreadIcon();
      },
    );

    await demoAccountFileTest.step('Post a second, unresolved comment', async () => {
      await viewModePage.addComment(true);
      await commentsPanelPage.postComment('Test Comment 2');
      await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment 2');
      await viewModePage.clickCommentsButton();
    });

    await demoAccountFileTest.step('Hide resolved comments and verify', async () => {
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectHideResolvedCommentsOption();
      await commentsPanelPage.isCommentResolvedThreadIconVisible(false);
      await expect(newPage).toHaveScreenshot('resolved-comments-hidden.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    });

    await demoAccountFileTest.step(
      'Show resolved comments again and verify',
      async () => {
        await viewModePage.openCommentsDropdown();
        await viewModePage.selectHideResolvedCommentsOption();
        await commentsPanelPage.isCommentResolvedThreadIconVisible();
        await expect(newPage).toHaveScreenshot('resolved-comments-show.png', {
          mask: [
            commentsPanelPage.commentsAuthorSection,
            commentsPanelPage.commentAvatarImage,
          ],
        });
      },
    );
  },
);

demoAccountFileTest(
  qase([704], 'Comments dropdown (Show comments list)'),
  async ({ mainPage }) => {
    let newPage: Page;
    let commentsPanelPage: CommentsPanelPage;

    await demoAccountFileTest.step(
      'Create board, open view mode and post a comment',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
        newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
        commentsPanelPage = new CommentsPanelPage(newPage);
        await viewModePage.clickCommentsButton();
        await viewModePage.addComment();
        await commentsPanelPage.postComment('Test Comment');
        await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
        await viewModePage.clickOnViewport();
      },
    );

    await demoAccountFileTest.step('Show comments list and verify', async () => {
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectShowCommentsListOption();
      await viewModePage.isCommentInListVisible(true);
      await expect(viewModePage.commentsRightPanel).toHaveScreenshot(
        'comments-list.png',
        {
          mask: [
            commentsPanelPage.commentsAuthorSection,
            commentsPanelPage.commentAvatarImage,
          ],
        },
      );
    });

    await demoAccountFileTest.step('Hide comments list and verify', async () => {
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectShowCommentsListOption();
      await viewModePage.isCommentInListVisible(false);
      await expect(newPage).toHaveScreenshot('comments-list-hidden.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
    });
  },
);
