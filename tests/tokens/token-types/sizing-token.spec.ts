import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page, browserName }) => {
  let teamPage: TeamPage = new TeamPage(page);
  let dashboardPage: DashboardPage = new DashboardPage(page);
  let mainPage: MainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const mainPage: MainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(2200, 'Apply "max/min size" token to an image (by right click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
    const layersPanelPage: LayersPanelPage = new LayersPanelPage(page);

    const sizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'sizing',
      value: '200',
    };

    await mainPage.uploadImage('images/mini_sample.jpg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(sizingToken.name);
    await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Max Width');
    await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Min Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
    await expect(mainPage.viewport).toHaveScreenshot('image-max-min-size-200.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.createDefaultBoardByCoordinates(100, 200, true);
    await designPanelPage.changeHeightAndWidthForLayer('600', '600');
    await mainPage.addFlexLayoutViaRightClick();
    await layersPanelPage.openLayersTab();
    await layersPanelPage.dragAndDropElementToElement('mini_sample', 'Board');
    await mainPage.clickViewportOnce();
    await layersPanelPage.selectLayerByName('mini_sample');
    await designPanelPage.clickOnFlexElementWidth100Btn();
    await designPanelPage.clickOnFlexElementHeight100Btn();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      'image-on-board-max-min-size-200.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
    await designPanelPage.checkFlexElementMinMax('Width', false, sizingToken.value);
    await designPanelPage.checkFlexElementMinMax('Height', true, sizingToken.value);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Max Width',
    );
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Min Height',
    );
  },
);
