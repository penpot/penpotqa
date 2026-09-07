import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ProfilePage } from '@pages/profile-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import {
  loginAsMainUser,
  loginAsUser,
  setupEditorRoleUser,
  setupViewerRoleUser,
} from 'helpers/user-flows';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let mainProfileName = '';

let commentsPanelPage: CommentsPanelPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let profilePage: ProfilePage;
let teamPage: TeamPage;

function commentScreenshotMask() {
  return mainPage.maskViewport({ usersSection: true }, [
    commentsPanelPage.commentsAuthorSection,
    commentsPanelPage.commentAvatarImage,
  ]);
}

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
  mainPage = new MainPage(page);
  commentsPanelPage = new CommentsPanelPage(page);

  await teamPage.createTeam(teamName);
  mainProfileName = (await profilePage.getUserName()) ?? '';
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe('Single comment thread actions', () => {
  mainTest.beforeEach(async () => {
    const commentText = 'Test Comment';
    await commentsPanelPage.clickCreateCommentButton();
    await mainPage.clickViewportTwice();
    await commentsPanelPage.enterCommentText(commentText);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(commentText);
  });

  mainTest(
    qase(
      [1219, 3069, 3074],
      'Create comment (Toolbar) and Hide/Show it from Main Menu/Shortkey',
    ),
    async ({ page }) => {
      const comment = 'Test Comment';

      await mainTest.step('1219, Create comment (Toolbar)', async () => {
        await mainTest.step(
          'Verify comment is displayed in pop-up and panel',
          async () => {
            await commentsPanelPage.isCommentDisplayedInPopUp(comment);
            await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);

            await mainPage.hideRulersViaMainMenu();
            await expect(page).toHaveScreenshot('comment-opened-pop-up.png', {
              mask: commentScreenshotMask(),
            });
          },
        );

        await mainTest.step(
          'Close pop-up and verify thread icon is displayed',
          async () => {
            await mainPage.clickViewportOnce();
            await commentsPanelPage.isCommentThreadIconDisplayed();
            await expect(page).toHaveScreenshot('comment-closed-pop-up.png', {
              mask: commentScreenshotMask(),
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

      await mainTest.step(
        "3074, Pressing 'C' shows comments from hidden state",
        async () => {
          await mainTest.step('Hide comments using the shortcut', async () => {
            await commentsPanelPage.pressHideCommentsShortcut();

            await mainPage.isCommentVisibilityToastVisible('Comments hidden');
            await commentsPanelPage.isCommentAvatarImageVisible(false);
          });

          await mainTest.step("Press the 'C' key", async () => {
            await commentsPanelPage.pressCommentsPanelShortcut();

            await commentsPanelPage.isCommentDisplayedInCommentsPanel(comment);
          });
        },
      );
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
            mask: commentScreenshotMask(),
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
          mask: commentScreenshotMask(),
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
            mask: commentScreenshotMask(),
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
        mask: commentScreenshotMask(),
      });
    });

    await mainTest.step(
      'Open resolved thread and verify checkbox is checked',
      async () => {
        await commentsPanelPage.clickResolvedCommentThreadIcon();
        await commentsPanelPage.isResolveCommentCheckboxSelected();
        await expect(page).toHaveScreenshot('comment-resolved-opened-pop-up.png', {
          mask: commentScreenshotMask(),
        });
      },
    );
  });

  mainTest(
    qase([3559], 'Comments remain visible on canvas after leaving Comments mode'),
    async () => {
      await mainTest.step(
        'Close comment pop-up and confirm the bubble is visible in Comments mode',
        async () => {
          await mainPage.clickViewportOnce();
          await commentsPanelPage.isCommentThreadIconDisplayed();
        },
      );

      await mainTest.step('Exit Comments mode via a design tool', async () => {
        await mainPage.clickMoveButton();
      });

      await mainTest.step(
        'Verify the comment bubble remains visible on the canvas',
        async () => {
          await commentsPanelPage.isCommentThreadIconDisplayed();
        },
      );
    },
  );

  mainTest(
    qase(
      [3560],
      'Perform full comment CRUD on canvas while a design tool is active',
    ),
    async () => {
      const replyComment = 'Reply while design tool is active';

      await mainTest.step(
        'Close pop-up, add a shape and exit Comments mode',
        async () => {
          await mainPage.clickViewportOnce();
          await mainPage.createDefaultRectangleByCoordinates(800, 800);
          await mainPage.clickMoveButton();
        },
      );

      await mainTest.step('Hover and expand the comment thread', async () => {
        await commentsPanelPage.hoverCommentThreadBubbleByIndex('1');
        await commentsPanelPage.clickCommentThreadIconByNumber('1');
      });

      await mainTest.step('Reply to the thread', async () => {
        await commentsPanelPage.enterReplyText(replyComment);
        await commentsPanelPage.clickPostCommentButton();
        await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
      });

      await mainTest.step('Delete the comment thread', async () => {
        await commentsPanelPage.clickCommentHeaderOptionsButton();
        await commentsPanelPage.clickDeleteCommentOption();
        await commentsPanelPage.clickDeleteThreadButton();
        await commentsPanelPage.isDeleteConversationModalNotVisible();
        await commentsPanelPage.isCommentThreadIconNotDisplayed();
      });
    },
  );
});

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

mainTest(
  qase(
    [3638],
    'Hover over an avatar in an expanded comment cluster shows a comment preview',
  ),
  async ({ page }) => {
    const comment = 'Test Comment';
    const xAxisCommentsCoordinates = [100, 50];
    const yAxisCommentsCoordinates = [150, 50];

    await mainTest.step('Create two comments close together', async () => {
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

    await mainTest.step('Zoom out until the comments form a cluster', async () => {
      await commentsPanelPage.areCommentBubblesVisible(['1', '2']);
      await mainPage.zoom(100, 100, 3);
      await commentsPanelPage.areCommentBubblesVisible(['1-2']);

      await mainPage.hideRulersViaMainMenu();
      await expect(page).toHaveScreenshot('comment-cluster-merged.png', {
        mask: commentScreenshotMask(),
      });
    });

    await mainTest.step('Expand the cluster by clicking its indicator', async () => {
      await commentsPanelPage.clickCommentThreadBubbleByIndex('1-2');
      await commentsPanelPage.areCommentBubblesVisible(['1', '2']);

      await expect(page).toHaveScreenshot('comment-cluster-expanded.png', {
        mask: commentScreenshotMask(),
      });
    });

    await mainTest.step(
      'Hover an avatar and verify the comment preview is displayed',
      async () => {
        await commentsPanelPage.hoverCommentThreadBubbleByIndex('1');
        await commentsPanelPage.isCommentClusterPreviewDisplayed();
        await expect(page).toHaveScreenshot('comment-cluster-preview.png', {
          mask: commentScreenshotMask(),
        });
      },
    );
  },
);

mainTest.describe('Notifications and mentions', () => {
  mainTest(
    qase(
      [2052, 2097],
      'Click "Mark All as Read" icon in notifications section if there are 10 unread notifications',
    ),
    async ({ page }) => {
      await mainTest.slow();
      let firstViewer: string;
      let firstEmail: string;
      const numberOfComments = 10;

      await mainTest.step('Invite and register viewer via invite link', async () => {
        await mainPage.backToDashboardFromFileEditor();

        ({ userEmail: firstEmail, userName: firstViewer } =
          await setupViewerRoleUser(page, {
            existingTeamName: teamName,
            assertInviteHeader: true,
          }));
      });

      await mainTest.step(
        'Log back as main user and post 10 mention comments',
        async () => {
          await profilePage.logout();
          await loginAsMainUser(page, { teamName });
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
          await loginAsUser(page, firstEmail, { teamName });
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
    const comment = 'Test Comment (main user)';
    const replyComment = 'Lorem Ipsum (editor user)';

    await mainTest.step('Post a comment as main user', async () => {
      await commentsPanelPage.clickCreateCommentButton();
      await mainPage.clickViewportTwice();
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await mainPage.backToDashboardFromFileEditor();
    });

    await mainTest.step('Invite and register editor via invite link', async () => {
      await setupEditorRoleUser(page, { existingTeamName: teamName });
    });

    await mainTest.step('Reply to comment as editor', async () => {
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
        await loginAsMainUser(page, { teamName });

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
    let firstEditor: string;
    let firstEmail: string;
    const comment = 'Test Comment (main user)';

    await mainTest.step('Invite and register editor via invite link', async () => {
      await mainPage.backToDashboardFromFileEditor();

      ({ userEmail: firstEmail, userName: firstEditor } = await setupEditorRoleUser(
        page,
        { existingTeamName: teamName },
      ));
    });

    await mainTest.step(
      'Log back as main user and post four comments (one with mention)',
      async () => {
        await profilePage.logout();
        await loginAsMainUser(page, { teamName });
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
      await loginAsUser(page, firstEmail, { teamName });
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
      let firstEditor: string;
      let firstEmail: string;
      const comment = 'Test Comment (main user)';

      await mainTest.step('Invite and register editor via invite link', async () => {
        await mainPage.backToDashboardFromFileEditor();

        ({ userEmail: firstEmail, userName: firstEditor } =
          await setupEditorRoleUser(page, { existingTeamName: teamName }));
      });

      await mainTest.step(
        'Log back as main user and post two mention comments',
        async () => {
          await profilePage.logout();
          await loginAsMainUser(page, { teamName });
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
          await loginAsUser(page, firstEmail, { teamName });
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

  mainTest.afterEach(async ({ page }) => {
    await profilePage.logout();
    await loginAsMainUser(page, { teamName });
    await dashboardPage.openFile();
    await mainPage.isMainPageLoaded();
  });
});
