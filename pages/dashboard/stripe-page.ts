import {
  type FrameLocator,
  type Locator,
  type Page,
  expect,
} from '@playwright/test';
import { BasePage } from '../base-page';
import { getActualExpirationDate } from '../../helpers/stripe';
import { STRIPE_TEST_CARDS } from '../../helpers/stripe-test-cards';

export class StripePage extends BasePage {
  // Embedded "add payment method" flow (Stripe Elements iframe, within
  // Penpot's own account settings) — for adding a card to an *existing*
  // subscription.
  readonly addPaymentMethodButton: Locator;
  readonly iframeAddCardModal: FrameLocator;
  readonly cardNumberInput: Locator;
  readonly cardExpirationDateInput: Locator;
  readonly cardCVCInput: Locator;
  readonly cardCountryDropdown: Locator;
  readonly cardZipCodeInput: Locator;
  readonly cardSaveInfoCheckout: Locator;
  readonly confirmButton: Locator;
  readonly returnToPenpotButton: Locator;
  readonly updateSubscriptionButton: Locator;
  readonly cancelSubscriptionButton: Locator;
  readonly selectButton: Locator;
  readonly continueButton: Locator;
  readonly trialEnds: Locator;
  readonly trialEndsDate: Locator;
  readonly cancelsEnds: Locator;
  readonly cancelSubscriptionHeader: Locator;
  readonly noLongerNeedItRadioButton: Locator;
  readonly submitButton: Locator;
  readonly invoiceRow: Locator;
  readonly lastInvoice: Locator;
  readonly currentSubscriptionHeader: Locator;

  // Hosted Stripe Checkout page (checkout.stripe.com) — a full external
  // navigation used for a brand-new subscription (e.g. the Enterprise
  // trial), distinct from the embedded add-card iframe above. These fields
  // are plain page-level inputs, not inside an iframe.
  readonly checkoutCountrySelect: Locator;
  readonly checkoutCardNumberInput: Locator;
  readonly checkoutCardExpiryInput: Locator;
  // CVC has no usable accessible name — its aria-label ("Credit or debit
  // card CVC/CVV") matches 2 elements even with an exact match (confirmed
  // live), so an id selector is the pragmatic choice here, not an oversight.
  readonly checkoutCardCvcInput: Locator;
  readonly checkoutBillingNameInput: Locator;
  // Spain (the checkout page's own default billing country) requires VAT
  // info rather than a ZIP code. Business name has no accessible label at
  // all, only a placeholder — getByPlaceholder is the best available option.
  readonly checkoutBusinessNameInput: Locator;
  readonly checkoutTaxIdInput: Locator;
  readonly checkoutStartTrialButton: Locator;
  // Shown in place (no navigation) when a decline test card is used —
  // e.g. "Your credit card was declined. Try paying with a
  // debit card instead.", rendered as a real `role="alert"` element.
  readonly checkoutDeclinedError: Locator;

  constructor(page: Page) {
    super(page);

    // Teams
    this.addPaymentMethodButton = page.getByText('Add payment method');
    this.iframeAddCardModal = page
      .locator('[class="StripeElement"]')
      .frameLocator('iframe[role="presentation"]');
    this.cardNumberInput = this.iframeAddCardModal.locator('input[name="number"]');
    this.cardExpirationDateInput = this.iframeAddCardModal.locator(
      'input[name="expiry"]',
    );
    this.cardCVCInput = this.iframeAddCardModal.locator('input[name="cvc"]');
    this.cardCountryDropdown = this.iframeAddCardModal.locator(
      'select[name="country"]',
    );
    this.cardZipCodeInput = this.iframeAddCardModal.locator(
      'input[name="postalCode"]',
    );
    this.cardSaveInfoCheckout = this.iframeAddCardModal.locator(
      '[id="Field-linkOptInCheckbox"]',
    );
    this.confirmButton = page.getByTestId('confirm');
    this.returnToPenpotButton = page.getByText('Return to Penpot');
    this.updateSubscriptionButton = page.getByText('Update subscription');
    this.cancelSubscriptionButton = page.getByText('Cancel subscription');
    this.selectButton = page.getByText('Select');
    this.continueButton = page.getByText('Continue');
    this.trialEnds = page.getByTestId('trial-ending-badge');
    this.trialEndsDate = this.trialEnds.locator('span span span');
    this.cancelsEnds = page.locator(
      '[data-test="subscription-cancel-at-period-end-badge"]',
    );
    this.cancelSubscriptionHeader = page.getByText('Confirm cancellation');
    this.noLongerNeedItRadioButton = page.getByText('I no longer need it', {
      exact: true,
    });
    this.submitButton = page.getByTestId('cancellation_reason_submit');
    this.invoiceRow = page.getByTestId('hip-link');
    this.lastInvoice = this.invoiceRow.first();
    this.currentSubscriptionHeader = page.getByText('Current subscription');

    this.checkoutCountrySelect = page.getByLabel('Country or region', {
      exact: true,
    });
    this.checkoutCardNumberInput = page.getByLabel('Card number', { exact: true });
    this.checkoutCardExpiryInput = page.getByLabel('Expiration', { exact: true });
    this.checkoutCardCvcInput = page.locator('#cardCvc');
    this.checkoutBillingNameInput = page.getByLabel('Cardholder name', {
      exact: true,
    });
    this.checkoutBusinessNameInput = page.getByPlaceholder('Business name', {
      exact: true,
    });
    this.checkoutTaxIdInput = page.getByLabel('Tax ID', { exact: true });
    this.checkoutStartTrialButton = page.getByRole('button', {
      name: /start trial/i,
    });
    this.checkoutDeclinedError = page.getByRole('alert');
  }

