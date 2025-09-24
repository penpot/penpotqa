const axios = require('axios');
const { readResultsFromFile } = require('./saveTestResults');
// const fs = require('fs')
// const FormData = require('form-data');

const baseUrl = 'https://chat.kaleidos.net/api/v4';
const channel_id = `${process.env.CHANNEL_ID}`;

async function getToken() {
  const url = `${baseUrl}/users/login`;
  const requestBody = {
    login_id: `${process.env.LOGIN_ID_MATTERMOST}`,
    password: `${process.env.PASSWORD_MATTERMOST}`,
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.headers['token'];
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// async function uploadFile() {
//   const url = `${baseUrl}/files`;
//
//   const token = await getToken();
//
//   const fileBuffer = fs.readFileSync('playwright-report.zip');
//   const filename = 'playwright-report.zip';
//
//
//
//   const formData = new FormData();
//   formData.append('channel_id', channel_id);
//   formData.append('files', fileBuffer, { filename });
//
//
//   try {
//     const response = await axios.post(url, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         Authorization: `Bearer ${token}`,
//       },
//     });
//
//     console.log('Ответ сервера:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Ошибка загрузки файла:', error);
//     return null;
//   }
// }

async function sendMessage(browserName, folderPath = null) {
  const url = `${baseUrl}/posts`;
  const token = await getToken();

  // await uploadFile()
  function roundNumber(num) {
    return Math.round(num * 100) / 100;
  }
  const results = await readResultsFromFile();

  // Build the folder line if folderPath is provided
  const folderLine = folderPath
    ? `\n       :file_folder: Folder: ${folderPath}`
    : '';

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
       :computer: Browser: ${browserName}${folderLine}
       :page_facing_up: Check interactive tests results: https://penpot.github.io/penpotqa/`;
  const requestBody = { channel_id: channel_id, message: messageWithLink };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

module.exports = { sendMessage };
