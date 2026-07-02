import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import {
  getVerificationMessage,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { random } from 'helpers/string-generator';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let mainProfileName = '';

let commentsPanelPage: CommentsPanelPage;
let dashboardPage: DashboardPage;
let loginPage: LoginPage;
let mainPage: MainPage;
let profilePage: ProfilePage;
let registerPage: RegisterPage;
let teamPage: TeamPage;

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

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    const commentText = 'Test Comment';
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(commentText);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(commentText);
  });

  mainTest(
    qase([1219, 3069], 'Create comment (Toolbar) and Hide/Show it from Main Menu'),
    async ({ page }) => {
      await mainTest.step('1219, Create comment (Toolbar)', async () => {
        const comment = 'Test Comment';

        await mainTest.step(
          'Verify comment is displayed in pop-up and panel',
          async () => {
            await commentsPanelPage.isCommentDisplayedInPopUp(comment);
            await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);

            await mainPage.hideRulersViaMainMenu();
            await expect(page).toHaveScreenshot('comment-opened-pop-up.png', {
              mask: mainPage.maskViewport({ usersSection: true }, [
                commentsPanelPage.commentsAuthorSection,
                commentsPanelPage.commentAvatarImage,
              ]),
            });
          },
        );

        await mainTest.step(
          'Close pop-up and verify thread icon is displayed',
          async () => {
            await mainPage.clickViewportOnce();
            await commentsPanelPage.isCommentThreadIconDisplayed();
            await expect(page).toHaveScreenshot('comment-closed-pop-up.png', {
              mask: mainPage.maskViewport({ usersSection: true }, [
                commentsPanelPage.commentsAuthorSection,
                commentsPanelPage.commentAvatarImage,
              ]),
            });
          },
        );
      });

      await mainTest.step('3069, Hide/show comments via main menu', async () => {
        await mainTest.step('Exit from the comments panel', async () => {
          await commentsPanelPage.clickCreateCommentButton();
        });

        await mainTest.step('Click on Main menu/View/Hide comments', async () => {
          await commentsPanelPage.isCommentAvatarImageVisible(true);

          await mainPage.clickOnHideCommentsFromMainMenu();
          await mainPage.clickViewportByCoordinates(800, 800);
          await mainPage.isCommentVisibilityToastVisible('Comments hidden');
          await commentsPanelPage.isCommentAvatarImageVisible(false);
        });

        await mainTest.step('Click on Main menu/View/Show comments', async () => {
          await mainPage.clickOnShowCommentsFromMainMenu();
          await mainPage.clickViewportByCoordinates(800, 800);
          await mainPage.isCommentVisibilityToastVisible('Comments visible');
          await commentsPanelPage.isCommentAvatarImageVisible(true);
        });
      });
    },
  );

  mainTest(
    qase([1226], 'Reply comment with valid text using Latin alphabet'),
    async ({ page }) => {
      const replyComment =
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry';

      await mainTest.step('Enter and post a reply', async () => {
        await commentsPanelPage.enterReplyText(replyComment);
        await commentsPanelPage.clickPostCommentButton();
      });

      await mainTest.step(
        'Verify reply is displayed in pop-up and panel',
        async () => {
          await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
          await commentsPanelPage.isCommentReplyDisplayedInCommentsPanel();
          await mainPage.hideRulersViaMainMenu();
          await expect(page).toHaveScreenshot('comment-reply.png', {
            mask: mainPage.maskViewport({ usersSection: true }, [
              commentsPanelPage.commentsAuthorSection,
              commentsPanelPage.commentAvatarImage,
            ]),
          });
        },
      );
    },
  );

  mainTest(
    qase([1231], 'Edit comment with valid text using Latin alphabet'),
    async ({ page }) => {
      const editedComment = 'Edited Test Comment';

      await mainTest.step('Edit the comment', async () => {
        await commentsPanelPage.clickCommentOptionsButton();
        await commentsPanelPage.clickEditCommentOption();
        await commentsPanelPage.enterCommentText(editedComment, true);
        await commentsPanelPage.clickPostCommentButton();
        await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
      });

      await mainTest.step('Reload and verify edited comment persists', async () => {
        await mainPage.reloadPage();
        await commentsPanelPage.clickCreateCommentButton();
        await commentsPanelPage.isCommentDisplayedInCommentsPanel(editedComment);
        await commentsPanelPage.clickCommentThreadIconByNumber('1');
        await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);

        await mainPage.hideRulersViaMainMenu();
        await expect(page).toHaveScreenshot('comment-edited.png', {
          mask: mainPage.maskViewport({ usersSection: true }, [
            commentsPanelPage.commentsAuthorSection,
            commentsPanelPage.commentAvatarImage,
          ]),
        });
      });
    },
  );

  mainTest(
    qase([1236, 2053], 'Delete thread & Check notification icon with no activity'),
    async ({ page }) => {
      await mainTest.step('Delete the comment thread', async () => {
        await commentsPanelPage.clickCommentHeaderOptionsButton();
        await commentsPanelPage.clickDeleteCommentOption();
        await commentsPanelPage.clickDeleteThreadButton();
      });

      await mainTest.step(
        'Verify thread is removed and placeholder is shown',
        async () => {
          await commentsPanelPage.isCommentThreadIconNotDisplayed();
          await commentsPanelPage.isCommentsPanelPlaceholderDisplayed(
            "You're all caught up! New comment notifications will appear here.",
          );
          await mainPage.hideRulersViaMainMenu();
          await expect(page).toHaveScreenshot('comment-removed.png', {
            mask: mainPage.maskViewport({ usersSection: true }, [
              commentsPanelPage.commentsAuthorSection,
              commentsPanelPage.commentAvatarImage,
            ]),
          });
        },
      );
    },
  );

  mainTest(qase([1240], 'Resolve comment'), async ({ page }) => {
    await mainTest.step('Resolve the comment and close pop-up', async () => {
      await commentsPanelPage.clickResolveCommentCheckbox();
    });

    await mainTest.step('Verify resolved thread icon is shown', async () => {
      await commentsPanelPage.isCommentResolvedThreadIconDisplayed();
      await mainPage.hideRulersViaMainMenu();
      await mainPage.clickViewportOnce();
      await expect(page).toHaveScreenshot('comment-resolved-closed-pop-up.png', {
        mask: mainPage.maskViewport({ usersSection: true }, [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ]),
      });
    });

    await mainTest.step(
      'Open resolved thread and verify checkbox is checked',
      async () => {
        await commentsPanelPage.clickResolvedCommentThreadIcon();
        await commentsPanelPage.isResolveCommentCheckboxSelected();
        await expect(page).toHaveScreenshot('comment-resolved-opened-pop-up.png', {
          mask: mainPage.maskViewport({ usersSection: true }, [
            commentsPanelPage.commentsAuthorSection,
            commentsPanelPage.commentAvatarImage,
          ]),
        });
      },
    );
  });
});

