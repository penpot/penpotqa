import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { PrototypePanelPage } from '@pages/workspace/prototype-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let pagesPanelPage: PagesPanelPage;
let viewModePage: ViewModePage;
let prototypePanelPage: PrototypePanelPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  pagesPanelPage = new PagesPanelPage(page);
  viewModePage = new ViewModePage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainTest.slow();
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest(
  qase([685], 'Click view mode (From right top click) - no boards created'),
  async () => {
    const newPage = await viewModePage.clickViewModeButton();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'no-board-view-mode-page-image.png',
    );
  },
);

mainTest(
  qase([688], 'Click view mode (From shortcut G+V) - board is created'),
  async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-page-image.png',
    );
  },
);

mainTest(qase([690], 'Full screen on/off'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await viewModePage.clickFullScreenButton();
  await viewModePage.exitFullScreenMode();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-page-image.png',
  );
});

mainTest(qase([698], 'Click arrows to navigate to other boards'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png',
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png',
  );
  await viewModePage.clickPrevButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png',
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png',
  );
  await viewModePage.clickPrevButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png',
  );
});

mainTest(qase([700], 'Click Back icon to reset view'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(500, 500, true);
  await mainPage.waitForChangeIsSaved();
  await mainPage.createDefaultBoardByCoordinates(100, 100, true);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png',
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'second-board-view-mode-page-image.png',
  );
  await viewModePage.clickNextButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'third-board-view-mode-page-image.png',
  );
  await viewModePage.clickResetButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'first-board-view-mode-page-image.png',
  );
});

mainTest(
  qase([699], 'Click board dropdown to navigate to other boards'),
  async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultBoardByCoordinates(500, 500, true);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
    await viewModePage.clickSelectBoardDropdown();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'board-dropdown-view-mode-page-image.png',
    );
    await viewModePage.selectSecondBoard();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'second-board-selected-view-mode-page-image.png',
    );
    await viewModePage.selectFirstBoard();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'first-board-selected-view-mode-page-image.png',
    );
  },
);

mainTest(qase([689], 'Interactions dropdown'), async () => {
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
  await viewModePage.clickInteractionsDropdown();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'show-interactions-board-view-mode-page-image.png',
  );
  await viewModePage.clickInteractionsDropdown();
  await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
    'interactions-show-options-image.png',
  );
  await viewModePage.selectShowOnClickInteractionsOptions();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'show-on-click-interactions-board-view-mode-page-image.png',
  );
  await viewModePage.clickInteractionsDropdown();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'show-on-click-interactions-board-view-mode-page-image2.png',
  );
});

mainTest(qase([691], 'Change scale'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await viewModePage.openScaleDropdown();
  await expect(viewModePage.scaleDropdownOptions).toHaveScreenshot(
    'scale-dropdown-view-mode-page-image.png',
  );
  await viewModePage.clickDownscaleButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'downscale-board-view-mode-page-image.png',
  );
  await viewModePage.clickResetScaleButton();
  await viewModePage.clickUpscaleButton();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'upscale-board-view-mode-page-image.png',
  );
  await viewModePage.selectFitScaleOptions();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'fit-scale-board-view-mode-page-image.png',
  );
  await viewModePage.selectFillScaleOptions();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'fill-scale-board-view-mode-page-image.png',
  );
  await viewModePage.selectFullScreenScaleOptions();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'full-screen-scale-board-view-mode-page-image.png',
  );
  await viewModePage.clickResetScaleButton();
  await expect(viewModePage.fullScreenSection).toHaveScreenshot(
    'full-screen-default-scale-board-view-mode-page-image.png',
  );
});

// TODO: The reference does not exist in Qase.
mainTest(qase([713], 'CO-392 Zoom by pressing + and - keys'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await viewModePage.clickOnAdd();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-page-add-button-image.png',
  );
  await viewModePage.clickOnSubtract();
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-page-subtract-button-image.png',
  );
});

mainTest(qase([708], 'Page dropdown'), async () => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await mainPage.waitForChangeIsSaved();
  await pagesPanelPage.clickAddPageButton();
  await mainPage.waitForChangeIsSaved();
  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);
  await viewModePage.openPageDropdown();
  await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
    'page-list-image.png',
  );
  await viewModePage.selectPageByName('Page 2');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-2page-image.png',
  );
  await viewModePage.openPageDropdown();
  await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
    'page-list-image2.png',
  );
  await viewModePage.selectPageByName('Page 1');
  await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
    'view-mode-1page-image.png',
  );
});

mainTest(qase([705], 'Edit file'), async ({ page }) => {
  await mainPage.createDefaultBoardByCoordinates(300, 300);
  await designPanelPage.changeHeightAndWidthForLayer('200', '200');
  await mainPage.waitForChangeIsSaved();

  const newPage = await viewModePage.clickViewModeShortcut();
  viewModePage = new ViewModePage(newPage);
  await viewModePage.waitForViewerSection(45000);

  await viewModePage.clickEditButton();
  await newPage.waitForTimeout(2000);
  await viewModePage.isPageSwitched(newPage);

  await page.close();
  await viewModePage.clickEditButton();
  const oldPage = await viewModePage.clickEditButton(false);
  mainPage = new MainPage(oldPage);
  teamPage = new TeamPage(oldPage);
  await mainPage.waitForViewportVisible();
  await expect(mainPage.viewport).toHaveScreenshot('main-page-opened.png', {
    mask: mainPage.maskViewport(),
  });
});
