import { giveFeedbackTest } from '@tests/profile-menu/help-and-learning/help-and-learning-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

giveFeedbackTest(
  qase([207, 208], 'Send Feedback: validate empty and valid submission'),
  async ({ yourAccountPage }) => {
    const { giveFeedback } = yourAccountPage;
    await giveFeedbackTest.step(
      '(207) Remove subject and validate behavior with empty fields: send feedback is disabled',
      async () => {
        await giveFeedback.checkSendButtonIsDisabled();
        await giveFeedback.fillSubject('QA Test');
        await giveFeedback.checkSendButtonIsDisabled();
        await giveFeedback.clearSubject();
        await giveFeedback.fillDescription(
          'This is a test feedback triggered by QA team',
        );
        await giveFeedback.checkSendButtonIsDisabled();
      },
    );

    await giveFeedbackTest.step(
      '(208) Enter subject, click on Send and validate success message',
      async () => {
        await giveFeedback.selectType('Idea');
        await giveFeedback.fillSubject('QA Test');
        await giveFeedback.send();
        await yourAccountPage.isSuccessMessageDisplayed('Feedback sent');
      },
    );
  },
);
