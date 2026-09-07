import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

mainAccountFileTest(
  qase(1148, 'Search file from Drafts'),
  async ({ mainPage, dashboardPage }) => {
    await mainPage.clickPencilBoxButton();
    await dashboardPage.hideLibrariesAndTemplatesCarrousel();
    await dashboardPage.renameFile('New File 1', 'qwe');
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.search('qwe');
    await dashboardPage.isHeaderDisplayed('Search results');
    await dashboardPage.isFilePresentWithName('qwe');
  },
);
