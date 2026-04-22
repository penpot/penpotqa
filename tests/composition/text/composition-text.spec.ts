import { expect } from '@playwright/test';
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

  mainTest(
    qase([380, 397], 'Change rotation from the design panel and focus on & off'),
    async () => {
      await mainTest.step('Change rotation to 90', async () => {
        await designPanelPage.changeRotationForLayer('90');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-rotated-90.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change rotation to 120', async () => {
        await designPanelPage.changeRotationForLayer('120');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-rotated-120.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change rotation to 45', async () => {
        await designPanelPage.changeRotationForLayer('45');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-rotated-45.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change rotation to 360', async () => {
        await designPanelPage.changeRotationForLayer('360');
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-rotated-359.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(
    qase([381], 'Add, hide, unhide, change type and delete Shadow to Text'),
    async () => {
      await mainTest.step('Add shadow', async () => {
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Hide shadow', async () => {
        await designPanelPage.hideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-hide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Unhide shadow', async () => {
        await designPanelPage.unhideShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-drop-shadow-unhide.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change shadow type to Inner Shadow', async () => {
        await designPanelPage.selectTypeForShadow('Inner shadow');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-inner-shadow-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Remove shadow', async () => {
        await designPanelPage.removeShadow();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'text-inner-shadow-remove.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(qase([382], 'Add and edit Shadow to text'), async ({ browserName }) => {
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#de1b1b');
    await mainPage.waitForChangeIsSaved();

    await mainTest.step('Add a new shadow with settings', async () => {
      await designPanelPage.clickAddShadowButton();
      await designPanelPage.clickShadowActionsButton();
      await designPanelPage.changeShadowSettings('2', '7', '0.5', '.5', '50');
      await designPanelPage.clickShadowColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickOnLayerOnCanvas();
      await mainPage.focusLayerViaShortcut();
      await mainPage.clickViewportTwice();
      await expect(mainPage.viewport).toHaveScreenshot('text-drop-shadow.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step(
      'Change type of shadow to Inner Shadow and change settings',
      async () => {
        await designPanelPage.selectTypeForShadow('Inner shadow');
        await designPanelPage.clickShadowActionsButton();
        await designPanelPage.changeShadowSettings('5', '7', '9', '12', '25');
        await designPanelPage.clickShadowColorIcon();
        await colorPalettePage.setHex('#96e637');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickOnLayerOnCanvas();
        await mainPage.focusLayerViaShortcut();
        await mainPage.clickViewportTwice();
        await expect(mainPage.viewport).toHaveScreenshot('text-inner-shadow.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });

  mainTest(
    qase([384, 385], 'Add, change value, hide, unhide and delete Blur to text'),
    async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();

      await mainTest.step('Add blur', async () => {
        await designPanelPage.clickAddBlurButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-default.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change blur value', async () => {
        await designPanelPage.changeValueForBlur('55');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Hide blur', async () => {
        await designPanelPage.hideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-hide.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Unhide blur', async () => {
        await designPanelPage.unhideBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-unhide.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Remove blur', async () => {
        await designPanelPage.removeBlur();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-blur-remove.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(qase([386], 'Add, edit and delete Stroke to Text'), async () => {
    await mainTest.step('Add stroke with default settings', async () => {
      await designPanelPage.clickAddStrokeButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-stroke-default.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change stroke settings to inside dotted', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#43E50B', '60', '10', 'Inside');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-inside-dotted.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change stroke settings to outside dashed', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#F5358F', '80', '5', 'Outside');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-outside-dashed.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change to center solid stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#F5358F', '100', '3', 'Center');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-center-solid.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Change to center mixed stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.changeStrokeSettings('#F5358F', '40', '4', 'Center');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'text-stroke-center-mixed.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step('Remove stroke', async () => {
      await mainPage.clickOnLayerOnCanvas();
      await designPanelPage.removeStroke();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-stroke-remove.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([388], 'Delete text (From right click)'), async () => {
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([2545], 'Delete text (From Keyboard)'), async () => {
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([392], 'Rename text with valid name'), async () => {
    await layersPanelPage.doubleClickLayerOnLayersTab('Hello world!');
    await layersPanelPage.typeNameCreatedLayerAndEnter('renamed text');
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.isLayerNameDisplayed('renamed text');
  });

  mainTest(
    qase([424], 'Change text uppercase, title case, lowercase (Design section)'),
    async () => {
      await mainTest.step('Change text case to Uppercase', async () => {
        await designPanelPage.changeTextCase('Upper');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-upper-case.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change to text case to Title Case', async () => {
        await designPanelPage.changeTextCase('Title');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-title-case.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });

      await mainTest.step('Change to text case to Lower Case', async () => {
        await designPanelPage.changeTextCase('Lower');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('text-lower-case.png', {
          mask: mainPage.maskViewport(),
        });
        await mainPage.focusLayerViaShortcut();
      });
    },
  );

  mainTest(qase([425], 'Change alignment (Design section)'), async () => {
    await mainTest.step('Change alignment to Middle', async () => {
      await designPanelPage.changeHeightAndWidthForLayer('200', '200');
      await designPanelPage.changeTextAlignment('Middle');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-middle.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change alignment to Bottom', async () => {
      await designPanelPage.changeTextAlignment('Bottom');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-bottom.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Change alignment to Top', async () => {
      await designPanelPage.changeTextAlignment('Top');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('text-align-top.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([427], 'Change RTL/LTR (Design section)'), async () => {
    await designPanelPage.changeTextDirection('RTL');
    await mainPage.waitForChangeIsSaved();
    await mainPage.focusLayerViaShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('text-rtl.png', {
      mask: mainPage.maskViewport(),
      maxDiffPixels: 30,
    });
    await mainPage.focusLayerViaShortcut();

    await designPanelPage.changeTextDirection('LTR');
    await mainPage.waitForChangeIsSaved();
    await mainPage.focusLayerViaShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('text-ltr.png', {
      mask: mainPage.maskViewport(),
      maxDiffPixels: 40,
    });
    await mainPage.focusLayerViaShortcut();
  });

  mainTest(
    qase([431], 'Change text color and opacity by typing color code'),
    async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await designPanelPage.changeOpacityForFill('50');
      await mainPage.clickMoveButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('text-fill-opacity.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openComputedTab();
      await expect(inspectPanelPage.textBlockOnInspect).toHaveScreenshot(
        'inspect-text-block-color.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  mainTest(qase([434], 'Selection to board'), async () => {
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.focusLayerViaShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('text-to-board.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase([394], 'Click "Focus on" text from right click'), async () => {
    const firstText = 'Hello world!';
    const secondText = 'Second text';

    await mainPage.createTextLayerByCoordinates(100, 200, secondText);
    await mainPage.focusLayerViaRightClickOnLayersTab(firstText);
    await expect(mainPage.viewport).toHaveScreenshot('first-text-focused.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickFocusModeTag();
    await mainPage.focusLayerViaRightClickOnLayersTab(secondText);
    await expect(mainPage.viewport).toHaveScreenshot('second-text-focused.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickFocusModeTag();
    await expect(mainPage.viewport).toHaveScreenshot(
      'first-and-second-text-not-focused.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
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
