const { request } = require('@playwright/test');

/**
 * Logs in using the API and returns a fresh storageState object.
 * This can then be passed into browser.newContext({ storageState }).
 */
async function apiLoginAccessToken() {
  const apiContext = await request.newContext({ baseURL: process.env.BASE_URL });

  const response = await apiContext.post('api/rpc/command/login-with-password', {
    data: {
      email: process.env.LOGIN_EMAIL,
      password: process.env.LOGIN_PWD,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${process.env.LOGIN_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }

  const storageState = await apiContext.storageState();
  await apiContext.dispose();

  return storageState;
}

module.exports = { apiLoginAccessToken };
