import { ProfilePage } from '@pages/profile-page';
import { demoAccountApiFixture } from 'fixtures';

type HelpAndLearningFixtures = {
  profilePage: ProfilePage;
};

// Open Profile menu > Help & Learning > Give feedback (shown inside Your account)
export const giveFeedbackTest =
  demoAccountApiFixture.extend<HelpAndLearningFixtures>({
    profilePage: async ({ page }, use) => {
      const profilePage = new ProfilePage(page);

      await profilePage.openGiveFeedbackPage();
      await profilePage.isHeaderDisplayed('Your account');

      await use(profilePage);
    },
  });
