/**
 * The filter is kept in the browser's localStorage (fresh per test context); a demo
 * account just gives each run its own clean account and file.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';

let commentsPanelPage: CommentsPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  commentsPanelPage = new CommentsPanelPage(page);
});

demoAccountFileTest(
  qase([1242], 'Use comment filters (Hide resolved comments)'),
  async ({ page, mainPage, dashboardPage }) => {
    let fileWithCommentsUrl = '';

    await demoAccountFileTest.step(
      'Setup: create two comments and resolve one of them',
      async () => {
        fileWithCommentsUrl = page.url();
        await commentsPanelPage.clickCreateCommentButton();
        await mainPage.clickViewportByCoordinates(200, 200, 2);
        await commentsPanelPage.postComment('Pending comment');
        await commentsPanelPage.checkCommentCountInList(1);
        await mainPage.clickViewportByCoordinates(600, 200, 2);
        await commentsPanelPage.postComment('Resolved comment');
        await commentsPanelPage.checkCommentCountInList(2);
        await commentsPanelPage.clickResolveCommentCheckbox();
        await mainPage.clickViewportByCoordinates(900, 700);
      },
    );

    await demoAccountFileTest.step(
      'Both comments are shown on the canvas and in the Comments panel',
      async () => {
        await commentsPanelPage.checkCommentCount(2);
        await commentsPanelPage.checkCommentCountInList(2);
      },
    );

    await demoAccountFileTest.step(
      'Open the filter → only "Show all comments" is checked',
      async () => {
        await commentsPanelPage.openCommentsFilter();
        await commentsPanelPage.isCommentsFilterOptionChecked('Show all comments');
        await commentsPanelPage.isCommentsFilterOptionChecked(
          'Show only your comments',
          false,
        );
        await commentsPanelPage.isCommentsFilterOptionChecked(
          'Show only your mentions',
          false,
        );
        await commentsPanelPage.isCommentsFilterOptionChecked(
          'Hide resolved comments',
          false,
        );
      },
    );

    await demoAccountFileTest.step(
      'Click "Hide resolved comments" → the menu closes and only the pending comment is shown',
      async () => {
        await commentsPanelPage.selectCommentsFilterOption('Hide resolved comments');
        await commentsPanelPage.checkCommentCount(1);
        await commentsPanelPage.checkCommentCountInList(1);
        await commentsPanelPage.isCommentDisplayedInCommentsPanel('Pending comment');
      },
    );

    await demoAccountFileTest.step(
      'Open the filter again → "Show all comments" and "Hide resolved comments" are checked',
      async () => {
        await commentsPanelPage.openCommentsFilter();
        await commentsPanelPage.isCommentsFilterOptionChecked('Show all comments');
        await commentsPanelPage.isCommentsFilterOptionChecked(
          'Hide resolved comments',
        );
      },
    );

    await demoAccountFileTest.step(
      'Reload the page → the resolved comment is still hidden',
      async () => {
        await page.reload();
        await mainPage.isMainPageLoaded();
        await commentsPanelPage.pressCommentsPanelShortcut();
        await commentsPanelPage.checkCommentCount(1);
        await commentsPanelPage.checkCommentCountInList(1);
      },
    );

    await demoAccountFileTest.step(
      'Open a new file and the comments filter → "Hide resolved comments" is still checked',
      async () => {
        await mainPage.backToDashboardFromFileEditor('Personal Projects');
        await dashboardPage.openSidebarItem('Drafts');
        await dashboardPage.createFileViaTitlePanel();
        await mainPage.isMainPageLoaded();
        await commentsPanelPage.pressCommentsPanelShortcut();
        await commentsPanelPage.openCommentsFilter();
        await commentsPanelPage.isCommentsFilterOptionChecked(
          'Hide resolved comments',
        );
      },
    );

    await demoAccountFileTest.step(
      'Uncheck "Hide resolved comments" and go back to the file with comments → both comments are shown',
      async () => {
        await commentsPanelPage.selectCommentsFilterOption('Hide resolved comments');
        await page.goto(fileWithCommentsUrl);
        await mainPage.isMainPageLoaded();
        await commentsPanelPage.pressCommentsPanelShortcut();
        await commentsPanelPage.checkCommentCount(2);
        await commentsPanelPage.checkCommentCountInList(2);
      },
    );
  },
);