  async clickOnAddPaymentMethodButton() {
    await this.addPaymentMethodButton.click();
  }

  async enterCardNumber(number: string = '4242424242424242') {
    await this.cardNumberInput.fill(number);
  }

  async enterCardExpirationDate(date: string) {
    await this.cardExpirationDateInput.fill(date);
  }

  async enterCardCVC(cvc: string = '123') {
    await this.cardCVCInput.fill(cvc);
  }

  async enterCardZipCode(zip: string = '12345') {
    (await this.cardZipCodeInput.isVisible())
      ? await this.cardZipCodeInput.fill(zip)
      : null;
  }

  async selectCardCountry(country: string = 'US') {
    await this.cardCountryDropdown.selectOption(country);
  }

  async clickOnAddCardButton() {
    if (await this.confirmButton.isVisible()) {
      await this.isAddCardButtonEnabled();
      await this.confirmButton.click();
    }
  }

  async addDefaultCard() {
    await this.clickOnAddPaymentMethodButton();
    await this.enterCardNumber();
    await this.enterCardExpirationDate(await getActualExpirationDate());
    await this.enterCardCVC();
    await this.selectCardCountry();
    await this.enterCardZipCode();
    await this.clickOnSaveInfoCheckout();
    await this.enterCardNumber();
    await this.page.waitForTimeout(2000);
    await this.clickOnAddCardButton();
    await this.isCardNumberFieldVisible(false);
  }

  async clickOnReturnToPenpotButton() {
    await this.returnToPenpotButton.click();
  }

  /**
   * Fills and submits the hosted Stripe Checkout page for a brand-new
   * subscription (e.g. the Enterprise 14-day trial). Assumes the browser has
   * already navigated to checkout.stripe.com (e.g. by clicking a "Try it
   * free" CTA).
   *
   * Country defaults to Spain (the checkout page's own default), which
   * requires VAT info — business name and tax ID — rather than a ZIP code;
   * this method fills both.
   *
   * `cardNumber` defaults to a card that succeeds — pass any of Stripe's
   * other test-mode card numbers (https://docs.stripe.com/testing#cards)
   * with `expectSuccess: false` to test a declined checkout instead: this
   * waits for the same-page decline error rather than the redirect back to
   * Penpot, since a decline never navigates away from Stripe.
   */
  async completeEnterpriseTrialCheckout(
    cardNumber: string = STRIPE_TEST_CARDS.SUCCESS_VISA,
    taxId: string = 'ESA1234567Z',
    expectSuccess: boolean = true,
  ) {
    await this.page.waitForURL(/checkout\.stripe\.com/, { timeout: 25000 });
    await this.checkoutCountrySelect.selectOption('ES');
    await this.checkoutCardNumberInput.fill(cardNumber);
    const expiry = (await getActualExpirationDate()).replace(' ', '/');
    await this.checkoutCardExpiryInput.fill(expiry);
    await this.checkoutCardCvcInput.fill('123');
    await this.checkoutBillingNameInput.fill('QA Test');
    await this.checkoutBusinessNameInput.fill('Penpot QA');
    await this.checkoutTaxIdInput.fill(taxId);
    await this.checkoutStartTrialButton.click();

    if (expectSuccess) {
      await this.page.waitForURL(
        (url) => !url.href.includes('checkout.stripe.com'),
        { timeout: 30000 },
      );
    } else {
      await expect(
        this.checkoutDeclinedError,
        'Checkout shows a decline error for the given card',
      ).toBeVisible({ timeout: 15000 });
    }
  }

  /** Asserts whether the browser is currently on the hosted Stripe Checkout
   * page (checkout.stripe.com) or has left it. */
  async isOnStripeCheckoutPage(onCheckoutPage: boolean = true) {
    onCheckoutPage
      ? await expect(this.page, 'On the Stripe checkout page').toHaveURL(
          /checkout\.stripe\.com/,
        )
      : await expect(
          this.page,
          'No longer on the Stripe checkout page',
        ).not.toHaveURL(/checkout\.stripe\.com/);
  }

  async isVisaCardAdded(added: boolean = true, last4Digits: string = '4242') {
    const card = this.page.getByText(`Visa •••• ${last4Digits}`);
    added ? await expect(card).toBeVisible() : await expect(card).not.toBeVisible();
  }

