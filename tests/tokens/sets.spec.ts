import { qase } from 'playwright-qase-reporter/playwright';
import { demoAccountFileTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { MainPage } from '@pages/workspace/main-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

const sampleData = new SampleData();

let tokensPage: TokensPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  tokensPage = new TokensPage(page);
  await mainPage.clickMoveButton();
});

demoAccountFileTest(qase([2102], 'Create a set via "create one" link'), async () => {
  const name = 'Mobile';

  await demoAccountFileTest.step('Open tokens tab', async () => {
    await tokensPage.clickTokensTab();
  });

  await demoAccountFileTest.step('Create set via "create one" link', async () => {
    await tokensPage.setsComp.createSetViaLink(name);
  });

  await demoAccountFileTest.step('Check first set name is correct', async () => {
    await tokensPage.setsComp.checkFirstSetName(name);
  });
});

demoAccountFileTest(
  qase([2105], 'Create a set using an existing name'),
  async () => {
    const setName = 'Mobile';
    const colorToken: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color',
      value: sampleData.color.getRandomHexCode(),
    };

    await demoAccountFileTest.step(`Create set "${setName}"`, async () => {
      await tokensPage.clickTokensTab();
      await tokensPage.setsComp.createSetViaButton(setName);
      await tokensPage.setsComp.checkFirstSetName(setName);
    });

    await demoAccountFileTest.step(
      `Create color token "${colorToken.name}" in the set`,
      async () => {
        await tokensPage.tokensComp.createTokenViaAddButtonAndSave(colorToken);
        await tokensPage.tokensComp.isTokenVisibleWithName(colorToken.name);
      },
    );

    await demoAccountFileTest.step(
      `Try to create a set with the existing name "${setName}" and check error is shown`,
      async () => {
        await tokensPage.setsComp.createSetViaButton(setName);
        await tokensPage.setsComp.checkSetNameAlreadyExistsError();
      },
    );
  },
);

demoAccountFileTest(qase([2127], 'Rename a set'), async () => {
  const name = 'Mobile';
  const newName1 = 'Mobile-Updated-Double-Click';
  const newName2 = 'Mobile-Updated-Context-Menu';
  const colorToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'color',
    value: sampleData.color.getRandomHexCode(),
  };

  await demoAccountFileTest.step('Create a set', async () => {
    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createSetViaButton(name);
    await tokensPage.setsComp.checkFirstSetName(name);
  });

  await demoAccountFileTest.step('Create a color token', async () => {
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
  });

  await demoAccountFileTest.step(
    'Rename set double click and assert name',
    async () => {
      await tokensPage.setsComp.renameSetByDoubleClick(newName1);
      await tokensPage.setsComp.checkFirstSetName(newName1);
    },
  );

  await demoAccountFileTest.step(
    'Rename set via context menu and assert name',
    async () => {
      await tokensPage.setsComp.renameSetViaContextMenu(newName1, newName2);
      await tokensPage.setsComp.checkFirstSetName(newName2);
    },
  );
});

