const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { CommentsPanelPage } = require('../../pages/workspace/comments-panel-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { waitMessage } = require('../../helpers/gmail');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');

const teamName = random().concat('autotest');

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ page }) => {
    const commentText = 'Test Comment';
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(commentText);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(commentText);
  });

  mainTest(
    qase([554, 1219], 'CO-339 Create comment from toolbar'),
    async ({ page }) => {
      const comment = 'Test Comment';
      const mainPage = new MainPage(page);
      const commentsPanelPage = new CommentsPanelPage(page);
      await commentsPanelPage.isCommentDisplayedInPopUp(comment);
      await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
      await expect(page).toHaveScreenshot('comment-opened-pop-up.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          mainPage.usersSection,
          mainPage.toolBarWindow,
        ],
      });
      await mainPage.clickViewportOnce();
      await commentsPanelPage.isCommentThreadIconDisplayed();
      await expect(page).toHaveScreenshot('comment-closed-pop-up.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          mainPage.usersSection,
          mainPage.toolBarWindow,
        ],
      });
    },
  );

  mainTest(
    qase([561, 1226], 'CO-346 Reply comment with valid text using Latin alphabet'),
    async ({ page }) => {
      const replyComment =
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry';
      const mainPage = new MainPage(page);
      const commentsPanelPage = new CommentsPanelPage(page);
      await commentsPanelPage.enterReplyText(replyComment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      await commentsPanelPage.isCommentReplyDisplayedInCommentsPanel();
      await expect(page).toHaveScreenshot('comment-reply.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          mainPage.usersSection,
          mainPage.toolBarWindow,
        ],
      });
    },
  );

  mainTest(
    qase([566, 1231], 'CO-351 Edit comment with valid text using Latin alphabet'),
    async ({ page, browserName }) => {
      const editedComment = 'Edited Test Comment';
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
      await commentsPanelPage.clickCommentThreadIcon(browserName);
      await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
      await expect(page).toHaveScreenshot('comment-edited.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          mainPage.usersSection,
          mainPage.toolBarWindow,
        ],
      });
    },
  );

  mainTest(qase([571, 1236], 'CO-356 Delete thread'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickCommentHeaderOptionsButton();
    await commentsPanelPage.clickDeleteCommentOption();
    await commentsPanelPage.clickDeleteThreadButton();
    await commentsPanelPage.isCommentThreadIconNotDisplayed();
    await commentsPanelPage.isCommentsPanelPlaceholderDisplayed(
      "You're all caught up! New comment notifications will appear here.",
    );
    await expect(page).toHaveScreenshot('comment-removed.png', {
      mask: [
        commentsPanelPage.commentsAuthorSection,
        mainPage.usersSection,
        mainPage.toolBarWindow,
      ],
    });
  });

  mainTest(qase([575, 1240], 'CO-360 Resolve comment'), async ({ page }) => {
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickResolveCommentCheckbox();
    await mainPage.clickViewportOnce();
    await commentsPanelPage.isCommentResolvedThreadIconDisplayed();
    await expect(page).toHaveScreenshot('comment-resolved-closed-pop-up.png', {
      mask: [
        commentsPanelPage.commentsAuthorSection,
        mainPage.usersSection,
        mainPage.toolBarWindow,
      ],
    });
    await commentsPanelPage.clickResolvedCommentThreadIcon();
    await commentsPanelPage.isResolveCommentCheckboxSelected();
    await expect(page).toHaveScreenshot('comment-resolved-opened-pop-up.png', {
      mask: [
        commentsPanelPage.commentsAuthorSection,
        mainPage.usersSection,
        mainPage.toolBarWindow,
      ],
    });
  });
});

mainTest(
  qase([556, 1221], 'CO-341 Post comment with valid text using Latin alphabet'),
  async ({ page }) => {
    const comment =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const mainPage = new MainPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(comment);
    await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
    await expect(page).toHaveScreenshot('comment-latin-opened-pop-up.png', {
      mask: [
        commentsPanelPage.commentsAuthorSection,
        mainPage.usersSection,
        mainPage.toolBarWindow,
      ],
    });
    await mainPage.clickViewportOnce();
    await commentsPanelPage.isCommentThreadIconDisplayed();
    await expect(page).toHaveScreenshot('comment-latin-closed-pop-up.png', {
      mask: [
        commentsPanelPage.commentsAuthorSection,
        mainPage.usersSection,
        mainPage.toolBarWindow,
      ],
    });
  },
);

