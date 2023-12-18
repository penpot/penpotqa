const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");
const { random } = require("../../helpers/string-generator");
const { CommentsPanelPage } = require("../../pages/workspace/comments-panel-page");

const teamName = random().concat("autotest");

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText("Test Comment");
    await commentsPanelPage.clickPostCommentButton();
  });

  mainTest("CO-339 Create comment from toolbar", async ({ page }) => {
    const comment = "Test Comment";
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.isCommentDisplayedInPopUp(comment);
    await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
    await expect(page).toHaveScreenshot("comment-opened-pop-up.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
    await commentsPanelPage.clickCreateCommentButton();
    await commentsPanelPage.isCommentThreadIconDisplayed();
    await expect(page).toHaveScreenshot("comment-closed-pop-up.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
  });

  mainTest(
    "CO-346 Reply comment with valid text using Latin alphabet",
    async ({ page }) => {
      const replyComment =
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry";
      const mainPage = new MainPage(page);
      const commentsPanelPage = new CommentsPanelPage(page);
      await commentsPanelPage.enterReplyText(replyComment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      await commentsPanelPage.isCommentReplyDisplayedInCommentsPanel();
      await expect(page).toHaveScreenshot("comment-reply.png", {
        mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
      });
    },
  );

  mainTest(
    "CO-351 Edit comment with valid text using Latin alphabet",
    async ({ page }) => {
      const editedComment = "Edited Test Comment";
      const mainPage = new MainPage(page);
      const commentsPanelPage = new CommentsPanelPage(page);
      await commentsPanelPage.clickCommentOptionsButton();
      await commentsPanelPage.clickEditCommentOption();
      await commentsPanelPage.enterCommentText(editedComment, true);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
      await mainPage.reloadPage();
      await commentsPanelPage.clickCreateCommentButton();
      await commentsPanelPage.isCommentDisplayedInCommentsPanel(editedComment);
      await commentsPanelPage.clickCommentThreadIcon();
      await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
      await expect(page).toHaveScreenshot("comment-edited.png", {
        mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
      });
    },
  );

  mainTest("CO-356 Delete thread", async ({ page }) => {
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickCommentOptionsButton();
    await commentsPanelPage.clickDeleteCommentOption();
    await commentsPanelPage.clickDeleteThreadButton();
    await commentsPanelPage.isCommentThreadIconNotDisplayed();
    await commentsPanelPage.isCommentsPanelPlaceholderDisplayed(
      "You're all caught up! New comment notifications will appear here.",
    );
    await expect(page).toHaveScreenshot("comment-removed.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
  });

  mainTest("CO-360 Resolve comment", async ({ page }) => {
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickResolveCommentCheckbox();
    await commentsPanelPage.clickCreateCommentButton();
    await commentsPanelPage.isCommentResolvedThreadIconDisplayed();
    await expect(page).toHaveScreenshot("comment-resolved-closed-pop-up.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
    await commentsPanelPage.clickResolvedCommentThreadIcon();
    await commentsPanelPage.isResolveCommentCheckboxSelected();
    await expect(page).toHaveScreenshot("comment-resolved-opened-pop-up.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
  });
});

mainTest(
  "CO-341 Post comment with valid text using Latin alphabet",
  async ({ page }) => {
    const comment =
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(comment);
    await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
    await expect(page).toHaveScreenshot("comment-latin-opened-pop-up.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
    await commentsPanelPage.clickCreateCommentButton();
    await commentsPanelPage.isCommentThreadIconDisplayed();
    await expect(page).toHaveScreenshot("comment-latin-closed-pop-up.png", {
      mask: [commentsPanelPage.commentsAuthorSection, mainPage.usersSection],
    });
  },
);
