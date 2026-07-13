import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { random } from 'helpers/string-generator';
import {
  waitMessage,
  waitSecondMessage,
  getVerificationMessage,
} from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { ProfilePage } from '@pages/profile-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';

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
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickShareButton();
    await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
      'view-mode-share-window-image.png',
      { mask: [viewModePage.copyLinkField] },
    );
    await viewModePage.clickGetLinkButton();
    await viewModePage.clickManagePermissionsButton();
    await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
      'view-mode-share-window-1page-selected-image.png',
      { mask: [viewModePage.copyLinkField] },
    );
    await viewModePage.selectAllPages();
    await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
      'view-mode-share-window-all-pages-selected-image.png',
      { mask: [viewModePage.copyLinkField] },
    );
    await viewModePage.clickGetLinkButton();
    const shareLink = await viewModePage.clickCopyLinkButton();
    await viewModePage.isSuccessMessageDisplayed('Link copied successfully');

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
  });

  mainTest(qase([694], 'Share prototype - destroy link'), async ({ page }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickShareButton();
    await viewModePage.clickGetLinkButton();
    const shareLink = await viewModePage.clickCopyLinkButton();
    await viewModePage.isSuccessMessageDisplayed('Link copied successfully');

    await viewModePage.clickDestroyLinkButton();

    await mainPage.clickPencilBoxButton();
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await profilePage.gotoLink(shareLink);
    viewModePage = new ViewModePage(page);
    await viewModePage.isViewerSectionVisible(false);
    await expect(mainPage.loginDialog).toHaveScreenshot('shared-error-image.png');
    await loginPage.goto();
  });

  mainTest(
    qase([696], 'Share prototype - manage permissions ("Can comment")'),
    async ({ page }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickShareButton();
      await viewModePage.clickManagePermissionsButton();
      await viewModePage.selectAllUsersCommentPermission();
      await viewModePage.clickGetLinkButton();
      const shareLink = await viewModePage.clickCopyLinkButton();
      await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
      await viewModePage.waitSuccessMessageHidden();
      await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
        'view-mode-share-window-all-users-comment-image.png',
        { mask: [viewModePage.copyLinkField] },
      );
      await newPage.close();

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
      await viewModePage.clickCommentsButton();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'view-mode-shared-comments-image.png',
      );
      await viewModePage.gotoLink(process.env.BASE_URL);
      await mainPage.isHeaderDisplayed('Projects');
      await profilePage.logout();
    },
  );

  mainTest(
    qase([697], 'Share prototype - manage permissions ("Can inspect code")'),
    async ({ page }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickShareButton();
      await viewModePage.clickManagePermissionsButton();
      await viewModePage.selectAllUsersInspectPermission();
      await viewModePage.clickGetLinkButton();
      const shareLink = await viewModePage.clickCopyLinkButton();
      await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
      await viewModePage.waitSuccessMessageHidden();
      await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
        'view-mode-share-window-all-users-inspect-image.png',
        { mask: [viewModePage.copyLinkField] },
      );
      await newPage.close();

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
      const inspectPanelPage = new InspectPanelPage(page);
      await viewModePage.isViewerSectionVisible();
      await viewModePage.openInspectTab();
      await inspectPanelPage.openCodeTab();
      await page.waitForTimeout(200);
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'view-mode-shared-code-image.png',
        {
          mask: [inspectPanelPage.codeHtmlStrings],
        },
      );
      await viewModePage.gotoLink(process.env.BASE_URL);
      await mainPage.isHeaderDisplayed('Projects');
      await loginPage.acceptCookie();
      await profilePage.logout();
    },
  );

  mainTest(
    qase([702], 'Comments dropdown (All and Only your comments)'),
    async ({ page }) => {
      await mainTest.slow();
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;

      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      let viewModePage2 = new ViewModePage(newPage);
      await viewModePage2.clickCommentsButton();
      await viewModePage2.addComment();

      const comment = 'Test Comment (main user)';
      let commentsPanelPage = new CommentsPanelPage(newPage);
      await commentsPanelPage.enterCommentText(comment);
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp(comment);
      await newPage.close();
      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

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

      await dashboardPage.openFile();
      await mainPage.isMainPageLoaded();
      const secondPage = await viewModePage.clickViewModeShortcut();
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
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectShowYourCommentsOption();
      await expect(secondPage).toHaveScreenshot('only-your-comments.png', {
        mask: [
          commentsPanelPage.commentsAuthorSection,
          commentsPanelPage.commentAvatarImage,
        ],
      });
      await secondPage.close();

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
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
