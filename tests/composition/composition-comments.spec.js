const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { random } = require('../../helpers/string-generator');
const { CommentsPanelPage } = require('../../pages/workspace/comments-panel-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { waitMessage } = require('../../helpers/gmail');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');

const teamName = random().concat('autotest');
let mainProfileName = '';

let teamPage,
  dashboardPage,
  profilePage,
  mainPage,
  commentsPanelPage,
  loginPage,
  registerPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
  commentsPanelPage = new CommentsPanelPage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  mainProfileName = await profilePage.getUserName();
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    const commentText = 'Test Comment';
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(commentText);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(commentText);
  });

  mainTest(qase([1219], 'Create comment (Toolbar)'), async ({ page }) => {
    const comment = 'Test Comment';
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
  });

  mainTest(
    qase([1226], 'Reply comment with valid text using Latin alphabet'),
    async ({ page }) => {
      const replyComment =
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry';
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

  mainTest.fixme(
    qase([1231], 'Edit comment with valid text using Latin alphabet'),
    async ({ page }) => {
      // FIXME: Comment context menu doesn't appear in automated environment
      // The Options button click is successful but the context menu with Edit/Delete options
      // doesn't render properly, preventing access to edit functionality
      const editedComment = 'Edited Test Comment';
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
      await expect(page).toHaveScreenshot('comment-edited.png', {
        mask: [
          page.locator('[class*="comments__thread-group"]'),
          page.locator('div[data-theme="dark"] div[style*="position: absolute"]'),
        ],
      });
    },
  );

  mainTest.fixme(qase([1236], 'Delete thread'), async ({ page }) => {
    // FIXME: Comment context menu doesn't appear in automated environment
    // The Options button click is successful but the context menu with Edit/Delete options
    // doesn't render properly, preventing access to delete thread functionality
    await commentsPanelPage.clickCommentOptionsButton();
    await commentsPanelPage.clickDeleteCommentOption();
    await commentsPanelPage.clickDeleteThreadButton();
    await commentsPanelPage.isCommentNotDisplayedInCommentsPanel('Test Comment');
    await expect(page).toHaveScreenshot('comment-deleted.png', {
      mask: [
        page.locator('[class*="comments__thread-group"]'),
        page.locator('div[data-theme="dark"] div[style*="position: absolute"]'),
      ],
    });
  });

  mainTest(qase([1240], 'Resolve comment'), async ({ page }) => {
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
  qase([1221], 'Post comment with valid text using Latin alphabet'),
  async ({ page }) => {
    const comment =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
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

mainTest(qase([2148], 'Zoom out and check comment bubbles'), async () => {
  const comment = 'Test Comment';
  const xAxisCommentsCoordinates = [100, 50, 700];
  const yAxisCommentsCoordinates = [150, 50, 700];

  await mainPage.pressCKeyboardShortcut();
  for (let i = 0; i < xAxisCommentsCoordinates.length; i++) {
    await mainPage.clickViewportByCoordinates(
      xAxisCommentsCoordinates[i],
      yAxisCommentsCoordinates[i],
      2,
    );
    await commentsPanelPage.enterCommentText(comment);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.checkCommentCountInList(i + 1);
  }
  await commentsPanelPage.areCommentBubblesVisible(['1', '2', '3']);
  await mainPage.zoom(100, 100, 3);
  await commentsPanelPage.areCommentBubblesVisible(['1-2', '3']);
  await mainPage.zoom(100, 100, 5);
  await commentsPanelPage.areCommentBubblesVisible(['1-2-3']);
});

mainTest.describe(() => {
  mainTest.fixme(
    qase(
      [2052, 2097],
      'Click "Mark All as Read" icon in notifications section if there are 10 unread notifications',
    ),
    // Fixme: Gmail API invalid_grant errors prevent invitation email testing
    async ({ page }) => {
      await mainTest.slow();
      const firstViewer = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstViewer}@gmail.com`;
      const numberOfComments = 10;

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
      await registerPage.registerAccount(
        firstViewer,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await teamPage.switchTeam(teamName);
      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();

      await commentsPanelPage.clickCreateCommentButton();
      for (let i = 0; i < numberOfComments; i++) {
        await mainPage.zoom(10, 10, 3);
        await mainPage.clickViewportByCoordinates(600, 300, 2);
        await commentsPanelPage.clickCommentMentionButton();
        await commentsPanelPage.clickFirstMentionMenuItem();
        await commentsPanelPage.clickPostCommentButton();
      }
      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();

      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await teamPage.switchTeam(teamName);
      // PENPOT-2052
      await dashboardPage.isUnreadNotificationVisible();
      // PENPOT-2097
      await dashboardPage.clickOnNotificationButton();
      await dashboardPage.clickOnNotificationMarkAsReadButton();
      await dashboardPage.isUnreadNotificationVisible(false);
      await dashboardPage.isMarkedAllNotifsAsReadMessage();
      await dashboardPage.clickOnNotificationButton();
      await dashboardPage.isNoNotificationsMessagePresent();
    },
  );

  mainTest.fixme(
    qase([2057], 'Click Notification in the pop-up'),
    // Fixme: Gmail API invalid_grant errors prevent invitation email testing
    async ({ page }) => {
      await mainTest.slow();
      const firstEditor = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}@gmail.com`;
      const comment = 'Test Comment (main user)';
      const replyComment = 'Lorem Ipsum (editor user)';

      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();

      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstEditor,
        firstEmail,
        process.env.LOGIN_PWD,
      );
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
      await teamPage.switchTeam(teamName);

      await dashboardPage.isUnreadNotificationVisible();
      await dashboardPage.clickOnNotificationButton();

      await dashboardPage.checkNotificationReplyUserName(mainProfileName);
      await dashboardPage.checkNotificationReplyText(comment);
      await dashboardPage.checkNotificationUnreadReplyCount('1 new reply');

      await dashboardPage.clickFirstNotificationMessage();
      await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);

      await mainPage.backToDashboardFromFileEditor();
    },
  );

  mainTest.fixme(
    qase([2086], '"Only your mentions" filter'),
    // Fixme: Gmail API invalid_grant errors prevent invitation email testing
    async ({ page }) => {
      await mainTest.slow();
      const firstEditor = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}@gmail.com`;
      const comment = 'Test Comment (main user)';

      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstEditor,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await teamPage.switchTeam(teamName);
      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();

      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();

      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickCommentMentionButton();
      await commentsPanelPage.clickFirstMentionMenuItem();
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.checkCommentCountInList(1);

      await mainPage.clickViewportByCoordinates(100, 100, 2);
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.checkCommentCountInList(2);

      await mainPage.clickViewportByCoordinates(600, 100, 2);
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.checkCommentCountInList(3);

      await mainPage.clickViewportByCoordinates(100, 800, 2);
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.checkCommentCountInList(4);

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await teamPage.switchTeam(teamName);
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
    },
  );

  mainTest.fixme(
    qase([2268], 'Notification icon after mention in the comments in the workspace'),
    // Fixme: Gmail API invalid_grant errors prevent invitation email testing
    async ({ page }) => {
      await mainTest.slow();
      const firstEditor = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}@gmail.com`;
      const comment = 'Test Comment (main user)';

      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstEditor,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await teamPage.switchTeam(teamName);
      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();

      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();

      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickCommentMentionButton();
      await commentsPanelPage.clickFirstMentionMenuItem();
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.checkCommentCountInList(1);

      await mainPage.clickViewportByCoordinates(100, 100, 2);
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickCommentMentionButton();
      await commentsPanelPage.clickFirstMentionMenuItem();
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.checkCommentCountInList(2);

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await teamPage.switchTeam(teamName);
      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();

      await commentsPanelPage.isUnreadCommentIconVisible(true);
      await commentsPanelPage.clickCreateCommentButton();
      await commentsPanelPage.isCommentUnreadThreadIconVisible(true);
      await commentsPanelPage.isUnreadCommentIconVisible(true);
      await commentsPanelPage.clickOnUnreadThreadIcon();
      await commentsPanelPage.clickOnUnreadThreadIcon();
      await commentsPanelPage.isCommentReadThreadIconVisible(true);
      await commentsPanelPage.isUnreadCommentIconVisible(true);
      await commentsPanelPage.clickOnUnreadThreadIcon();
      await commentsPanelPage.clickOnUnreadThreadIcon();
      await commentsPanelPage.isCommentUnreadThreadIconVisible(false);
      await commentsPanelPage.isUnreadCommentIconVisible(false);

      await commentsPanelPage.checkCommentCount(2);
      await commentsPanelPage.checkCommentCountInList(2);
      await commentsPanelPage.isCommentDisplayedInCommentsPanel(
        comment + ` ${firstEditor}`,
      );
      await mainPage.backToDashboardFromFileEditor();
    },
  );

  mainTest.afterEach(async () => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(teamName);

    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();
  });
});
