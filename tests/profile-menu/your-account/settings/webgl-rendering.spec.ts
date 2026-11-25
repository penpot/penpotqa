import {
  yourAccountFileTest,
  yourAccountTest,
} from '@tests/profile-menu/your-account/your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

yourAccountFileTest.describe('WebGL rendering from Settings', () => {
  yourAccountFileTest.use({ renderer: 'svg' });

  yourAccountFileTest(
    qase(
      [2793, 2794],
      'Toggle the renderer to WebGL and back to legacy SVG from Settings, and verify the immediate switch',
    ),
    async ({ page, yourAccountPage, workspacePage }) => {
      const fileUrl = page.url();

      await yourAccountFileTest.step(
        'Setup: the open file is drawn with the legacy SVG renderer',
        async () => {
          await workspacePage.checkActiveRenderer(false);
        },
      );

      await yourAccountFileTest.step(
        '(2793) Toggle renderer to WebGL from Settings UI and verify immediate switch',
        async () => {
          await yourAccountFileTest.step(
            'Enable WebGL rendering in Your account > Settings',
            async () => {
              await yourAccountPage.goto('Settings');
              await yourAccountPage.settings.checkWebglRenderingStatus('Disabled');
              await yourAccountPage.settings.toggleWebglRendering(true);
            },
          );

          await yourAccountFileTest.step(
            'The file is drawn with the WebGL renderer',
            async () => {
              await page.goto(fileUrl);
              await workspacePage.checkActiveRenderer(true);
            },
          );
        },
      );

      await yourAccountFileTest.step(
        '(2794) Toggle renderer to legacy SVG from Settings UI and verify immediate switch',
        async () => {
          await yourAccountFileTest.step(
            'Disable WebGL rendering in Your account > Settings',
            async () => {
              await yourAccountPage.goto('Settings');
              await yourAccountPage.settings.checkWebglRenderingStatus('Enabled');
              await yourAccountPage.settings.toggleWebglRendering(false);
            },
          );

          await yourAccountFileTest.step(
            'WebGL rendering is still disabled after reloading',
            async () => {
              await page.reload();
              await yourAccountPage.settings.checkWebglRenderingStatus('Disabled');
            },
          );

          await yourAccountFileTest.step(
            'The file is drawn with the legacy SVG renderer',
            async () => {
              await page.goto(fileUrl);
              await workspacePage.checkActiveRenderer(false);
            },
          );
        },
      );
    },
  );
});

yourAccountTest.describe('WebGL rendering on a new account', () => {
  yourAccountTest.use({ renderer: 'default' });

  yourAccountTest(
    qase([4090], 'Start a new account with WebGL rendering enabled'),
    async ({ dashboardPage, workspacePage }) => {
      const { mainMenu } = workspacePage.leftSidebar;

      await yourAccountTest.step(
        "Create a new file from the Drafts' placeholder",
        async () => {
          await dashboardPage.createFileViaPlaceholder();
          await workspacePage.checkActiveRenderer(true);
        },
      );

      await yourAccountTest.step(
        'Main menu > Preferences offers to disable WebGL rendering',
        async () => {
          await mainMenu.clickMainMenuButton();
          await mainMenu.hoverPreferencesMainMenuItem();
          await mainMenu.checkWebglRenderingMenuSubItem('Disable');
        },
      );
    },
  );
});
