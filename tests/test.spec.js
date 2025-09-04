const { test } = require('@playwright/test');
const { updateTestResults } = require('../helpers/saveTestResults');

test.describe('Sample Test Suite', () => {
  test.afterEach(async ({}, testInfo) => {
    await updateTestResults(testInfo.status, testInfo.retry);
  });

  test('should pass when true is true', async () => {
    test.expect(true).toBe(true);
  });

  test('should fail when false is true', async () => {
    test.expect(false).toBe(true); // This test will fail
  });
});
