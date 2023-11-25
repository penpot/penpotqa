const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { expect, test} = require("@playwright/test");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");
const { random } = require("../../helpers/string-generator");

const teamName = random().concat('autotest');

test.beforeEach( async ({ page }) => {
    const teamPage = new TeamPage(page);
    const dashboardPage = new DashboardPage(page);
    const mainPage = new MainPage(page);
    await teamPage.createTeam(teamName);
    await dashboardPage.deleteProjectsIfExist();
    await dashboardPage.deleteFilesIfExist();
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    });

test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    const mainPage = new MainPage(page);
    await mainPage.backToDashboardFromFileEditor();
    await teamPage.deleteTeam(teamName);
});

mainTest(
  "CO-339 Create comment from toolbar",
  async ({ page, browserName }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await mainPage.enterCommentText("Test Comment");
    await mainPage.clickPostCommentButton();
    await mainPage.isCommentDisplayedInPopUp("Test Comment");
    await mainPage.isCommentDisplayedInCommentsPanel("Test Comment");
    if (browserName === "chromium") {
      await expect(page).toHaveScreenshot("comment-opened-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      });
    } else {
      await expect(page).toHaveScreenshot("comment-opened-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
        maxDiffPixels: 10,
      });
    }
    await mainPage.clickCreateCommentButton();
    await mainPage.isCommentThreadIconDisplayed();
    if (browserName === "chromium") {
      await expect(page).toHaveScreenshot("comment-closed-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      });
    } else {
      await expect(page).toHaveScreenshot("comment-closed-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
        maxDiffPixels: 10,
      });
    }
  }
);

mainTest(
  "CO-341 Post comment with valid text using Latin alphabet",
  async ({ page, browserName }) => {
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
    if (browserName === "chromium") {
      await expect(page).toHaveScreenshot("comment-latin-opened-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      });
    } else {
      await expect(page).toHaveScreenshot("comment-latin-opened-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
        maxDiffPixels: 10,
      });
    }
    await mainPage.clickCreateCommentButton();
    await mainPage.isCommentThreadIconDisplayed();
    if (browserName === "chromium") {
      await expect(page).toHaveScreenshot("comment-latin-closed-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      });
    } else {
      await expect(page).toHaveScreenshot("comment-latin-closed-pop-up.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
        maxDiffPixels: 10,
      });
    }
  }
);

mainTest(
  "CO-346 Reply comment with valid text using Latin alphabet",
  async ({ page, browserName }) => {
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
    if (browserName === "chromium") {
      await expect(page).toHaveScreenshot("comment-reply.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      });
    } else {
      await expect(page).toHaveScreenshot("comment-reply.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
        maxDiffPixels: 10,
      });
    }
  }
);

mainTest(
  "CO-351 Edit comment with valid text using Latin alphabet",
  async ({ page, browserName }) => {
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
    if (browserName === "chromium") {
      await expect(page).toHaveScreenshot("comment-edited.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      });
    } else {
      await expect(page).toHaveScreenshot("comment-edited.png", {
        mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
        maxDiffPixels: 10,
      });
    }
  }
);

mainTest("CO-356 Delete thread", async ({ page, browserName }) => {
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
    "You're all caught up! New comment notifications will appear here."
  );
  if (browserName === "chromium") {
    await expect(page).toHaveScreenshot("comment-removed.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    });
  } else {
    await expect(page).toHaveScreenshot("comment-removed.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 10,
    });
  }
});

mainTest("CO-360 Resolve comment", async ({ page, browserName }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateCommentButton();
  await mainPage.clickViewportTwice();
  await mainPage.enterCommentText("Test Comment");
  await mainPage.clickPostCommentButton();
  await mainPage.clickResolveCommentCheckbox();
  await mainPage.clickCreateCommentButton();
  await mainPage.isCommentResolvedThreadIconDisplayed();
  if (browserName === "chromium") {
    await expect(page).toHaveScreenshot("comment-resolved-closed-pop-up.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    });
  } else {
    await expect(page).toHaveScreenshot("comment-resolved-closed-pop-up.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 10,
    });
  }
  await mainPage.clickResolvedCommentThreadIcon();
  await mainPage.isResolveCommentCheckboxSelected();
  if (browserName === "chromium") {
    await expect(page).toHaveScreenshot("comment-resolved-opened-pop-up.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
    });
  } else {
    await expect(page).toHaveScreenshot("comment-resolved-opened-pop-up.png", {
      mask: [mainPage.commentsAuthorSection, mainPage.usersSection],
      maxDiffPixels: 10,
    });
  }
});
