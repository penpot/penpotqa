const { request } = require('@playwright/test');
const { ApiClient } = require('./apiClient');

/**
 * Logs in using the API access token and returns a Playwright storageState.
 *
 * Purpose:
 *   - Authenticate a user via the Penpot API without using the UI.
 *   - Return a `storageState` object containing cookies and session info.
 *   - Allows Playwright tests to start with an already logged-in context.
 *
 * Usage:
 *   const storageState = await apiLoginAccessToken();
 *   const context = await browser.newContext({ storageState });
 */
async function apiLoginAccessToken() {
  const api = new ApiClient(process.env.BASE_URL, process.env.LOGIN_ACCESS_TOKEN);
  await api.init();

  const response = await api.post('login-with-password', {
    email: process.env.LOGIN_EMAIL,
    password: process.env.LOGIN_PWD,
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }

  const storageState = await api.storageState();
  await api.dispose();

  return storageState;
}

// /**
//  * Logs in using the API and returns a fresh storageState object.
//  * This can then be passed into browser.newContext({ storageState }).
//  */
// async function apiLoginAccessToken() {
//   const apiContext = await request.newContext({ baseURL: process.env.BASE_URL });

//   const response = await apiContext.post('api/rpc/command/login-with-password', {
//     data: {
//       email: process.env.LOGIN_EMAIL,
//       password: process.env.LOGIN_PWD,
//     },
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Token ${process.env.LOGIN_ACCESS_TOKEN}`,
//     },
//   });

//   if (!response.ok()) {
//     throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
//   }

//   const storageState = await apiContext.storageState();
//   await apiContext.dispose();

//   return storageState;
// }

module.exports = { apiLoginAccessToken };
