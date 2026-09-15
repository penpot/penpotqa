/**
 * Stripe's well-known test-mode card numbers (test mode only — these are
 * documented by Stripe itself and never charge anything real).
 * See https://docs.stripe.com/testing#cards
 */
export const STRIPE_TEST_CARDS = {
  SUCCESS_VISA: '4242424242424242',
} as const;
