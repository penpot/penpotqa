import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
});

mainTest(qase([1152], 'Upload single font'), async () => {
  await mainTest.step('Open Fonts section', async () => {
    await dashboardPage.openSidebarItem('Fonts');
  });

  await mainTest.step('Upload a single font and verify it is listed', async () => {
    await dashboardPage.uploadFont('fonts/Pacifico.ttf');
    await dashboardPage.isFontExists('Pacifico', 'Regular');
  });
});

mainTest(qase([1153], 'Fonts - upload (multiple)'), async () => {
  await mainTest.step('Open Fonts section', async () => {
    await dashboardPage.openSidebarItem('Fonts');
  });

  await mainTest.step(
    'Upload multiple fonts and verify they are listed',
    async () => {
      await dashboardPage.uploadAllFonts([
        'fonts/Pacifico.ttf',
        'fonts/SourceCodePro-Regular.woff',
      ]);
      await dashboardPage.areFontsListed([
        { fontName: 'Pacifico', fontStyle: 'Regular' },
        { fontName: 'Source Code Pro', fontStyle: 'Regular' },
      ]);
    },
  );
});

mainTest(qase([1154], 'Fonts - upload fail invalid file format'), async () => {
  await mainTest.step('Open Fonts section', async () => {
    await dashboardPage.openSidebarItem('Fonts');
  });

  await mainTest.step('Try to upload an invalid file format', async () => {
    await dashboardPage.uploadFontWithInvalidFormat('images/images.png');
  });
});

mainTest(qase([1155], 'Search font'), async () => {
  await mainTest.step('Open Fonts section and upload test fonts', async () => {
    await dashboardPage.openSidebarItem('Fonts');
    await dashboardPage.uploadFont('fonts/ArialTh.ttf');
    await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
  });

  await mainTest.step('Search and verify font results', async () => {
    await dashboardPage.searchFont('Arial Th');
    await dashboardPage.isFontExists('Arial Th', 'Regular');
    await dashboardPage.isFontNotExist('Allura-Regular');
  });
});

mainTest(qase([1157], 'Edit font BUG'), async () => {
  await mainTest.step('Open Fonts section and upload a font', async () => {
    await dashboardPage.openSidebarItem('Fonts');
    await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
    await dashboardPage.isFontExists('Allura', 'Regular');
  });

  await mainTest.step('Edit the font name and verify the change', async () => {
    await dashboardPage.editFont('New Test Font');
    await dashboardPage.isFontExists('New Test Font', 'Regular');
  });
});

mainTest(qase([1158], 'Delete font'), async () => {
  await mainTest.step('Open Fonts section and upload a font', async () => {
    await dashboardPage.openSidebarItem('Fonts');
    await dashboardPage.uploadFont('fonts/Pacifico.ttf');
    await dashboardPage.isFontExists('Pacifico', 'Regular');
  });

  await mainTest.step('Delete the font and verify the empty state', async () => {
    await dashboardPage.deleteFont();
    await dashboardPage.isFontsTablePlaceholderDisplayed(
      'Custom fonts you upload will appear here.',
    );
  });
});

mainTest(qase([1159], 'Delete font - Cancel button check'), async () => {
  await mainTest.step('Open Fonts section and upload a font', async () => {
    await dashboardPage.openSidebarItem('Fonts');
    await dashboardPage.uploadFont('fonts/Pacifico.ttf');
    await dashboardPage.isFontExists('Pacifico', 'Regular');
  });

  await mainTest.step(
    'Cancel font deletion and verify the font remains',
    async () => {
      await dashboardPage.cancelDeleteFont();
      await dashboardPage.isFontExists('Pacifico', 'Regular');
    },
  );
});
