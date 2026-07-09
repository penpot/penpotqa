import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { SampleData } from 'helpers/sample-data';
import { createTeamName } from 'helpers/teams/create-team-name';

const sampleData = new SampleData();
const teamName = createTeamName();

let mainPage: MainPage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let layersPanelPage: LayersPanelPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
});

mainTest(
  qase(
    [2430],
    'When converting a component to a variant, the connections are not lost',
  ),
  async () => {
    await mainTest.step('Import file and copy the main component', async () => {
      await dashboardPage.importAndOpenFile('documents/figure.penpot');
      await mainPage.isMainPageLoaded();
      await mainPage.clickMoveButton();

      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.copyElementViaAltDragAndDrop(100, 100);
    });

    await mainTest.step('Combine components as a variants group', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.combineAsVariantsGroup();
      await assetsPanelPage.isVariantsAddedToFileLibraryComponents();
    });

    await mainTest.step(
      `Change fill color of the "Rectangle, Blue" component`,
      async () => {
        await layersPanelPage.openLayersTab();

        await layersPanelPage.selectLayerByName('Rectangle, Blue');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.setComponentColor(sampleData.color.redHexCode);
        await layersPanelPage.selectLayerByName('Rectangle, Blue');
        await designPanelPage.isFillHexCodeSetComponent(sampleData.color.redHexCode);
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Verify the connection to the child component is not lost',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.isFillHexCodeSetComponent(sampleData.color.redHexCode);
      },
    );
  },
);

mainTest(
  qase([2433], 'Creating a child component by copying a variant'),
  async () => {
    await mainTest.step(
      'Create a component and convert it to a variant',
      async () => {
        await dashboardPage.createFileViaPlaceholder();
        await mainPage.isMainPageLoaded();
        await mainPage.clickMoveButton();

        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.createVariantViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Copy and paste the variant to create a child component',
      async () => {
        await layersPanelPage.selectLayerByName('Value 2');
        await mainPage.pressCopyShortcut();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.pressPasteShortcut();
        await layersPanelPage.checkVariantLayerCount(2);
        await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Rectangle');
      },
    );

    await mainTest.step(`Change fill color of the "Value 2" variant`, async () => {
      await layersPanelPage.selectLayerByName('Value 2');
      await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
      await layersPanelPage.selectLayerByName('Value 2');
      await designPanelPage.isFillHexCodeSetComponent(sampleData.color.blueHexCode);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify the child component color changes with the variant property',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.isFillHexCodeSetComponent(
          sampleData.color.blueHexCode,
        );
        await designPanelPage.changeFirstVariantProperty('Value 1');
        await designPanelPage.isFillHexCodeSetComponent(
          sampleData.color.grayHexCode,
        );
      },
    );
  },
);
