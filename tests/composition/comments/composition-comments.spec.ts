import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ProfilePage } from '@pages/profile-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest, demoTeamWithInviteeTest } from 'fixtures';
import { openTeamFile } from 'helpers/teams/open-team-file';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { qase } from 'playwright-qase-reporter/playwright';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';

let commentsPanelPage: CommentsPanelPage;
let profilePage: ProfilePage;

function commentScreenshotMask(mainPage: MainPage) {
  return mainPage.maskViewport({ usersSection: true }, [
    commentsPanelPage.commentsAuthorSection,
    commentsPanelPage.commentAvatarImage,
  ]);
}

demoAccountFileTest.describe('Single comment thread actions', () => {
  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    commentsPanelPage = new CommentsPanelPage(page);
    // A fixed, short name keeps the comment author inside its box (the default
    // demo name is long and changes width every run).
    await setDemoUserName(page.context().request, 'QA Tester');
    await page.reload();
    await mainPage.isMainPageLoaded();
    const commentText = 'Test Comment';
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.postComment(commentText);
    await commentsPanelPage.isCommentDisplayedInPopUp(commentText);
  });

  demoAccountFileTest(
    qase(
      [1219, 3069, 3074],
      'Create comment (Toolbar) and Hide/Show it from Main Menu/Shortkey',
    ),
    async ({ page, mainPage }) => {
      const comment = 'Test Comment';

      await demoAccountFileTest.step('1219, Create comment (Toolbar)', async () => {
        await demoAccountFileTest.step(
          'Verify comment is displayed in pop-up and panel',
          async () => {
            await commentsPanelPage.isCommentDisplayedInPopUp(comment);
            await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
            await commentsPanelPage.hasCommentThreadNumber(1);
          },
        );

        await demoAccountFileTest.step(
          'Close pop-up and verify thread icon is displayed',
          async () => {
            await mainPage.clickViewportOnce();
            await commentsPanelPage.isCommentThreadPopUpVisible(false);
            await commentsPanelPage.isCommentThreadIconVisible();
          },
        );
      });

      await demoAccountFileTest.step(
        '3069, Hide/show comments via main menu',
        async () => {
          await demoAccountFileTest.step(
            'Exit from the comments panel',
            async () => {
              await commentsPanelPage.clickCreateCommentButton();
            },
          );

          await demoAccountFileTest.step(
            'Click on Main menu/View/Hide comments',
            async () => {
              await commentsPanelPage.isCommentAvatarImageVisible(true);

              await mainPage.clickOnHideCommentsFromMainMenu();
              await mainPage.clickViewportByCoordinates(800, 800);
              await mainPage.isCommentVisibilityToastVisible('Comments hidden');
              await commentsPanelPage.isCommentAvatarImageVisible(false);
            },
          );

          await demoAccountFileTest.step(
            'Click on Main menu/View/Show comments',
            async () => {
              await mainPage.clickOnShowCommentsFromMainMenu();
              await mainPage.clickViewportByCoordinates(800, 800);
              await mainPage.isCommentVisibilityToastVisible('Comments visible');
              await commentsPanelPage.isCommentAvatarImageVisible(true);
            },
          );
        },
      );

      await demoAccountFileTest.step(
        "3074, Pressing 'C' shows comments from hidden state",
        async () => {
          await demoAccountFileTest.step(
            'Hide comments using the shortcut',
            async () => {
              await commentsPanelPage.pressHideCommentsShortcut();

              await mainPage.isCommentVisibilityToastVisible('Comments hidden');
              await commentsPanelPage.isCommentAvatarImageVisible(false);
            },
          );

          await demoAccountFileTest.step("Press the 'C' key", async () => {
            await commentsPanelPage.pressCommentsPanelShortcut();

            await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1226], 'Reply comment with valid text using Latin alphabet'),
    async ({ page, mainPage }) => {
      const replyComment =
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry';

      await demoAccountFileTest.step('Enter and post a reply', async () => {
        await commentsPanelPage.postComment(replyComment);
      });

      await demoAccountFileTest.step(
        'Verify reply is displayed in pop-up and panel',
        async () => {
          await commentsPanelPage.hasCommentsInPopUp(['Test Comment', replyComment]);
          await commentsPanelPage.isCommentDisplayedInCommentsPanel('Test Comment');
          await commentsPanelPage.isCommentReplyDisplayedInCommentsPanel();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1231], 'Edit comment with valid text using Latin alphabet'),
    async ({ page, mainPage }) => {
      const editedComment = 'Edited Test Comment';

      await demoAccountFileTest.step('Edit the comment', async () => {
        await commentsPanelPage.clickCommentOptionsButton();
        await commentsPanelPage.clickEditCommentOption();
        await commentsPanelPage.editComment(editedComment);
        await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
      });

      await demoAccountFileTest.step(
        'Reload and verify edited comment persists',
        async () => {
          await mainPage.reloadPage();
          await commentsPanelPage.clickCreateCommentButton();
          await commentsPanelPage.isCommentDisplayedInCommentsPanel(editedComment);
          await commentsPanelPage.openCommentThread('1');
          await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1236, 2053], 'Delete thread & Check notification icon with no activity'),
    async ({ page, mainPage }) => {
      await demoAccountFileTest.step('Delete the comment thread', async () => {
        await commentsPanelPage.clickCommentHeaderOptionsButton();
        await commentsPanelPage.clickDeleteCommentOption();
        await commentsPanelPage.clickDeleteThreadButton();
      });

      await demoAccountFileTest.step(
        'Verify thread is removed and placeholder is shown',
        async () => {
          await commentsPanelPage.isCommentThreadIconVisible(false);
          await commentsPanelPage.isCommentsPanelPlaceholderDisplayed(
            "You're all caught up! New comment notifications will appear here.",
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1240], 'Resolve comment'),
    async ({ page, mainPage }) => {
      await demoAccountFileTest.step(
        'Resolve the comment and close pop-up',
        async () => {
          await commentsPanelPage.isResolveCommentCheckboxSelected(false);
          await commentsPanelPage.clickResolveCommentCheckbox();
        },
      );

      await demoAccountFileTest.step(
        'Verify resolved thread icon is shown',
        async () => {
          await commentsPanelPage.isCommentResolvedThreadIconVisible();
          await mainPage.clickViewportOnce();
          await commentsPanelPage.isCommentThreadBubbleResolved('1');
          await commentsPanelPage.isCommentDisplayedInCommentsPanel('Test Comment');
        },
      );

      await demoAccountFileTest.step(
        'Open resolved thread and verify checkbox is checked',
        async () => {
          await commentsPanelPage.clickResolvedCommentThreadIcon();
          await commentsPanelPage.isResolveCommentCheckboxSelected();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3559], 'Comments remain visible on canvas after leaving Comments mode'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Close comment pop-up and confirm the bubble is visible in Comments mode',
        async () => {
          await mainPage.clickViewportOnce();
          await commentsPanelPage.isCommentThreadIconVisible();
        },
      );

      await demoAccountFileTest.step(
        'Exit Comments mode via a design tool',
        async () => {
          await mainPage.clickMoveButton();
        },
      );

      await demoAccountFileTest.step(
        'Verify the comment bubble remains visible on the canvas',
        async () => {
          await commentsPanelPage.isCommentThreadIconVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [3560],
      'Perform full comment CRUD on canvas while a design tool is active',
    ),
    async ({ mainPage }) => {
      const replyComment = 'Reply while design tool is active';

      await demoAccountFileTest.step(
        'Close pop-up, add a shape and exit Comments mode',
        async () => {
          await mainPage.clickViewportOnce();
          await mainPage.createDefaultRectangleByCoordinates(800, 800);
          await mainPage.clickMoveButton();
        },
      );

      await demoAccountFileTest.step(
        'Hover and expand the comment thread',
        async () => {
          await commentsPanelPage.hoverCommentThreadBubbleByIndex('1');
          await commentsPanelPage.openCommentThread('1');
        },
      );

      await demoAccountFileTest.step('Reply to the thread', async () => {
        await commentsPanelPage.postComment(replyComment);
        await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      });

      await demoAccountFileTest.step('Delete the comment thread', async () => {
        await commentsPanelPage.clickCommentHeaderOptionsButton();
        await commentsPanelPage.clickDeleteCommentOption();
        await commentsPanelPage.clickDeleteThreadButton();
        await commentsPanelPage.isDeleteConversationModalNotVisible();
        await commentsPanelPage.isCommentThreadIconVisible(false);
      });
    },
  );
});

demoAccountFileTest.describe('Comment bubbles', () => {
  demoAccountFileTest.beforeEach(async ({ page }) => {
    commentsPanelPage = new CommentsPanelPage(page);
  });

  demoAccountFileTest(
    qase([2148], 'Zoom out and check comment bubbles'),
    async ({ mainPage }) => {
      const comment = 'Test Comment';
      const xAxisCommentsCoordinates = [100, 50, 700];
      const yAxisCommentsCoordinates = [150, 50, 700];

      await demoAccountFileTest.step(
        'Post three comments at different coordinates',
        async () => {
          await mainPage.pressKeyboardShortcut('C');
          for (let i = 0; i < xAxisCommentsCoordinates.length; i++) {
            await mainPage.clickViewportByCoordinates(
              xAxisCommentsCoordinates[i],
              yAxisCommentsCoordinates[i],
              2,
            );
            await commentsPanelPage.postComment(comment);
            await commentsPanelPage.checkCommentCountInList(i + 1);
          }
        },
      );

      await demoAccountFileTest.step(
        'Zoom in and verify comment bubbles merge',
        async () => {
          await commentsPanelPage.areCommentBubblesVisible(['1', '2', '3']);
          await mainPage.zoom(100, 100, 3);
          await commentsPanelPage.areCommentBubblesVisible(['1-2', '3']);
          await mainPage.zoom(100, 100, 5);
          await commentsPanelPage.areCommentBubblesVisible(['1-2-3']);
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [3638],
      'Hover over an avatar in an expanded comment cluster shows a comment preview',
    ),
    async ({ page, mainPage }) => {
      const comment = 'Test Comment';
      const xAxisCommentsCoordinates = [100, 50];
      const yAxisCommentsCoordinates = [150, 50];

      await demoAccountFileTest.step(
        'Setup: give the user a fixed name (shown in the snapshots)',
        async () => {
          await setDemoUserName(page.context().request, 'QA Tester');
          await page.reload();
          await mainPage.isMainPageLoaded();
        },
      );

      await demoAccountFileTest.step(
        'Create two comments close together',
        async () => {
          await mainPage.pressKeyboardShortcut('C');
          for (let i = 0; i < xAxisCommentsCoordinates.length; i++) {
            await mainPage.clickViewportByCoordinates(
              xAxisCommentsCoordinates[i],
              yAxisCommentsCoordinates[i],
              2,
            );
            await commentsPanelPage.postComment(comment);
            await commentsPanelPage.checkCommentCountInList(i + 1);
          }
        },
      );

      await demoAccountFileTest.step(
        'Zoom out until the comments form a cluster',
        async () => {
          await commentsPanelPage.areCommentBubblesVisible(['1', '2']);
          await mainPage.zoom(100, 100, 3);
          await commentsPanelPage.areCommentBubblesVisible(['1-2']);

          await mainPage.hideRulersViaMainMenu();
          await expect(page).toHaveScreenshot('comment-cluster-merged.png', {
            mask: commentScreenshotMask(mainPage),
          });
        },
      );

      await demoAccountFileTest.step(
        'Expand the cluster by clicking its indicator',
        async () => {
          await commentsPanelPage.clickCommentThreadBubbleByIndex('1-2');
          await commentsPanelPage.areCommentBubblesVisible(['1', '2']);

          await expect(page).toHaveScreenshot('comment-cluster-expanded.png', {
            mask: commentScreenshotMask(mainPage),
          });
        },
      );

      await demoAccountFileTest.step(
        'Hover an avatar and verify the comment preview is displayed',
        async () => {
          await commentsPanelPage.hoverCommentThreadBubbleByIndex('1');
          await commentsPanelPage.isCommentClusterPreviewDisplayed();
          await expect(page).toHaveScreenshot('comment-cluster-preview.png', {
            mask: commentScreenshotMask(mainPage),
          });
        },
      );
    },
  );
});

demoTeamWithInviteeTest.describe('Notifications and mentions', () => {
  demoTeamWithInviteeTest.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    commentsPanelPage = new CommentsPanelPage(page);
  });

  demoTeamWithInviteeTest.describe(() => {
    demoTeamWithInviteeTest.use({ inviteeRole: InvitationRole.Viewer });

    demoTeamWithInviteeTest(
      qase(
        [2052, 2097],
        'Click "Mark All as Read" icon in notifications section if there are 10 unread notifications',
      ),
      async ({ mainPage, invitee, team }) => {
        demoTeamWithInviteeTest.slow();
        const numberOfComments = 10;

        await demoTeamWithInviteeTest.step(
          'Post 10 comments mentioning the viewer',
          async () => {
            await commentsPanelPage.clickCreateCommentButton();
            for (let i = 0; i < numberOfComments; i++) {
              // Each comment goes 80px left of the previous one: its pop-up opens to
              // the right, so the next click never lands on an earlier bubble or
              // pop-up (that would post a reply instead of a new comment).
              await mainPage.clickViewportByCoordinates(900 - i * 80, 300);
              await commentsPanelPage.clickCommentMentionButton();
              await commentsPanelPage.clickMentionMenuItemByName(invitee.name);
              await commentsPanelPage.clickPostCommentButton();
              // Close the thread pop-up on empty canvas before placing the next one.
              await commentsPanelPage.isCommentThreadPopUpVisible();
              await mainPage.clickViewportByCoordinates(200, 750);
              await commentsPanelPage.isCommentThreadPopUpVisible(false);
            }
          },
        );

        await demoTeamWithInviteeTest.step(
          'As the viewer, mark all notifications as read',
          async () => {
            const viewerDashboardPage = new DashboardPage(invitee.page);
            await new TeamPage(invitee.page).goToTeamDashboard(team.id);
            // PENPOT-2052
            await viewerDashboardPage.isUnreadNotificationVisible();
            // PENPOT-2097
            await viewerDashboardPage.clickOnNotificationButton();
            await viewerDashboardPage.clickOnNotificationMarkAsReadButton();
            await viewerDashboardPage.isUnreadNotificationVisible(false);
            await viewerDashboardPage.isMarkedAllNotificationAsReadMessage();
            await viewerDashboardPage.clickOnNotificationButton();
            await viewerDashboardPage.isNoNotificationsMessagePresent();
          },
        );
      },
    );
  });

  demoTeamWithInviteeTest(
    qase([2057], 'Click Notification in the pop-up'),
    async ({ page, mainPage, dashboardPage, invitee, team }) => {
      demoTeamWithInviteeTest.slow();
      const comment = 'Test Comment (owner)';
      const replyComment = 'Lorem Ipsum (editor user)';
      let ownerName = '';

      await demoTeamWithInviteeTest.step('Post a comment as the owner', async () => {
        await commentsPanelPage.clickCreateCommentButton();
        await mainPage.clickViewportTwice();
        await commentsPanelPage.postComment(comment);
        await mainPage.backToDashboardFromFileEditor();
        ownerName = (await profilePage.getUserName()) ?? '';
      });

      await demoTeamWithInviteeTest.step(
        'Reply to the comment as the editor',
        async () => {
          const editorComments = new CommentsPanelPage(invitee.page);
          await openTeamFile(invitee.page, team.id);
          await editorComments.clickCreateCommentButton();
          await editorComments.openCommentThread('1');
          await editorComments.postComment(replyComment);
          await editorComments.isCommentReplyDisplayedInPopUp(replyComment);
        },
      );

      await demoTeamWithInviteeTest.step(
        'As the owner, open the reply from the notification',
        async () => {
          await page.reload();
          await dashboardPage.isUnreadNotificationVisible();
          await dashboardPage.clickOnNotificationButton();

          await dashboardPage.checkNotificationReplyUserName(ownerName);
          await dashboardPage.checkNotificationReplyText(comment);
          await dashboardPage.checkNotificationUnreadReplyCount('1 new reply');

          await dashboardPage.clickFirstNotificationMessage();
          await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
        },
      );
    },
  );

  demoTeamWithInviteeTest(
    qase([2086], '"Only your mentions" filter'),
    async ({ mainPage, invitee, team }) => {
      demoTeamWithInviteeTest.slow();
      const comment = 'Test Comment (owner)';

      await demoTeamWithInviteeTest.step(
        'Post four comments, one mentioning the editor',
        async () => {
          await commentsPanelPage.clickCreateCommentButton();
          await mainPage.clickViewportTwice();

          await commentsPanelPage.enterCommentText(comment);
          await commentsPanelPage.clickCommentMentionButton();
          await commentsPanelPage.clickMentionMenuItemByName(invitee.name);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.checkCommentCountInList(1);

          await mainPage.clickViewportByCoordinates(100, 100, 2);
          await commentsPanelPage.postComment(comment);
          await commentsPanelPage.checkCommentCountInList(2);

          await mainPage.clickViewportByCoordinates(600, 100, 2);
          await commentsPanelPage.postComment(comment);
          await commentsPanelPage.checkCommentCountInList(3);

          await mainPage.clickViewportByCoordinates(100, 800, 2);
          await commentsPanelPage.postComment(comment);
          await commentsPanelPage.checkCommentCountInList(4);
        },
      );

      await demoTeamWithInviteeTest.step(
        'As the editor, filter by own mentions',
        async () => {
          const editorComments = new CommentsPanelPage(invitee.page);
          await openTeamFile(invitee.page, team.id);
          await editorComments.clickCreateCommentButton();
          await editorComments.openCommentsFilter();
          await editorComments.selectCommentsFilterOption('Show only your mentions');

          await editorComments.checkCommentCount(1);
          await editorComments.checkCommentCountInList(1);
          await editorComments.isCommentDisplayedInCommentsPanel(
            comment + ` ${invitee.name}`,
          );
        },
      );
    },
  );

  demoTeamWithInviteeTest(
    qase([2268], 'Notification icon after mention in the comments in the workspace'),
    async ({ mainPage, invitee, team }) => {
      demoTeamWithInviteeTest.slow();
      const comment = 'Test Comment (owner)';

      await demoTeamWithInviteeTest.step(
        'Post two comments mentioning the editor',
        async () => {
          await commentsPanelPage.clickCreateCommentButton();
          await mainPage.clickViewportTwice();

          await commentsPanelPage.enterCommentText(comment);
          await commentsPanelPage.clickCommentMentionButton();
          await commentsPanelPage.clickMentionMenuItemByName(invitee.name);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.checkCommentCountInList(1);

          await mainPage.clickViewportByCoordinates(100, 100, 2);
          await commentsPanelPage.enterCommentText(comment);
          await commentsPanelPage.clickCommentMentionButton();
          await commentsPanelPage.clickMentionMenuItemByName(invitee.name);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.checkCommentCountInList(2);
        },
      );

      await demoTeamWithInviteeTest.step(
        'As the editor, verify unread comment notifications',
        async () => {
          const editorComments = new CommentsPanelPage(invitee.page);
          await openTeamFile(invitee.page, team.id);

          await editorComments.isUnreadCommentIconVisible(true);
          await editorComments.clickCreateCommentButton();
          await editorComments.isCommentUnreadThreadIconVisible(true);
          await editorComments.isUnreadCommentIconVisible(true);
          await editorComments.clickOnUnreadThreadIcon();
          await editorComments.clickOnUnreadThreadIcon();
          await editorComments.isCommentReadThreadIconVisible(true);
          await editorComments.isUnreadCommentIconVisible(true);
          await editorComments.clickOnUnreadThreadIcon();
          await editorComments.clickOnUnreadThreadIcon();
          await editorComments.isCommentUnreadThreadIconVisible(false);
          await editorComments.isUnreadCommentIconVisible(false);

          await editorComments.checkCommentCount(2);
          await editorComments.checkCommentCountInList(2);
          await editorComments.isCommentDisplayedInCommentsPanel(
            comment + ` ${invitee.name}`,
          );
        },
      );
    },
  );
});
