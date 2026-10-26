import { ProfilePage } from '@pages/profile-page';
import { CommentsPanelPage } from '@pages/workspace/comments-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect, Page } from '@playwright/test';
import { demoAccountFileTest, demoTeamWithInviteeTest } from 'fixtures';
import { loginAsDemoAccount } from 'helpers/accounts/login-as-demo-account';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { openTeamFile } from 'helpers/teams/open-team-file';
import { qase } from 'playwright-qase-reporter/playwright';

const defaultNameBoard = 'Board';

// A second demo account, logged in in its own browser context, for opening share
// links as another user.
const shareTest = demoAccountFileTest.extend<{ secondUserPage: Page }>({
  secondUserPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const secondUserPage = await context.newPage();
    await loginAsDemoAccount(secondUserPage, { renderer: 'wasm' });
    await use(secondUserPage);
    await context.close();
  },
});
let viewModePage: ViewModePage;
let profilePage: ProfilePage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ page }) => {
    viewModePage = new ViewModePage(page);
    profilePage = new ProfilePage(page);
    layersPanelPage = new LayersPanelPage(page);
    await demoAccountFileTest.slow();
  });

  demoAccountFileTest(
    qase([694], 'Share prototype - destroy link'),
    async ({ page, mainPage }) => {
      let shareLink: string;

      await demoAccountFileTest.step('Create board and open view mode', async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
        const newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
      });

      await demoAccountFileTest.step('Get and copy the share link', async () => {
        await viewModePage.clickShareButton();
        await viewModePage.clickGetLinkButton();
        shareLink = await viewModePage.clickCopyLinkButton();
        await viewModePage.isSuccessMessageDisplayed('Link copied successfully');
      });

      await demoAccountFileTest.step('Destroy the share link', async () => {
        await viewModePage.clickDestroyLinkButton();
      });

      await demoAccountFileTest.step(
        'Log out and verify the destroyed link is no longer accessible',
        async () => {
          await mainPage.clickPencilBoxButton();
          await profilePage.logout();
          await profilePage.gotoLink(shareLink);
          viewModePage = new ViewModePage(page);
          await viewModePage.isViewerSectionVisible(false);
          await expect(mainPage.loginDialog).toHaveScreenshot(
            'shared-error-image.png',
          );
        },
      );
    },
  );

  shareTest(
    qase([696], 'Share prototype - manage permissions ("Can comment")'),
    async ({ mainPage, secondUserPage }) => {
      let shareLink: string;
      let newPage: Page;

      await shareTest.step('Create board and open view mode', async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
        newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
      });

      await shareTest.step(
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

      await shareTest.step('Open the shared link as a second user', async () => {
        await secondUserPage.goto(shareLink, { waitUntil: 'networkidle' });
        viewModePage = new ViewModePage(secondUserPage);
        await viewModePage.isViewerSectionVisible();
      });

      await shareTest.step('Open comments panel and verify', async () => {
        await viewModePage.clickCommentsButton();
        await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
          'view-mode-shared-comments-image.png',
        );
      });
    },
  );

  shareTest(
    qase([697], 'Share prototype - manage permissions ("Can inspect code")'),
    async ({ mainPage, secondUserPage }) => {
      let shareLink: string;
      let newPage: Page;

      await shareTest.step('Create board and open view mode', async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await layersPanelPage.isNumLayerNameVisible(defaultNameBoard, 1);
        newPage = await viewModePage.clickViewModeShortcut();
        viewModePage = new ViewModePage(newPage);
        await viewModePage.waitForViewerSection(45000);
      });

      await shareTest.step(
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

      await shareTest.step('Open the shared link as a second user', async () => {
        await secondUserPage.goto(shareLink, { waitUntil: 'networkidle' });
        viewModePage = new ViewModePage(secondUserPage);
        await viewModePage.isViewerSectionVisible();
      });

      await shareTest.step('Open Inspect tab code and verify', async () => {
        const inspectPanelPage = new InspectPanelPage(secondUserPage);
        await viewModePage.openInspectTab();
        await inspectPanelPage.openCodeTab();
        await secondUserPage.waitForTimeout(200);
        await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
          'view-mode-shared-code-image.png',
          {
            mask: [inspectPanelPage.codeHtmlStrings],
          },
        );
      });
    },
  );
});

demoTeamWithInviteeTest.describe(() => {
  demoTeamWithInviteeTest.use({ inviteeRole: InvitationRole.Admin });

  demoTeamWithInviteeTest(
    qase([702], 'Comments dropdown (All and Only your comments)'),
    async ({ page, mainPage, invitee, team }) => {
      demoTeamWithInviteeTest.slow();
      let secondPage: Page;
      let adminViewModePage: ViewModePage;
      let adminComments: CommentsPanelPage;

      await demoTeamWithInviteeTest.step(
        'Post a comment as the owner in view mode',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(300, 300);
          await new LayersPanelPage(page).isNumLayerNameVisible(defaultNameBoard, 1);
          const ownerViewPage = await new ViewModePage(page).clickViewModeShortcut();
          const ownerViewModePage = new ViewModePage(ownerViewPage);
          await ownerViewModePage.clickCommentsButton();
          await ownerViewModePage.addComment();

          const comment = 'Test Comment (main user)';
          const ownerComments = new CommentsPanelPage(ownerViewPage);
          await ownerComments.postComment(comment);
          await ownerComments.isCommentDisplayedInPopUp(comment);
          await ownerViewPage.close();
        },
      );

      await demoTeamWithInviteeTest.step(
        'As the admin, post a comment in view mode and verify both are shown',
        async () => {
          await openTeamFile(invitee.page, team.id);
          secondPage = await new ViewModePage(invitee.page).clickViewModeShortcut();
          adminViewModePage = new ViewModePage(secondPage);
          await adminViewModePage.clickCommentsButton();
          await adminViewModePage.addComment(true);
          const comment2 = 'Test Comment (main user)';
          adminComments = new CommentsPanelPage(secondPage);
          await adminComments.postComment(comment2);
          await adminComments.isCommentDisplayedInPopUp(comment2);
          await expect(secondPage).toHaveScreenshot('all-users-comments.png', {
            mask: [
              adminComments.commentsAuthorSection,
              adminComments.commentAvatarImage,
            ],
          });
        },
      );

      await demoTeamWithInviteeTest.step(
        'Filter to show only your comments and verify',
        async () => {
          await adminViewModePage.openCommentsDropdown();
          await adminViewModePage.selectShowYourCommentsOption();
          await expect(secondPage).toHaveScreenshot('only-your-comments.png', {
            mask: [
              adminComments.commentsAuthorSection,
              adminComments.commentAvatarImage,
            ],
          });
        },
      );
    },
  );
});
