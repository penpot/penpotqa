const { expect } = require('@playwright/test');
const getPlatformName = require('../helpers/get-platform');

exports.BasePage = class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('div[class*="dashboard-title"] h1');
    this.successMessage = page.locator('div[class="banner success fixed"]');
    this.infoMessage = page.locator('div[class="banner info fixed"]');
    this.moveButton = page.locator('button[title="Move (V)"]');
    this.savedChangesIcon = page.locator('div[title="Saved"]');

    //Layer right-click menu items
    this.createdLayer = page.locator(
      'div[class="viewport"] [id^="shape"] >> nth=0',
    );
    this.createdBoardTitle = page.locator('g[class="frame-title"] >> nth=0');
    this.deleteLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Delete")',
    );
    this.hideLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Hide")',
    );
    this.showLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Show")',
    );
    this.focusOnLayerMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Focus on")',
    );
    this.transformToPathMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Transform to path")',
    );
    this.selectionToBoardMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Selection to board")',
    );
    this.createComponentMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li:has-text("Create component")',
    );
    this.flipVerticalMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Flip vertical")',
    );
    this.flipHorizontalMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Flip horizontal")',
    );
    this.editPathMenuItem = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Edit")',
    );
    this.addFlexLayout = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Add flex layout")',
    );
    this.removeFlexLayout = page.locator(
      'ul[class*="workspace-context-menu"] li:has-text("Remove flex layout")',
    );
  }

  async clearInput(input, browserName) {
    await input.click();
    if (getPlatformName() === 'MacOS') {
      await this.page.keyboard.press('Meta+A');
    } else {
      if (browserName === 'webkit') {
        await this.page.keyboard.press('Meta+A');
      } else {
        await this.page.keyboard.press('Control+A');
      }
    }
    await this.page.keyboard.press('Delete');
  }

  async clickShortcutCtrlZ(browserName) {
    if (getPlatformName() === "MacOS") {
      await this.page.keyboard.press("Meta+Z");
    } else {
      if (browserName !== "webkit") {
        await this.page.keyboard.press("Control+Z");
      } else {
        await this.page.keyboard.press("Meta+Z");
      }
    }
  }

  async reloadPage() {
    await this.page.reload();
  }

  async clickOnEnter() {
    await this.page.keyboard.press('Enter');
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toHaveText(title);
  }

  async isSuccessMessageDisplayed(message) {
    await expect(this.successMessage).toHaveText(message);
  }

  async waitSuccessMessageHidden() {
    await this.successMessage.waitFor({ state: 'hidden' });
  }

  async waitInfoMessageHidden() {
    await this.infoMessage.waitFor({ state: 'hidden' });
  }

  async clickMoveButton() {
    await this.moveButton.click({ force: true });
  }

  async waitForChangeIsSaved() {
    await this.savedChangesIcon.waitFor({ state: 'visible' });
  }

  async deleteLayerViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.deleteLayerMenuItem.click();
  }

  async hideLayerViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(
      `//*[text()="${title}"]//parent::*[@class="frame-title"]`,
    );
    await boardSel.click({ button: 'right', force: true });
    await this.hideLayerMenuItem.click();
  }

  async focusBoardViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(
      `//*[text()="${title}"]//parent::*[@class="frame-title"]`,
    );
    await boardSel.click({ button: 'right', force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaRightClickOnCanvas() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async getLayerSelectorOnLayersTab(layer) {
    return this.page.locator(
      `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`,
    );
  }

  async focusLayerViaRightClickOnLayersTab(layer) {
    const layerSel = await this.getLayerSelectorOnLayersTab(layer);
    await layerSel.click({ button: 'right', force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async hideLayerViaRightClickOnLayersTab(layer) {
    const layerSel = await this.getLayerSelectorOnLayersTab(layer);
    await layerSel.click({ button: 'right', force: true });
    await this.hideLayerMenuItem.click();
  }

  async unHideLayerViaRightClickOnLayersTab(layer) {
    const layerSel = await this.getLayerSelectorOnLayersTab(layer);
    await layerSel.click({ button: 'right', force: true });
    await this.showLayerMenuItem.click();
  }

  async transformToPathViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.transformToPathMenuItem.click();
  }

  async selectionToBoardViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.selectionToBoardMenuItem.click();
  }

  async createComponentViaRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: 'right', force: true });
    await this.createComponentMenuItem.click();
  }

  async flipVerticalViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.flipVerticalMenuItem.click();
  }

  async flipHorizontalViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.flipHorizontalMenuItem.click();
  }

  async openNodesPanelViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.editPathMenuItem.click();
  }

  async addFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: 'right', force: true });
    await this.addFlexLayout.click();
  }

  async removeFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: 'right', force: true });
    await this.removeFlexLayout.click();
  }
};
