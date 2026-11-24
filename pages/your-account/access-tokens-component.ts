import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Your account > Integrations > Personal access tokens. The create and delete
 * modals and the token options dropdown render in a portal.
 */
export class AccessTokensComponent extends BaseComponent {
  readonly createNewTokenButton: Locator;
  readonly optionsButton: Locator;
  readonly noTokensText: Locator;

  readonly createTokenModalHeading: Locator;
  readonly tokenNameInput: Locator;
  readonly createTokenSubmitButton: Locator;
  readonly tokenCreatedModalHeading: Locator;
  readonly closeModalButton: Locator;
  readonly deleteTokenOption: Locator;
  readonly deleteTokenModalHeading: Locator;
  readonly deleteTokenButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.createNewTokenButton = root.getByRole('button', {
      name: 'Create new access token',
    });
    this.optionsButton = root.getByRole('button', { name: 'Options' });
    this.noTokensText = root.getByText('You have no tokens so far.');

    this.createTokenModalHeading = page.getByRole('heading', {
      name: 'Create access token',
    });
    this.tokenNameInput = page.getByRole('textbox', { name: 'Name' });
    this.createTokenSubmitButton = page.getByRole('button', {
      name: 'Create access token',
    });
    this.tokenCreatedModalHeading = page.getByRole('heading', {
      name: 'Access token created',
    });
    // The toast's and the modal's ✕ icons are also named "Close": match the
    // modal's text button instead
    this.closeModalButton = page.getByRole('button').filter({ hasText: 'Close' });
    this.deleteTokenOption = page.getByTestId('token-delete');
    this.deleteTokenModalHeading = page.getByRole('heading', {
      name: 'Delete token',
    });
    this.deleteTokenButton = page.getByRole('button', { name: 'Delete token' });
  }

  /**
   * Creates an access token, closes the "created" modal and checks it's listed.
   * @param name Token name.
   */
  async createToken(name: string) {
    await this.createNewTokenButton.click();
    await expect(
      this.createTokenModalHeading,
      'Create token modal is open',
    ).toBeVisible();
    await this.tokenNameInput.fill(name);
    await this.createTokenSubmitButton.click();
    await expect(
      this.tokenCreatedModalHeading,
      'Token created modal is open',
    ).toBeVisible();
    await this.closeModalButton.click();
    await expect(
      this.root.getByText(name),
      `Token "${name}" is listed`,
    ).toBeVisible();
  }

  /** Deletes the only listed token from its options and checks none is left. */
  async deleteToken() {
    await this.optionsButton.click();
    await this.deleteTokenOption.click();
    await expect(
      this.deleteTokenModalHeading,
      'Delete token modal is open',
    ).toBeVisible();
    await this.deleteTokenButton.click();
    await this.checkNoTokens();
  }

  /** Checks the "no tokens" empty state is shown. */
  async checkNoTokens() {
    await expect(this.noTokensText, 'No access tokens are listed').toBeVisible();
  }
}
