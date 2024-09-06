const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');

exports.PrototypePanelPage = class PrototypePanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.prototypeTab = page.getByRole("tab", { name: "prototype" });
    this.prototypeArrowConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-accent-tertiary)"] >>nth=0',
    );
    this.prototypeArrowSecondConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-accent-tertiary)"] >>nth=1',
    );
    this.prototypePanelFlowNameText = page.locator('span[class*="flow-name-label"]');
    this.prototypePanelFlowNameInput = page.locator('input[class*="interactions"]');
    this.addInteractionButton = page.locator('button[class*="add-interaction-btn"]');
    this.removeSecondInteractionButton = page.locator(
      'button[class*="interactions__remove-btn"] >>nth=1',
    );
    this.firstInteractionRecord = page.locator(
      'div[class*="interactions-summary"] >>nth=0',
    );
    this.interactionDestinationField = page.locator(
      '//*[text()="Destination"]//parent::div//div[contains(@class, "custom-select")]',
    );
    this.removeFlowButton = page.locator('button[class*="remove-flow-btn"]');
  }

  async clickPrototypeTab() {
    await this.prototypeTab.click();
  }

  async dragAndDropPrototypeArrowConnector(x, y) {
    await this.page.waitForTimeout(200);
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

  async clickRemoveSecondInteractionButton() {
    await this.removeSecondInteractionButton.click();
  }

  async clickFirstInteractionRecord() {
    await this.firstInteractionRecord.click();
  }

  async renameFlow(newName) {
    await this.prototypePanelFlowNameInput.dblclick();
    await this.prototypePanelFlowNameInput.fill(newName);
    await this.clickOnEnter();
  }

  async clickRemoveFlowButton() {
    await this.removeFlowButton.click();
  }

  async selectInteractionDestination(value) {
    const optionSel = this.page.locator(
      `div[class*="interaction-type-select"] span:has-text("${value}")`,
    );
    await this.interactionDestinationField.click();
    await optionSel.click();
  }
};
