const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');
const { getActualExpirationDate } = require('../../helpers/stripe');

exports.StripePage = class StripePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Teams
    this.addPaymentMethodButton = page.getByText('Add payment method');
    this.iframeAddCardModal = page
      .locator('[class="StripeElement"]')
      .frameLocator('iframe[role="presentation"]');
    this.cardNumberImput = this.iframeAddCardModal.locator('input[name="number"]');
    this.cardExpirationDateImput = this.iframeAddCardModal.locator(
      'input[name="expiry"]',
    );
    this.cardCVCImput = this.iframeAddCardModal.locator('input[name="cvc"]');
    this.cardCountryDropdown = this.iframeAddCardModal.locator(
      'select[name="country"]',
    );
    this.cardZipCodeImput = this.iframeAddCardModal.locator(
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
    this.cancelSubscriptionHeader = page.getByText('Cancel your subscription');
    this.noLongerNeedItRadioButton = page.getByText('I no longer need it', {
      exact: true,
    });
    this.submitButton = page.getByTestId('cancellation_reason_submit');
    this.invoiceRow = page.getByTestId('hip-link');
    this.lastInvoice = this.invoiceRow.first();
    this.currentSubscriptionHeader = page.getByText('Current subscription');
  }

  async clickOnAddPaymentMethodButton() {
    await this.addPaymentMethodButton.click();
  }

  async enterCardNumber(number = '4242424242424242') {
    await this.cardNumberImput.fill(number);
  }

  async enterCardExpirationDate(date) {
    await this.cardExpirationDateImput.fill(date);
  }

  async enterCardCVC(cvc = '123') {
    await this.cardCVCImput.fill(cvc);
  }

  async enterCardZipCode(zip = '12345') {
    (await this.cardZipCodeImput.isVisible())
      ? await this.cardZipCodeImput.fill(zip)
      : null;
  }

  async selectCardCountry(country = 'US') {
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

  async isVisaCardAdded(added = true, last4Digits = '4242') {
    const card = await this.page.getByText(`Visa •••• ${last4Digits}`);
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
  }

  async checkCurrentSubscription(subscription = 'Unlimited') {
    const subscriptionLocator = await this.page.getByText(`Penpot ${subscription}`, {
      exact: true,
    });
    await expect(subscriptionLocator).toBeVisible();
  }

  async isTrialEndsVisible(visible = true) {
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

  async waitTrialEndsDisappear(timeout = 60000, interval = 6000) {
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

  async waitCancelsEndsDisappear(timeout = 40000, interval = 6000) {
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

  async isCancelsEndsVisible(visible = true) {
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

  async isCancelSubscriptionHeaderVisible(visible = true) {
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

  async checkLastInvoiceName(name) {
    await expect(await this.lastInvoice.getByText(name)).toBeVisible();
  }

  async checkLastInvoiceStatus(status) {
    await expect(await this.lastInvoice.getByText(status)).toBeVisible();
  }

  async checkLastInvoiceAmount(amount) {
    await expect(await this.lastInvoice.getByText(amount)).toBeVisible();
  }

  async checkInvoiceAmountCount(amount, expectedCount) {
    const amountElements = this.invoiceRow.getByText(amount);
    await expect(amountElements).toHaveCount(expectedCount);
  }

  async waitInvoiceAmountCount(amount, expectedCount, retries = 4) {
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

  async isCardNumberFieldVisible(visible = true, timeout = 30000) {
    visible
      ? await expect(this.cardNumberImput).toBeVisible({ timeout: timeout })
      : await expect(this.cardNumberImput).not.toBeVisible({ timeout: timeout });
  }

  async isAddCardButtonEnabled(enabled = true) {
    enabled
      ? await expect(this.confirmButton).not.toBeDisabled()
      : await expect(this.confirmButton).toBeDisabled();
  }
};