demoAccountFileTest.describe(() => {
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;
  let tokensPage: TokensPage;

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
    value: '30',
  };
  const radiusToken2: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'border-radius',
    value: '50',
  };

  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);
    tokensPage = new TokensPage(page);

    await tokensPage.createDefaultRectangleByCoordinates(100, 200);

    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createSetViaButton('Mode/Dark');
    await tokensPage.setsComp.isSetNameVisible('Dark');
    await tokensPage.setsComp.isGroupSetNameVisible('Mode');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Dark');
    await tokensPage.setsComp.isSetCheckedByName('Dark');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken1);
    await tokensPage.tokensComp.clickOnTokenWithName(colorToken1.name);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillTokenColorSetComponent(colorToken1.name);

    await tokensPage.setsComp.createSetViaButton('Mode/Light');
    await tokensPage.setsComp.isSetNameVisible('Light');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
    await tokensPage.setsComp.isSetCheckedByName('Light');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillTokenColorSetComponent(colorToken2.name);

    await tokensPage.setsComp.createSetViaButton('Device/Desktop');
    await tokensPage.setsComp.isSetNameVisible('Desktop');
    await tokensPage.setsComp.isGroupSetNameVisible('Device');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Desktop');
    await tokensPage.setsComp.isSetCheckedByName('Desktop');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken2);

    await tokensPage.tokensComp.clickOnTokenWithName(radiusToken2.name);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);

    await tokensPage.setsComp.createSetViaButton('Device/Mobile');
    await tokensPage.setsComp.isSetNameVisible('Mobile');
    await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
    await tokensPage.setsComp.isSetCheckedByName('Mobile');
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken1);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkGeneralCornerRadius(radiusToken1.value);
  });

  demoAccountFileTest(
    qase([2133], 'Rename a set group using an existing name'),
    async () => {
      await demoAccountFileTest.step(
        'Rename "Mode" group to "Device" (existing group name)',
        async () => {
          await tokensPage.setsComp.renameGroupByDoubleClick('Mode', 'Device');
        },
      );

      await demoAccountFileTest.step(
        'Check "Mode" group is no longer visible',
        async () => {
          await tokensPage.setsComp.isGroupSetNameVisible('Mode', false);
        },
      );

      await demoAccountFileTest.step(
        'Check "Dark" and "Light" sets are still visible after the merge',
        async () => {
          await tokensPage.setsComp.isSetNameVisible('Dark');
          await tokensPage.setsComp.isSetNameVisible('Light');
        },
      );
    },
  );

  demoAccountFileTest(qase([2139], 'Enable and Disable sets'), async () => {
    await demoAccountFileTest.step(
      'Disable Light set and check Dark color token is applied',
      async () => {
        await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
        await designPanelPage.isFillTokenColorSetComponent(colorToken1.name);
      },
    );

    await demoAccountFileTest.step(
      'Disable Mobile set and check Desktop radius is applied',
      async () => {
        await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
        await designPanelPage.checkGeneralCornerRadius(radiusToken2.value);
      },
    );

    await demoAccountFileTest.step(
      'Enable Light set and check Light color token is applied',
      async () => {
        await tokensPage.setsComp.clickOnSetCheckboxByName('Light');
        await designPanelPage.isFillTokenColorSetComponent(colorToken2.name);
      },
    );

    await demoAccountFileTest.step(
      'Enable Mobile set and check Mobile radius is applied',
      async () => {
        await tokensPage.setsComp.clickOnSetCheckboxByName('Mobile');
        await designPanelPage.checkGeneralCornerRadius(radiusToken1.value);
      },
    );
  });

  demoAccountFileTest(qase([2141], 'Add set to this group'), async () => {
    await demoAccountFileTest.step('Add Tablet set to Device group', async () => {
      await tokensPage.setsComp.addSetToGroupByName('Device', 'Tablet');
    });

    await demoAccountFileTest.step(
      'Check Tablet set is visible inside Device group',
      async () => {
        await tokensPage.setsComp.isSetNameVisible('Tablet', true);
      },
    );
  });

  demoAccountFileTest(qase([2146], 'Delete a set group'), async () => {
    await demoAccountFileTest.step('Delete Device set group', async () => {
      await tokensPage.setsComp.deleteSetsGroupByName('Device');
    });

    await demoAccountFileTest.step(
      'Check Device group is no longer visible',
      async () => {
        await tokensPage.setsComp.isGroupSetNameVisible('Device', false);
      },
    );

    await demoAccountFileTest.step(
      'Check Desktop and Mobile sets are no longer visible',
      async () => {
        await tokensPage.setsComp.isSetNameVisible('Desktop', false);
        await tokensPage.setsComp.isSetNameVisible('Mobile', false);
      },
    );
  });
});

demoAccountFileTest(qase([2231], 'Duplicate set'), async () => {
  const name = 'Mobile';
  const firstSetName = name + '-copy';
  const secondSetName = firstSetName + '-copy';
  const thirdSetName = secondSetName + '-copy';

  await demoAccountFileTest.step('Create initial set', async () => {
    await tokensPage.clickTokensTab();
    await tokensPage.setsComp.createSetViaButton(name);
    await tokensPage.setsComp.checkFirstSetName(name);
  });

  await demoAccountFileTest.step(
    'Duplicate set for the first time and check copy is visible',
    async () => {
      await tokensPage.setsComp.duplicateSetByName(name);
      await tokensPage.setsComp.isSetNameVisible(firstSetName);
    },
  );

  await demoAccountFileTest.step(
    'Duplicate set for the second time and check copy is visible',
    async () => {
      await tokensPage.setsComp.duplicateSetByName(firstSetName);
      await tokensPage.setsComp.isSetNameVisible(secondSetName);
    },
  );

  await demoAccountFileTest.step(
    'Duplicate set for the third time and check copy is visible',
    async () => {
      await tokensPage.setsComp.duplicateSetByName(secondSetName);
      await tokensPage.setsComp.isSetNameVisible(thirdSetName);
    },
  );

  await demoAccountFileTest.step('Duplicate set for the fourth time', async () => {
    await tokensPage.setsComp.duplicateSetByName(thirdSetName);
  });
});
