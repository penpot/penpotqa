const { expect, test } = require('@playwright/test');
const { mainTest } = require('../fixtures');
const { MainPage } = require('../pages/workspace/main-page');
const { random } = require('../helpers/string-generator');
const { TeamPage } = require('../pages/dashboard/team-page');
const { DashboardPage } = require('../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { ViewModePage } = require('../pages/workspace/view-mode-page');
const { PrototypePanelPage } = require('../pages/workspace/prototype-panel-page');
const { CommentsPanelPage } = require('../pages/workspace/comments-panel-page');
const { DesignPanelPage } = require('../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../pages/workspace/layers-panel-page');
const { InspectPanelPage } = require('../pages/workspace/inspect-panel-page');
const { ProfilePage } = require('../pages/profile-page');
const { LoginPage } = require('../pages/login-page');
const { RegisterPage } = require('../pages/register-page');
const { waitMessage } = require('../helpers/gmail');

const teamName = random().concat('autotest');

let teamPage,
  dashboardPage,
  mainPage,
  viewModePage,
  prototypePanelPage,
  designPanelPage,
  layersPanelPage,
  profilePage,
  loginPage,
  registerPage;
test.beforeEach(async ({ page, browserName }, testInfo) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  viewModePage = new ViewModePage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  browserName === 'webkit'
    ? await testInfo.setTimeout(testInfo.timeout + 40000)
    : await testInfo.setTimeout(testInfo.timeout + 10000);
  await teamPage.createTeam(teamName);
  browserName === 'webkit' ? await teamPage.waitForTeamBtn(15000) : null;
  await teamPage.isTeamSelected(teamName, browserName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }, testInfo) => {
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(
    qase([685], 'CO-364 Click view mode (From right top click) - no boards created'),
    async ({ browserName }) => {
      const newPage = await viewModePage.clickViewModeButton();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'no-board-view-mode-page-image.png',
      );
    },
  );

  mainTest(
    qase([688], 'CO-367 Click view mode (From shortcut G+V) - board is created'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-page-image.png',
      );
    },
  );

  mainTest(qase([690], 'CO-369 Full screen on/off'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickFullScreenButton();
    await expect(viewModePage.fullScreenSection).toHaveScreenshot(
      'view-mode-full-screen-image.png',
    );
    await viewModePage.clickOnESC();
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'view-mode-page-image.png',
    );
  });

  mainTest(
    qase([698], 'CO-377 Click arrows to navigate to other boards'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultBoardByCoordinates(500, 500, true);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
      await viewModePage.clickNextButton();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'second-board-view-mode-page-image.png',
      );
      await viewModePage.clickPrevButton();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
      await viewModePage.clickNextButton();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'second-board-view-mode-page-image.png',
      );
      await viewModePage.clickPrevButton();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
    },
  );

  mainTest(
    qase([700], 'CO-379 Click Back icon to reset view'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultBoardByCoordinates(500, 500, true);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultBoardByCoordinates(100, 100, true);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
      await viewModePage.clickNextButton();
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'second-board-view-mode-page-image.png',
      );
      await viewModePage.clickNextButton();
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'third-board-view-mode-page-image.png',
      );
      await viewModePage.clickResetButton();
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
    },
  );

  mainTest(
    qase([699], 'CO-378 Click board dropdown to navigate to other boards'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultBoardByCoordinates(500, 500, true);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickSelectBoardDropdown();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'board-dropdown-view-mode-page-image.png',
      );
      await viewModePage.selectSecondBoard();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'second-board-selected-view-mode-page-image.png',
      );
      await viewModePage.selectFirstBoard();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'first-board-selected-view-mode-page-image.png',
      );
    },
  );

  mainTest(qase([689], 'CO-368 Interactions dropdown'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.createDefaultBoardByCoordinates(500, 500, true);
    await mainPage.waitForChangeIsSaved();
    await prototypePanelPage.clickPrototypeTab();
    await prototypePanelPage.dragAndDropPrototypeArrowConnector(300, 300);
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickInteractionsDropdown();
    await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
      'show-on-click-interactions-options-default-image.png',
    );
    await viewModePage.selectShowInteractionsOptions();
    await viewModePage.clickOnBoardCounter();
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'show-interactions-board-view-mode-page-image.png',
    );
    await viewModePage.clickInteractionsDropdown();
    await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
      'interactions-show-options-image.png',
    );
    await viewModePage.selectShowOnClickInteractionsOptions();
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'show-on-click-interactions-board-view-mode-page-image.png',
    );
    await viewModePage.clickOnBoardCounter();
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'show-on-click-interactions-board-view-mode-page-image2.png',
    );
  });

  mainTest(qase([691], 'CO-370 Change scale'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.openScaleDropdown();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.scaleDropdownOptions).toHaveScreenshot(
      'scale-dropdown-view-mode-page-image.png',
    );
    await viewModePage.clickDownscaleButton();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'downscale-board-view-mode-page-image.png',
    );
    await viewModePage.clickResetScaleButton();
    await viewModePage.clickUpscaleButton();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'upscale-board-view-mode-page-image.png',
    );
    await viewModePage.selectFitScaleOptions();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'fit-scale-board-view-mode-page-image.png',
    );
    await viewModePage.selectFillScaleOptions();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'fill-scale-board-view-mode-page-image.png',
    );
    await viewModePage.selectFullScreenScaleOptions();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.fullScreenSection).toHaveScreenshot(
      'full-screen-scale-board-view-mode-page-image.png',
    );
    await viewModePage.clickResetScaleButton();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.fullScreenSection).toHaveScreenshot(
      'full-screen-default-scale-board-view-mode-page-image.png',
    );
  });

  mainTest(
    qase([713], 'CO-392 Zoom by pressing + and - keys'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickOnAdd();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-page-add-button-image.png',
      );
      await viewModePage.clickOnSubtract();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-page-subtract-button-image.png',
      );
    },
  );

  mainTest(qase([708], 'CO-387 Page dropdown'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.openPageDropdown();
    await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
      'page-list-image.png',
    );
    await viewModePage.selectPageByName('Page 2');
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'view-mode-2page-image.png',
    );
    await viewModePage.openPageDropdown();
    await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
      'page-list-image2.png',
    );
    await viewModePage.selectPageByName('Page 1');
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'view-mode-1page-image.png',
    );
  });

  mainTest(qase([701], 'CO-380 Create comment'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickCommentsButton();
    await viewModePage.addComment();

    const comment = 'Test Comment';
    const commentsPanelPage = new CommentsPanelPage(newPage);
    await commentsPanelPage.enterCommentText('Test Comment');
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(comment);
    await expect(newPage).toHaveScreenshot('comment-opened-pop-up.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
    await viewModePage.clickOnViewport();
    await commentsPanelPage.isCommentThreadIconDisplayed();
    await expect(newPage).toHaveScreenshot('comment-closed-pop-up.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });

  mainTest(qase([709], 'CO-388 Reply comment'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickCommentsButton();
    await viewModePage.addComment();

    const replyComment =
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry';
    const commentsPanelPage = new CommentsPanelPage(newPage);
    await commentsPanelPage.enterCommentText('Test Comment');
    await commentsPanelPage.clickPostCommentButton();

    await commentsPanelPage.enterReplyText(replyComment);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentReplyDisplayedInPopUp(replyComment);
    await expect(newPage).toHaveScreenshot('comment-reply.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });

  mainTest(qase([710], 'CO-389 Edit comment'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickCommentsButton();
    await viewModePage.addComment();

    const editedComment = 'Edited Test Comment';
    const commentsPanelPage = new CommentsPanelPage(newPage);
    await commentsPanelPage.enterCommentText('Test Comment');
    await commentsPanelPage.clickPostCommentButton();

    await commentsPanelPage.clickCommentOptionsButton();
    await commentsPanelPage.clickEditCommentOption();
    await commentsPanelPage.enterCommentText(editedComment, true);
    await commentsPanelPage.clickPostCommentButton();
    await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
    await commentsPanelPage.reloadPage();
    await commentsPanelPage.clickCommentThreadIcon();
    await commentsPanelPage.isCommentDisplayedInPopUp(editedComment);
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(newPage).toHaveScreenshot('comment-edited.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });

  mainTest(qase([711], 'CO-390 Delete thread'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickCommentsButton();
    await viewModePage.addComment();

    const commentsPanelPage = new CommentsPanelPage(newPage);
    await commentsPanelPage.enterCommentText('Test Comment');
    await commentsPanelPage.clickPostCommentButton();

    await commentsPanelPage.clickCommentHeaderOptionsButton();
    await commentsPanelPage.clickDeleteCommentOption();
    await commentsPanelPage.clickDeleteThreadButton();
    await commentsPanelPage.isCommentThreadIconNotDisplayed();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(newPage).toHaveScreenshot('comment-removed.png', {
      mask: [commentsPanelPage.commentsAuthorSection],
    });
  });

  mainTest(
    qase([703], 'CO-382 Comments dropdown (Hide resolved comments)'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      const commentsPanelPage = new CommentsPanelPage(newPage);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
      await commentsPanelPage.clickResolveCommentCheckbox();
      await commentsPanelPage.clickResolvedCommentThreadIcon();
      await viewModePage.addComment(true);
      await commentsPanelPage.enterCommentText('Test Comment 2');
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment 2');
      await viewModePage.clickCommentsButton();

      await viewModePage.openCommentsDropdown();
      await viewModePage.selectHideResolvedCommentsOption();
      await commentsPanelPage.isCommentResolvedThreadIconNotDisplayed();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(newPage).toHaveScreenshot('resolved-comments-hidden.png', {
        mask: [commentsPanelPage.commentsAuthorSection],
      });
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectHideResolvedCommentsOption();
      await commentsPanelPage.isCommentResolvedThreadIconDisplayed();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
      await expect(newPage).toHaveScreenshot('resolved-comments-show.png', {
        mask: [commentsPanelPage.commentsAuthorSection],
      });
    },
  );

  mainTest(
    qase([704], 'CO-383 Comments dropdown (Show comments list)'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      const commentsPanelPage = new CommentsPanelPage(newPage);
      await viewModePage.clickCommentsButton();
      await viewModePage.addComment();
      await commentsPanelPage.enterCommentText('Test Comment');
      await commentsPanelPage.clickPostCommentButton();
      await commentsPanelPage.isCommentDisplayedInPopUp('Test Comment');
      await viewModePage.clickOnViewport();

      await viewModePage.openCommentsDropdown();
      await viewModePage.selectShowCommentsListOption();
      await viewModePage.isCommentInListVisible(true);
      await expect(viewModePage.commentsRightPanel).toHaveScreenshot(
        'comments-list.png',
        {
          mask: [commentsPanelPage.commentsAuthorSection],
        },
      );
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectShowCommentsListOption();
      await viewModePage.isCommentInListVisible(false);
      await expect(newPage).toHaveScreenshot('comments-list-hidden.png', {
        mask: [commentsPanelPage.commentsAuthorSection],
      });
    },
  );

  mainTest(qase([706], 'CO-385 Switch to Inspect view'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.openInspectTab();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'view-mode-inspect-page-image.png',
    );
    await viewModePage.openInteractionsTab();
    browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
    await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
      'view-mode-interactions-page-image.png',
    );
  });

  mainTest(
    qase(
      [715],
      'CO-394 Inspect functionality - Board elements dropdown in the top left',
    ),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await designPanelPage.changeHeightAndWidthForLayer('200', '200');
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultRectangleByCoordinates(320, 320);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();

      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      layersPanelPage = new LayersPanelPage(newPage);
      const inspectPanelPage = new InspectPanelPage(newPage);
      await viewModePage.openInspectTab();
      await layersPanelPage.clickLayerOnLayersTab('Rectangle');
      await inspectPanelPage.openCodeTab();
      await newPage.waitForTimeout(200);
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-code-tab-image.png',
      );
    },
  );

  mainTest(
    qase([717], 'CO-396 Inspect functionality- Export'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await designPanelPage.changeHeightAndWidthForLayer('200', '200');
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultRectangleByCoordinates(320, 320);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();

      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      designPanelPage = new DesignPanelPage(newPage);
      await viewModePage.openInspectTab();

      await designPanelPage.clickAddExportButtonForViewMode();
      await designPanelPage.isExportElementButtonDisplayed('Export 1 element');
      await expect(viewModePage.rightSidebar).toHaveScreenshot(
        'view-mode-export-right-sidebar-image.png',
      );

      await designPanelPage.clickExportElementButton(newPage);
    },
  );

  mainTest(
    qase(1785, 'CO-387 Switch between layers from left menu'),
    async ({ browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await designPanelPage.changeHeightAndWidthForLayer('500', '700');
      await mainPage.waitForChangeIsSaved();
      await mainPage.uploadImage('images/mini_sample.jpg');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('mini_sample');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultRectangleByCoordinates(220, 220);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultEllipseByCoordinates(330, 220, true);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultTextLayerByCoordinates(220, 330, browserName);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Hello World!');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createSmallClosedPathByCoordinates(330, 330);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.dragAndDropComponentToBoard('Path');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();

      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      layersPanelPage = new LayersPanelPage(newPage);
      await viewModePage.openInspectTab();
      await layersPanelPage.clickLayerOnLayersTab('Rectangle');
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-rectangle-selected-image.png',
      );
      await layersPanelPage.clickLayerOnLayersTab('Ellipse');
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-ellipse-selected-image.png',
      );
      await layersPanelPage.clickLayerOnLayersTab('Hello World!');
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-test-selected-image.png',
      );
      await layersPanelPage.clickLayerOnLayersTab('Path');
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-path-selected-image.png',
      );
      await layersPanelPage.clickLayerOnLayersTab('mini_sample');
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-image-selected-image.png',
      );
    },
  );

  mainTest(qase([1787], 'CO-389 Copy layout and paste'), async ({ browserName }) => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();

    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    layersPanelPage = new LayersPanelPage(newPage);
    await viewModePage.openInspectTab();
    await viewModePage.copyWidth();
    await expect(viewModePage.rightSidebar).toHaveScreenshot(
      'view-mode-copy-width-image.png',
    );
    await viewModePage.checkBuffer('width: 200px;', newPage, browserName);
  });

  mainTest(qase([705], 'CO-384 Edit file'), async ({ page, browserName }) => {
    if (browserName === 'webkit') {
    } else {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await designPanelPage.changeHeightAndWidthForLayer('200', '200');
      await mainPage.waitForChangeIsSaved();

      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      layersPanelPage = new LayersPanelPage(newPage);

      await viewModePage.clickEditButton();
      await newPage.waitForTimeout(1000);
      await viewModePage.isPageSwitched(newPage);

      await page.close();
      await viewModePage.clickEditButton();
      const oldPage = await viewModePage.clickEditButton(false);
      mainPage = new MainPage(oldPage);
      teamPage = new TeamPage(oldPage);
      await mainPage.waitForViewportVisible();
      await expect(mainPage.viewport).toHaveScreenshot('main-page-opened.png');
    }
  });
});

