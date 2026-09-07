import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest } from 'fixtures';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([2200], 'Apply "max/min size" token to an image (by right click)'),
  async ({ mainPage }) => {
    const sizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'sizing',
      value: '200',
    };

    await mainAccountFileTest.step(
      `Upload image and apply "${sizingToken.name}" token to Max Width and Min Height`,
      async () => {
        await mainPage.uploadImage('images/mini_sample.jpg');
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(sizingToken.name);
        await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Max Width');
        await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Min Height');
        await mainPage.waitForChangeIsSaved();
        await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
      },
    );

    await mainAccountFileTest.step(
      'Verify screenshot of image with max/min size applied',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'image-max-min-size-200.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await mainAccountFileTest.step(
      'Place image in a flex board and verify min/max values in design panel',
      async () => {
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
        await designPanelPage.checkFlexElementMinMax(
          'Width',
          false,
          sizingToken.value,
        );
        await designPanelPage.checkFlexElementMinMax(
          'Height',
          true,
          sizingToken.value,
        );
      },
    );

    await mainAccountFileTest.step(
      'Verify Max Width and Min Height menu items are selected',
      async () => {
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
  },
);

mainAccountFileTest(
  qase([2197], 'Verifying invalid token values on creation, aborting (cancel)'),
  async () => {
    const firstSizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'existing.token',
      value: '10',
    };

    await mainAccountFileTest.step('Create first sizing token', async () => {
      await tokensPage.clickTokensTab();
      await tokensPage.tokensComp.createTokenViaAddButtonAndSave(firstSizingToken);
    });

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
      'Fill in token name reusing another existing name and assert error message',
      async () => {
        await tokensPage.tokensComp.fillTokenName(firstSizingToken.name);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `A token already exists at the path: ${firstSizingToken.name}`,
        );

        await tokensPage.tokensComp.clearTokenNameInput();
      },
    );

    await mainAccountFileTest.step(
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

    await mainAccountFileTest.step(
      'Fill token value with non-numerical equation and assert error message',
      async () => {
        const value = '500*a';

        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Invalid token value: ${value}`,
        );
      },
    );

    await mainAccountFileTest.step(
      'Fill token value with a wrong alias reference (alias references are case sensitive) and assert error message',
      async () => {
        const value = '{existing.TOKEN}';

        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Missing token references: existing.TOKEN`,
        );
      },
    );

    await mainAccountFileTest.step(
      'Fill token value with a self alias reference and assert error message',
      async () => {
        const value = '{new.token}';

        await tokensPage.tokensComp.fillTokenValue(value);

        await tokensPage.tokensComp.isErrorHintMessageVisible(
          `Token has self reference`,
        );
      },
    );

    await mainAccountFileTest.step(
      'Cancel token creation by clicking on Cancel button',
      async () => {
        await tokensPage.tokensComp.clickCancelButton();
      },
    );
  },
);

mainAccountFileTest(
  qase(
    [2195],
    "Update the reference of an alias to update the shape where it's applied",
  ),
  async ({ mainPage }) => {
    const firstSizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'sizing',
      value: '200px',
    };

    const secondSizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'alias1',
      value: '{sizing}*2',
    };

    const thirdSizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'alias2',
      value: '{alias1}/2',
    };

    await mainAccountFileTest.step(
      'Create an alias sizing token chain',
      async () => {
        await tokensPage.clickTokensTab();
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(firstSizingToken);
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(
          secondSizingToken,
        );
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(thirdSizingToken);
      },
    );

    await mainAccountFileTest.step('Create an ellipse', async () => {
      await mainPage.createDefaultEllipseByCoordinates(200, 200);
    });

    await mainAccountFileTest.step(
      `Apply ${thirdSizingToken.name} and assert size`,
      async () => {
        await tokensPage.tokensComp.clickOnTokenWithName(thirdSizingToken.name);
        await designPanelPage.checkSizeWidth('200');
        await designPanelPage.checkSizeHeight('200');
      },
    );

    await mainAccountFileTest.step(
      `Edit ${firstSizingToken.name} and assert size`,
      async () => {
        const updatedFirstSizingToken: MainToken<TokenClass> = {
          class: TokenClass.Sizing,
          name: 'sizing',
          value: '50px',
        };

        await tokensPage.tokensComp.editTokenViaRightClickAndSave(
          updatedFirstSizingToken,
        );
        await designPanelPage.checkSizeWidth('50');
        await designPanelPage.checkSizeHeight('50');
      },
    );
  },
);
