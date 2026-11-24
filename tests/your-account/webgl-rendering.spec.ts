import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { SettingsPage } from '@pages/your-account/settings-page';
import { demoAccountApiFixture, demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountFileTest.describe('WebGL rendering from Settings', () => {
  demoAccountFileTest.use({ renderer: 'svg' });

  demoAccountFileTest(
    qase(
      [2793, 2794],
      'Toggle the renderer to WebGL and back to legacy SVG from Settings, and verify the immediate switch',
    ),
    async ({ page }) => {
      const workspacePage = new WorkspacePage(page);
      const settingsPage = new SettingsPage(page);
      const fileUrl = page.url();

      await demoAccountFileTest.step(
        'Setup: the open file is drawn with the legacy SVG renderer',
        async () => {
          await workspacePage.checkActiveRenderer(false);
        },
      );

      await demoAccountFileTest.step(
        '2793 Enable WebGL rendering in Your account > Settings',
        async () => {
          await settingsPage.goto();
          await settingsPage.checkWebglRenderingStatus('Disabled');
          await settingsPage.toggleWebglRendering(true);
        },
      );

      await demoAccountFileTest.step(
        '2793 The file is drawn with the WebGL renderer',
        async () => {
          await page.goto(fileUrl);
          await workspacePage.checkActiveRenderer(true);
        },
      );

      await demoAccountFileTest.step(
        '2794 Disable WebGL rendering in Your account > Settings',
        async () => {
          await settingsPage.goto();
          await settingsPage.checkWebglRenderingStatus('Enabled');
          await settingsPage.toggleWebglRendering(false);
        },
      );

      await demoAccountFileTest.step(
        '2794 WebGL rendering is still disabled after reloading',
        async () => {
          await page.reload();
          await settingsPage.checkWebglRenderingStatus('Disabled');
        },
      );

      await demoAccountFileTest.step(
        '2794 The file is drawn with the legacy SVG renderer',
        async () => {
          await page.goto(fileUrl);
          await workspacePage.checkActiveRenderer(false);
        },
      );
    },
  );
});

demoAccountApiFixture.describe('WebGL rendering on a new account', () => {
  demoAccountApiFixture.use({ renderer: 'default' });

  demoAccountApiFixture(
    qase([4090], 'Start a new account with WebGL rendering enabled'),
    async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const workspacePage = new WorkspacePage(page);
      const { mainMenu } = workspacePage.leftSidebar;

      await demoAccountApiFixture.step(
        "Create a new file from the Drafts' placeholder",
        async () => {
          await dashboardPage.createFileViaPlaceholder();
          await workspacePage.checkActiveRenderer(true);
        },
      );

      await demoAccountApiFixture.step(
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
