import { mainAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect } from 'playwright/test';

let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  designPanelPage = new DesignPanelPage(page);
  await mainPage.createDefaultTextLayer();
});

mainAccountFileTest(
  qase([3486], 'Font family names render using their own family in the selector'),
  async () => {
    await designPanelPage.openTypographyFontDropdown();
    await designPanelPage.isTypographyFontDropdownFullSizeVisible();
    await expect(designPanelPage.textFontDropdownFullSize).toHaveScreenshot(
      'font-dropdown-full-size.png',
    );
  },
);
