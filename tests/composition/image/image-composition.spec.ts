import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.describe('PNG image', () => {
  mainTest.beforeEach(async () => {
    await mainPage.uploadImage('images/images.png');
  });
});

mainTest.describe('JPEG image', () => {
  mainTest.beforeEach(async () => {
    await mainPage.uploadImage('images/sample.jpeg');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([1270], 'Change rotation (Design page in the right)'), async () => {
    await mainTest.step('Set rotation to 90 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 90 should match snapshot',
      ).toHaveScreenshot('image-rotated-90.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Set rotation to 120 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 120 should match snapshot',
      ).toHaveScreenshot('image-rotated-120.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Set rotation to 45 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 45 should match snapshot',
      ).toHaveScreenshot('image-rotated-45.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Set rotation to 360 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(
        mainPage.viewport,
        'Rotation 360 should match snapshot',
      ).toHaveScreenshot('image-rotated-359.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase(
      [474],
      'Flip Vertical and Flip Horizontal image (From right click and Shortcut Shift +V Shift + H)',
    ),
    async () => {
      await mainTest.step(
        'Flip image vertically via right click and verify',
        async () => {
          await mainPage.flipVerticalViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped vertical should match snapshot',
          ).toHaveScreenshot('image-flipped-vertical.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        'Flip image horizontally via right click and verify',
        async () => {
          await mainPage.flipHorizontalViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped vertical and horizontal should match snapshot',
          ).toHaveScreenshot('image-flipped-vertical-horizontal.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        'Flip image vertically via shortcut and verify',
        async () => {
          await mainPage.flipVerticalViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Flipped horizontal should match snapshot',
          ).toHaveScreenshot('image-flipped-horizontal.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await mainTest.step(
        'Flip image horizontally via shortcut and verify',
        async () => {
          await mainPage.flipHorizontalViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Non-flipped JPEG should match snapshot',
          ).toHaveScreenshot('image-non-flipped-jpeg.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});
