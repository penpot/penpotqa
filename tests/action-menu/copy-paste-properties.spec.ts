import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainAccountFileTest, mainTest } from 'fixtures';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TypographyToken } from '@pages/workspace/tokens/token-components/typography-tokens-component';
import { createTeamName } from 'helpers/teams/create-team-name';
import { SampleData } from 'helpers/sample-data';

const sampleData: SampleData = new SampleData();

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;
let assetsPanelPage: AssetsPanelPage;
let inspectPanelPage: InspectPanelPage;
let pagesPanelPage: PagesPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  pagesPanelPage = new PagesPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.describe(() => {
    mainAccountFileTest.beforeEach(async ({ mainPage }) => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#FF0000');
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.changeStrokeSettings(
        '#000000',
        '90',
        '20',
        'Inside',
        'Solid',
      );
      await designPanelPage.clickAddShadowButton();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('7');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.clickViewportTwice();
      await layersPanelPage.selectLayerByName('Rectangle');
    });

    mainAccountFileTest(
      qase([1964], 'Copy paste properties from rectangle to ellipse'),
      async ({ mainPage }) => {
        await mainPage.copyLayerPropertyViaRightClick();

        await mainPage.createDefaultEllipseByCoordinates(100, 300, true);
        await Promise.all([
          mainPage.waitForUpdateFileRequest(),
          mainPage.clickShortcutCtrlAltV(),
        ]);

        await expect(mainPage.viewport).toHaveScreenshot('copies-property.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );

    mainAccountFileTest(
      qase([1973], 'Copy paste properties into 3 different layers'),
      async ({ mainPage }) => {
        await mainPage.copyLayerPropertyViaRightClick();
        await pagesPanelPage.clickAddPageButton();
        await pagesPanelPage.clickOnPageOnLayersPanel(2);
        await mainPage.createDefaultEllipseByCoordinates(100, 300, true);
        await mainPage.createDefaultBoardByCoordinates(300, 300, true);
        await mainPage.createDefaultTextLayerByCoordinates(500, 500);
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickShortcutCtrlAltV();
        await mainPage.waitForChangeIsSaved();

        // TODO: Remove the hardcoded timeout, and think of waiting the API WASM responses when the viewport is completely rendered
        await mainPage.page.waitForTimeout(150);
        // wait for 2 frames
        await mainPage.page.evaluate(() => {
          return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve();
              });
            });
          });
        });

        await expect(mainPage.viewport).toHaveScreenshot(
          'copies-property-3-layers.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  });

  mainAccountFileTest(
    qase([1975], 'Copy paste Properties on Main component 1 to Copy component 2'),
    async ({ mainPage }) => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await mainPage.createComponentViaRightClick();
      await designPanelPage.clickFirstColorIcon();
      await colorPalettePage.setHex('#0000FF');
      await mainPage.duplicateLayerViaRightClick();
      await layersPanelPage.clickNCopyComponentOnLayersTab(0);
      await designPanelPage.changeXAxisForLayer('300');

      await mainPage.createDefaultEllipseByCoordinates(100, 700, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.duplicateLayerViaRightClick();
      await designPanelPage.changeXAxisForLayer('350');
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickNMainComponentOnLayersTab(1);
      await mainPage.clickShortcutCtrlAltC();
      await layersPanelPage.clickNCopyComponentOnLayersTab(0);
      await mainPage.clickShortcutCtrlAltV();

      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();

      await expect(mainPage.viewport).toHaveScreenshot(
        'paste-property-copy-component.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1976], 'Copy paste properties of Flex layout to another Board'),
    async ({ mainPage }) => {
      await mainPage.createDefaultBoardByCoordinates(100, 100);
      await mainPage.addFlexLayoutViaRightClick();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutAlignment('Center');
      await designPanelPage.changeLayoutPadding('Vertical', '5');
      await designPanelPage.changeLayoutPadding('Horizontal', '15');
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickShortcutCtrlAltC();

      await mainPage.createDefaultBoardByCoordinates(100, 700, true);
      await mainPage.clickShortcutCtrlAltV();

      await designPanelPage.isLayoutAlignmentSelected('Center');
      await designPanelPage.checkLayoutPadding('Vertical', '5');
      await designPanelPage.checkLayoutPadding('Horizontal', '15');
    },
  );

  mainAccountFileTest(
    qase([1978], 'Copy paste typography property'),
    async ({ mainPage }) => {
      await mainPage.createDefaultTextLayerByCoordinates(100, 100);
      await assetsPanelPage.selectFont('Sofia');
      await assetsPanelPage.selectFontSize('20');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickShortcutCtrlAltC();

      await mainPage.createDefaultTextLayerByCoordinates(500, 500);
      await mainPage.clickShortcutCtrlAltV();

      await assetsPanelPage.checkFont('Sofia');
      await assetsPanelPage.checkFontSize('20');
    },
  );

  mainAccountFileTest(
    qase(
      [2020],
      'Compare copied CSS properties with CSS properties in "Inspect" tab',
    ),
    async ({ mainPage }) => {
      await mainPage.createDefaultEllipseByCoordinates(100, 100);
      const cssCode = await mainPage.copyLayerCSSViaRightClick();

      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openCodeTab();
      const cssCodeFromInspectTab =
        await inspectPanelPage.copyCssCodeByName('Ellipse');

      await expect(cssCode).toEqual(cssCodeFromInspectTab);
    },
  );

  mainAccountFileTest(
    qase(
      [2256],
      'Compare "Copy as SVG" code with the SVG code on the "Inspect" panel',
    ),
    async ({ mainPage }) => {
      await mainPage.createDefaultEllipseByCoordinates(100, 100);
      const svgCode = await mainPage.copyLayerSVGViaRightClick();
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openCodeTab();
      await inspectPanelPage.clickOnSVGCodeButton();
      const svgCodeFromInspectTab = await inspectPanelPage.copySvgCode();

      await expect(svgCode).toEqual(svgCodeFromInspectTab);
    },
  );

  mainAccountFileTest(
    qase([2257], '"Copy as SVG" a simple path, pasting the code on Penpot'),
    async ({ mainPage }) => {
      await mainPage.createDefaultOpenPath();
      await mainPage.copyLayerSVGViaRightClick();
      await Promise.all([
        mainPage.waitForUpdateFileRequest(),
        mainPage.pasteLayerViaRightClick(),
      ]);

      await expect(mainPage.viewport).toHaveScreenshot('copies-path.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );
});

mainTest.describe(() => {
  let teamPage: TeamPage;
  let dashboardPage: DashboardPage;
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;

  const fileName = 'copy/paste properties';

  mainTest.beforeEach(async ({ page }) => {
    teamPage = new TeamPage(page);
    dashboardPage = new DashboardPage(page);
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await teamPage.createTeam(createTeamName());
    await dashboardPage.isHeaderDisplayed('Projects');
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.importFileFromProjectPage(
      'documents/copy_paste_token_properties_layout.penpot',
    );
    await dashboardPage.isFilePresentWithName(fileName);
    await dashboardPage.openFileWithName(fileName);
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
  });

  mainTest(
    qase(
      [3679, 3680],
      'Paste properties preserves token references on boards and text',
    ),
    async () => {
      await mainTest.step(
        '3679, Paste properties preserves gap, padding, fill and border tokens on a flex layout board',
        async () => {
          await mainTest.step('Copy Board 1 properties', async () => {
            await layersPanelPage.selectLayerByName('Board 1');
            await mainPage.clickShortcutCtrlAltC();
          });

          await mainTest.step('Paste properties onto Board 2', async () => {
            await layersPanelPage.selectLayerByName('Board 2');
            await Promise.all([
              mainPage.waitForUpdateFileRequest(),
              mainPage.clickShortcutCtrlAltV(),
            ]);
            await mainPage.waitForChangeIsSaved();
          });

          await mainTest.step(
            'Verify gap, padding, fill and stroke are pasted as token references',
            async () => {
              await designPanelPage.checkFieldTokenName('Row gap', '30px');
              await designPanelPage.checkFieldTokenName('Column gap', '30px');
              await designPanelPage.checkFieldTokenName('Vertical padding', '30px');
              await designPanelPage.checkFieldTokenName(
                'Horizontal padding',
                '30px',
              );
              await designPanelPage.checkFieldTokenName('Stroke width', '30');

              await designPanelPage.checkFieldTokenName('Fill section', 'red');
              await designPanelPage.checkFieldTokenName('Stroke section', 'blue');
            },
          );

          await mainTest.step(
            'Change the "red" color token value and verify Board 2 fill updates too',
            async () => {
              await tokensPage.clickTokensTab();
              await tokensPage.tokensComp.expandTokenByName(TokenClass.Color);
              await tokensPage.tokensComp.editTokenViaRightClickAndSave({
                class: TokenClass.Color,
                name: 'red',
                value: sampleData.color.greenHexCode,
              } as MainToken<TokenClass>);
              await mainPage.waitForChangeIsSaved();

              // Name unchanged (still the same token reference) but the
              // resolved value now matches the edited token.
              await designPanelPage.checkFieldTokenName('Fill section', 'red');
              await designPanelPage.checkFillTokenResolvedValue(
                sampleData.color.greenHexCode,
              );
            },
          );
        },
      );

      await mainTest.step(
        '3680, Paste properties preserves color and typography tokens on a text layer',
        async () => {
          await mainTest.step('Copy Text 1 properties', async () => {
            await layersPanelPage.openLayersTab();
            await layersPanelPage.selectLayerByName('Text 1');
            await mainPage.clickShortcutCtrlAltC();
          });

          await mainTest.step('Paste properties onto Text 2', async () => {
            await layersPanelPage.selectLayerByName('Text 2');
            await Promise.all([
              mainPage.waitForUpdateFileRequest(),
              mainPage.clickShortcutCtrlAltV(),
            ]);
            await mainPage.waitForChangeIsSaved();
          });

          await mainTest.step(
            'Verify text color and typography are pasted as token references',
            async () => {
              await designPanelPage.checkFieldTokenName('Fill section', 'gray');

              await tokensPage.clickTokensTab();
              await tokensPage.tokensComp.expandTokenByName(TokenClass.Typography);
              await tokensPage.tokensComp.checkAppliedTokenTitleForClass(
                TokenClass.Typography,
                /Font Family: ABeeZee/,
              );
            },
          );

          await mainTest.step(
            'Change the typography token value and verify Text 2 updates too',
            async () => {
              await tokensPage.clickTokensTab();
              await tokensPage.tokensComp.expandTokenByName(TokenClass.Typography);
              await tokensPage.tokensComp.editTokenViaRightClickAndSave({
                class: TokenClass.Typography,
                name: 'ABee_custom',
                fontFamily: 'Source Sans Pro',
              } as TypographyToken<TokenClass>);
              await mainPage.waitForChangeIsSaved();

              await tokensPage.tokensComp.checkAppliedTokenTitleForClass(
                TokenClass.Typography,
                /Font Family: Source Sans Pro/,
              );
            },
          );
        },
      );
    },
  );
});