  async clickOnUpdateSubscriptionButton() {
    await this.updateSubscriptionButton.click();
  }

  async clickOnSelectButton() {
    await this.selectButton.click();
  }

  async clickOnContinueButton() {
    await this.continueButton.click();
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }

  async changeSubscription() {
    await this.clickOnUpdateSubscriptionButton();
    await this.clickOnSelectButton();
    await this.clickOnContinueButton();
    await this.clickOnConfirmButton();
    await expect(this.confirmButton).not.toBeVisible({ timeout: 10000 });
  }

  async checkCurrentSubscription(subscription: string = 'Unlimited') {
    const subscriptionLocator = this.page
      .getByText(`Penpot ${subscription}`, {
        exact: true,
      })
      .first();
    await expect(subscriptionLocator).toBeVisible();
  }

  async isTrialEndsVisible(visible: boolean = true) {
    visible
      ? await expect(this.trialEnds).toBeVisible()
      : await expect(this.trialEnds).not.toBeVisible();
  }

  async isTrialEndsTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    await expect(this.trialEndsDate).toHaveText(tomorrowFormatted);
  }

  async waitTrialEndsDisappear(timeout: number = 60000, interval: number = 8000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const isVisible = await this.trialEnds.isVisible();
      if (!isVisible) {
        return;
      }
      await this.page.reload();
      await expect(this.currentSubscriptionHeader).toBeVisible();
      await this.page.waitForTimeout(interval);
    }
    console.error(`The timeout for trial completion has expired.`);
    await expect(
      this.trialEnds,
      `The timeout for trial completion has expired.`,
    ).not.toBeVisible({ timeout: 1000 });
  }

  async waitCancelsEndsDisappear(timeout: number = 60000, interval: number = 8000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const isVisible = await this.cancelsEnds.isVisible();
      if (!isVisible) {
        return;
      }
      await this.page.reload();
      await this.page.waitForTimeout(interval);
    }
    console.error(`The timeout for cancels completion has expired.`);
    await expect(
      this.cancelsEnds,
      `The timeout for cancels completion has expired.`,
    ).not.toBeVisible({ timeout: 1000 });
  }

  async isCancelsEndsVisible(visible: boolean = true) {
    visible
      ? await expect(this.cancelsEnds).toBeVisible()
      : await expect(this.cancelsEnds).not.toBeVisible();
  }

  async clickOnCancelSubscriptionButton() {
    await this.cancelSubscriptionButton.click();
  }

  async clickOnNoLongerNeedItRadioButton() {
    await this.noLongerNeedItRadioButton.click();
  }

  async clickOnSubmitButton() {
    await this.submitButton.click();
  }

  async isCancelSubscriptionHeaderVisible(visible: boolean = true) {
    visible
      ? await expect(this.cancelSubscriptionHeader).toBeVisible()
      : await expect(this.cancelSubscriptionHeader).not.toBeVisible();
  }

  async cancelSubscription() {
    await this.clickOnCancelSubscriptionButton();
    await this.isCancelSubscriptionHeaderVisible();
    await this.clickOnCancelSubscriptionButton();
    await this.clickOnNoLongerNeedItRadioButton();
    await this.clickOnSubmitButton();
    await this.isCancelsEndsVisible();
  }

  async checkLastInvoiceName(name: string) {
    await expect(this.lastInvoice.getByText(name)).toBeVisible();
  }

  async checkLastInvoiceStatus(status: string) {
    await expect(this.lastInvoice.getByText(status)).toBeVisible();
  }

  async checkLastInvoiceAmount(amount: string) {
    await expect(this.lastInvoice.getByText(amount)).toBeVisible();
  }

  async checkInvoiceAmountCount(amount: string, expectedCount: number) {
    const amountElements = this.invoiceRow.getByText(amount);
    await expect(amountElements).toHaveCount(expectedCount);
  }

  async waitInvoiceAmountCount(
    amount: string,
    expectedCount: number,
    retries: number = 4,
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        const amountElements = this.invoiceRow.getByText(amount);
        await expect(amountElements).toHaveCount(expectedCount);
        return;
      } catch (error) {
        await this.page.reload();
        await this.page.waitForTimeout(3000);
      }
    }
    const finalElements = this.invoiceRow.getByText(amount);
    await expect(finalElements).toHaveCount(expectedCount);
  }

  async clickOnSaveInfoCheckout() {
    (await this.cardSaveInfoCheckout.isVisible())
      ? await this.cardSaveInfoCheckout.click()
      : null;
  }

  async isCardNumberFieldVisible(visible: boolean = true, timeout: number = 30000) {
    visible
      ? await expect(this.cardNumberInput).toBeVisible({ timeout })
      : await expect(this.cardNumberInput).not.toBeVisible({ timeout });
  }

  async isAddCardButtonEnabled(enabled: boolean = true) {
    enabled
      ? await expect(this.confirmButton).not.toBeDisabled()
      : await expect(this.confirmButton).toBeDisabled();
  }
}
