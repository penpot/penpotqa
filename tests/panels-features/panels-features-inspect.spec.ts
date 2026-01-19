import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName: string = random().concat('autotest');
const sampleData: SampleData = new SampleData();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let inspectPanelPage: InspectPanelPage;

mainTest.beforeEach(
  'Create a team, new file and a rectangle shape',
  async ({ page }) => {
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    designPanelPage = new DesignPanelPage(page);
    mainPage = new MainPage(page);
    inspectPanelPage = new InspectPanelPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();

    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  },
);

mainTest.afterEach('Delete team', async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(2654, 'Computed panel - Shows raw property values'),
  async ({ page }) => {
    const colorToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'global.color',
      value: sampleData.color.redHexCode,
    };
    tokensPage = new TokensPage(page);

    await mainTest.step('Create a color token', async () => {
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(colorToken.name);
    });

    await mainTest.step('Apply color token to the rectangle', async () => {
      await tokensPage.tokensComp.clickOnTokenWithName(colorToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(colorToken.name);
      await designPanelPage.isFillTokenColorSetComponent(colorToken.name);
      await tokensPage.tokensComp.isMenuItemWithNameSelected(
        colorToken.name,
        'ColorFill',
      );
    });

    await mainTest.step('Check Inspect tab (Styles)', async () => {
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.isTokenSetsAndThemesSectionVisible();
      await inspectPanelPage.isTokensSetAndThemesSectionCollapseButtonVisible();
      await inspectPanelPage.isSizeAndPositionSectionVisible();
      await inspectPanelPage.isSizeAndPositionSectionCollapseButtonVisible();
      await inspectPanelPage.isFillSectionVisible();
      await inspectPanelPage.isFillSectionCollapseButtonVisible();
    });

    await mainTest.step(
      'Collapse and uncollapse "Token Sets & Themes" section',
      async () => {
        const sectionTitle: string = 'Token Sets &';
        const propertyTerm: string = 'Active sets';
        await inspectPanelPage.collapseInspectStyleSection(
          sectionTitle,
          propertyTerm,
        );
        await inspectPanelPage.uncollapseInspectStyleSection(
          sectionTitle,
          propertyTerm,
        );
      },
    );

    await mainTest.step('Check Inspect tab (Computed)', async () => {
      await inspectPanelPage.openComputedTab();
      await inspectPanelPage.isSizeAndPositionSectionVisible();
      await inspectPanelPage.isFillSectionVisible();
    });
  },
);
