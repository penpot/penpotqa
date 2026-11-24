import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Your account > Profile: name, email, avatar and the "Want to remove your
 * account?" flow at the bottom of the section.
 */
export class ProfileSectionComponent extends BaseComponent {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveSettingsButton: Locator;
  readonly avatarBlock: Locator;
  readonly imageInput: Locator;
  readonly deleteImageButton: Locator;
  readonly confirmDeleteImageButton: Locator;
  readonly changeEmailButton: Locator;
  readonly newEmailInput: Locator;
  readonly confirmNewEmailInput: Locator;
  readonly confirmChangeEmailButton: Locator;

  // Account deletion (PENPOT-3555). The confirmation modal renders in a portal.
  readonly wantToRemoveAccountLink: Locator;
  readonly deleteAccountModalHeading: Locator;
  readonly deleteAccountWarningText: Locator;
  readonly organizationsToDeleteToggle: Locator;
  readonly organizationsToDeleteList: Locator;
  readonly cancelDeleteAccountButton: Locator;
  readonly confirmDeleteAccountButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.nameInput = root.locator('#fullname');
    this.emailInput = root.locator('#email');
    this.saveSettingsButton = root.getByRole('button', { name: 'Save settings' });
    this.avatarBlock = root.locator('div.main_ui_settings_profile__form-container');
    this.imageInput = root.getByTestId('profile-image-input');
    this.deleteImageButton = root.getByRole('button', { name: 'Delete' });
    this.confirmDeleteImageButton = page
      .locator('#portal-container-modal')
      .getByRole('button', { name: 'Delete' });
    this.changeEmailButton = root.getByRole('button', { name: 'Change email' });
    this.newEmailInput = page.locator('#email-1');
    this.confirmNewEmailInput = page.locator('#email-2');
    this.confirmChangeEmailButton = page
      .getByTestId('change-email-submit')
      .getByRole('button', { name: 'Change email' });

    this.wantToRemoveAccountLink = root.getByText('Want to remove your account?');
    this.deleteAccountModalHeading = page.getByRole('heading', {
      name: 'Are you sure you want to delete your account?',
    });
    this.deleteAccountWarningText = page.getByText(
      'This action is irreversible. Your account, subscription, and organizations will be deleted immediately. You will also lose access to your current projects and files.',
    );
    this.organizationsToDeleteToggle = page.getByRole('button', {
      name: 'Organizations that will be deleted',
    });
    this.organizationsToDeleteList = page
      .getByRole('list')
      .filter({ hasText: 'members' });
    this.cancelDeleteAccountButton = page.getByRole('button', {
      name: 'Cancel and keep my account',
    });
    this.confirmDeleteAccountButton = page.getByRole('button', {
      name: 'Yes, delete my account',
    });
  }

  /**
   * Replaces the name and saves it with "Save settings".
   * @param newName New account name.
   */
  async changeName(newName: string) {
    await this.nameInput.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
    await this.nameInput.fill(newName);
    await this.saveSettingsButton.click();
  }

  /**
   * Requests an email change: fills and confirms the new email in the modal.
   * @param newEmail New email address.
   */
  async changeEmail(newEmail: string) {
    await this.changeEmailButton.click();
    await this.newEmailInput.fill(newEmail);
    await this.confirmNewEmailInput.fill(newEmail);
    await this.confirmChangeEmailButton.click();
  }

  /**
   * Uploads a profile image and waits until the new one is shown and saved.
   * @param filePath Image path, relative to the project root.
   */
  async uploadImage(filePath: string) {
    const profileImage = this.imageInput.locator('../img');
    const oldSrc = await profileImage.getAttribute('src');
    await this.imageInput.setInputFiles(filePath);
    await expect(
      this.imageInput.locator(`../img[src="${oldSrc}"]`),
      'Previous profile image is replaced',
    ).toBeHidden();
    await this.page.waitForResponse(
      (response) =>
        response.url() ===
          `${process.env.BASE_URL}api/main/methods/push-audit-events` &&
        response.status() === 204,
    );
  }

  /** Deletes the profile image and confirms it in the modal. */
  async deleteImage() {
    await this.deleteImageButton.click();
    await this.confirmDeleteImageButton.click();
  }

  /** Clicks "Want to remove your account?" and waits for the confirmation modal. */
  async openDeleteAccountModal() {
    await this.wantToRemoveAccountLink.click();
    await expect(
      this.deleteAccountModalHeading,
      'Delete-account confirmation modal is open',
    ).toBeVisible();
  }

  /** Checks the delete-account modal shows both its Cancel and Confirm buttons. */
  async checkDeleteAccountModalButtonsAreVisible() {
    await expect(
      this.cancelDeleteAccountButton,
      '"Cancel and keep my account" button is visible',
    ).toBeVisible();
    await expect(
      this.confirmDeleteAccountButton,
      '"Yes, delete my account" button is visible',
    ).toBeVisible();
  }

  /** Checks the delete-account modal shows the irreversible-deletion warning. */
  async checkDeleteAccountWarningIsVisible() {
    await expect(
      this.deleteAccountWarningText,
      'Irreversible-deletion warning text is shown',
    ).toBeVisible();
  }

  /** Expands "Organizations that will be deleted"; no-op if already expanded (the default). */
  async expandOrganizationsToDelete() {
    if (
      (await this.organizationsToDeleteToggle.getAttribute('aria-expanded')) !==
      'true'
    ) {
      await this.organizationsToDeleteToggle.click();
    }
    await expect(
      this.organizationsToDeleteList,
      '"Organizations that will be deleted" list is expanded',
    ).toBeVisible();
  }

  /**
   * Checks an organization is listed to be deleted, with its counts.
   * @param orgName Organization name.
   * @param teams Number of teams shown for it.
   * @param members Number of members shown for it.
   */
  async checkOrganizationIsListedToDelete(
    orgName: string,
    teams: number,
    members: number,
  ) {
    const row = this.organizationsToDeleteList
      .getByRole('listitem')
      .filter({ hasText: orgName });
    await expect(
      row,
      `Organization "${orgName}" is listed to be deleted`,
    ).toBeVisible();
    await expect(
      row,
      `Organization "${orgName}" shows ${teams} teams`,
    ).toContainText(`${teams} teams`);
    await expect(
      row,
      `Organization "${orgName}" shows ${members} members`,
    ).toContainText(`${members} members`);
  }

  /** Clicks "Yes, delete my account" in the delete-account modal. */
  async confirmDeleteAccount() {
    await this.confirmDeleteAccountButton.click();
  }
}
