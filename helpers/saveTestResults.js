const fs = require('fs');

async function readResultsFromFile() {
  try {
    const report = JSON.parse(
      fs.readFileSync('playwright-report/results.json', 'utf8'),
    );
    const { expected = 0, unexpected = 0, flaky = 0 } = report.stats || {};
    const totalTests = expected + unexpected + flaky;
    const percentPassed = totalTests ? ((expected + flaky) / totalTests) * 100 : 0;

    return {
      Passed: expected,
      Failed: unexpected,
      Flaky: flaky,
      PercentPassed: percentPassed,
    };
  } catch (error) {
    console.error('Error reading playwright-report/results.json:', error);
    return null;
  }
}

module.exports = { readResultsFromFile };
