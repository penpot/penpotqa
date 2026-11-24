import { yourAccountTest } from '@tests/profile-menu/your-account/your-account-fixture';

// Open Profile menu > Help & Learning > Give feedback (shown inside Your account)
export const giveFeedbackTest = yourAccountTest.extend({
  yourAccountPage: async ({ yourAccountPage }, use) => {
    await yourAccountPage.profileMenu.openGiveFeedback();
    await yourAccountPage.checkIsVisible();

    await use(yourAccountPage);
  },
});
