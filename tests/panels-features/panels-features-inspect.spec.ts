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
  async ({ page, browserName }) => {
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    designPanelPage = new DesignPanelPage(page);
    mainPage = new MainPage(page);
    inspectPanelPage = new InspectPanelPage(page);
    tokensPage = new TokensPage(page);

    await teamPage.createTeam(teamName);
    await teamPage.isTeamSelected(teamName);

    await dashboardPage.createFileViaPlaceholder();
    browserName === 'webkit' && !(await mainPage.isMainPageVisible())
      ? await dashboardPage.createFileViaPlaceholder()
      : null;
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

mainTest(qase(2654, 'Computed panel - Shows raw property values'), async () => {
  const colorToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'global.color',
    value: sampleData.color.redHexCode,
  };

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
      await inspectPanelPage.collapseInspectStyleSection(sectionTitle, propertyTerm);
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
});

mainTest(
  qase(2661, 'Stroke width token copy button and tooltip with computed value'),
  async () => {
    const strokeToken: MainToken<TokenClass> = {
      class: TokenClass.StrokeWidth,
      name: 'global.stroke',
      value: '5',
    };

    await mainTest.step('Create a stroke width token', async () => {
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(strokeToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(strokeToken.name);
    });

    await mainTest.step('Apply stroke width token to the rectangle', async () => {
      await tokensPage.tokensComp.clickOnTokenWithName(strokeToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(strokeToken.name);
      await designPanelPage.checkStrokeWidth(strokeToken.value);
      await tokensPage.tokensComp.isMenuItemWithNameSelected(
        strokeToken.name,
        'Stroke Width',
      );
    });

    await mainTest.step(
      'Hover and copy stroke width name in Inspect tab (Styles)',
      async () => {
        await inspectPanelPage.openInspectTab();
        await inspectPanelPage.isStrokeSectionVisible();
        await inspectPanelPage.isStrokeBorderWidthNameVisible(strokeToken.name);
        await inspectPanelPage.hoverStrokeBorderWidthName(strokeToken.name);
        await inspectPanelPage.isStrokeBorderWidthTooltipVisible(strokeToken.value);
        await inspectPanelPage.copyStrokeBorderWidthToClipboard(strokeToken.name);
      },
    );
  },
);

mainTest(
  qase(
    2667,
    'Tokens Sets & Themes section - Updates when an active token set is enabled/disabled in Tokens panel',
  ),
  async ({ browserName }) => {
    const set1Name = 'set1';
    const set2Name = 'set2';
    const strokeToken: MainToken<TokenClass> = {
      class: TokenClass.StrokeWidth,
      name: 'stroke-width',
      value: '5',
    };
    const borderRadiusToken: MainToken<TokenClass> = {
      class: TokenClass.BorderRadius,
      name: 'border-radius',
      value: '60',
    };

    await mainTest.step('Create variants from rectangle', async () => {
      await mainPage.createComponentViaShortcut(browserName);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createComponentViaShortcut(browserName);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Create set1 with a stroke width token, enable it and apply token to the variant value selected',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.setsComp.createSetViaLink(set1Name);
        await tokensPage.setsComp.isSetNameVisible(set1Name);
        await tokensPage.setsComp.clickOnSetCheckboxByName(set1Name);

        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(strokeToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(strokeToken.name);
        await tokensPage.tokensComp.clickOnTokenWithName(strokeToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(strokeToken.name);
      },
    );

    await mainTest.step(
      'Create set2 with a border radius token, enable it and apply token to the variant value selected',
      async () => {
        await tokensPage.setsComp.createSetViaButton(set2Name);
        await tokensPage.setsComp.isSetNameVisible(set2Name);
        await tokensPage.setsComp.clickOnSetCheckboxByName(set2Name);

        await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(
          borderRadiusToken,
        );
        await tokensPage.tokensComp.isTokenVisibleWithName(borderRadiusToken.name);
        await tokensPage.tokensComp.clickOnTokenWithName(borderRadiusToken.name);
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(borderRadiusToken.name);
      },
    );

    await mainTest.step('Check active sets in Inspect tab', async () => {
      const activeSetsNames: string = `${set1Name}, ${set2Name}`;
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.isTokenSetsAndThemesSectionVisible();
      await inspectPanelPage.isActiveSetsNameVisible(activeSetsNames);
    });

    await mainTest.step(
      'Disable set1 and check active sets in Inspect tab',
      async () => {
        await mainPage.clickOnDesignTab();
        await mainPage.isDesignTabVisible(true);
        await tokensPage.clickTokensTab();
        await tokensPage.setsComp.clickOnSetCheckboxByName(set1Name);

        const activeSetsNames: string = set2Name;
        await inspectPanelPage.openInspectTab();
        await inspectPanelPage.isTokenSetsAndThemesSectionVisible();
        await inspectPanelPage.isActiveSetsNameVisible(activeSetsNames);
      },
    );

    await mainTest.step(
      'Enable set1 again and check active sets in Inspect tab',
      async () => {
        await mainPage.clickOnDesignTab();
        await mainPage.isDesignTabVisible(true);
        await tokensPage.clickTokensTab();
        await tokensPage.setsComp.clickOnSetCheckboxByName(set1Name);

        const activeSetsNames: string = `${set2Name}, ${set1Name}`;
        await inspectPanelPage.openInspectTab();
        await inspectPanelPage.isTokenSetsAndThemesSectionVisible();
        await inspectPanelPage.isActiveSetsNameVisible(activeSetsNames);
      },
    );
  },
);
