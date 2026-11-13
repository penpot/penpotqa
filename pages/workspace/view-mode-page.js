const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');
const {
  ExportSectionComponent,
  getExportSectionRoot,
} = require('../components/export-section-component');

exports.ViewModePage = class ViewModePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Assets panel
    this.viewModeButton = page.getByRole('button', { name: 'View mode (G V)' });
    this.viewerLayoutSection = page.locator('#viewer-layout');
    this.inspectButton = page.getByRole('button', { name: 'Inspect' });
    this.rightSidebar = page.locator(`aside[class*='inspect_right_sidebar']`);
    // Inspect tab shows the same Export section as the workspace Design tab
    this.exportSection = new ExportSectionComponent(
      page,
      getExportSectionRoot(this.rightSidebar),
    );
    this.fullScreenButton = page.getByRole('button', {
      name: 'Full Screen',
      exact: true,
    });
    this.fullScreenSection = page.locator(
      `section[class*="main_ui_viewer__fullscreen"]`,
    );
    this.prevBoardButton = page.getByRole('button', {
      name: 'Previous',
      exact: true,
    });
    this.nextBoardButton = page.getByRole('button', { name: 'Next', exact: true });
    this.resetBoardButton = page.getByRole('button', {
      name: 'Go to the first board',
    });
    this.selectBoardDropdown = page.locator('#current-frame');
    this.boardTitle = page.locator('div[class*="thumbnail-info"]');
    this.interactionsArrow = page.locator('.interactions .selected');
    this.interactionsDropdown = page.locator(
      'span[class*="interactions__dropdown-title"]:has-text("Interactions")',
    );
    this.interactionsDropdownOptions = page.locator(
      'ul[class*="interactions__dropdown"]',
    );
    this.doNotShowInterOptions = page
      .getByRole('listitem')
      .filter({ hasText: "Don't show interactions" });
    this.showInterOptions = page
      .getByRole('listitem')
      .filter({ hasText: /^Show interactions$/ });
    this.showOnClickInterOptions = page
      .getByRole('listitem')
      .filter({ hasText: 'Show interactions on click' });
    this.boardCounter = page.locator('.main_ui_viewer__counter');
    this.scaleDropdown = page.locator('div[class*="header__zoom-widget"]');
    this.upscaleButton = page.getByRole('button', { name: 'Zoom out' });
    this.downscaleButton = page.getByRole('button', { name: 'Zoom in' });
    this.scaleResetButton = page.getByRole('button', { name: 'Reset' });
    this.scaleFitOptions = page
      .getByRole('listitem')
      .filter({ hasText: 'Fit - Scale down to fit' });
    this.scaleFillOptions = page
      .getByRole('listitem')
      .filter({ hasText: 'Fill - Scale to fill' });
    this.scaleFullScreenOptions = page
      .getByRole('listitem')
      .filter({ hasText: 'Full screen' });
    this.scaleDropdownOptions = page.locator('ul[class*="header__dropdown"]');
    this.pageDropdown = page.locator('span[class*="header__breadcrumb-text"]');
    this.pageDropdownOptions = page.locator('ul[class*="dropdown-sitemap"]');
    this.commentsButton = page.getByRole('button', { name: /^Comments \(/ });
    this.commentsContainer = page.locator('div[class*="viewer-comments-container"]');
    this.commentsDropdown = page.getByTestId('viewer-comments-dropdown');
    this.commentsDropdownOptions = page.locator(
      'ul[class*="viewer_comments__dropdown"]',
    );
    this.showAllCommentsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show all comments' });
    this.showYourCommentsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show only your comments' });
    this.hideResolvedCommentsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Hide resolved comments' });
    this.showCommentsListOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show comments list' });
    this.commentsRightPanel = page.locator(
      'div[class*="comments__settings-bar-inside"]',
    );
    this.commentCommentsPanelText = page.locator(
      'div[class*="comments__settings-bar-inside"] div[class*="comments__item"]',
    );
    this.interactionsButton = page.getByRole('button', { name: 'Interactions' });
    this.widthCopyButton = page.locator('button[class*="copy_button"]').first();
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.shareButton = page.getByRole('button', { name: 'Share' });
    this.shareLinkDialog = page.locator('div[class*="share-link-dialog"]');
    this.getLinkButton = page.getByRole('button', { name: 'Get link' });
    this.managePermissionsButton = page.getByRole('button', {
      name: 'Manage permissions',
    });
    this.selectAllCheckbox = page.getByText('Select All', { exact: true });
    this.copyLinkButton = page.getByRole('button', { name: 'Copy link' });
    this.copyLinkField = page.getByPlaceholder('Shareable link will appear here');
    this.destroyLinkButton = page.getByRole('button', { name: 'Destroy link' });
    this.commentPermissionDropdown = page.locator(
      'div[class*="who-comment-select"]',
    );
    this.inspectPermissionDropdown = page.locator(
      'div[class*="who-inspect-select"]',
    );
    this.allUsersOption = page
      .getByRole('option')
      .filter({ hasText: 'All Penpot users' });
    this.homeButton = page.locator('svg[class*="header__logo-icon"]');
  }

  async clickViewModeButton() {
    const popupPromise = this.page.waitForEvent('popup');
    await this.viewModeButton.click();
    return popupPromise;
  }

  async clickViewModeShortcut() {
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.keyboard.press('G+V');
    return popupPromise;
  }

  /** Opens the Inspect tab and moves the pointer off the header button. */
  async openInspectTab() {
    await this.inspectButton.click();
    await expect(this.rightSidebar).toBeVisible();
    // The DS tooltip of the hovered button would end up in snapshots.
    await this.page.mouse.move(500, 700);
  }

  async openInteractionsTab() {
    await this.interactionsButton.click();
  }

  async clickFullScreenButton() {
    await this.fullScreenButton.click();
    await this.fullScreenSection.hover();
    await expect(this.fullScreenSection).toBeVisible();
  }

  /**
   * Shows the viewer header in full screen mode, where it stays hidden above the
   * screen until the pointer hovers the top edge.
   */
  async showFullScreenHeader() {
    await this.page.mouse.move(100, 5);
    await expect(
      this.scaleDropdown,
      'Viewer header should be visible',
    ).toBeInViewport();
  }

  async exitFullScreenMode() {
    await this.fullScreenSection.hover();
    await this.fullScreenSection.click({ position: { x: 100, y: 100 } });
    await this.fullScreenButton.click();
    await expect(this.fullScreenSection).not.toBeVisible();
  }

  async clickPrevButton() {
    await this.prevBoardButton.click();
  }

  async clickNextButton() {
    await this.nextBoardButton.click();
  }

  async clickResetButton() {
    await this.resetBoardButton.click();
  }

  async clickSelectBoardDropdown() {
    await this.selectBoardDropdown.click();
  }

  async selectFirstBoard() {
    await this.boardTitle.first().click();
  }

  async selectSecondBoard() {
    await this.boardTitle.last().click();
  }

  async clickInteractionsDropdown() {
    await this.interactionsDropdown.click();
  }

  async selectShowInteractionsOptions() {
    await this.showInterOptions.click();
  }

  async selectShowOnClickInteractionsOptions() {
    await this.showOnClickInterOptions.click();
  }

  async clickOnViewSection() {
    await this.viewerLayoutSection.click();
  }

  async clickOnBoardCounter() {
    await this.boardCounter.click();
  }

  async openScaleDropdown() {
    await this.scaleDropdown.click();
  }
  async clickDownscaleButton() {
    await this.downscaleButton.click();
  }

  async clickUpscaleButton() {
    await this.upscaleButton.click();
  }

  async clickResetScaleButton() {
    await this.scaleResetButton.click();
  }

  async selectFitScaleOptions() {
    await this.scaleFitOptions.click();
  }

  async selectFillScaleOptions() {
    await this.scaleFillOptions.click();
  }

  async selectFullScreenScaleOptions() {
    await this.scaleFullScreenOptions.click();
  }

  async openPageDropdown() {
    await this.pageDropdown.click();
  }

  async selectPageByName(name) {
    const option = await this.page.getByRole('listitem').filter({ hasText: name });
    await option.first().click();
  }

  async clickCommentsButton() {
    await this.commentsButton.click();
  }

  async addComment(second = false) {
    second
      ? await this.commentsContainer.click()
      : await this.commentsContainer.click({
          position: { x: 10, y: 10 },
        });
  }

  async clickOnViewport() {
    await this.commentsContainer.click();
  }

  async openCommentsDropdown() {
    await this.commentsDropdown.click();
  }

  async selectShowAllCommentsOption() {
    await this.showAllCommentsOption.click();
  }

  async selectShowYourCommentsOption() {
    await this.showYourCommentsOption.click();
  }

  async selectHideResolvedCommentsOption() {
    await this.hideResolvedCommentsOption.click();
  }

  async selectShowCommentsListOption() {
    await this.showCommentsListOption.click();
  }

  async isCommentsListVisible(visible = true) {
    visible
      ? await expect(this.commentsRightPanel).toBeVisible()
      : await expect(this.commentsRightPanel).not.toBeVisible();
  }

  async isCommentInListVisible(visible = true) {
    visible
      ? await expect(this.commentCommentsPanelText.last()).toBeVisible()
      : await expect(this.commentCommentsPanelText.last()).not.toBeVisible();
  }

  async copyWidth() {
    await this.widthCopyButton.click();
  }

  async checkBuffer(expectedValue, page) {
    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(clipboardText).toBe(expectedValue);
  }

  async clickEditButton(first = true) {
    if (first) {
      await this.editButton.click();
    } else {
      const popupPromise = this.page.waitForEvent('popup');
      await this.editButton.click();
      return popupPromise;
    }
  }

  async isPageSwitched(newPage) {
    const pages = await newPage.context().pages();
    const activePage = await Promise.race(
      pages.map(async (p) => {
        const isActive = await p.evaluate(() => document.hasFocus());
        return isActive ? p : null;
      }),
    );
    expect(activePage).not.toBe(newPage);
  }

  async clickShareButton() {
    await this.shareButton.click();
  }

  async clickGetLinkButton() {
    await this.getLinkButton.click();
  }

  async clickManagePermissionsButton() {
    await this.managePermissionsButton.click();
  }

  async selectAllPages() {
    await this.selectAllCheckbox.click();
  }

  async clickCopyLinkButton() {
    await this.copyLinkButton.click();
    return await this.copyLinkField.inputValue();
  }

  async isViewerSectionVisible(visible = true) {
    visible
      ? await expect(this.viewerLayoutSection).toBeVisible()
      : await expect(this.viewerLayoutSection).not.toBeVisible();
  }

  async waitForViewerSection(timeout = 10000) {
    await this.viewerLayoutSection.waitFor({ state: 'visible', timeout: timeout });
  }

  async clickDestroyLinkButton() {
    await this.destroyLinkButton.click();
    await this.destroyLinkButton.click();
  }

  async selectAllUsersCommentPermission() {
    await this.commentPermissionDropdown.click();
    await this.allUsersOption.click();
  }

  async selectAllUsersInspectPermission() {
    await this.inspectPermissionDropdown.click();
    await this.allUsersOption.click();
  }

  async gotoHome() {
    await this.homeButton.click();
  }

  async isShareButtonVisible() {
    await expect(this.shareButton).toBeVisible();
  }

  async isBoardCounterVisible() {
    await expect(this.boardCounter).toBeVisible();
  }

  /**
   * The viewer animates the board container with the Web Animations API. A
   * Slide only moves the incoming board in (`left` -100px → 0px); Push also
   * moves the old board out (0px → 100px) and Dissolve animates `opacity`.
   * Only catchable while it runs, so give the interaction a long duration.
   */
  async checkSlideAnimationRunning() {
    await expect
      .poll(
        () =>
          this.page.evaluate(() => {
            const transitions = document
              .getAnimations()
              .filter((animation) => animation.playState === 'running')
              .map((animation) => animation.effect)
              .filter((effect) =>
                String(effect.target?.className).includes('viewport-container'),
              )
              .map((effect) =>
                effect
                  .getKeyframes()
                  .map(({ left, opacity }) => `left:${left} opacity:${opacity}`)
                  .join(' → '),
              );
            return [...new Set(transitions)];
          }),
        { message: 'Viewer slides the next board in' },
      )
      .toEqual(['left:-100px opacity:undefined → left:0px opacity:undefined']);
  }

  /** @param {string} text e.g. "2 / 2" */
  async checkBoardCounter(text) {
    await expect(this.boardCounter, `Viewer shows board ${text}`).toHaveText(text);
  }
};
