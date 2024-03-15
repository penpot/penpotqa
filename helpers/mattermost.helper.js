const axios = require('axios');
const { readResultsFromFile } = require('./saveTestResults');

class TokenRetriever {
  constructor() {
    this.baseUrl = 'https://chat.kaleidos.net/api/v4';
    this.channel_id = 'athjkcftxjyuux5qx64ha9dzsr'
  }

  async getToken(loginId, password) {
    const url = `${this.baseUrl}/users/login`;
    const requestBody = { login_id: loginId, password: password };

    try {
      const response = await axios.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      return  response.headers['Token'];
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async sendMessage() {
    const url = `${this.baseUrl}/posts`;
    const token = await this.getToken();

    const results = await readResultsFromFile()
    const messageWithLink =
      `Total Tests: ${results.Passed+results.Failed+results.Flaky}\n
       :white_check_mark: Success Percentage: ${results.PercentPassed}%\n
       :white_check_mark: Success: ${results.Passed}%\n
       :x: Failure: ${results.Failed}\n
       :ballot_box_with_check: Flaky: ${results.Flaky}\n
       \n
       GitRun: https://github.com/penpot/penpotqa/actions/runs/${process.env.GITHUB_RUN_ID}\n`;
    const requestBody = { channel_id: this.channel_id, message: messageWithLink };

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

module.exports = TokenRetriever;
