import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let dashboardPage: DashboardPage;

demoAccountApiFixture.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
});

demoAccountApiFixture(qase([1152], 'Upload single font'), async () => {
  await demoAccountApiFixture.step('Open Fonts section', async () => {
    await dashboardPage.openSidebarItem('Fonts');
  });

  await demoAccountApiFixture.step(
    'Upload a single font and verify it is listed',
    async () => {
      await dashboardPage.uploadFont('fonts/Pacifico.ttf');
      await dashboardPage.isFontExists('Pacifico', 'Regular');
    },
  );
});

demoAccountApiFixture(qase([1153], 'Fonts - upload (multiple)'), async () => {
  await demoAccountApiFixture.step('Open Fonts section', async () => {
    await dashboardPage.openSidebarItem('Fonts');
  });

  await demoAccountApiFixture.step(
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

demoAccountApiFixture(
  qase([1154], 'Fonts - upload fail invalid file format'),
  async () => {
    await demoAccountApiFixture.step('Open Fonts section', async () => {
      await dashboardPage.openSidebarItem('Fonts');
    });

    await demoAccountApiFixture.step(
      'Try to upload an invalid file format',
      async () => {
        await dashboardPage.uploadFontWithInvalidFormat('images/images.png');
      },
    );
  },
);

demoAccountApiFixture(qase([1155], 'Search font'), async () => {
  await demoAccountApiFixture.step(
    'Open Fonts section and upload test fonts',
    async () => {
      await dashboardPage.openSidebarItem('Fonts');
      await dashboardPage.uploadFont('fonts/ArialTh.ttf');
      await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
    },
  );

  await demoAccountApiFixture.step('Search and verify font results', async () => {
    await dashboardPage.searchFont('Arial Th');
    await dashboardPage.isFontExists('Arial Th', 'Regular');
    await dashboardPage.isFontNotExist('Allura-Regular');
  });
});

demoAccountApiFixture(qase([1157], 'Edit font BUG'), async () => {
  await demoAccountApiFixture.step(
    'Open Fonts section and upload a font',
    async () => {
      await dashboardPage.openSidebarItem('Fonts');
      await dashboardPage.uploadFont('fonts/Allura-Regular.otf');
      await dashboardPage.isFontExists('Allura', 'Regular');
    },
  );

  await demoAccountApiFixture.step(
    'Edit the font name and verify the change',
    async () => {
      await dashboardPage.editFont('New Test Font');
      await dashboardPage.isFontExists('New Test Font', 'Regular');
    },
  );
});

demoAccountApiFixture(qase([1158], 'Delete font'), async () => {
  await demoAccountApiFixture.step(
    'Open Fonts section and upload a font',
    async () => {
      await dashboardPage.openSidebarItem('Fonts');
      await dashboardPage.uploadFont('fonts/Pacifico.ttf');
      await dashboardPage.isFontExists('Pacifico', 'Regular');
    },
  );

  await demoAccountApiFixture.step(
    'Delete the font and verify the empty state',
    async () => {
      await dashboardPage.deleteFont();
      await dashboardPage.isFontsTablePlaceholderDisplayed(
        'Custom fonts you upload will appear here.',
      );
    },
  );
});
