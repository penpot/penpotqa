import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { type TextRangeStyle, WorkspacePage } from '@pages/workspace/workspace-page';
import { type TextTypography } from '@pages/workspace/right-sidebar/design-tab/text-section-component';

// "Setup A" page of the file: a text layer whose words each carry a different style
const SOURCE_LAYER = 'Formatted source text';
const SOURCE_TEXT =
  'This paragraph is the source text for the paste tests. It mixes a Bold word, ' +
  'an Italic word, an Underline word and a Strike word with plain text around ' +
  'them. This sentence uses Lobster from Google Fonts, followed by a Small word ' +
  'and a Large word. Next comes an Image word with an image fill and a Custom ' +
  'word that uses the team font. The rest of the paragraph keeps the default ' +
  'style, so a selection can start or end anywhere and still cross several ' +
  'style boundaries.';
const CUSTOM_FONT = 'Nekophilia';
// Name the Fill section shows for the image of the "Image" word
const IMAGE_FILL = 'sample';

type FormattedWord = TextTypography & { word: string; imageFill?: boolean };

const SOURCE_SANS = 'Source Sans Pro';
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
  { word: 'Custom', font: CUSTOM_FONT, style: 'Regular', size: '24' },
];

// Empty area of the canvas below the source text, where the copy is pasted
const PASTE_X = 240;
const PASTE_Y = 680;

// The copied chunk goes from "Bold" to "Custom", so it crosses every style
const CHUNK_START = SOURCE_TEXT.indexOf('Bold');
const CHUNK_END = SOURCE_TEXT.indexOf('Custom') + 'Custom'.length;

// Where each formatted word sits in the pasted chunk, with its expected styles
const PASTED_WORD_STYLES: TextRangeStyle[] = FORMATTED_WORDS.map(
  ({ word, imageFill, ...typography }) => ({
    label: word,
    start: SOURCE_TEXT.indexOf(word) - CHUNK_START,
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
  workspacePage = new WorkspacePage(page);
  layersPanelPage = new LayersPanelPage(page);

  await demoAccountFileTest.step(
    `Apply the team font ${CUSTOM_FONT} to the word "Custom"`,
    async () => {
      await layersPanelPage.selectLayerByExactName(SOURCE_LAYER);
      await mainPage.clickOnEnter();
      await workspacePage.textEditor.selectTextRange(
        SOURCE_TEXT.indexOf('Custom'),
        'Custom'.length,
      );
      await workspacePage.rightSidebar.design.text.changeFont(CUSTOM_FONT);
      await workspacePage.rightSidebar.design.text.checkTypography(
        FORMATTED_WORDS.find(({ word }) => word === 'Custom')!,
      );
      await mainPage.clickOnESC();
      await mainPage.waitForChangeIsSaved();
    },
  );
});

demoAccountFileTest(
  qase(4013, 'Paste formatted text onto the canvas in the same file'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Copy the formatted chunk', async () => {
      // The source text is still selected after the beforeEach (editing it renamed
      // its layer after the content)
      await workspacePage.copyTextRange(CHUNK_START, CHUNK_END - CHUNK_START);
    });

    await demoAccountFileTest.step(
      'Exit the editor and paste on an empty area of the canvas',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickViewportByCoordinates(PASTE_X, PASTE_Y);
        await mainPage.pressPasteShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isErrorScreenNotDisplayed();
        await layersPanelPage.isLayerNameDisplayed(
          SOURCE_TEXT.slice(CHUNK_START, CHUNK_END),
        );
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
        // Parks the mouse on the (masked) ruler, so no layer or shape shows a hover
        // outline and no tooltip opens
        await mainPage.guides.first().hover();
        await expect(mainPage.viewport).toHaveScreenshot('paste-onto-canvas.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

demoAccountFileTest(
  qase(
    4014,
    'Paste formatted text at the caret of a new text shape in the same file',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Copy the formatted chunk', async () => {
      // The source text is still selected after the beforeEach (editing it renamed
      // its layer after the content)
      await workspacePage.copyTextRange(CHUNK_START, CHUNK_END - CHUNK_START);
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
      await mainPage.waitForChangeIsSaved();
      await mainPage.isErrorScreenNotDisplayed();
      await layersPanelPage.isLayerNameDisplayed(
        SOURCE_TEXT.slice(CHUNK_START, CHUNK_END),
      );
      // Leaves the editor with the new text selected
      await mainPage.clickOnESC();
    });

    await demoAccountFileTest.step('Each pasted word keeps its style', async () => {
      await workspacePage.checkTextRangeStyles(PASTED_WORD_STYLES);
    });

    await demoAccountFileTest.step(
      'The pasted text looks like the source',
      async () => {
        await mainPage.clickOnESC();
        await mainPage.clickOnESC();
        // Parks the mouse on the (masked) ruler, so no layer or shape shows a hover
        // outline and no tooltip opens
        await mainPage.guides.first().hover();
        await expect(mainPage.viewport).toHaveScreenshot('paste-at-caret.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);
