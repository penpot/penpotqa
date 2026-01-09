const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');

exports.PrototypePanelPage = class PrototypePanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.prototypeTab = page.getByRole('tab', { name: 'prototype' });
    this.prototypeArrowConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-accent-tertiary)"] >>nth=0',
    );
    this.prototypeArrowSecondConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-accent-tertiary)"] >>nth=1',
    );
    this.prototypePanelFlowNameText = page.locator('span[class*="flow-name-label"]');
    this.prototypePanelFlowNameInput = page.locator('input[class*="interactions"]');
    this.addInteractionButton = page.getByRole('button', {
      name: 'Add interaction',
    });

    //Flow Section
    this.flowSection = page.locator(
      '.main_ui_workspace_sidebar_options_menus_interactions__section',
    );
    this.removeFlowButton = this.flowSection.getByRole('button', { name: 'Remove' });

    //Interactions Section
    this.interactionsSection = page.locator(
      '.main_ui_workspace_sidebar_options_menus_interactions__section',
    );
    this.interactionsRecordRemoveButton = this.interactionsSection.getByRole(
      'button',
      { name: 'Remove' },
    );
    this.interactionRecordOptionsButton = this.interactionsSection.getByRole(
      'button',
      { name: 'Options' },
    );

    //Options Section
    this.interactionsOptionsMenu = page.locator(
      '.main_ui_workspace_sidebar_options_menus_interactions__interaction-item',
    );
    this.interactionDestinationField = this.interactionsOptionsMenu
      .locator(
        '.main_ui_workspace_sidebar_options_menus_interactions__interaction-row',
      )
      .filter({ hasText: 'Destination' });
  }

  async clickPrototypeTab() {
    await this.prototypeTab.click();
  }

  async dragAndDropPrototypeArrowConnector(x, y) {
    await expect(this.prototypeArrowConnector).toBeVisible();
    await this.prototypeArrowConnector.hover();
    await this.viewport.click();
    await this.prototypeArrowConnector.dragTo(this.viewport, {
      force: false,
      targetPosition: { x: x, y: y },
    });
  }

  async isFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelFlowNameInput).toHaveValue(name);
  }

  async isFlowNameNotDisplayedOnPrototypePanel() {
    await expect(this.prototypePanelFlowNameInput).not.toBeVisible();
  }

  async clickAddInteractionButton() {
    await this.addInteractionButton.click({ delay: 500 });
  }

  async isPrototypeArrowSecondConnectorDisplayed() {
    await expect(this.prototypeArrowSecondConnector).toBeVisible();
  }

  async isPrototypeArrowSecondConnectorNotDisplayed() {
    await expect(this.prototypeArrowSecondConnector).not.toBeVisible();
  }

  async clickRemoveInteractionByIndex(index) {
    const interactionRecord = this.interactionsRecordRemoveButton.nth(index);
    await interactionRecord.click();
  }

  async openInteractionsOptionsByIndex(index) {
    const interactionOption = this.interactionRecordOptionsButton.nth(index);
    await interactionOption.click();
  }

  async renameFlow(newName) {
    await this.prototypePanelFlowNameInput.dblclick();
    await this.prototypePanelFlowNameInput.fill(newName);
    await this.clickOnEnter();
  }

  async clickRemoveFlowByIndex(index) {
    const flowRecord = this.removeFlowButton.nth(index);
    await flowRecord.click();
  }

  async selectInteractionDestination(value) {
    const optionSel = this.interactionDestinationField.getByRole('option', {
      name: value,
    });

    await this.interactionDestinationField.click();
    await optionSel.click();
  }
};