mainTest(
  qase([1221], 'Post comment with valid text using Latin alphabet'),
  async ({ page }) => {
    const comment =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';

    await mainTest.step('Create and post a Latin text comment', async () => {
      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
    });

    await mainTest.step('Verify comment in pop-up and panel (open)', async () => {
      await commentsPanelPage.isCommentDisplayedInPopUp(comment);
      await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
      await mainPage.hideRulersViaMainMenu();
      await expect(page).toHaveScreenshot('comment-latin-opened-pop-up.png', {
        mask: mainPage.maskViewport({ usersSection: true }, [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ]),
      });
    });

    await mainTest.step('Close pop-up and verify thread icon', async () => {
      await mainPage.clickViewportOnce();
      await commentsPanelPage.isCommentThreadIconDisplayed();
      await expect(page).toHaveScreenshot('comment-latin-closed-pop-up.png', {
        mask: mainPage.maskViewport({ usersSection: true }, [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ]),
      });
    });
  },
);

mainTest(qase([2148], 'Zoom out and check comment bubbles'), async () => {
  const comment = 'Test Comment';
  const xAxisCommentsCoordinates = [100, 50, 700];
  const yAxisCommentsCoordinates = [150, 50, 700];

  await mainTest.step('Post three comments at different coordinates', async () => {
    await mainPage.pressKeyboardShortcut('C');
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
  });

  await mainTest.step('Zoom in and verify comment bubbles merge', async () => {
    await commentsPanelPage.areCommentBubblesVisible(['1', '2', '3']);
    await mainPage.zoom(100, 100, 3);
    await commentsPanelPage.areCommentBubblesVisible(['1-2', '3']);
    await mainPage.zoom(100, 100, 5);
    await commentsPanelPage.areCommentBubblesVisible(['1-2-3']);
  });
});

