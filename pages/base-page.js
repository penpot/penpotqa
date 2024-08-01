const { expect } = require('@playwright/test');
const { getPlatformName } = require('../helpers/get-platform');

exports.BasePage = class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('div[class*="dashboard-title"] h1');
    this.successMessage = page.locator('div[class*="main_ui_notifications_toast_notification__text"]');
    this.infoMessage = page.locator('div[class*="main_ui_messages__banner"]');
    this.wrapperMessage = page.locator('div[class*="main_ui_messages__wrapper"]');
    this.moveButton = page.locator('button[title="Move (V)"]');
    this.savedChangesIcon = page.locator('div[title="Saved"]');
    this.viewport = page.locator('div.viewport');

    //Layer right-click menu items
    this.createdLayer = page.locator('div[class="viewport"] [id^="shape"] >> nth=0');
    this.copyLayer = page.locator('div[class="viewport"] [class*="viewport-selrect"]').last();
    this.createdBoardTitle = page.locator('g[class="frame-title"] div >> nth=0');
    this.deleteLayerMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Delete")',
    );
    this.hideLayerMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Hide")',
    );
    this.showLayerMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Show")',
    );
    this.focusOnLayerMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] *:has-text("Focus on")',
    ).last();
    this.transformToPathMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Transform to path")',
    );
    this.selectionToBoardMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Selection to board")',
    );
    // this.createComponentMenuItem = page.locator(
    //   'ul[class*="workspace_context_menu"] li:has-text("Create component")',
    // );
    // this.createMultipleComponentsMenuItem = page.locator(
    //   'ul[class*="workspace_context_menu"] li:has-text("Create multiple components")',
    // );
    this.flipVerticalMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Flip vertical")',
    );
    this.flipHorizontalMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Flip horizontal")',
    );
    this.editPathMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Edit")',
    );
    this.addFlexLayout = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Add flex layout")',
    );
    this.removeFlexLayout = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Remove flex layout")',
    );
    this.addGridLayout = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Add grid layout")',
    );
    this.removeGridLayout = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Remove grid layout")',
    );
    this.addRowGridLayoutBtn = page.locator('g[class*="grid-plus-button"]',
    ).first();
    this.addColumnGridLayoutBtn = page.locator('g[class*="grid-plus-button"]',
    ).last();
    this.removeGridLayout = page.locator(
      'ul[class*="workspace_context_menu"] li:has-text("Remove grid layout")',
    );
    this.deleteLayerMenuOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Delete")',
    );
    this.createComponentMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Create component")',
    );
    this.updateMainComponentMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Update main component")',
    );
    this.restoreMainComponentMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Restore main component")',
    );
    this.createMultipleComponentsMenuItem = page.locator(
      'li[class*="context-menu-item"] span:has-text("Create multiple components")',
    );
    this.showInAssetsPanelOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Show in assets panel")',
    );
    this.createAnnotationOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Create annotation")',
    );
    this.duplicateOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Duplicate")',
    );
    this.copyOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Copy")',
    );
    this.pasteOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Paste")',
    );
    this.groupOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Group")',
    );
    this.showMainComponentOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Show main component")',
    );
    this.resetOverridesOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Reset overrides")',
    );
    this.detachInstanceOption = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Detach instance")',
    );
    this.duplicateRowMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Duplicate row")',
    );
    this.addRowAboveMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Add 1 row above")',
    );
    this.AddRowBelowMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Add 1 row below")',
    );
    this.deleteRowMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Delete row")',
    ).first();
    this.deleteAndShapesRowMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Delete row and shapes")',
    );
    this.duplicateColumnMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Duplicate column")',
    );
    this.addColumnLeftMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Add 1 column to the left")',
    );
    this.AddColumnRightMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Add 1 column to the right")',
    );
    this.deleteColumnMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Delete column")',
    ).first();
    this.deleteAndShapesColumnMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Delete column and shapes")',
    );
    this.mergeGridCellMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] li span:has-text("Merge cells")',
    );
    this.acceptCookieButton = page.locator(
      'button[class*="CookieConsent_accept"]',
    );
  }

  async clearInput(input, browserName) {
    await input.click();
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
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
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+Z');
    } else {
      if (browserName !== 'webkit') {
        await this.page.keyboard.press('Control+Z');
      } else {
        await this.page.keyboard.press('Meta+Z');
      }
    }
  }

  async clickShortcutCtrlD(browserName) {
    if (getPlatformName() === 'MacOS' || getPlatformName() === 'darwin') {
      await this.page.keyboard.press('Meta+D');
    } else {
      if (browserName !== 'webkit') {
        await this.page.keyboard.press('Control+D');
      } else {
        await this.page.keyboard.press('Meta+D');
      }
    }
  }

  async reloadPage() {
    await this.page.reload();
  }

  async clickOnEnter() {
    await this.page.keyboard.press('Enter');
  }

  async clickOnBackspaceAndEnter() {
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Enter');
  }

  async clickOnESC() {
    await this.page.keyboard.press('Escape');
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
    await this.page.waitForTimeout(400);
  }

  async clickMoveButton() {
    await this.moveButton.click({ force: true });
  }

  async waitForChangeIsSaved() {
    await this.savedChangesIcon.waitFor({ state: 'visible' });
  }

  async refreshPage() {
    await this.page.reload();
    await this.page.waitForTimeout(5000)
  }

  async deleteLayerViaRightClick() {
    await this.createdLayer.click({ button: 'right', force: true });
    await this.deleteLayerMenuItem.click();
  }

  async hideLayerViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(
      `//*[@class='frame-title']//../*[text()='${title}']`,
    );
    await boardSel.click({ button: 'right', force: true });
    await this.hideLayerMenuItem.click();
  }

  async focusBoardViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(
      `span[class*="workspace_sidebar_layer_name"]:has-text("${title}")`,
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
    const layerSel = this.page.locator('div[class="viewport"] [class*="viewport-selrect"]');
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

  async addFlexLayoutViaRightClickForNComponent(n) {
    const board = this.page.locator(`g[class="frame-title"] >> nth=${n}`);
    await board.click({ button: 'right', force: true });
    await this.addFlexLayout.click();
  }

  async removeFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: 'right', force: true });
    await this.removeFlexLayout.click();
  }

  async addGridLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: 'right', force: true });
    await this.addGridLayout.click();
  }
  async removeGridLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: 'right', force: true });
    await this.removeGridLayout.click();
  }

  async addRowGridLayoutBtnClick() {
    await this.addRowGridLayoutBtn.click();
  }

  async addColumnGridLayoutBtnClick() {
    await this.addColumnGridLayoutBtn.click();
  }

  async showMainComponentViaRightClick() {
    await this.copyLayer.click({ button: 'right', force: true });
    await this.showMainComponentOption.click();
  }

  async resetOverridesViaRightClick() {
    await this.copyLayer.click({ button: 'right', force: true });
    await this.resetOverridesOption.click();
  }

  async isWrapperMessageVisible() {
    await expect(this.wrapperMessage).toBeVisible({timeout: 10000});
  }

  async acceptCookie() {
    if (await this.acceptCookieButton.isVisible()) {
      await this.acceptCookieButton.click();
    }
    await expect(this.acceptCookieButton).not.toBeVisible();
  }
};
