import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { PrototypePanelPage } from '@pages/workspace/prototype-panel-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let pagesPanelPage: PagesPanelPage;
let viewModePage: ViewModePage;
let prototypePanelPage: PrototypePanelPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  pagesPanelPage = new PagesPanelPage(page);
  viewModePage = new ViewModePage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  await mainTest.slow();
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest(
  qase([685], 'Click view mode (From right top click) - no boards created'),
  async () => {
    await mainTest.step('Open view mode from the top right button', async () => {
      const newPage = await viewModePage.clickViewModeButton();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
    });

    await mainTest.step('Verify view mode page is displayed', async () => {
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'no-board-view-mode-page-image.png',
      );
    });
  },
);

mainTest(
  qase([688], 'Click view mode (From shortcut G+V) - board is created'),
  async () => {
    await mainTest.step('Create board', async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Open view mode from the G+V shortcut', async () => {
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
    });

    await mainTest.step('Verify view mode page is displayed', async () => {
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'view-mode-page-image.png',
      );
    });
  },
);

mainTest(qase([690], 'Full screen on/off'), async () => {
  await mainTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await mainTest.step('Enter and exit full screen mode', async () => {
    await viewModePage.clickFullScreenButton();
    await viewModePage.exitFullScreenMode();
  });

  await mainTest.step('Verify view mode page is displayed', async () => {
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-page-image.png',
    );
  });
});

mainTest(qase([698], 'Click arrows to navigate to other boards'), async () => {
  await mainTest.step('Create two boards and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultBoardByCoordinates(500, 500, true);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await mainTest.step('Verify first board is displayed', async () => {
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'first-board-view-mode-page-image.png',
    );
  });

  await mainTest.step(
    'Navigate to next board with the next arrow and verify',
    async () => {
      await viewModePage.clickNextButton();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'second-board-view-mode-page-image.png',
      );
    },
  );

  await mainTest.step(
    'Navigate back to previous board with the prev arrow and verify',
    async () => {
      await viewModePage.clickPrevButton();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
    },
  );

  await mainTest.step(
    'Navigate to next board with the next arrow again and verify',
    async () => {
      await viewModePage.clickNextButton();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'second-board-view-mode-page-image.png',
      );
    },
  );

  await mainTest.step(
    'Navigate back to previous board with the prev arrow again and verify',
    async () => {
      await viewModePage.clickPrevButton();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
    },
  );
});

mainTest(qase([700], 'Click Back icon to reset view'), async () => {
  await mainTest.step('Create three boards and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultBoardByCoordinates(500, 500, true);
    await mainPage.waitForChangeIsSaved();
    await mainPage.createDefaultBoardByCoordinates(100, 100, true);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await mainTest.step('Verify first board is displayed', async () => {
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'first-board-view-mode-page-image.png',
    );
  });

  await mainTest.step('Navigate to second board and verify', async () => {
    await viewModePage.clickNextButton();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'second-board-view-mode-page-image.png',
    );
  });

  await mainTest.step('Navigate to third board and verify', async () => {
    await viewModePage.clickNextButton();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'third-board-view-mode-page-image.png',
    );
  });

  await mainTest.step(
    'Click Back icon and verify view resets to first board',
    async () => {
      await viewModePage.clickResetButton();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'first-board-view-mode-page-image.png',
      );
    },
  );
});

mainTest(
  qase([699], 'Click board dropdown to navigate to other boards'),
  async () => {
    await mainTest.step('Create two boards and open view mode', async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await mainPage.createDefaultBoardByCoordinates(500, 500, true);
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
    });

    await mainTest.step('Open board dropdown and verify its options', async () => {
      await viewModePage.clickSelectBoardDropdown();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'board-dropdown-view-mode-page-image.png',
      );
    });

    await mainTest.step('Select second board from dropdown and verify', async () => {
      await viewModePage.selectSecondBoard();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'second-board-selected-view-mode-page-image.png',
      );
    });

    await mainTest.step('Select first board from dropdown and verify', async () => {
      await viewModePage.selectFirstBoard();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'first-board-selected-view-mode-page-image.png',
      );
    });
  },
);

