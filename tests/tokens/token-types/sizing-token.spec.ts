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

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();

  if (browserName === 'webkit' && !(await mainPage.isMainPageVisible())) {
    await dashboardPage.createFileViaPlaceholder();
  }

  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(2200, 'Apply "max/min size" token to an image (by right click)'),
  async () => {
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

mainTest(
  qase(2197, 'Verifying invalid token values on creation, aborting (cancel)'),
  async () => {
    const firstSizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'existing.token',
      value: '10',
    };

    await mainTest.step('Create first sizing token', async () => {
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndSave(firstSizingToken);
    });

    await mainTest.step(
      'Fill token name, type a text and clear and assert error message',
      async () => {
        const sizingToken: MainToken<TokenClass> = {
          class: TokenClass.Sizing,
          name: 'sizingToken',
          value: undefined,
        };

        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.clickOnAddTokenButton(sizingToken);
        await tokensPage.tokensComp.fillTokenName(sizingToken.name);
        await tokensPage.tokensComp.clearTokenNameInput();

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          'Name should be at least 1 character',
        );

        await tokensPage.tokensComp.clearTokenNameInput();
      },
    );

    await mainTest.step(
      'Fill in token name with a large text (256 chars) and assert is cropped',
      async () => {
        const longName =
          'loremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremipsumloremX';

        await tokensPage.tokensComp.fillTokenName(longName);
        await tokensPage.tokensComp.hasTokenNameInputSpecificText(
          longName.slice(0, 255),
        );
        await tokensPage.tokensComp.isErrorHintMessageNotVisible();
        await tokensPage.tokensComp.clearTokenNameInput();
      },
    );

    await mainTest.step(
      'Fill in token name with special characters and assert error message',
      async () => {
        const specialCharactersName = '#$&!';

        await tokensPage.tokensComp.fillTokenName(specialCharactersName);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `${specialCharactersName} is not a valid token name. Token names should only contain letters and digits separated by . characters and must not start with a $ sign.`,
        );

        await tokensPage.tokensComp.clearTokenNameInput();
      },
    );

    await mainTest.step(
      'Fill in token name reusing another existing name and assert error message',
      async () => {
        await tokensPage.tokensComp.fillTokenName(firstSizingToken.name);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `A token already exists at the path: ${firstSizingToken.name}`,
        );

        await tokensPage.tokensComp.clearTokenNameInput();
      },
    );

    await mainTest.step(
      'Fill token value with non-numerical data and assert error message',
      async () => {
        const newName = 'new.token';
        const value = '500a';

        await tokensPage.tokensComp.fillTokenName(newName);
        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Invalid token value: ${value}`,
        );
      },
    );

    await mainTest.step(
      'Fill token value with non-numerical equation and assert error message',
      async () => {
        const value = '500*a';

        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Invalid token value: ${value}`,
        );
      },
    );

    await mainTest.step(
      'Fill token value with a wrong alias reference (alias references are case sensitive) and assert error message',
      async () => {
        const value = '{existing.TOKEN}';

        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Missing token references: existing.TOKEN`,
        );
      },
    );

    await mainTest.step(
      'Fill token value with a self alias reference and assert error message',
      async () => {
        const value = '{new.token}';

        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Token has self reference`,
        );
      },
    );

    await mainTest.step(
      'Cancel token creation by clicking on Cancel button',
      async () => {
        await tokensPage.tokensComp.clickCancelButton();
      },
    );
  },
);
