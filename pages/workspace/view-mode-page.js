const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.ViewModePage = class ViewModePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Assets panel
    this.viewModeButton = page.locator(`a[class*='viewer-btn']`);
    this.viewerLoyautSection = page.locator('#viewer-layout');
    this.inspectButton = page.locator(`button .icon-code`);
    this.rightSidebar = page.locator(`aside[class*='inspect_right_sidebar']`);
    this.fullScreenButton = page.locator(`span[class*="fullscreen-btn"]`);
    this.fullScreenSection = page.locator(`section[class*="main_ui_viewer__fulscreen"]`);
    this.prevBoardButton = page.locator(`button[class*="viewer-go-prev"]`);
    this.nextBoardButton = page.locator(`button[class*="viewer-go-next"]`);
    this.resetBoardButton = page.locator(`button[class*="reset-button"]`);
    this.selectBoardDropdown = page.locator('#current-frame');
    this.boardTitle = page.locator('div[class*="thumbnail-info"]');
    this.interactionsArrow = page.locator('.interactions .selected');
    this.interactionsDropdown = page.locator('span[class*="interactions__dropdown-title"]:has-text("Interactions")');
    this.interactionsDropdownOptions = page.locator('ul[class*="interactions__dropdown"]');
    this.dontShowInterOptions = page.locator('li[data-mode="hide"]');
    this.showInterOptions = page.locator('li[data-mode="show"]');
    this.showOnClickInterOptions = page.locator('li[data-mode="show-on-click"]');
    this.boardCounter = page.locator('.main_ui_viewer__counter');
    this.scaleDropdown = page.locator('div[class*="header__zoom-widget"]');
    this.upscaleButton = page.locator('button[class*="zoom-btn"] .icon-remove');
    this.downscaleButton = page.locator('button[class*="zoom-btn"] .icon-add');
    this.scaleResetButton = page.locator('button[class*="reset-btn"]');
    this.scaleFitOptions = page.locator('li[class*="zoom-option"]:has-text("Fit - Scale down to fit")');
    this.scaleFillOptions = page.locator('li[class*="zoom-option"]:has-text("Fill - Scale to fill")');
    this.scaleFullScreenOptions = page.locator('li[class*="zoom-option"]:has-text("Full screen")');
    this.scaleDropdownOptions = page.locator('ul[class*="header__dropdown"]');
    this.pageDropdown = page.locator('span[class*="header__breadcrumb-text"]');
    this.pageDropdownOptions = page.locator('ul[class*="dropdown-sitemap"]');
    this.commentsButton = page.locator('button[data-value="comments"]');
    this.commentsContainer = page.locator('div[class*="viewer-comments-container"]');
    this.commentsDropdown = page.locator('div[data-testid="viewer-comments-dropdown"]');
    this.commentsDropdownOptions = page.locator('ul[class*="viewer_comments__dropdown"]');
    this.showAllCommentsOption = page.locator('li[class*="comments__dropdown"] span:has-text("Show all comments")');
    this.showYourCommentsOption = page.locator('li[class*="comments__dropdown"] span:has-text("Show only your comments")');
    this.hideResolvedCommentsOption = page.locator('li[class*="comments__dropdown"] span:has-text("Hide resolved comments")');
    this.showCommentsListOption = page.locator('li[class*="comments__dropdown"] span:has-text("Show comments list")');
    this.commentsRightPanel = page.locator('div[class*="comments__settings-bar-inside"]');
    this.commentCommentsPanelText = page.locator(
      'div[class*="comments__settings-bar-inside"] div[class*="comments__content"]',
    );
    this.interactionsButton = page.locator('button[data-value="interactions"]');
    this.widthCopyButton = page.locator('button[class*="copy_button"]').first();
    this.editButton = page.locator('span[class*="edit-btn"]');
    this.shareButton = page.locator('button[class*="share-btn"]');
    this.shareLincDialog = page.locator('div[class*="share-link-dialog"]');
    this.getLincButton = page.locator('input[value="Get link"]');
    this.managePermissionsButton = page.locator('button[class*="share_link__manage-permissions"]');
    this.selectAllCheckbox = page.locator('label[for="view-all"]');
    this.copyLincButton = page.locator('button[class*="share_link__copy-button"]');
    this.copyLincField = page.locator('input[class*="share_link__input-text"]');
    this.destroyLincButton = page.locator('input[value="Destroy link"]');
    this.commentPermissionDropdown = page.locator('div[class*="who-comment-select"]');
    this.inspectPermissionDropdown = page.locator('div[class*="who-inspect-select"]');
    this.allUsersOption = page.locator('li span:has-text("All Penpot users")');
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

  async openInspectTab() {
    await this.inspectButton.click();
    await expect(this.rightSidebar).toBeVisible();
  }

  async openInteractionsTab() {
    await this.interactionsButton.click();
  }

  async clickFullScreenButton() {
    await this.fullScreenButton.click();
    await expect(this.fullScreenSection).toBeVisible();
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
    await this.viewerLoyautSection.click();
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
    const option = await this.page.locator(`ul[class*="dropdown-sitemap"] span:has-text("${name}")`);
    await option.first().click();
  }

  async clickCommentsButton() {
    await this.commentsButton.click();
  }

  async addComment(second = false) {
    second
      ? await this.commentsContainer.click()
      : await this.commentsContainer.click({
        position: { x: 10, y: 10 }
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

  async checkBuffer(expectedValue, page, browserName) {
    if(browserName === 'chrome'){
      const clipboardText = await page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });
      expect(clipboardText).toBe(expectedValue);
    }
  }

  async clickEditButton(first = true) {
    if(first) {
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
      })
    );
    expect(activePage).not.toBe(newPage);
  }

  async clickShareButton() {
    await this.shareButton.click();
  }

  async clickGetLincButton() {
    await this.getLincButton.click();
  }

  async clickManagePermissionsButton() {
    await this.managePermissionsButton.click();
  }

  async selectAllPages() {
    await this.selectAllCheckbox.click();
  }

  async clickCopyLincButton() {
    await this.copyLincButton.click();
    return await this.copyLincField.inputValue();
  }

  async isViewerSectionVisible(visible = true) {
    visible
      ? await expect(this.viewerLoyautSection).toBeVisible()
      : await expect(this.viewerLoyautSection).not.toBeVisible();
  }

  async waitForViewerSection(timeout = 10000) {
    await this.viewerLoyautSection.waitFor({ state: 'visible' , timeout: timeout});
  }

  async clickDestroyLincButton() {
    await this.destroyLincButton.click();
    await this.destroyLincButton.click();
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
};
