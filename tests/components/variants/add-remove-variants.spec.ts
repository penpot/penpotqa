import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();

  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await layersPanelPage.renameLayerViaRightClick('Rectangle', 'Rectangle1');

  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.createVariantViaRightClick();
  await mainPage.waitForChangeIsSaved();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([2398], 'Add Variant to a component on the canvas'), async () => {
  await mainPage.clickViewportTwice();
  await mainPage.createDefaultRectangleByCoordinates(600, 300);
  await layersPanelPage.renameLayerViaRightClick('Rectangle', 'Rectangle2');

  await mainPage.createComponentViaRightClickFromLayerByName('Rectangle2');
  await mainPage.waitForChangeIsSaved();

  await mainPage.dragAndDropComponentToVariantContainerViaCanvas(
    'Rectangle2',
    'Rectangle1',
  );

  await layersPanelPage.checkVariantLayerCount(3);
});

mainTest(
  qase([2399], 'Add Variant to a component from the Layers tab'),
  async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 500);
    await layersPanelPage.renameLayerViaRightClick('Rectangle', 'Rectangle2');
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.dragAndDropComponentToVariants('Rectangle2');
    await layersPanelPage.checkVariantLayerCount(3);
  },
);

mainTest(
  qase([2404], 'Delete variant from the component using the context menu'),
  async () => {
    await mainPage.deleteLayerViaRightClickByName('Value 2');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.checkVariantLayerCount(1);
  },
);

mainTest(
  qase([2407], 'Restoring a deleted variant from the child component'),
  async () => {
    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.copyElementViaAltDragAndDrop(200, 500);

    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.deleteLayerViaRightClickByName('Value 1');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.restoreVariantViaRightClick();

    await layersPanelPage.checkVariantLayerCount(2);
    await layersPanelPage.isLayerWithNameSelected('Value 1');
  },
);

mainTest(
  qase(
    [2409],
    'Add Variants to a component by cutting and pasting the main component',
  ),
  async ({ browserName }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.cutLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickOnVariantsTitle('Rectangle');
    await mainPage.pressPasteShortcut(browserName);
    await layersPanelPage.checkVariantLayerCount(3);
  },
);

mainTest(
  qase(
    [2410],
    'Remove variant from a group cutting and pasting it outside variant component',
  ),
  async ({ browserName }) => {
    await layersPanelPage.selectLayerByName('Value 2');
    await mainPage.pressCutShortcut(browserName);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.pressPasteShortcut(browserName);
    await layersPanelPage.checkVariantLayerCount(1);
    await layersPanelPage.isLayerWithNameSelected('Rectangle1 / Value 2');
  },
);

mainTest(
  qase([2413], 'Remove the last component from the variants component'),
  async () => {
    await layersPanelPage.selectLayerByName('Value 1');
    await mainPage.deleteLayerViaRightClickByName('Value 1');
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.selectLayerByName('Value 2');
    await mainPage.dragAndDropComponentOutOfVariantContainerViaCanvas(
      'Value 2',
      'Rectangle1',
    );

    await layersPanelPage.isVariantLayerVisible(false);
    await layersPanelPage.isLayerWithNameSelected('Rectangle1 / Value 2');
  },
);

mainTest(
  qase([2419], 'Changing the component frame in the design panel'),
  async () => {
    await mainPage.clickOnVariantsTitle('Rectangle1');
    await layersPanelPage.isLayerWithNameSelected('Rectangle1');
    await designPanelPage.isFlexElementWidth100BtnVisible(false);
    await designPanelPage.clickOnFlexElementFixWidthBtn();
    await designPanelPage.clickOnFlexElementFixHeightBtn();
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkSizeWidth('500');
    await designPanelPage.checkSizeHeight('500');
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('variants-500x500.png', {
      mask: mainPage.maskViewport(),
    });
  },
);
