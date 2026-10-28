import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

mainAccountFileTest(
  qase([1020], 'Open panel main menu - help&info'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Open shortcuts panel via main menu',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.clickHelpInfoMainMenuItem();
        await mainPage.clickShortcutsMainMenuSubItem();
      },
    );

    await mainAccountFileTest.step(
      'Verify shortcuts panel is displayed and matches screenshot',
      async () => {
        await mainPage.isShortcutsPanelDisplayed();
        await mainPage.clickViewportTwice();
        await expect(
          mainPage.shortcutsPanel,
          'Shortcuts panel should match screenshot',
        ).toHaveScreenshot('shortcuts-panel.png');
      },
    );

    await mainAccountFileTest.step(
      'Close shortcuts panel via main menu and verify it is hidden',
      async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.clickHelpInfoMainMenuItem();
        await mainPage.clickShortcutsMainMenuSubItem();
        await mainPage.isShortcutsPanelNotDisplayed();
      },
    );
  },
);

mainAccountFileTest(qase([1025], 'Show/hide panel'), async ({ mainPage }) => {
  await mainAccountFileTest.step(
    'Open shortcuts panel via keyboard shortcut',
    async () => {
      await mainPage.pressShortcutsPanelShortcut();
      await mainPage.isShortcutsPanelDisplayed();
    },
  );

  await mainAccountFileTest.step(
    'Close shortcuts panel and verify it is hidden',
    async () => {
      await mainPage.clickViewportTwice();
      await mainPage.closeShortcutsPanel();
      await mainPage.isShortcutsPanelNotDisplayed();
    },
  );
});
