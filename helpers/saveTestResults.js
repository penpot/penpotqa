const fs = require('fs');

async function readResultsFromFile() {
  try {
    return JSON.parse(fs.readFileSync('testResults.json', 'utf8'));
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null;
  }
}

async function updateTestResults(result, retryCount) {
  if (!fs.existsSync('testResults.json')) {
    const initialResults = { Passed: 0, Failed: 0, Flaky: 0, PercentPassed: 0 };
    try {
      fs.writeFileSync('testResults.json', JSON.stringify(initialResults, null, 2));
      console.log('Test results file created:', initialResults);
    } catch (err) {
      console.error('Error creating testResults.json:', err);
      return;
    }
  }

  let testResults;
  try {
    const data = fs.readFileSync('testResults.json', 'utf8');
    testResults = JSON.parse(data);
  } catch (err) {
    console.error('Error reading testResults.json:', err);
    return;
  }

  if (result === 'passed' && retryCount === 0) {
    testResults.Passed++;
  } else if (result === 'failed' && retryCount === 2) {
    testResults.Failed++;
  } else if (result === 'timedOut' && retryCount === 2) {
    testResults.Failed++;
  } else if (result === 'flaky') {
    testResults.Flaky++;
  } else if (result === 'passed' && retryCount > 0) {
    testResults.Flaky++;
  }

  const totalTests = testResults.Passed + testResults.Failed + testResults.Flaky;
  testResults.PercentPassed = (testResults.Passed / totalTests) * 100;

  try {
    fs.writeFileSync('testResults.json', JSON.stringify(testResults, null, 2));
    console.log('Test results updated:', testResults);
  } catch (err) {
    console.error('Error writing testResults.json:', err);
  }
}

module.exports = { readResultsFromFile, updateTestResults };
