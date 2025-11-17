const { giveFeedbackTest } = require('./your-account-fixture');
const { qase } = require('playwright-qase-reporter/playwright');

giveFeedbackTest.describe('Send Feedback', () => {
  giveFeedbackTest(
    qase([207, 208], 'Send Feedback: validate empty and valid submission'),
    async ({ profilePage }) => {
      await giveFeedbackTest.step(
        'Remove subject and validate behaviour with empty fields: send feedback is disabled',
        async () => {
          await profilePage.isSendFeedbackButtonDisabled();
          await profilePage.enterSubjectToGiveFeedbackForm('QA Test');
          await profilePage.isSendFeedbackButtonDisabled();
          await profilePage.clearSubjectInputInGiveFeedbackForm();
          await profilePage.enterDescriptionToGiveFeedbackForm(
            'This is a test feedback triggered by QA team',
          );
          await profilePage.isSendFeedbackButtonDisabled();
        },
      );

      await giveFeedbackTest.step(
        'Enter subject, click on Send and validate success message',
        async () => {
          await profilePage.enterSubjectToGiveFeedbackForm('QA Test');
          await profilePage.clickSendFeedbackButton();
          await profilePage.isSuccessMessageDisplayed('Feedback sent');
        },
      );
    },
  );
});
