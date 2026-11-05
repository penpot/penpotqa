import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Flow section of the Prototype tab: the flow that starts at the selected board. */
export class FlowSectionComponent extends BaseComponent {
  readonly flowNameInput: Locator;
  readonly removeFlowButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.flowNameInput = root.getByRole('textbox');
    this.removeFlowButton = root.getByRole('button', { name: 'Remove' });
  }

  async renameFlow(newName: string) {
    await this.flowNameInput.dblclick();
    await this.flowNameInput.fill(newName);
    await this.clickOnEnter();
  }

  async removeFlow() {
    await this.removeFlowButton.click();
  }

  async checkFlowName(name: string) {
    await expect(this.flowNameInput, `Flow is named "${name}"`).toHaveValue(name);
  }

  async checkNoFlow() {
    await expect(this.flowNameInput, 'Flow section lists no flow').toHaveCount(0);
  }
}
