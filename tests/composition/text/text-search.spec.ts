import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let colorPalettePage: ColorPalettePage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let inspectPanelPage: InspectPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ browserName }) => {
    browserName === 'webkit' ? await mainPage.waitForViewportVisible() : null;
    await mainPage.createDefaultTextLayer();
  });

  mainTest(qase([421], 'Search text by name'), async () => {
    const firstText = 'Hello world!';
    const secondText = 'Second text';
    const thirdText = 'Third text';

    const renamedFirstText = 'new test text';
    const renamedSecondText = 'test text';
    const renamedThirdText = 'abcd';

    await mainTest.step('Create text layers', async () => {
      await mainPage.createTextLayerByCoordinates(100, 200, secondText);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createTextLayerByCoordinates(100, 300, thirdText);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Rename text layers and assert expected layer name',
      async () => {
        await layersPanelPage.doubleClickLayerOnLayersTab(firstText);
        await layersPanelPage.typeNameCreatedLayerAndEnter(renamedFirstText);
        await layersPanelPage.isLayerNameDisplayed(renamedFirstText);

        await layersPanelPage.doubleClickLayerOnLayersTab(secondText);
        await layersPanelPage.typeNameCreatedLayerAndEnter(renamedSecondText);
        await layersPanelPage.isLayerNameDisplayed(renamedSecondText);

        await layersPanelPage.doubleClickLayerOnLayersTab(thirdText);
        await layersPanelPage.typeNameCreatedLayerAndEnter(renamedThirdText);
        await layersPanelPage.isLayerNameDisplayed(renamedThirdText);
      },
    );

    await mainTest.step(
      `Type in search: ${renamedFirstText} and assert 1st Text is filtered`,
      async () => {
        await layersPanelPage.openLayerSearchBar();
        await layersPanelPage.searchLayer(renamedFirstText);
        await layersPanelPage.isLayerNameDisplayed(renamedFirstText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedSecondText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedThirdText);
        await layersPanelPage.clearLayerSearchBar();
      },
    );

    await mainTest.step(
      `Type in search "test Text" and assert 1st & 2nd Texts are filtered`,
      async () => {
        await layersPanelPage.searchLayer('test Text');
        await layersPanelPage.isLayerNameDisplayed(renamedFirstText);
        await layersPanelPage.isLayerNameDisplayed(renamedSecondText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedThirdText);
        await layersPanelPage.clearLayerSearchBar();
      },
    );

    await mainTest.step(
      `Type in search "ABCD" and assert 3rd Text is filtered`,
      async () => {
        await layersPanelPage.searchLayer('ABCD');
        await layersPanelPage.isLayerNameDisplayed(renamedThirdText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedFirstText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedSecondText);
        await layersPanelPage.clearLayerSearchBar();
      },
    );

    await mainTest.step(
      `Type in search "qwe" and assert no texts are filtered`,
      async () => {
        await layersPanelPage.searchLayer('qwe');
        await layersPanelPage.isLayerNameNotDisplayed(renamedFirstText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedSecondText);
        await layersPanelPage.isLayerNameNotDisplayed(renamedThirdText);
      },
    );
  });

  mainTest(qase([429], 'Search fonts'), async () => {
    const fontName1 = 'Unlock';
    const fontName2 = 'Acme';
    const fontName3 = 'Source';
    const fontName4 = 'abcd';

    await mainTest.step(
      `Search: "${fontName1}" and assert 1st Font is filtered`,
      async () => {
        await designPanelPage.openTypographyFontDropdown();
        await designPanelPage.searchTypographyFontFromSearch(fontName1);
        await designPanelPage.isTypographyFontItemVisible(fontName1);
        await designPanelPage.clearTypographyFontSearchBar();
      },
    );

    await mainTest.step(
      `Search: "${fontName2}" and assert 2nd Font is filtered`,
      async () => {
        await designPanelPage.searchTypographyFontFromSearch(fontName2);
        await designPanelPage.isTypographyFontItemVisible(fontName2);
        await designPanelPage.clearTypographyFontSearchBar();
      },
    );

    await mainTest.step(
      `Search: "${fontName3}" and assert 4 fonts which contain "${fontName3}" are found`,
      async () => {
        await designPanelPage.searchTypographyFontFromSearch(fontName3);
        await designPanelPage.isTypographyFontItemVisible('Source Code Pro');
        await designPanelPage.isTypographyFontItemVisible('Source Sans 3');
        await designPanelPage.isTypographyFontItemVisible('Source Sans Pro');
        await designPanelPage.isTypographyFontItemVisible('Source Serif 4');
        await designPanelPage.clearTypographyFontSearchBar();
      },
    );

    await mainTest.step(
      `Search: "${fontName4}" and assert No results are found`,
      async () => {
        await designPanelPage.searchTypographyFontFromSearch(fontName4);
        await designPanelPage.isTypographyFontItemNotVisible(fontName4);
      },
    );
  });
});