mainTest.describe(() => {
  mainTest(
    qase(
      [2052, 2097],
      'Click "Mark All as Read" icon in notifications section if there are 10 unread notifications',
    ),
    async ({ page }) => {
      await mainTest.slow();
      const firstViewer = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstViewer}${process.env.GMAIL_DOMAIN}`;
      const numberOfComments = 10;

      await mainTest.step('Invite viewer to team', async () => {
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
      });

      await mainTest.step('Register viewer account via invite link', async () => {
        const firstInvite = await waitMessage(page, firstEmail, 40);
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await page.goto(firstInvite.inviteUrl);
        await registerPage.registerAccount(
          firstViewer,
          firstEmail,
          process.env.LOGIN_PWD,
        );
        await waitSecondMessage(page, firstEmail, 40);
        const verificationMessage = await getVerificationMessage(firstEmail);
        await page.goto(verificationMessage.inviteUrl);
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(teamName);
      });

      await mainTest.step(
        'Log back as main user and post 10 mention comments',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
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
            await commentsPanelPage.clickMentionMenuItemByName(firstViewer);
            await commentsPanelPage.clickPostCommentButton();
          }
          await mainPage.backToDashboardFromFileEditor();
          await profilePage.logout();
        },
      );

      await mainTest.step(
        'Log in as viewer and mark all notifications as read',
        async () => {
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(firstEmail);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await teamPage.switchTeam(teamName);
          // PENPOT-2052
          await dashboardPage.isUnreadNotificationVisible();
          // PENPOT-2097
          await dashboardPage.clickOnNotificationButton();
          await dashboardPage.clickOnNotificationMarkAsReadButton();
          await dashboardPage.isUnreadNotificationVisible(false);
          await dashboardPage.isMarkedAllNotificationAsReadMessage();
          await dashboardPage.clickOnNotificationButton();
          await dashboardPage.isNoNotificationsMessagePresent();
        },
      );
    },
  );

  mainTest(qase([2057], 'Click Notification in the pop-up'), async ({ page }) => {
    await mainTest.slow();
    const firstEditor = random().concat('autotest');
    const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}${process.env.GMAIL_DOMAIN}`;
    const comment = 'Test Comment (main user)';
    const replyComment = 'Lorem Ipsum (editor user)';

    await mainTest.step('Post a comment as main user', async () => {
      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await mainPage.backToDashboardFromFileEditor();
    });

    await mainTest.step('Invite editor to team', async () => {
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    });

    await mainTest.step('Register editor and reply to comment', async () => {
      const firstInvite = await waitMessage(page, firstEmail, 40);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstEditor,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await waitSecondMessage(page, firstEmail, 40);
      const verificationMessage = await getVerificationMessage(firstEmail);
      await page.goto(verificationMessage.inviteUrl);
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();

      await commentsPanelPage.clickCreateCommentButton();
      await commentsPanelPage.clickCommentThreadIconByNumber('1');
      await commentsPanelPage.enterReplyText(replyComment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      await mainPage.backToDashboardFromFileEditor();
    });

    await mainTest.step(
      'Log back as main user and verify notification',
      async () => {
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
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
  });

  mainTest(qase([2086], '"Only your mentions" filter'), async ({ page }) => {
    await mainTest.slow();
    const firstEditor = random().concat('autotest');
    const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}${process.env.GMAIL_DOMAIN}`;
    const comment = 'Test Comment (main user)';

    await mainTest.step('Invite editor to team', async () => {
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
    });

    await mainTest.step('Register editor account via invite link', async () => {
      const firstInvite = await waitMessage(page, firstEmail, 40);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstEditor,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await waitSecondMessage(page, firstEmail, 40);
      const verificationMessage = await getVerificationMessage(firstEmail);
      await page.goto(verificationMessage.inviteUrl);
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);
    });

    await mainTest.step(
      'Log back as main user and post four comments (one with mention)',
      async () => {
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await teamPage.switchTeam(teamName);
        await dashboardPage.openFile();
        await mainPage.isMainPageLoaded();

        await commentsPanelPage.clickCreateCommentButton();
        await mainPage.clickViewportTwice();

        await commentsPanelPage.enterCommentText(comment);
        await commentsPanelPage.clickCommentMentionButton();
        await commentsPanelPage.clickMentionMenuItemByName(firstEditor);
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
      },
    );

    await mainTest.step('Log in as editor and filter by own mentions', async () => {
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmailAndClickOnContinue(firstEmail);
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
    });
  });

  mainTest(
    qase([2268], 'Notification icon after mention in the comments in the workspace'),
    async ({ page }) => {
      await mainTest.slow();
      const firstEditor = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}${process.env.GMAIL_DOMAIN}`;
      const comment = 'Test Comment (main user)';

      await mainTest.step('Invite editor to team', async () => {
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
      });

      await mainTest.step('Register editor account via invite link', async () => {
        const firstInvite = await waitMessage(page, firstEmail, 40);
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await page.goto(firstInvite.inviteUrl);
        await registerPage.registerAccount(
          firstEditor,
          firstEmail,
          process.env.LOGIN_PWD,
        );
        await waitSecondMessage(page, firstEmail, 40);
        const verificationMessage = await getVerificationMessage(firstEmail);
        await page.goto(verificationMessage.inviteUrl);
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(teamName);
      });

      await mainTest.step(
        'Log back as main user and post two mention comments',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await teamPage.switchTeam(teamName);
          await dashboardPage.openFile();
          await mainPage.isMainPageLoaded();

          await commentsPanelPage.clickCreateCommentButton();
          await mainPage.clickViewportTwice();

          await commentsPanelPage.enterCommentText(comment);
          await commentsPanelPage.clickCommentMentionButton();
          await commentsPanelPage.clickMentionMenuItemByName(firstEditor);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.checkCommentCountInList(1);

          await mainPage.clickViewportByCoordinates(100, 100, 2);
          await commentsPanelPage.enterCommentText(comment);
          await commentsPanelPage.clickCommentMentionButton();
          await commentsPanelPage.clickMentionMenuItemByName(firstEditor);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.checkCommentCountInList(2);

          await mainPage.backToDashboardFromFileEditor();
        },
      );

      await mainTest.step(
        'Log in as editor and verify unread comment notifications',
        async () => {
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(firstEmail);
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
    },
  );

  mainTest.afterEach(async () => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(teamName);

    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();
  });
});
