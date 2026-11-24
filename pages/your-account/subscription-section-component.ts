import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/** Plans offered with a free trial in the Subscription section. */
export type TrialPlan = 'Unlimited' | 'Enterprise';

/**
 * Your account > Subscription: the plan cards and the modals they open
 * (trial confirmation, downgrade warning, Contact Sales), which render in a portal.
 */
export class SubscriptionSectionComponent extends BaseComponent {
  readonly currentPlanLabel: Locator;
  readonly manageSubscriptionButton: Locator;
  readonly addPaymentMethodButton: Locator;
  /** "Subscribe" (exact) only ever labels the Professional card's own button. */
  readonly subscribeToProfessionalButton: Locator;
  readonly tryItFreeFor14DaysButton: Locator;
  readonly try14DaysForFreeButton: Locator;

  // Trial modal
  readonly continueButton: Locator;
  readonly startFreeTrialButton: Locator;
  readonly skipPaymentDetailsButton: Locator;
  readonly membersInput: Locator;
  readonly trialModal: Locator;
  readonly trialModalHeader: Locator;

  // Downgrade warning modal (PENPOT-3353), shown when subscribing to
  // Professional from an Enterprise account.
  readonly downgradeWarningText: Locator;
  readonly downgradeWarningCancelButton: Locator;

  // "Contact Sales" modal (PENPOT-3592), shown instead of Stripe checkout when
  // an account on a paid plan tries the other one. Two copy variants exist: a
  // standalone modal with a mailto link, or 3353's downgrade modal with a
  // "Contact Sales" button instead of its Continue button.
  readonly contactSalesLink: Locator;
  readonly contactSalesButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.currentPlanLabel = root
      .locator(
        'div[class*="plan-card-title-container"] h4[class*="plan-card-title"]',
      )
      .first();
    this.manageSubscriptionButton = root.getByRole('button', {
      name: 'Manage your subscription',
    });
    this.addPaymentMethodButton = root.getByRole('button', {
      name: 'Add a payment method to continue after your trial',
    });
    this.subscribeToProfessionalButton = root.getByRole('button', {
      name: 'Subscribe',
      exact: true,
    });
    // Not rooted: on a paid plan this is the Enterprise widget in the sidebar,
    // outside the section (on a free plan, it's a plan card's button).
    this.tryItFreeFor14DaysButton = page.getByRole('button', {
      name: 'Try it free for 14 days',
    });
    this.try14DaysForFreeButton = root.getByRole('button', {
      name: 'Try 14 days for free',
    });

    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.startFreeTrialButton = page.getByRole('button', {
      name: 'Start free trial',
    });
    this.skipPaymentDetailsButton = page.locator(
      'input[value="Skip for now and start trial"]',
    );
    this.membersInput = page.locator('input[name="min-members"]');
    this.trialModal = page.locator('[class*="subscription__modal-success-content"]');
    this.trialModalHeader = page.locator('[class*="subscription__modal-title"]');

    this.downgradeWarningText = page.getByText('Switch to Professional plan?');
    this.downgradeWarningCancelButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });

    this.contactSalesLink = page.getByRole('link', { name: 'sales@penpot.app' });
    this.contactSalesButton = page.getByRole('button', { name: 'Contact Sales' });
  }

  /**
   * Card of a plan under "Other penpot plans". The cards have no role or label,
   * so they're matched by their class and told apart by their heading.
   * @param plan Plan whose card to return.
   */
  private getPlanCard(plan: TrialPlan): Locator {
    return this.root
      .locator('.main_ui_settings_subscription__plan-card')
      .filter({ has: this.page.getByRole('heading', { name: plan, exact: true }) });
  }

  /**
   * Starts a free trial from a plan card, skipping payment details, and checks
   * the plan becomes the current one.
   * @param plan Plan to try; defaults to 'Unlimited'.
   * @param editors Number of editors to enter (Unlimited only).
   */
  async startTrial(plan: TrialPlan = 'Unlimited', editors?: string) {
    await this.getPlanCard(plan)
      .getByRole('button', { name: 'Try it free for 14 days' })
      .click();
    if (plan === 'Unlimited') {
      if (editors !== undefined) {
        await this.membersInput.fill(editors);
      }
      await this.continueButton.click();
      await this.skipPaymentDetailsButton.click();
    } else {
      await this.startFreeTrialButton.click();
    }
    await expect(this.trialModal, 'Trial confirmation modal is shown').toBeVisible();
    await this.checkTrialModalHeader(`You are ${plan} (trial)!`);
    await this.closeModalWindow();
    await this.checkCurrentPlan(`${plan} (trial)`);
  }

  /** Clicks "Manage your subscription" (opens Stripe's customer portal). */
  async clickManageSubscription() {
    await this.manageSubscriptionButton.click();
  }

  /** Clicks "Add a payment method to continue after your trial". */
  async clickAddPaymentMethod() {
    await this.addPaymentMethodButton.click();
  }

  /** Clicks "Subscribe" on the Professional card. */
  async clickSubscribeToProfessional() {
    await this.subscribeToProfessionalButton.click();
  }

  /** Clicks "Try it free for 14 days". */
  async clickTryItFreeFor14Days() {
    await this.tryItFreeFor14DaysButton.click();
  }

  /** Clicks "Try 14 days for free". */
  async clickTry14DaysForFree() {
    await this.try14DaysForFreeButton.click();
  }

  /** Cancels the downgrade warning and checks it closes. */
  async closeDowngradeWarningWithoutConfirming() {
    await this.downgradeWarningCancelButton.click();
    await this.checkDowngradeWarningIsVisible(false);
  }

  /** Closes the Contact Sales modal with Escape and checks it closes. */
  async closeContactSalesModal() {
    await this.page.keyboard.press('Escape');
    await this.checkContactSalesModalIsVisible(false);
  }

  /**
   * Checks the name of the current plan.
   * @param name Expected plan name, e.g. 'Enterprise (trial)'.
   */
  async checkCurrentPlan(name: string) {
    await expect(this.currentPlanLabel, `Current plan is "${name}"`).toHaveText(
      name,
    );
  }

  /**
   * Checks the title of the trial confirmation modal.
   * @param title Expected title.
   */
  async checkTrialModalHeader(title: string) {
    await expect(
      this.trialModalHeader,
      `Trial modal title is "${title}"`,
    ).toHaveText(title);
  }

  /**
   * Checks whether the downgrade-to-Professional warning is shown.
   * @param visible `true` (default) to check it's shown, `false` to check it isn't.
   */
  async checkDowngradeWarningIsVisible(visible = true) {
    visible
      ? await expect(
          this.downgradeWarningText,
          'Downgrade-to-Professional warning is shown',
        ).toBeVisible()
      : await expect(
          this.downgradeWarningText,
          'Downgrade-to-Professional warning is not shown',
        ).toBeHidden();
  }

  /**
   * Checks whether the Contact Sales modal is shown, in either of its variants.
   * @param visible `true` (default) to check it's shown, `false` to check it isn't.
   */
  async checkContactSalesModalIsVisible(visible = true) {
    const contactSalesSignal = this.contactSalesLink.or(this.contactSalesButton);
    visible
      ? await expect(
          contactSalesSignal,
          '"Contact Sales" modal is shown (mailto link or button variant)',
        ).toBeVisible()
      : await expect(
          contactSalesSignal,
          '"Contact Sales" modal is not shown',
        ).toBeHidden();
  }
}
