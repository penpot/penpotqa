const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { expect } = require("@playwright/test");

mainTest("Create a board", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkHtmlOfCreatedObject(
    '<rect rx="0" ry="0" x="630" y="410" transform="" width="100" height="100" class="frame-background" style="fill: rgb(255, 255, 255); fill-opacity: 1;"></rect>'
  );
  await expect(page).toHaveScreenshot("board.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a rectangle", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateRectangleButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkHtmlOfCreatedObject(
    '<rect rx="0" ry="0" x="630" y="410" transform="" width="100" height="100" style="fill: rgb(177, 178, 181); fill-opacity: 1;"></rect>'
  );
  await expect(page).toHaveScreenshot("rectangle.png", {
    mask: [mainPage.usersSection],
  });
});
mainTest("Create an ellipse", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateEllipseButton();
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkHtmlOfCreatedObject(
    '<ellipse rx="50" ry="50" cx="680" cy="460" transform="" style="fill: rgb(177, 178, 181); fill-opacity: 1;"></ellipse>'
  );
  await expect(page).toHaveScreenshot("ellipse.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a text", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateTextButton();
  await mainPage.clickViewport();
  await mainPage.typeText("Hello World!");
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkHtmlOfCreatedObject(
    '<text y="459" textLength="72.4375" lengthAdjust="spacingAndGlyphs" x="680" dominant-baseline="text-before-edge" style="text-transform: none; font-family: sourcesanspro; letter-spacing: normal; font-style: normal; font-weight: 400; white-space: pre; font-size: 14px; text-decoration: none solid rgb(0, 0, 0); direction: ltr; fill: rgb(0, 0, 0); fill-opacity: 1;">Hello World!</text>'
  );
  await expect(page).toHaveScreenshot("text.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Import an image", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.uploadImage("images/images.png");
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkPartialHtmlOfCreatedObject(
    '<rect rx="0" ry="0" x="528.5" y="395.5" transform="" width="303" height="130" fill='
  );
  await expect(page).toHaveScreenshot("image.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a curve", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreateCurveButton();
  await mainPage.drawCurve(900, 300, 600, 200);
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkHtmlOfCreatedObject(
    '<path rx="0" ry="0" d="M596,252L296,152"></path>'
  );
  await expect(page).toHaveScreenshot("curve.png", {
    mask: [mainPage.usersSection],
  });
});

mainTest("Create a path", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.clickCreatePathButton();
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewportByCoordinates(1200, 700);
  await mainPage.clickViewportByCoordinates(1000, 400);
  await mainPage.clickViewportByCoordinates(500, 200);
  await mainPage.clickViewport();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedObjectVisible();
  await mainPage.checkHtmlOfCreatedObject(
    '<path rx="0" ry="0" d="M196,152L896,652L696,352L196,152ZM680,460"></path>'
  );
  await expect(page).toHaveScreenshot("path.png", {
    mask: [mainPage.usersSection],
  });
});
