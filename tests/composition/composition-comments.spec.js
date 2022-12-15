const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("CO-339 Create comment from toolbar", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateCommentButton();
  await mainPage.clickViewportTwice();
  await mainPage.enterCommentText("Test Comment");
  await mainPage.clickPostCommentButton();
  await mainPage.isCommentDisplayedInPopUp("Test Comment");
  await mainPage.isCommentDisplayedInCommentsPanel("Test Comment");
  await expect(page).toHaveScreenshot("comment-opened-pop-up.png", {
    mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    maxDiffPixels: 5,
  });
  await mainPage.clickCreateCommentButton();
  await mainPage.isCommentThreadIconDisplayed();
  await expect(page).toHaveScreenshot("comment-closed-pop-up.png", {
    mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    maxDiffPixels: 5,
  });
});

mainTest(
  "CO-341 Post comment with valid text using Latin alphabet",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await mainPage.enterCommentText(
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    );
    await mainPage.clickPostCommentButton();
    await mainPage.isCommentDisplayedInPopUp(
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    );
    await mainPage.isCommentDisplayedInCommentsPanel(
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    );
    await expect(page).toHaveScreenshot("comment-latin-opened-pop-up.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 5,
    });
    await mainPage.clickCreateCommentButton();
    await mainPage.isCommentThreadIconDisplayed();
    await expect(page).toHaveScreenshot("comment-latin-closed-pop-up.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 5,
    });
  }
);

mainTest(
  "CO-346 Reply comment with valid text using Latin alphabet",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await mainPage.enterCommentText("Test Comment");
    await mainPage.clickPostCommentButton();
    await mainPage.clickViewportByCoordinates(600, 400);
    await mainPage.clickCommentThreadIcon();
    await mainPage.enterReplyText(
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry"
    );
    await mainPage.clickPostCommentButton();
    await mainPage.isCommentReplyDisplayedInPopUp(
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry"
    );
    await mainPage.isCommentReplyDisplayedInCommentsPanel();
    await expect(page).toHaveScreenshot("comment-reply.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 5,
    });
  }
);

mainTest(
  "CO-351 Edit comment with valid text using Latin alphabet",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await mainPage.enterCommentText("Test Comment");
    await mainPage.clickPostCommentButton();
    await mainPage.clickViewportByCoordinates(600, 400);
    await mainPage.clickCommentThreadIcon();
    await mainPage.clickCommentOptionsButton();
    await mainPage.clickEditCommentOption();
    await mainPage.clearCommentInput();
    await mainPage.enterCommentText("Edited Test Comment");
    await mainPage.clickPostCommentButton();
    await mainPage.isCommentDisplayedInPopUp("Edited Test Comment");
    await mainPage.reloadPage();
    await mainPage.clickCreateCommentButton();
    await mainPage.isCommentDisplayedInCommentsPanel("Edited Test Comment");
    await mainPage.clickCommentThreadIcon();
    await mainPage.isCommentDisplayedInPopUp("Edited Test Comment");
    await expect(page).toHaveScreenshot("comment-edited.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 5,
    });
  }
);

mainTest("CO-356 Delete thread", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateCommentButton();
  await mainPage.clickViewportTwice();
  await mainPage.enterCommentText("Test Comment");
  await mainPage.clickPostCommentButton();
  await mainPage.clickViewportByCoordinates(600, 400);
  await mainPage.clickCommentThreadIcon();
  await mainPage.clickCommentOptionsButton();
  await mainPage.clickDeleteCommentOption();
  await mainPage.clickDeleteThreadButton();
  await mainPage.isCommentThreadIconNotDisplayed();
  await mainPage.isCommentsPanelPlaceholderDisplayed(
    "You have no pending comment notifications"
  );
  await expect(page).toHaveScreenshot("comment-removed.png", {
    mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    maxDiffPixels: 5,
  });
});

mainTest("CO-360 Resolve comment", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateCommentButton();
  await mainPage.clickViewportTwice();
  await mainPage.enterCommentText("Test Comment");
  await mainPage.clickPostCommentButton();
  await mainPage.clickResolveCommentCheckbox();
  await mainPage.clickCreateCommentButton();
  await mainPage.isCommentResolvedThreadIconDisplayed();
  await expect(page).toHaveScreenshot("comment-resolved-closed-pop-up.png", {
    mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    maxDiffPixels: 5,
  });
  await mainPage.clickResolvedCommentThreadIcon();
  await mainPage.isResolveCommentCheckboxSelected();
  await expect(page).toHaveScreenshot("comment-resolved-opened-pop-up.png", {
    mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    maxDiffPixels: 5,
  });
});
