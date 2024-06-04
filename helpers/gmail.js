const { google } = require('googleapis');
const { expect } = require('@playwright/test');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const rToken = process.env.REFRESH_TOKEN;

async function authorize() {
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost");
  return await refreshToken(oAuth2Client);
}

async function refreshToken(oAuth2Client) {
  oAuth2Client.setCredentials({ refresh_token: rToken });
  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.access_token) {
      // console.log('New access token:', tokens.access_token);
      oAuth2Client.setCredentials(tokens);
    }
  });
  return oAuth2Client;
}

async function listMessages(auth, email) {
  const gmail = google.gmail({ version: 'v1', auth });

  async function searchMessages(label, email) {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `to:${email}`,
      labelIds: [label],
      maxResults: 10,
    });
    return res.data.messages || [];
  }

  const inboxMessages = await searchMessages('INBOX', email);
  const spamMessages = await searchMessages('SPAM', email);
  const messages = [...inboxMessages, ...spamMessages];

  const msg = await gmail.users.messages.get({
    userId: 'me',
    id: messages[0].id,
  });
  return Buffer.from(msg.data.payload.parts[0].parts[0].body.data, 'base64').toString('utf-8');
}

async function getRegisterMessage(email) {
  return authorize().then(async (auth) => {
    const body = await listMessages(auth, email);
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = body.match(urlRegex);
    if (match) {
      const url = match[0];
      const remainingText = body.replace(url, '').trim();
      return {
        inviteUrl: url,
        inviteText: remainingText
      };
    } else {
      console.log('No URL found in the text.');
      return null;
    }
  }).catch(console.error);
}

async function checkInviteText(text, team, user='k8q6byz') {
  const messageText = 'Hello!\r\n' +
    '\r\n' +
    `${user} has invited you to join the team “${team}”.\r\n` +
    '\r\n' +
    'Accept invitation using this link:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'Enjoy!\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkRegisterText(text, name) {
  const messageText = `Hello ${name}!\r\n` +
    '\r\n' +
    'Thanks for signing up for your Penpot account! Please verify your email using the\r\n' +
    'link below and get started building mockups and prototypes today!\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'Enjoy!\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkRecoveryText(text, name) {
  const messageText = `Hello ${name}!\r\n` +
    '\r\n' +
    'We received a request to reset your password. Click the link below to choose a\r\n' +
    'new one:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you received this email by mistake, you can safely ignore it. Your password\r\n' +
    "won't be changed.\r\n" +
    '\r\n' +
    'Enjoy!\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkNewEmailText(text, name, newEmail) {
  const messageText = `Hello ${name}!\r\n` +
    '\r\n' +
    `We received a request to change your current email to ${newEmail}.\r\n` +
    '\r\n' +
    'Click to the link below to confirm the change:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you received this email by mistake, please consider changing your password\r\n' +
    'for security reasons.\r\n' +
    '\r\n' +
    'Enjoy!\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

module.exports = {checkInviteText, getRegisterMessage, checkRegisterText, checkRecoveryText, checkNewEmailText};

