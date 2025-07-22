const { expect } = require('@playwright/test');
const { getPlatformName } = require('../helpers/get-platform');

exports.BasePage = class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('div[class*="dashboard-title"] h1');
    this.successMessage = page.locator(
      'div[class*="shared_notification_pill__type-toast"]',
    );
    this.warningMessageText = page.locator(
      'aside[class*="warning"] div[class*="context_notification"]',
    );
    this.infoMessage = page.locator('div[class*="main_ui_messages__banner"]');
    this.wrapperMessage = page.getByTestId('actionable');
    this.moveButton = page.getByRole('button', { name: 'Move (V)' });
    this.savedChangesIcon = page.locator('div[title="Saved"]');
    this.unsavedChangesIcon = page.locator('div[title="Saving"]');
    this.viewport = page.locator('div[class*="viewport"] >> nth=0');
    this.resizeHandler = page.locator('[class="resize-handler"]');

    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.modalSaveButton = page.getByRole('button', { name: 'Save' });
    this.modalCloseButton = page.getByRole('button', { name: 'Close' });

    //Layer right-click menu items
    this.createdLayer = page.locator(
      'div[class*="viewport"] [id^="shape"] >> nth=0',
    );
    this.copyLayer = page
      .locator('div[class*="viewport"] [class*="viewport-selrect"]')
      .last();
    this.createdBoardTitle = page.getByTestId('viewport').getByText('Board').first();
    this.shapeLabelNameInput = page
      .getByTestId('viewport')
      .getByRole('textbox')
      .last();

    this.deleteLayerMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete' });
    this.hideLayerMenuItem = page.getByRole('listitem').filter({ hasText: 'Hide' });
    this.showLayerMenuItem = page.getByRole('listitem').filter({ hasText: 'Show' });
    this.focusOnLayerMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Focus on' });
    this.transformToPathMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Transform to path' });
    this.selectionToBoardMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Selection to board' });
    this.flipVerticalMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Flip vertical' });
    this.flipHorizontalMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Flip horizontal' });
    this.editPathMenuItem = page.getByRole('listitem').filter({ hasText: 'Edit' });
    this.addFlexLayout = page
      .getByRole('listitem')
      .filter({ hasText: 'Add flex layout' });
    this.removeFlexLayout = page
      .getByRole('listitem')
      .filter({ hasText: 'Remove flex layout' });
    this.addGridLayout = page
      .getByRole('listitem')
      .filter({ hasText: 'Add grid layout' });
    this.removeGridLayout = page
      .getByRole('listitem')
      .filter({ hasText: 'Remove grid layout' });
    this.addRowGridLayoutBtn = page.locator('g[class*="grid-plus-button"]').first();
    this.addColumnGridLayoutBtn = page
      .locator('g[class*="grid-plus-button"]')
      .last();
    this.gridLayoutEditor = page.locator('g[class*="grid-layout-editor"]').last();
    this.columnsRowsOnDesignPanel = page
      .getByTestId('inspect-layout-rows')
      .locator('..');
    this.deleteLayerMenuOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete' });
    this.createComponentMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Create component' });
    this.updateMainComponentMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Update main component' });
    this.restoreMainComponentMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Restore main component' });
    this.createMultipleComponentsMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Create multiple components' });
    this.showInAssetsPanelOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show in assets panel' });
    this.createAnnotationOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Create annotation' });
    this.duplicateOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate' });
    this.copyOption = page.getByRole('listitem').filter({ hasText: 'Copy' }).first();
    this.pasteOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Paste' })
      .first();
    this.groupOption = page.getByRole('listitem').filter({ hasText: 'Group' });
    this.showMainComponentOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show main component' });
    this.resetOverridesOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Reset overrides' });
    this.detachInstanceOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Detach instance' });
    this.duplicateRowMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate row' });
    this.addRowAboveMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Add 1 row above' });
    this.addRowBelowMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Add 1 row below' });
    this.deleteRowMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete row' })
      .first();
    this.deleteAndShapesRowMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete row and shapes' });
    this.duplicateColumnMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate column' });
    this.addColumnLeftMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Add 1 column to the left' });
    this.addColumnRightMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Add 1 column to the right' });
    this.deleteColumnMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete column' })
      .first();
    this.deleteAndShapesColumnMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete column and shapes' });
    this.mergeGridCellMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Merge cells' });
    this.copyPasteAsMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Copy/Paste as ...' });
    this.copyAsCssMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: /^Copy as CSS$/ });
    this.copyAsCssNLayersMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Copy as CSS (nested layers)' });
    this.copyAsTextMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Copy as text' });
    this.copyAsSVGMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: /^Copy as SVG$/ });
    this.copyPropertiesMenuItem = page.getByText('Copy propertiesCtrlAltc');
    this.pastePropertiesMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Paste properties' });
    this.copyLinkMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Copy link' });
    this.acceptCookieButton = page.getByRole('button', { name: 'Accept all' });
    this.renameOption = page.getByRole('listitem').filter({ hasText: 'Rename' });
    this.importErrorMessage = page.locator('div[class*="error-message"]');
    this.importErrorDetailMessage = page.locator(
      'div[class*="error-detail-content"]',
    );
    this.detailsButton = page.getByRole('button', { name: 'Details' });
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

  async clickShortcutAltN(browserName) {
    await this.page.keyboard.press('Alt+N');
  }

  async reloadPage() {
    await this.page.reload();
  }

  async clickOnEnter() {
    await this.page.keyboard.press('Enter');
  }

  async clickOnBackspaceAndEnter() {
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Enter');
  }

  async clickOnESC() {
    await this.page.keyboard.press('Escape');
  }

  async clickOnSubtract() {
    await this.page.keyboard.press('NumpadSubtract');
  }

  async clickOnAdd() {
    await this.page.keyboard.press('NumpadAdd');
  }

  async isHeaderDisplayed(title) {
    await expect(this.header).toHaveText(title, { timeout: 20000 });
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

  async waitForChangeIsUnsaved() {
    await this.unsavedChangesIcon.waitFor({ state: 'visible' });
  }

  async waitForResizeHandlerVisible() {
    await this.resizeHandler.first().waitFor({ state: 'visible' });
  }

  async waitForViewportVisible(timeout = 30) {
    await this.viewport.waitFor({ state: 'visible', timeout: timeout * 1000 });
  }

  async refreshPage() {
    await this.page.reload();
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

  async focusBoardViaRightClickOnCanvas(title, browserName = 'chrome') {
    const boardSel = this.page.locator(
      `span[class*="workspace_sidebar_layer_name"]:has-text("${title}")`,
    );
    await boardSel.click({ button: 'right', force: true });
    browserName === 'chromium'
      ? await this.focusOnLayerMenuItem.click()
      : await this.focusOnLayerMenuItem.locator('span').first().click();
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
    const layerSel = this.page.locator(
      'div[class*="viewport"] [class*="viewport-selrect"]',
    );
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
    const board = this.page.locator(`g[class="frame-title"] div >> nth=${n}`);
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

  async addColumnsGridLayout(count) {
    for (let i = 0; i < count; i++) {
      await this.addRowGridLayoutBtn.click();
    }
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
    await expect(this.wrapperMessage).toBeVisible({ timeout: 10000 });
  }

  async renameCreatedBoardViaRightClick() {
    await this.createdBoardTitle.click({ button: 'right', force: true });
    await this.renameOption.click();
  }

  async acceptCookie() {
    if (await this.acceptCookieButton.isVisible()) {
      await this.acceptCookieButton.click();
    }
    await expect(this.acceptCookieButton).not.toBeVisible();
  }

  async gotoLink(link) {
    await this.page.goto(link);
  }

  async getUrl() {
    return this.page.url();
  }

  async makeBadUrl(url) {
    return url.replace(/(file-id=).../, '$1555');
  }

  async makeBadDashboardUrl(url) {
    return url.replace(/(\?team-id=).../, '$1555');
  }

  async typeNameForShapeLabel(newName) {
    await this.shapeLabelNameInput.fill(newName);
  }

  async typeNameShapeLabelAndEnter(newName) {
    await this.typeNameForShapeLabel(newName);
    await this.clickOnEnter();
  }

  async clickShortcutCtrlAltC() {
    await this.page.keyboard.press('Control+Alt+C');
  }

  async clickShortcutCtrlAltV() {
    await this.page.keyboard.press('Control+Alt+V');
  }

  async clickShortcutShiftAltC() {
    await this.page.keyboard.press('ShiftLeft+Alt+C');
  }

  async closeModalWindow() {
    await this.modalCloseButton.last().click();
  }

  async clickOnCancelButton() {
    await this.modalCancelButton.click();
  }
};