mainTest.describe(() => {
  mainTest(
    qase([693], 'CO-372 Share prototype - get link (2 pages)'),
    async ({ page, browserName }) => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickAddPageButton();
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
      await viewModePage.clickShareButton();
      browserName === 'webkit' ? await newPage.waitForTimeout(1000) : null;
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
      await expect(newViewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-shared-image.png',
      );
      await loginPage.goto();
    },
  );

  mainTest(
    qase([694], 'CO-373 Share prototype - destroy link'),
    async ({ page, browserName }) => {
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
    },
  );

  mainTest(
    qase([696], 'CO-375 Share prototype - manage permissions ("Can comment")'),
    async ({ page, browserName }) => {
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
      await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
        'view-mode-share-window-all-users-comment-image.png',
        { mask: [viewModePage.copyLinkField] },
      );
      await newPage.close();

      await mainPage.clickPencilBoxButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await profilePage.gotoLink(shareLink);
      viewModePage = new ViewModePage(page);
      await viewModePage.isViewerSectionVisible();
      await viewModePage.clickCommentsButton();
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-shared-comments-image.png',
      );
      await viewModePage.gotoLink(process.env.BASE_URL);
      await mainPage.isHeaderDisplayed('Projects');
      await profilePage.logout();
    },
  );

  mainTest(
    qase(
      [697],
      'CO-376 Share prototype - manage permissions ("Can inspect code  ")',
    ),
    async ({ page, browserName }) => {
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
      await expect(viewModePage.shareLinkDialog).toHaveScreenshot(
        'view-mode-share-window-all-users-inspect-image.png',
        { mask: [viewModePage.copyLinkField] },
      );
      await newPage.close();

      await mainPage.clickPencilBoxButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
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
      await expect(viewModePage.viewerLoyautSection).toHaveScreenshot(
        'view-mode-shared-code-image.png',
      );
      await viewModePage.gotoLink(process.env.BASE_URL);
      await mainPage.isHeaderDisplayed('Projects');
      await profilePage.logout();
    },
  );

  mainTest(
    qase(702, 'CO-381 Comments dropdown (All and Only your comments)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;

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
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
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
        mask: [commentsPanelPage.commentsAuthorSection],
      });
      await viewModePage.openCommentsDropdown();
      await viewModePage.selectShowYourCommentsOption();
      await expect(secondPage).toHaveScreenshot('only-your-comments.png', {
        mask: [commentsPanelPage.commentsAuthorSection],
      });
      await secondPage.close();

      await mainPage.backToDashboardFromFileEditor();
      await profilePage.logout();
    },
  );

  mainTest.afterEach(async () => {
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });
});
