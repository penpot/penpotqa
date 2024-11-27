const { expect } = require('@playwright/test');
const { MainPage } = require('./main-page');

exports.HistoryPanelPage = class HistoryPanelPage extends MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.emptyVersionMessage = page.getByText('There are no versions yet');
    this.saveVersionButton = page.getByRole('button', { name: 'Save version' });
    this.versionNameInput = page.locator('input[class*="version-entry-name-edit"]');
    this.versionName = page.locator('p[class*="version-entry-name"]');
    this.optionsVersionButton = page.getByRole('button', {
      name: 'Open version menu',
    });
    this.renameVersionButton = page.getByRole('button', { name: 'Rename' });
    this.restoreVersionButton = page.getByRole('button', { name: 'Restore' });
    this.deleteVersionButton = page.getByRole('button', { name: 'Delete' });
    this.cancelRestoreVersionButton = page.getByRole('button', { name: 'Dismiss' });
    this.autosaveVersionsButton = page.getByRole('button', {
      name: 'Expand snapshots',
    });

    this.snapshotElement = page.locator('div[class*="version-snapshot-entry"]');
    this.optionsSnapshotButton = page.getByRole('button', {
      name: 'Open snapshot menu',
    });
    this.pinSnapshotButton = page.getByRole('button', { name: 'Pin version' });
    this.restoreSnapshotButton = page.getByRole('button', {
      name: 'Restore version',
    });
    this.versionCreatorAvatars = page.locator('img[class*="version-entry-avatar"]');
    this.historyPanel = page.getByRole('tabpanel', { name: 'history' });
    this.filterVersionDropdown = this.historyPanel.locator(
      'div[class*="custom-select"]',
    );
    this.allVersionsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'All versions' });
    this.myVersionsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'My versions' });
  }

  async isVersionListEmpty(empty = true) {
    empty
      ? await expect(this.emptyVersionMessage).toBeVisible()
      : await expect(this.emptyVersionMessage).toBeHidden();
  }

  async clickSaveVersionButton() {
    await this.saveVersionButton.click();
  }

  async renameVersion(name) {
    await this.versionNameInput.fill(name);
    await this.clickViewportTwice();
  }

  async checkVersionName(name) {
    await expect(this.versionName).toHaveText(name);
  }

  async checkFirstVersionName(name) {
    await expect(this.versionName.last()).toHaveText(name);
  }

  async checkLastVersionName(name) {
    await expect(this.versionName.first()).toHaveText(name);
  }

  async openVersionOptionsMenu() {
    await this.optionsVersionButton.first().click();
  }

  async selectVersionOption(option) {
    await this.versionName.first().hover();
    await this.openVersionOptionsMenu();
    switch (option) {
      case 'Rename':
        await this.renameVersionButton.click();
        break;
      case 'Restore':
        await this.restoreVersionButton.click();
        break;
      case 'Delete':
        await this.deleteVersionButton.click();
        break;
    }
  }

  async clickRestoreVersionButton() {
    await this.restoreVersionButton.click();
  }

  async clickCancelRestoreVersionButton() {
    await this.cancelRestoreVersionButton.click();
  }

  async checkAutosaveVersionsCount(count) {
    await expect(this.autosaveVersionsButton).toHaveText(
      `${count} autosave versions`,
    );
  }

  async isAutosaveVersionsVisible(visible = true) {
    visible
      ? await expect(this.autosaveVersionsButton).toBeVisible()
      : await expect(this.autosaveVersionsButton).toBeHidden();
  }

  async clickOnAutosaveVersionsButton() {
    await this.autosaveVersionsButton.click();
  }

  async multipleSaveDefaultVersions(count = 1) {
    for (let i = 0; i < count; i++) {
      await this.saveVersionButton.click();
      await this.clickViewportTwice();
    }
  }

  async selectSnapshotOption(option) {
    await this.snapshotElement.hover();
    await this.optionsSnapshotButton.click();
    switch (option) {
      case 'Pin version':
        await this.pinSnapshotButton.click();
        break;
      case 'Restore version':
        await this.restoreSnapshotButton.click();
        break;
    }
  }

  async isOtherUserVersionVisible(visible = true) {
    const avatars = await this.versionCreatorAvatars.elementHandles();
    const srcValues = await Promise.all(
      avatars.map(async (avatar) => await avatar.getAttribute('src')),
    );
    const firstSrc = srcValues[0];
    visible
      ? expect(srcValues.every((src) => src === firstSrc)).not.toBeTruthy()
      : expect(srcValues.every((src) => src === firstSrc)).toBeTruthy();
  }

  async changeVersionFilter(option) {
    await this.filterVersionDropdown.click();
    switch (option) {
      case 'My versions':
        await this.myVersionsOption.click();
        break;
      case 'All versions':
        await this.allVersionsOption.click();
        break;
    }
  }
};
