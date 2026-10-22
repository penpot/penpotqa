import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';

let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(qase(3982, 'Undo and redo text edits'), async ({ mainPage }) => {
  let initialWidth: number;
  let reducedWidth: number;
  let centeredWidth: number;
  let centeredHeight: number;

  await mainPage.createTextLayerByCoordinates(200, 300, 'Lorem ipsum');

  await demoAccountFileTest.step(
    'Delete the word "ipsum" with Backspace',
    async () => {
      await mainPage.createdLayer.click();
      initialWidth = await designPanelPage.getWidthValue();
      await mainPage.clickOnEnter();
      await mainPage.page.keyboard.press('End');
      for (let i = 0; i < ' ipsum'.length; i++) {
        await mainPage.page.keyboard.press('Backspace');
      }
      await mainPage.clickOnESC();
      await mainPage.waitForChangeIsSaved();
      // The v3 editor keeps the text in WASM, not in the contenteditable DOM,
      // so the text is checked through the layer name, which follows the content
      await layersPanelPage.isLayerNameDisplayed('Lorem');
      await expect
        .poll(() => designPanelPage.getWidthValue(), 'Width decreases')
        .toBeLessThan(initialWidth);
      reducedWidth = await designPanelPage.getWidthValue();
    },
  );

  await demoAccountFileTest.step(
    'Undo restores the text and its width',
    async () => {
      await mainPage.clickShortcutCtrlZ();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isErrorScreenNotDisplayed();
      await layersPanelPage.isLayerNameDisplayed('Lorem ipsum');
      await expect
        .poll(() => designPanelPage.getWidthValue(), 'Width is restored')
        .toBe(initialWidth);
    },
  );

  await demoAccountFileTest.step(
    'The editor opens showing the restored text',
    async () => {
      await mainPage.clickOnEnter();
      await expect(mainPage.textbox).toBeFocused();
      await layersPanelPage.isLayerNameDisplayed('Lorem ipsum');
    },
  );

  await demoAccountFileTest.step('Redo deletes the word again', async () => {
    await mainPage.clickOnESC();
    await mainPage.clickShortcutCtrlShiftZ();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isErrorScreenNotDisplayed();
    await expect
      .poll(() => designPanelPage.getWidthValue(), 'Width is reduced again')
      .toBe(reducedWidth);
    await layersPanelPage.isLayerNameDisplayed('Lorem');
  });

  await demoAccountFileTest.step('Set auto height and align center', async () => {
    await designPanelPage.changeTextOption('Auto height');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeTextOption('Center');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isTextOptionSelected('Auto height');
    await designPanelPage.isTextOptionSelected('Center');
    centeredWidth = await designPanelPage.getWidthValue();
    centeredHeight = await designPanelPage.getHeightValue();
  });

  await demoAccountFileTest.step('Select a word and leave the editor', async () => {
    await mainPage.clickOnEnter();
    await mainPage.doubleClickOnTextAt(0.5);
    await mainPage.clickViewportByCoordinates(900, 600);
    await expect(mainPage.textbox).toBeHidden();
    await layersPanelPage.isLayerNameDisplayed('Lorem');
    await mainPage.createdLayer.click();
    await designPanelPage.isTextOptionSelected('Center');
    expect(await designPanelPage.getWidthValue()).toBe(centeredWidth);
    expect(await designPanelPage.getHeightValue()).toBe(centeredHeight);
  });

  await demoAccountFileTest.step(
    'Undo reverts the alignment keeping the size',
    async () => {
      await mainPage.clickShortcutCtrlZ();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isErrorScreenNotDisplayed();
      await mainPage.createdLayer.click();
      await designPanelPage.isTextOptionSelected('Left');
      await expect
        .poll(() => designPanelPage.getWidthValue(), 'Width is kept')
        .toBe(centeredWidth);
      await expect
        .poll(() => designPanelPage.getHeightValue(), 'Height is kept')
        .toBe(centeredHeight);
    },
  );
});

demoAccountFileTest(
  qase(3983, 'Add several fills and gradient fills to a word of a text'),
  async ({ mainPage }) => {
    await mainPage.createTextLayerByCoordinates(200, 300, 'Hello world');

    await demoAccountFileTest.step(
      'Select the word "world" in the editor',
      async () => {
        await mainPage.createdLayer.click();
        await mainPage.clickOnEnter();
        await mainPage.doubleClickOnTextAt(0.8);
        await designPanelPage.checkFillsCount(1);
        await designPanelPage.isFillHexCodeSetByIndex(0, '000000');
      },
    );

    await demoAccountFileTest.step('Add a second fill', async () => {
      await designPanelPage.clickAddFillButton();
      await designPanelPage.checkFillsCount(2);
      await designPanelPage.isFillHexCodeSetByIndex(1, '000000');
    });

    await demoAccountFileTest.step(
      'Change the new fill to a linear gradient',
      async () => {
        await designPanelPage.clickFillColorIconByIndex(0);
        await colorPalettePage.selectColorGradient();
        await designPanelPage.isGradientFillSetByIndex(0, 'Linear');
      },
    );

    await demoAccountFileTest.step('Change the gradient to radial', async () => {
      await colorPalettePage.selectGradientType('Radial');
      await designPanelPage.isGradientFillSetByIndex(0, 'Radial');
      // Esc would also close the text editor, so the picker is closed by clicking
      // on an empty area of the right sidebar
      await designPanelPage.rightSidebar.click({ position: { x: 150, y: 920 } });
      await expect(colorPalettePage.colorPicker).toBeHidden();
      await designPanelPage.isGradientFillSetByIndex(0, 'Radial');
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
      'Caret inside "world" shows both fills',
      async () => {
        await mainPage.clickViewportByCoordinates(900, 600);
        await expect(mainPage.textbox).toBeHidden();
        await mainPage.createdLayer.click();
        await mainPage.clickOnEnter();
        await mainPage.page.keyboard.press('End');
        await mainPage.page.keyboard.press('ArrowLeft');
        await mainPage.page.keyboard.press('ArrowLeft');
        await designPanelPage.checkFillsCount(2);
        await designPanelPage.isGradientFillSetByIndex(0, 'Radial');
        await designPanelPage.isFillHexCodeSetByIndex(1, '000000');
      },
    );

    await demoAccountFileTest.step(
      'Caret inside "Hello" shows only the black fill',
      async () => {
        await mainPage.page.keyboard.press('Home');
        await mainPage.page.keyboard.press('ArrowRight');
        await mainPage.page.keyboard.press('ArrowRight');
        await designPanelPage.checkFillsCount(1);
        await designPanelPage.isFillHexCodeSetByIndex(0, '000000');
      },
    );
  },
);
