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
};
