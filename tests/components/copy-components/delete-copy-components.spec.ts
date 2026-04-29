import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName: string = random().concat('autotest');

let dashboardPage: DashboardPage;
let mainPage: MainPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(1496, 'Undo deleted component'), async ({ browserName }) => {
  await mainTest.step('Create rectangle and copy component', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.duplicateLayerViaRightClick();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  await mainTest.step('Delete copy component', async () => {
    await mainPage.pressDeleteKeyboardButton();
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify copy component is deleted', async () => {
    await expect(
      mainPage.viewport,
      'Viewport should match screenshot after deleting copy component',
    ).toHaveScreenshot('rectangle-copy-component-delete.png', {
      mask: mainPage.maskViewport(),
    });
  });

  await mainTest.step('Undo deletion', async () => {
    await mainPage.clickShortcutCtrlZ(browserName);
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify copy component is restored after undo', async () => {
    await expect(
      mainPage.viewport,
      'Viewport should match screenshot after undoing deletion',
    ).toHaveScreenshot('rectangle-copy-component-delete-undo.png', {
      mask: mainPage.maskViewport(),
    });
  });
});

mainTest(qase(1497, 'Delete copy component from DEL button'), async () => {
  await mainTest.step('Create rectangle and copy component', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  await mainTest.step('Delete copy component', async () => {
    await mainPage.pressDeleteKeyboardButton();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Verify copy component is deleted from layers panel',
    async () => {
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName(
        'Rectangle',
        false,
      );
    },
  );
});