mainTest(qase([689], 'Interactions dropdown'), async () => {
  await mainTest.step(
    'Create two boards with a prototype connection and open view mode',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.createDefaultBoardByCoordinates(500, 500, true);
      await mainPage.waitForChangeIsSaved();
      await prototypePanelPage.clickPrototypeTab();
      await prototypePanelPage.dragAndDropPrototypeArrowConnector(300, 300);
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
    },
  );

  await mainTest.step(
    'Open interactions dropdown and verify default options',
    async () => {
      await viewModePage.clickInteractionsDropdown();
      await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
        'show-on-click-interactions-options-default-image.png',
      );
    },
  );

  await mainTest.step('Enable Show interactions option and verify', async () => {
    await viewModePage.selectShowInteractionsOptions();
    await viewModePage.clickInteractionsDropdown();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'show-interactions-board-view-mode-page-image.png',
    );
  });

  await mainTest.step(
    'Open interactions dropdown again and verify show options',
    async () => {
      await viewModePage.clickInteractionsDropdown();
      await expect(viewModePage.interactionsDropdownOptions).toHaveScreenshot(
        'interactions-show-options-image.png',
      );
    },
  );

  await mainTest.step(
    'Enable Show on click interactions option and verify',
    async () => {
      await viewModePage.selectShowOnClickInteractionsOptions();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'show-on-click-interactions-board-view-mode-page-image.png',
      );
    },
  );

  await mainTest.step(
    'Open interactions dropdown once more and verify board state',
    async () => {
      await viewModePage.clickInteractionsDropdown();
      await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
        'show-on-click-interactions-board-view-mode-page-image2.png',
      );
    },
  );
});

mainTest(qase([691], 'Change scale'), async () => {
  await mainTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await mainPage.waitForChangeIsSaved();
    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await mainTest.step('Open scale dropdown and verify its options', async () => {
    await viewModePage.openScaleDropdown();
    await expect(viewModePage.scaleDropdownOptions).toHaveScreenshot(
      'scale-dropdown-view-mode-page-image.png',
    );
  });

  await mainTest.step('Downscale board and verify', async () => {
    await viewModePage.clickDownscaleButton();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'downscale-board-view-mode-page-image.png',
    );
  });

  await mainTest.step('Reset scale and upscale board and verify', async () => {
    await viewModePage.clickResetScaleButton();
    await viewModePage.clickUpscaleButton();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'upscale-board-view-mode-page-image.png',
    );
  });

  await mainTest.step('Select Fit scale option and verify', async () => {
    await viewModePage.selectFitScaleOptions();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'fit-scale-board-view-mode-page-image.png',
    );
  });

  await mainTest.step('Select Fill scale option and verify', async () => {
    await viewModePage.selectFillScaleOptions();
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'fill-scale-board-view-mode-page-image.png',
    );
  });

  await mainTest.step('Select Full screen scale option and verify', async () => {
    await viewModePage.selectFullScreenScaleOptions();
    await expect(viewModePage.fullScreenSection).toHaveScreenshot(
      'full-screen-scale-board-view-mode-page-image.png',
    );
  });

  await mainTest.step(
    'Reset scale from full screen mode and verify default scale',
    async () => {
      await viewModePage.clickResetScaleButton();
      await expect(viewModePage.fullScreenSection).toHaveScreenshot(
        'full-screen-default-scale-board-view-mode-page-image.png',
      );
    },
  );
});

mainTest(qase([708], 'Page dropdown'), async () => {
  await mainTest.step(
    'Create board and a second page and open view mode',
    async () => {
      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.clickAddPageButton();
      await mainPage.waitForChangeIsSaved();
      const newPage = await viewModePage.clickViewModeShortcut();
      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);
    },
  );

  await mainTest.step('Open page dropdown and verify its options', async () => {
    await viewModePage.openPageDropdown();
    await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
      'page-list-image.png',
    );
  });

  await mainTest.step('Select Page 2 and verify', async () => {
    await viewModePage.selectPageByName('Page 2');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-2page-image.png',
    );
  });

  await mainTest.step(
    'Open page dropdown again and verify its options',
    async () => {
      await viewModePage.openPageDropdown();
      await expect(viewModePage.pageDropdownOptions).toHaveScreenshot(
        'page-list-image2.png',
      );
    },
  );

  await mainTest.step('Select Page 1 and verify', async () => {
    await viewModePage.selectPageByName('Page 1');
    await expect(viewModePage.viewerLayoutSection).toHaveScreenshot(
      'view-mode-1page-image.png',
    );
  });
});

mainTest(qase([705], 'Edit file'), async ({ page }) => {
  await mainTest.step('Create board and open view mode', async () => {
    await mainPage.createDefaultBoardByCoordinates(300, 300);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();

    const newPage = await viewModePage.clickViewModeShortcut();
    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);
  });

  await mainTest.step(
    'Click Edit button and verify it switches to the workspace',
    async () => {
      await viewModePage.clickEditButton();
      const newPage = viewModePage.page;
      await newPage.waitForTimeout(2000);
      await viewModePage.isPageSwitched(newPage);
    },
  );

  await mainTest.step(
    'Close workspace tab and reopen it from view mode',
    async () => {
      await page.close();
      await viewModePage.clickEditButton();
      const oldPage = await viewModePage.clickEditButton(false);
      mainPage = new MainPage(oldPage);
      teamPage = new TeamPage(oldPage);
      await mainPage.waitForViewportVisible();
    },
  );

  await mainTest.step('Verify workspace page is opened', async () => {
    await expect(mainPage.viewport).toHaveScreenshot('main-page-opened.png', {
      mask: mainPage.maskViewport(),
    });
  });
});
