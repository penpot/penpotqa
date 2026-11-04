import { TeamPage } from '@pages/dashboard/team-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createInviteEmail } from 'helpers/teams/invite-email';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoOnboardingTest } from './login-signup-fixtures';

demoOnboardingTest(
  qase(
    [1802, 1813],
    'Reload the page while questions survey is opened, Press "ESC" button to close question slides',
  ),
  async ({ dashboardPage }) => {
    await demoOnboardingTest.step(
      'Answer onboarding questions and reload page',
      async () => {
        await dashboardPage.selectRadioButton('Work');
        await dashboardPage.selectLastDropdownOptions();
        await dashboardPage.reloadPage();
      },
    );

    await demoOnboardingTest.step(
      'Verify survey remains visible and ESC does not close it',
      async () => {
        await dashboardPage.isOnboardingFirstQuestionsVisible();
        await dashboardPage.clickOnESC();
        await dashboardPage.isOnboardingFirstQuestionsVisible();
      },
    );
  },
);

demoOnboardingTest(
  qase(
    [1805],
    'Select any option, click "Next" button and comebacks to previous question',
  ),
  async ({ dashboardPage }) => {
    await demoOnboardingTest.step(
      'Select options and navigate to the next question',
      async () => {
        await dashboardPage.selectRadioButton('Work');
        await dashboardPage.selectKindOfWork('Development');
        await dashboardPage.clickOnNextButton();
      },
    );

    await demoOnboardingTest.step(
      'Go back and verify previous selections are preserved',
      async () => {
        await dashboardPage.clickOnPrevButton();
        await dashboardPage.checkRadioButtonLabel('Work');
        await dashboardPage.checkDropdownValue('Development');
      },
    );
  },
);

demoOnboardingTest(
  qase([46], 'Add multiple members to your team from Onboarding modal'),
  async ({ page, dashboardPage }) => {
    const teamName = createTeamName();
    const emails = `${createInviteEmail('editor')}, ${createInviteEmail('editor')}`;

    await demoOnboardingTest.step(
      'Answer the survey and reach the onboarding team step',
      async () => {
        await dashboardPage.fillOnboardingFirstQuestions();
        await dashboardPage.skipWhatNewsPopUp();
        await dashboardPage.enterOnboardingTeamName(teamName);
      },
    );

    await demoOnboardingTest.step(
      'Invite two members and create the team',
      async () => {
        await dashboardPage.enterOnboardingInviteEmails(emails);
        await dashboardPage.clickOnOnboardingCreateTeamButton();
      },
    );

    await demoOnboardingTest.step('Verify the new team is selected', async () => {
      await new TeamPage(page).isTeamSelected(teamName);
    });
  },
);

demoOnboardingTest(
  qase([2245], 'Creating a team without member invitation after first login'),
  async ({ page, dashboardPage }) => {
    const teamName = createTeamName();

    await demoOnboardingTest.step(
      'Answer the survey and reach the onboarding team step',
      async () => {
        await dashboardPage.fillOnboardingFirstQuestions();
        await dashboardPage.skipWhatNewsPopUp();
        await dashboardPage.enterOnboardingTeamName(teamName);
        await dashboardPage.isOnboardingCreateTeamButtonActive();
      },
    );

    await demoOnboardingTest.step(
      'Create the team without invitations',
      async () => {
        await dashboardPage.clickOnOnboardingCreateEmptyTeamButton();
        await dashboardPage.isOnboardingTeamModalNotVisible();
      },
    );

    await demoOnboardingTest.step('Verify the new team is selected', async () => {
      await new TeamPage(page).isTeamSelected(teamName);
    });
  },
);
