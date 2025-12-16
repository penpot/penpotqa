const { readResultsFromFile } = require('./saveTestResults');

async function generateMessage(
  browserName,
  folderPath = null,
  isManualExecution = false,
  username = null,
  smartReportUrl = null,
) {
  function roundNumber(num) {
    return Math.round(num * 100) / 100;
  }
  const results = await readResultsFromFile();

  if (!results) {
    return 'Error: Could not read test results';
  }

  // Build the folder line if folderPath is provided
  const folderLine = folderPath
    ? `\n       :file_folder: Folder: ${folderPath}`
    : '';

  // Build the user mention line with workflow name
  let workflowName = '';
  if (isManualExecution) {
    workflowName = 'PR_manual';
  } else if (browserName && browserName.toLowerCase() === 'firefox') {
    workflowName = 'PRE_firefox';
  } else if (browserName && browserName.toLowerCase() === 'webkit') {
    workflowName = 'PRE_webkit';
  } else if (browserName && browserName.toLowerCase() === 'chrome') {
    workflowName = 'PRE_chrome_daily';
  }

  const userMentionLine =
    username && workflowName
      ? `\n       :wave: @${username} your \"${workflowName}\" automated run has finished!`
      : '';

  // Build smart report line if URL is provided
  const smartReportLine =
    smartReportUrl && smartReportUrl.trim() !== ''
      ? `\n       :chart_with_upwards_trend: Smart Report: ${smartReportUrl}`
      : '';

  console.log('Smart Report URL received:', smartReportUrl);
  console.log('Smart Report Line:', smartReportLine);

  const messageWithLink = `**Total Tests** : **${
    results.Passed + results.Failed + results.Flaky
  }**   :person_doing_cartwheel:   **Success Percentage:** **${roundNumber(
    results.PercentPassed,
  )}%**
       :white_check_mark: Success: ${results.Passed}
       :x: Failure: ${results.Failed}
       :ballot_box_with_check: Flaky: ${results.Flaky}
       :cat2: GitRun: https://github.com/penpot/penpotqa/actions/runs/${
         process.env.GITHUB_RUN_ID
       }
       :computer: Browser: ${browserName}${folderLine}${userMentionLine}
       :page_facing_up: Check interactive tests results: https://kaleidos-qa-reports.s3.eu-west-1.amazonaws.com/run-${
         process.env.GITHUB_RUN_ID
       }/index.html${smartReportLine}`;

  console.log(messageWithLink);
  return messageWithLink;
}

module.exports = { generateMessage };
