import type { Page } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';

/** Opens a file in the editor straight from its URL (no dashboard navigation). */
export async function openFileInWorkspace(
  page: Page,
  teamId: string,
  fileId: string,
): Promise<MainPage> {
  const mainPage = new MainPage(page);
  await page.goto(`/?screen=workspace&team-id=${teamId}&file-id=${fileId}`);
  await mainPage.acceptCookie();
  await mainPage.isMainPageLoaded();
  // An empty file opens with the board tool selected, so a click on the canvas draws a board
  await mainPage.clickMoveButton();
  return mainPage;
}
