import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { type TextTypography } from '@pages/workspace/right-sidebar/design-tab/text-section-component';
import { type TextRangeStyle, WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const SOURCE_LAYER = 'Formatted source text';
const SOURCE_TEXT =
  'This paragraph is the source text for the paste tests. It mixes a Bold word, ' +
  'an Italic word, an Underline word and a Strike word with plain text around ' +
  'them. This sentence uses Lobster from Google Fonts, followed by a Small word ' +
  'and a Large word. Next comes an Image word with an image fill and a Custom ' +
  'word that uses the team font. The rest of the paragraph keeps the default ' +
  'style, so a selection can start or end anywhere and still cross several ' +
  'style boundaries.';
const TEXT_LAYER_NAME = SOURCE_TEXT.slice(0, 280).trim();
const CUSTOM_FONT = 'Nekophilia';
const IMAGE_FILL = 'sample';

type FormattedWord = TextTypography & { word: string; imageFill?: boolean };

const SOURCE_SANS = 'Source Sans Pro';
const CUSTOM_WORD: FormattedWord = {
  word: 'Custom',
  font: CUSTOM_FONT,
  style: 'Regular',
  size: '24',
};

const FORMATTED_WORDS: FormattedWord[] = [
  { word: 'Bold', font: SOURCE_SANS, style: '700', size: '24' },
  { word: 'Italic', font: SOURCE_SANS, style: '400 Italic', size: '24' },
  {
    word: 'Underline',
    font: SOURCE_SANS,
    style: '400',
    size: '24',
    decoration: 'Underline',
  },
  {
    word: 'Strike',
    font: SOURCE_SANS,
    style: '400',
    size: '24',
    decoration: 'Strikethrough',
  },
  { word: 'Lobster', font: 'Lobster', style: '400', size: '24' },
  { word: 'Small', font: SOURCE_SANS, style: '400', size: '14' },
  { word: 'Large', font: SOURCE_SANS, style: '400', size: '48' },
  { word: 'Image', font: SOURCE_SANS, style: '900', size: '48', imageFill: true },
  CUSTOM_WORD,
];

const PASTE_X = 240;
const PASTE_Y = 640;

const PASTED_WORD_STYLES: TextRangeStyle[] = FORMATTED_WORDS.map(
  ({ word, imageFill, ...typography }) => ({
    label: word,
    start: SOURCE_TEXT.indexOf(word),
    length: word.length,
    typography,
    imageFill: imageFill ? IMAGE_FILL : undefined,
  }),
);

let workspacePage: WorkspacePage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.use({
  penpotFile: 'documents/text-pasting.penpot',
  teamFonts: [{ path: `fonts/${CUSTOM_FONT}.otf`, family: CUSTOM_FONT }],
});

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  demoAccountFileTest.slow();
  workspacePage = new WorkspacePage(page);
  layersPanelPage = new LayersPanelPage(page);

  await demoAccountFileTest.step(
    `Apply the team font ${CUSTOM_FONT} to the word "${CUSTOM_WORD.word}"`,
    async () => {
      await layersPanelPage.selectLayerByExactName(SOURCE_LAYER);
      await mainPage.clickOnEnter();
      await workspacePage.textEditor.selectTextRangeFromEnd(
        SOURCE_TEXT.length -
          SOURCE_TEXT.indexOf(CUSTOM_WORD.word) -
          CUSTOM_WORD.word.length,
        CUSTOM_WORD.word.length,
      );
      await workspacePage.rightSidebar.design.text.changeFont(CUSTOM_FONT);
      await workspacePage.rightSidebar.design.text.checkTypography(CUSTOM_WORD);
      await mainPage.clickOnESC();
      await mainPage.waitForChangeIsSaved();
    },
  );
});

demoAccountFileTest(
  qase([4013], 'Paste formatted text onto the canvas in the same file'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Copy the formatted text', async () => {
      await workspacePage.copyAllText();
    });

    await demoAccountFileTest.step(
      'Exit the editor and paste on an empty area of the canvas',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickViewportByCoordinates(PASTE_X, PASTE_Y);
        await mainPage.pressPasteShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isErrorScreenNotDisplayed();
        await layersPanelPage.isNumLayerNameVisible(TEXT_LAYER_NAME, 2);
      },
    );

    await demoAccountFileTest.step('Select the pasted text', async () => {
      await mainPage.createdLayer.click();
    });

    await demoAccountFileTest.step('Each pasted word keeps its style', async () => {
      await workspacePage.checkTextRangeStyles(PASTED_WORD_STYLES);
    });

    await demoAccountFileTest.step(
      'The pasted text looks like the source',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickOnESC();
        await mainPage.movePointerToViewportBottomRight();
        await expect(mainPage.viewport).toHaveScreenshot('paste-onto-canvas.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [4014],
    'Paste formatted text at the caret of a new text shape in the same file',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Copy the formatted text', async () => {
      await workspacePage.copyAllText();
    });

    await demoAccountFileTest.step(
      'Create a new text shape on an empty area of the canvas',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickOnESC();
        await mainPage.clickCreateTextButton();
        await mainPage.clickViewportByCoordinates(PASTE_X, PASTE_Y);
        await workspacePage.textEditor.checkTextEditorIsFocused();
      },
    );

    await demoAccountFileTest.step('Paste at the caret', async () => {
      await workspacePage.textEditor.paste();
      await mainPage.clickOnESC();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isErrorScreenNotDisplayed();
      await layersPanelPage.isNumLayerNameVisible(TEXT_LAYER_NAME, 2);
    });

    await demoAccountFileTest.step('Each pasted word keeps its style', async () => {
      await workspacePage.checkTextRangeStyles(PASTED_WORD_STYLES);
    });

    await demoAccountFileTest.step(
      'The pasted text looks like the source',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickOnESC();
        await mainPage.movePointerToViewportBottomRight();
        await expect(mainPage.viewport).toHaveScreenshot('paste-at-caret.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);
