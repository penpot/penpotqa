import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { expect, Page } from '@playwright/test';
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

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let pagesPanelPage: PagesPanelPage;
let viewModePage: ViewModePage;
let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  pagesPanelPage = new PagesPanelPage(page);
  viewModePage = new ViewModePage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  await mainTest.slow();
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest(qase([693], 'Share prototype - get link (2 pages)'), async ({ page }) => {
    let shareLink: string;

    await mainTest.step('Create board with two pages', async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.clickAddPageButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Open view mode and the share dialog', async () => {
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickShareButton();
      await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
        'view-mode-share-window-image.png',
        { mask: [viewModePage.copyLinkField] },
      );
    });

    await mainTest.step(
      'Manage permissions and verify the default single page selection',
      async () => {
        await viewModePage.clickGetLinkButton();
        await viewModePage.clickManagePermissionsButton();
        await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
          'view-mode-share-window-1page-selected-image.png',
          { mask: [viewModePage.copyLinkField] },
        );
      },
    );

    await mainTest.step('Select all pages and verify', async () => {
      await viewModePage.selectAllPages();
      await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
        'view-mode-share-window-all-pages-selected-image.png',
        { mask: [viewModePage.copyLinkField] },
      );
    });

    await mainTest.step('Get and copy the share link', async () => {
      await viewModePage.clickGetLinkButton();
      shareLink = await viewModePage.clickCopyLinkButton();
      await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
    });

    await mainTest.step(
      'Log out and open the shared link, then verify it is accessible',
      async () => {
        await mainPage.clickPencilBoxButton();
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await profilePage.gotoLink(shareLink);
        const newViewModePage = new ViewModePage(page);
        await newViewModePage.isViewerSectionVisible();
        await expect(newViewModePage.viewerLayoutSection).toHaveScreenshot(
          'view-mode-shared-image.png',
        );
        await loginPage.goto();
      },
    );
  });

  mainTest(qase([694], 'Share prototype - destroy link'), async ({ page }) => {
    let shareLink: string;

    await mainTest.step('Create board and open view mode', async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
    });

    await mainTest.step('Get and copy the share link', async () => {
      await viewModePage.clickShareButton();
      await viewModePage.clickGetLinkButton();
      shareLink = await viewModePage.clickCopyLinkButton();
      await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
    });

    await mainTest.step('Destroy the share link', async () => {
      await viewModePage.clickDestroyLinkButton();
    });

    await mainTest.step(
      'Log out and verify the destroyed link is no longer accessible',
      async () => {
        await mainPage.clickPencilBoxButton();
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await profilePage.gotoLink(shareLink);
        viewModePage = new ViewModePage(page);
        await viewModePage.isViewerSectionVisible(false);
        await expect(mainPage.loginDialog).toHaveScreenshot(
          'shared-error-image.png',
        );
        await loginPage.goto();
      },
    );
  });

  mainTest(
    qase([696], 'Share prototype - manage permissions ("Can comment")'),
    async ({ page }) => {
      let shareLink: string;
      let newPage: Page;

      await mainTest.step('Create board and open view mode', async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await mainPage.waitForChangeIsSaved();
        newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
      });

      await mainTest.step(
        'Set "Can comment" permission for all users and get the share link',
        async () => {
          await viewModePage.clickShareButton();
          await viewModePage.clickManagePermissionsButton();
          await viewModePage.selectAllUsersCommentPermission();
          await viewModePage.clickGetLinkButton();
          shareLink = await viewModePage.clickCopyLinkButton();
          await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
          await viewModePage.waitSuccessMessageHidden();
          await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
            'view-mode-share-window-all-users-comment-image.png',
            { mask: [viewModePage.copyLinkField] },
          );
          await newPage.close();
        },
      );

      await mainTest.step(
        'Log in as the second user and open the shared link',
        async () => {
          await mainPage.clickPencilBoxButton();
          await profilePage.logout();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await profilePage.gotoLink(shareLink);
          viewModePage = new ViewModePage(page);
          await viewModePage.isViewerSectionVisible();
        },
      );

      await mainTest.step('Open comments panel and verify', async () => {
        await viewModePage.clickCommentsButton();
        await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
          'view-mode-shared-comments-image.png',
        );
      });

      await mainTest.step('Return to dashboard and log out', async () => {
        await viewModePage.gotoLink(process.env.BASE_URL);
        await mainPage.isHeaderDisplayed('Projects');
        await profilePage.logout();
      });
    },
  );

  mainTest(
    qase([697], 'Share prototype - manage permissions ("Can inspect code")'),
    async ({ page }) => {
      let shareLink: string;
      let newPage: Page;

      await mainTest.step('Create board and open view mode', async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await mainPage.waitForChangeIsSaved();
        newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
      });

      await mainTest.step(
        'Set "Can inspect code" permission for all users and get the share link',
        async () => {
          await viewModePage.clickShareButton();
          await viewModePage.clickManagePermissionsButton();
          await viewModePage.selectAllUsersInspectPermission();
          await viewModePage.clickGetLinkButton();
          shareLink = await viewModePage.clickCopyLinkButton();
          await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
          await viewModePage.waitSuccessMessageHidden();
          await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
            'view-mode-share-window-all-users-inspect-image.png',
            { mask: [viewModePage.copyLinkField] },
          );
          await newPage.close();
        },
      );

      await mainTest.step(
        'Log in as the second user and open the shared link',
        async () => {
          await mainPage.clickPencilBoxButton();
          await profilePage.logout();
          await page.context().clearCookies();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
          await profilePage.gotoLink(shareLink);
          viewModePage = new ViewModePage(page);
          await viewModePage.isViewerSectionVisible();
        },
      );

      await mainTest.step('Open Inspect tab code and verify', async () => {
        const inspectPanelPage = new InspectPanelPage(page);
        await viewModePage.openInspectTab();
        await inspectPanelPage.openCodeTab();
        await page.waitForTimeout(200);
        await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
          'view-mode-shared-code-image.png',
          {
            mask: [inspectPanelPage.codeHtmlStrings],
          },
        );
      });

      await mainTest.step('Return to dashboard and log out', async () => {
        await viewModePage.gotoLink(process.env.BASE_URL);
        await mainPage.isHeaderDisplayed('Projects');
        await loginPage.acceptCookie();
        await profilePage.logout();
      });
    },
  );

  mainTest(
    qase([702], 'Comments dropdown (All and Only your comments)'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;
      let commentsPanelPage: CommentsPanelPage;
      let firstInvite: Awaited<ReturnType<typeof waitMessage>>;
      let secondPage: Page;

      await mainTest.step(
        'Post a comment as the main user and go back to dashboard',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(300, 300);
          await mainPage.waitForChangeIsSaved();
          const newPage = await viewModePage.clickViewModeShortcut();
          const viewModePage2 = new ViewModePage(newPage);
          await viewModePage2.clickCommentsButton();
          await viewModePage2.addComment();

          const comment = 'Test Comment (main user)';
          commentsPanelPage = new CommentsPanelPage(newPage);
          await commentsPanelPage.enterCommentText(comment);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.isCommentDisplayedInPopUp(comment);
          await newPage.close();
          await mainPage.backToDashboardFromFileEditor();
        },
      );

      await mainTest.step('Invite a second admin to the team', async () => {
        await teamPage.openInvitationsPageViaOptionsMenu();
        await teamPage.clickInviteMembersToTeamButton();
        await teamPage.isInviteMembersPopUpHeaderDisplayed(
          'Invite members to the team',
        );
        await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
        await teamPage.selectInvitationRoleInPopUp('Admin');
        await teamPage.clickSendInvitationButton();
        await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
        firstInvite = await waitMessage(page, firstEmail, 40);
      });

      await mainTest.step('Register the invited admin account', async () => {
        await profilePage.logout();
        await loginPage.isLoginPageOpened();
        await page.goto(firstInvite.inviteUrl);
        await registerPage.registerAccount(
          firstAdmin,
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
        'Open the file as the second admin and post a comment, then verify',
        async () => {
          await dashboardPage.openFile();
          await mainPage.isMainPageLoaded();
          secondPage = await viewModePage.clickViewModeShortcut();
          viewModePage = new ViewModePage(secondPage);
          await viewModePage.clickCommentsButton();
          await viewModePage.addComment(true);
          const comment2 = 'Test Comment (main user)';
          commentsPanelPage = new CommentsPanelPage(secondPage);
          await commentsPanelPage.enterCommentText(comment2);
          await commentsPanelPage.clickPostCommentButton();
          await commentsPanelPage.isCommentDisplayedInPopUp(comment2);
          await expect(secondPage).toHaveScreenshot('all-users-comments.png', {
            mask: [
              commentsPanelPage.commentsAuthorSection,
              commentsPanelPage.commentAvatarImage,
            ],
          });
        },
      );

      await mainTest.step(
        'Filter to show only your comments and verify',
        async () => {
          await viewModePage.openCommentsDropdown();
          await viewModePage.selectShowYourCommentsOption();
          await expect(secondPage).toHaveScreenshot('only-your-comments.png', {
            mask: [
              commentsPanelPage.commentsAuthorSection,
              commentsPanelPage.commentAvatarImage,
            ],
          });
          await secondPage.close();
        },
      );

      await mainTest.step('Return to dashboard and log out', async () => {
        await mainPage.backToDashboardFromFileEditor();
        await profilePage.logout();
      });
    },
  );

  mainTest.afterEach(async () => {
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });
});
