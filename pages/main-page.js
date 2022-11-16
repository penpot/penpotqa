const { expect } = require("@playwright/test");
const viewportLocator = 'div[class="viewport"]';
exports.MainPage = class MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    this.page = page;
    this.createBoardButton = page.locator('button[data-test="artboard-btn"]');
    this.createRectangleButton = page.locator('button[data-test="rect-btn"]');
    this.createEllipseButton = page.locator('button[data-test="ellipse-btn"]');
    this.createTextButton = page.locator('button[alt="Text (T)"]');
    this.uploadImageSelector = page.locator("#image-upload");
    this.createCurveButton = page.locator('button[data-test="curve-btn"]');
    this.createPathButton = page.locator('button[data-test="path-btn"]');
    this.createdObject = page.locator('div *[id^="fills"]');
    this.textbox = page.locator(
      'div[role="textbox"] div[contenteditable="true"]'
    );
    this.viewport = page.locator(viewportLocator);
    this.savedChangesIcon = page.locator('div[class="saved"]');
    this.pencilBoxButton = page.locator('div[class="main-icon"]');
  }

  async clickCreateBoardButton() {
    await this.createBoardButton.click();
  }

  async clickCreateRectangleButton() {
    await this.createRectangleButton.click();
  }

  async clickCreateEllipseButton() {
    await this.createEllipseButton.click();
  }

  async clickCreateTextButton() {
    await this.createTextButton.click();
  }

  async typeText(text) {
    await this.textbox.fill(text);
  }

  async uploadImage(imageUrl) {
    await this.uploadImageSelector.setInputFiles(imageUrl);
  }

  async clickCreateCurveButton() {
    await this.createCurveButton.click();
  }

  async clickCreatePathButton() {
    await this.createPathButton.click();
  }

  async clickViewport() {
    await this.viewport.click();
    await this.viewport.click();
  }

  async clickViewportByCoordinates(x, y) {
    await this.page.mouse.click(x, y);
  }

  async waitForChangeIsSaved() {
    await expect(this.savedChangesIcon).toBeVisible();
  }

  async isCreatedObjectVisible() {
    await expect(this.createdObject.nth(0)).toBeVisible();
  }

  async checkHtmlOfCreatedObject(expectedHTML) {
    expect(await this.createdObject.nth(0).innerHTML()).toEqual(expectedHTML);
  }

  async checkPartialHtmlOfCreatedObject(expectedHTML) {
    expect(await this.createdObject.nth(0).innerHTML()).toContain(expectedHTML);
  }

  async drawCurve(x1, y1, x2, y2) {
    await this.page.mouse.move(x1, y1);
    await this.page.mouse.down();
    await this.page.mouse.move(x1, y1);
    await this.page.mouse.move(x2, y2);
    await this.page.mouse.up();
  }

  async clickPencilBoxButton() {
    await this.pencilBoxButton.click();
  }
};
