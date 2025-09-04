const { test } = require('@playwright/test');

test.describe('Sample Test Suite', () => {
  test('should pass when true is true', async () => {
    test.expect(true).toBe(true);
  });

  test('should fail when false is true', async () => {
    test.expect(false).toBe(true); // This test will fail
  });
});
