const { readResultsFromFile } = require('./saveTestResults');

async function generateMessage(
  folderPath = null,
  repeatEach = null,
  isManualExecution = false,
  username = null,
  browserName = 'Chrome',
  reportSuffix = '',
) {
  function roundNumber(num) {
    return Math.round(num * 100) / 100;
  }
  function formatDuration(ms) {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  const results = await readResultsFromFile();

  if (!results) {
    return 'Error: Could not read test results';
  }

  // Build the folder line if folderPath is provided
  const folderLine = folderPath
    ? `\n       :file_folder: Folder: ${folderPath}`
    : '';

  const repeatEachLine = repeatEach
    ? `\n       :repeat: Repeat: x${repeatEach}`
    : '';

  // Build the user mention line with workflow name
  const workflowName = isManualExecution ? 'PR_manual' : 'PRE_chrome_daily';

  const userMentionLine = username
    ? `\n       :wave: @${username} your \"${workflowName}\" automated run has finished!`
    : '';

  const reportDir = reportSuffix
    ? `run-${process.env.GITHUB_RUN_ID}-${reportSuffix}`
    : `run-${process.env.GITHUB_RUN_ID}`;

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
       :stopwatch: Duration: ${formatDuration(results.Duration)}
       :computer: Browser: ${browserName}
       :herb: Branch: ${process.env.GITHUB_REF_NAME || 'N/A'}${folderLine}${repeatEachLine}${userMentionLine}
       :page_facing_up: Check interactive tests results: https://kaleidos-qa-reports.s3.eu-west-1.amazonaws.com/${reportDir}/index.html`;

  console.log(messageWithLink);
  return messageWithLink;
}

module.exports = { generateMessage };
