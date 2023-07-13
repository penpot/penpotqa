const { test } = require("@playwright/test");
const { LoginPage } = require("../pages/login-page")
const { RegisterPage } = require("../pages/register-page")

test("ON-5 Sign up with invalid email address",async ({page}) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail('test.com');
  await registerPage.enterPassword(process.env.LOGIN_PWD);
  await registerPage.isEmailInputErrorDisplayed('Enter a valid email please');
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test("ON-6 Sign up with no password", async ({page}) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail(process.env.LOGIN_EMAIL);
  await registerPage.clickOnPasswordInput();
  await registerPage.clickOnHeader();
  await registerPage.isPasswordInputErrorDisplayed('Password should at least be 8 characters')
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});

test("ON-7 Sign up with incorrect password", async ({page}) => {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  await loginPage.goto();
  await loginPage.clickOnCreateAccount();
  await registerPage.isRegisterPageOpened();
  await registerPage.enterEmail(process.env.LOGIN_EMAIL);
  await registerPage.enterPassword('1234');
  await registerPage.isPasswordInputErrorDisplayed('Password should at least be 8 characters')
  await registerPage.isCreateAccountBtnDisplayed();
  await registerPage.isCreateAccountBtnDisabled();
});