mainTest.describe(() => {
  mainTest(
    qase(2052, 'Notification icon after mention in the comments'),
    async ({ page }) => {
      await mainTest.slow();
      const firstViewer = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstViewer}@gmail.com`;
      const comment = 'Test Comment (main user)';

      const mainPage = new MainPage(page);
      const teamPage = new TeamPage(page);
      const profilePage = new ProfilePage(page);
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      const dashboardPage = new DashboardPage(page);
      const commentsPanelPage = new CommentsPanelPage(page);

      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Viewer');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstViewer);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();

      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();

      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickCommentMentionButton();
      await commentsPanelPage.clickFirstMentionMenuItem();
      await commentsPanelPage.clickPostCommentButton();

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isUnreadNotificationVisible();
    },
  );

  mainTest(qase(2057, 'Click Notification in the pop-up'), async ({ page }) => {
    await mainTest.slow();
    const firstEditor = random().concat('autotest');
    const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}@gmail.com`;
    const comment = 'Test Comment (main user)';
    const replyComment = 'Lorem Ipsum (editor user)';
    const mainProfile = 'QA Engineer';

    const mainPage = new MainPage(page);
    const teamPage = new TeamPage(page);
    const profilePage = new ProfilePage(page);
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);

    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();

    await mainPage.backToDashboardFromFileEditor();

    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
    await teamPage.selectInvitationRoleInPopUp('Editor');
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    const firstInvite = await waitMessage(page, firstEmail, 40);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await page.goto(firstInvite.inviteUrl);
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(firstEmail);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();
    await registerPage.enterFullName(firstEditor);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.isTeamSelected(teamName);

    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();

    await commentsPanelPage.clickCreateCommentButton();
    await commentsPanelPage.clickCommentThreadIcon();
    await commentsPanelPage.enterReplyText(replyComment);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);

    await mainPage.backToDashboardFromFileEditor();

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();

    await dashboardPage.isUnreadNotificationVisible();
    await dashboardPage.clickOnNotificationButton();

    await dashboardPage.checkNotificationReplyUserName(mainProfile);
    await dashboardPage.checkNotificationReplyText(comment);
    await dashboardPage.checkNotificationUnreadReplyCount('1 new reply');

    await dashboardPage.clickFirstNotificationMessage();
    await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);

    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(2086, 'Only your mentions filter'), async ({ page }) => {
    await mainTest.slow();
    const firstEditor = random().concat('autotest');
    const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}@gmail.com`;
    const comment = 'Test Comment (main user)';

    const mainPage = new MainPage(page);
    const teamPage = new TeamPage(page);
    const profilePage = new ProfilePage(page);
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const commentsPanelPage = new CommentsPanelPage(page);

    await mainPage.backToDashboardFromFileEditor();

    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
    await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
    await teamPage.selectInvitationRoleInPopUp('Editor');
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    const firstInvite = await waitMessage(page, firstEmail, 40);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await page.goto(firstInvite.inviteUrl);
    await registerPage.isRegisterPageOpened();
    await registerPage.enterEmail(firstEmail);
    await registerPage.enterPassword(process.env.LOGIN_PWD);
    await registerPage.clickOnCreateAccountBtn();
    await registerPage.enterFullName(firstEditor);
    await registerPage.clickOnAcceptTermsCheckbox();
    await registerPage.clickOnCreateAccountSecondBtn();
    await dashboardPage.fillOnboardingQuestions();
    await teamPage.isTeamSelected(teamName);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();

    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();

    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickCommentMentionButton();
    await commentsPanelPage.clickFirstMentionMenuItem();
    await commentsPanelPage.clickPostCommentButton();

    await mainPage.clickViewportByCoordinates(100, 100, 2);
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();

    await mainPage.clickViewportByCoordinates(600, 100, 2);
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();

    await mainPage.clickViewportByCoordinates(100, 800, 2);
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();

    await mainPage.backToDashboardFromFileEditor();
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(firstEmail);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();

    await commentsPanelPage.clickCreateCommentButton();
    await commentsPanelPage.selectShowYourMentionsOption();

    await commentsPanelPage.checkCommentCount(1);
    await commentsPanelPage.checkCommentCountInList(1);
    await commentsPanelPage.isCommentDisplayedInCommentsPanel(
      comment + ` ${firstEditor}`,
    );
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest.afterEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    const profilePage = new ProfilePage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();
  });
});
