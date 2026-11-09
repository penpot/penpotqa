import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const sampleData = new SampleData();

const SetGroup = { Mode: 'Mode', Device: 'Device' } as const;
const SetName = {
  Dark: 'Dark',
  Light: 'Light',
  Desktop: 'Desktop',
  Mobile: 'Mobile',
} as const;
const THEME_GROUP = 'App';
const ThemeName = { Web: 'Web', Mobile: 'Mobile' } as const;

let tokensPage: TokensPage;
let designPanelPage: DesignPanelPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  designPanelPage = new DesignPanelPage(page);

  await mainPage.clickMoveButton();
});

demoAccountFileTest(qase([2167], 'Create theme via "create one" link'), async () => {
  await demoAccountFileTest.step('Open Tokens panel', async () => {
    await tokensPage.clickTokensTab();
  });

  await demoAccountFileTest.step('Create theme via "create one" link', async () => {
    await tokensPage.themesComp.createThemeViaLink('Desktop');
  });

  await demoAccountFileTest.step('Verify no theme is active', async () => {
    await tokensPage.themesComp.checkSelectedTheme('No theme active');
  });
});

demoAccountFileTest.describe(() => {
  const colorToken1: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.getRandomHexCode(),
  };
  const colorToken2: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.getRandomHexCode(),
  };
  const radiusToken1: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '50',
  };
  const radiusToken2: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '30',
  };

  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultRectangleByCoordinates(200, 200);

    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createAndActivateSet(
      `${SetGroup.Mode}/${SetName.Dark}`,
    );
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken1);
    await tokensPage.tokensComp.clickOnTokenWithName(colorToken1.name);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillTokenColorSetComponent(colorToken1.name);

    await tokensPage.setsComp.createAndActivateSet(
      `${SetGroup.Mode}/${SetName.Light}`,
    );
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillTokenColorSetComponent(colorToken2.name);

    await tokensPage.setsComp.createAndActivateSet(
      `${SetGroup.Device}/${SetName.Desktop}`,
    );
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(radiusToken1);
    await tokensPage.tokensComp.clickOnTokenWithName(radiusToken1.name);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius(radiusToken1.value);

    await tokensPage.setsComp.createAndActivateSet(
      `${SetGroup.Device}/${SetName.Mobile}`,
    );
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(radiusToken2);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);
  });

  demoAccountFileTest.describe(() => {
    demoAccountFileTest.beforeEach(async () => {
      await tokensPage.themesComp.createThemeViaLinkWithGroup(
        THEME_GROUP,
        ThemeName.Web,
      );
      await tokensPage.themesComp.addNewThemeWithGroup(
        THEME_GROUP,
        ThemeName.Mobile,
      );

      await tokensPage.themesComp.openEditThemeModalByThemeName(ThemeName.Web);
      await tokensPage.themesComp.activateSetInTheme(SetName.Dark);
      await tokensPage.themesComp.activateSetInTheme(SetName.Light);
      await tokensPage.themesComp.activateSetInTheme(SetName.Desktop);
      await tokensPage.themesComp.saveTheme();
      await tokensPage.setsComp.checkActiveSetsCountByThemeName(ThemeName.Web, '3');

      await tokensPage.themesComp.openEditThemeModalByThemeName(ThemeName.Mobile);
      await tokensPage.themesComp.activateSetInTheme(SetName.Light);
      await tokensPage.themesComp.activateSetInTheme(SetName.Mobile);
      await tokensPage.themesComp.saveTheme();
      await tokensPage.setsComp.checkActiveSetsCountByThemeName(
        ThemeName.Mobile,
        '2',
      );
    });

    demoAccountFileTest(
      qase([2206], 'Enable themes in different groups'),
      async ({ mainPage }) => {
        await demoAccountFileTest.step(
          'Create "Brand X" theme and activate all sets',
          async () => {
            await tokensPage.themesComp.addNewTheme('Brand X');
            await tokensPage.themesComp.openEditThemeModalByThemeName('Brand X');
            await tokensPage.themesComp.activateSetInTheme(SetName.Light);
            await tokensPage.themesComp.activateSetInTheme(SetName.Dark);
            await tokensPage.themesComp.activateSetInTheme(SetName.Desktop);
            await tokensPage.themesComp.activateSetInTheme(SetName.Mobile);
            await tokensPage.themesComp.saveTheme();
            await tokensPage.setsComp.checkActiveSetsCountByThemeName(
              'Brand X',
              '4',
            );
            await mainPage.closeModalWindow();
            await tokensPage.themesComp.checkSelectedTheme('No theme active');
          },
        );

        await demoAccountFileTest.step(
          'Select "Web" theme and verify active sets',
          async () => {
            await tokensPage.themesComp.selectTheme(ThemeName.Web);
            await tokensPage.themesComp.checkSelectedTheme('App / Web');
            await tokensPage.setsComp.isSetCheckedByName(SetName.Dark);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Light);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Desktop);
          },
        );

        await demoAccountFileTest.step(
          'Select "Mobile" theme and verify active sets',
          async () => {
            await tokensPage.themesComp.selectTheme(ThemeName.Mobile);
            await tokensPage.themesComp.checkSelectedTheme('App / Mobile');
            await tokensPage.setsComp.isSetCheckedByName(SetName.Light);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Mobile);
          },
        );

        await demoAccountFileTest.step(
          'Select "Brand X" theme and verify multiple themes are active',
          async () => {
            await tokensPage.themesComp.selectTheme('Brand X');
            await tokensPage.themesComp.checkSelectedTheme('2 active themes');
            await tokensPage.setsComp.isSetCheckedByName(SetName.Dark);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Light);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Mobile);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Desktop);
          },
        );
      },
    );

    demoAccountFileTest(
      qase(
        [2190],
        'Add new group theme using an existing group name and an existing theme name via select "edit themes"',
      ),
      async ({ mainPage }) => {
        await demoAccountFileTest.step(
          'Add theme with existing group "App" and existing name "Web" and verify modal closes',
          async () => {
            await tokensPage.themesComp.addNewThemeWithGroup(
              THEME_GROUP,
              ThemeName.Web,
              true,
            );
            await mainPage.closeModalWindow();
          },
        );
      },
    );

    demoAccountFileTest(qase([2192], 'Rename a theme'), async ({ mainPage }) => {
      const newThemeName: string = 'Tablet';

      await demoAccountFileTest.step(
        `Rename "Mobile" theme to "${newThemeName}"`,
        async () => {
          await tokensPage.themesComp.openEditThemeModalByThemeName(
            ThemeName.Mobile,
          );
          await tokensPage.themesComp.editThemeName(newThemeName);
        },
      );

      await demoAccountFileTest.step(
        `Verify active sets count for "${newThemeName}" theme`,
        async () => {
          await tokensPage.setsComp.checkActiveSetsCountByThemeName(
            newThemeName,
            '2',
          );
          await mainPage.closeModalWindow();
        },
      );
    });

    demoAccountFileTest(
      qase([2204], 'Enable and disable themes via "Theme list" modal'),
      async () => {
        await demoAccountFileTest.step(
          'Enable "Web" theme from the theme list',
          async () => {
            await tokensPage.themesComp.toggleThemeInList(ThemeName.Web);
            await tokensPage.themesComp.checkThemeEnabledInList(ThemeName.Web);
            await tokensPage.themesComp.checkSelectedTheme('App / Web');
          },
        );

        await demoAccountFileTest.step(
          'Enable "Mobile" theme and verify "Web" is disabled',
          async () => {
            await tokensPage.themesComp.toggleThemeInList(ThemeName.Mobile);
            await tokensPage.themesComp.checkThemeEnabledInList(ThemeName.Mobile);
            await tokensPage.themesComp.checkThemeEnabledInList(
              ThemeName.Web,
              false,
            );
            await tokensPage.themesComp.checkSelectedTheme('App / Mobile');
          },
        );

        await demoAccountFileTest.step(
          'Disable "Mobile" theme and verify no theme is active',
          async () => {
            await tokensPage.themesComp.toggleThemeInList(ThemeName.Mobile);
            await tokensPage.themesComp.checkThemeEnabledInList(
              ThemeName.Mobile,
              false,
            );
            await tokensPage.themesComp.checkThemeEnabledInList(
              ThemeName.Web,
              false,
            );
            await tokensPage.themesComp.checkSelectedTheme('No theme active');
          },
        );
      },
    );

    demoAccountFileTest(
      qase([2205], 'Enable and disable themes via "Themes" selector'),
      async ({ mainPage }) => {
        await demoAccountFileTest.step('Close the theme list modal', async () => {
          await mainPage.closeModalWindow();
          await tokensPage.themesComp.checkSelectedTheme('No theme active');
        });

        await demoAccountFileTest.step(
          'Select "Web" theme and verify its sets and tokens are applied',
          async () => {
            await tokensPage.themesComp.selectTheme(ThemeName.Web);
            await mainPage.waitForChangeIsSaved();
            await tokensPage.themesComp.checkSelectedTheme('App / Web');
            await tokensPage.setsComp.isSetCheckedByName(SetName.Dark);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Light);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Desktop);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Mobile, false);
            await designPanelPage.checkGeneralCornerRadius(radiusToken1.value);
          },
        );

        await demoAccountFileTest.step(
          'Select "Mobile" theme and verify "Web" sets are disabled',
          async () => {
            await tokensPage.themesComp.selectTheme(ThemeName.Mobile);
            await mainPage.waitForChangeIsSaved();
            await tokensPage.themesComp.checkSelectedTheme('App / Mobile');
            await tokensPage.setsComp.isSetCheckedByName(SetName.Light);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Mobile);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Dark, false);
            await tokensPage.setsComp.isSetCheckedByName(SetName.Desktop, false);
            await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);
          },
        );

        await demoAccountFileTest.step(
          'Select "Mobile" theme again and verify no theme or set is active',
          async () => {
            await tokensPage.themesComp.selectTheme(ThemeName.Mobile);
            await mainPage.waitForChangeIsSaved();
            await tokensPage.themesComp.checkSelectedTheme('No theme active');
            for (const setName of Object.values(SetName)) {
              await tokensPage.setsComp.isSetCheckedByName(setName, false);
            }
            await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);
          },
        );
      },
    );
  });

  demoAccountFileTest(
    qase([2236], 'Create theme with immediately set selection'),
    async () => {
      await demoAccountFileTest.step(
        'Open Tokens panel and create "Test" theme with "Dark" set pre-selected',
        async () => {
          await tokensPage.clickTokensTab();
          await tokensPage.themesComp.createThemeViaLinkWithSet(
            'Test',
            SetName.Dark,
          );
        },
      );

      await demoAccountFileTest.step(
        'Verify no theme is active initially',
        async () => {
          await tokensPage.themesComp.checkSelectedTheme('No theme active');
        },
      );

      await demoAccountFileTest.step(
        'Select "Test" theme and verify it is active with "Dark" set checked',
        async () => {
          await tokensPage.themesComp.selectTheme('Test');
          await tokensPage.themesComp.checkSelectedTheme('Test');
          await tokensPage.setsComp.isSetCheckedByName(SetName.Dark);
        },
      );
    },
  );
});
