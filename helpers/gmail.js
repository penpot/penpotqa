const { google } = require('googleapis');
const { expect } = require('@playwright/test');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const rToken = process.env.REFRESH_TOKEN;
const urlRegex = /(https?:\/\/[^\s]+)/g;

async function authorize() {
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost',
  );
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

/** Searches both labels as ONE query, so results stay in Gmail's own
 * newest-first order — two separate per-label queries concatenated
 * together would not (e.g. a newer message in SPAM could still sort after
 * an older one in INBOX). */
async function findMessages(gmail, email) {
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: `to:${email} (in:inbox OR in:spam)`,
    maxResults: 10,
  });
  return res.data.messages || [];
}

async function listMessages(auth, email) {
  const gmail = google.gmail({ version: 'v1', auth });
  const messages = await findMessages(gmail, email);

  if (messages.length > 0) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: messages[0].id,
    });
    return Buffer.from(
      msg.data.payload.parts[0].parts[0].body.data,
      'base64',
    ).toString('utf-8');
  }
}

async function messagesCount(auth, email) {
  const gmail = google.gmail({ version: 'v1', auth });
  const messages = await findMessages(gmail, email);
  return messages.length;
}

async function checkMessagesCount(email, count) {
  return authorize()
    .then(async (auth) => {
      const actualCount = await messagesCount(auth, email);
      expect(actualCount).toEqual(count);
    })
    .catch(console.error);
}

async function getMessagesCount(email) {
  return authorize()
    .then(async (auth) => {
      return await messagesCount(auth, email);
    })
    .catch(console.error);
}

async function getRegisterMessage(email) {
  return authorize()
    .then(async (auth) => {
      const body = await listMessages(auth, email);
      if (body) {
        const match = body.match(urlRegex);
        if (match) {
          const url = match[0];
          const remainingText = body.replace(url, '').trim();
          return {
            inviteUrl: url,
            inviteText: remainingText,
          };
        } else {
          console.log('No URL found in the text.');
          return null;
        }
      }
    })
    .catch(console.error);
}

/** The most recent message's Subject header — listMessages() only decodes
 * the body. */
async function getMessageSubject(email) {
  return authorize()
    .then(async (auth) => {
      const gmail = google.gmail({ version: 'v1', auth });
      const messages = await findMessages(gmail, email);
      if (messages.length === 0) {
        return null;
      }

      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: messages[0].id,
        format: 'metadata',
        metadataHeaders: ['Subject'],
      });
      const subjectHeader = (msg.data.payload.headers || []).find(
        (header) => header.name === 'Subject',
      );
      return subjectHeader ? subjectHeader.value : null;
    })
    .catch(console.error);
}

async function getRequestAccessMessage(email) {
  return authorize()
    .then(async (auth) => {
      const body = await listMessages(auth, email);
      if (body) {
        const matches = Array.from(body.matchAll(urlRegex));
        if (matches) {
          const urls = matches.map((match) => match[0]);
          const remainingText = urls.reduce((acc, item) => {
            return acc.replace(item, '').trim();
          }, body);
          return {
            inviteUrl: urls,
            inviteText: remainingText,
          };
        } else {
          console.log('No URL found in the text.');
          return null;
        }
      }
    })
    .catch(console.error);
}

async function checkInviteText(text, team, user) {
  expect(text).toContain('Hello!');
  expect(text).toContain(`${user} has invited you to join the team "${team}".`);
  expect(text).toContain('Accept invitation using this link:');
  expect(text).toContain('Enjoy!');
  expect(text).toContain('The Penpot team.');
}

/** Same template as checkInviteText, but also names the org — only true
 * when the invitee is an EXISTING Penpot account; a fresh address gets the
 * plain team-only wording. No `user` param: the inviter is always a demo
 * account with a server-generated name. */
async function checkEnterpriseInviteText(text, team, org) {
  expect(text).toContain('Hello!');
  expect(text).toContain(`has invited you to join the team "${team}"`);
  expect(text).toContain(`part of the organization "${org}"`);
  expect(text).toContain('Accept invitation using this link:');
  expect(text).toContain('Enjoy!');
  expect(text).toContain('The Penpot team.');
}

/** Unlike the body (checkEnterpriseInviteText), the subject never names
 * the org, only the team. */
async function checkEnterpriseInviteSubject(subject, team, org) {
  expect(subject).toContain(team);
  expect(subject).not.toContain(org);
}

async function checkRegisterText(text, name) {
  const messageText =
    `Hi ${name},\r\n` +
    '\r\n' +
    'Welcome to Penpot!\r\n' +
    '\r\n' +
    'Please verify your email to get started with your first design and collaboration.\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'Enjoy!\r\n' +
    '\r\n' +
    'The Penpot team';
  await expect(text).toBe(messageText);
}

async function checkRecoveryText(text, name) {
  const messageText =
    `Hello ${name}!\r\n` +
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
  const messageText =
    `Hello ${name}!\r\n` +
    '\r\n' +
    `We received a request to change your current email to ${newEmail}.\r\n` +
    '\r\n' +
    'Click the link below to confirm the change.\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you did not request this change, consider changing your password for security reasons.\r\n' +
    '\r\n' +
    'Enjoy!\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkConfirmAccessText(text, name, email, teamName) {
  const messageText =
    'Hello!\r\n' +
    '\r\n' +
    '\r\n' +
    'Hello!\r\n' +
    '\r\n' +
    `${name} (${email.toLowerCase()}) has requested access to the file named “New File 1”.\r\n` +
    '\r\n' +
    'To provide this access, you have the following options:\r\n' +
    '\r\n' +
    `- Give Access to the “${teamName}” Team:\r\n` +
    '\r\n' +
    `This will automatically include ${name} in the team, so the user can see all the projects and files in it.\r\n` +
    '\r\n' +
    'Click the link below to provide team access:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '- Send a View-Only Link:\r\n' +
    '\r\n' +
    `Alternatively, you can create and share a view-only link to the file. This will allow ${name} to view the content without making any changes.\r\n` +
    '\r\n' +
    'Click the link below to generate and send the link:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you do not wish to grant access at this time, you can simply disregard this email.\r\n' +
    'Thank you\r\n' +
    '\r\n' +
    '\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkDashboardConfirmAccessText(text, name, email, teamName) {
  const messageText =
    'Hello!\r\n' +
    '\r\n' +
    `${name} (${email.toLowerCase()}) wants to have access to the “${teamName}” Team.\r\n` +
    '\r\n' +
    'To provide access, please click the link below:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you do not wish to grant access at this time, you can simply disregard this email.\r\n' +
    'Thank you\r\n' +
    '\r\n' +
    '\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkYourPenpotConfirmAccessText(text, name, email) {
  const messageText =
    'Hello!\r\n' +
    '\r\n' +
    '\r\n' +
    'Hello!\r\n' +
    '\r\n' +
    `${name} (${email.toLowerCase()}) has requested access to the file named “New File 1”.\r\n` +
    '\r\n' +
    'Please note that the file is currently in Personal Projects, so direct access cannot be granted. However, you have two options to provide the requested access:\r\n' +
    '\r\n' +
    `- Move the File to Another Team:\r\n` +
    '\r\n' +
    `You can move the file to another team and then give access to that team, inviting ${name}.\r\n` +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '- Send a View-Only Link:\r\n' +
    '\r\n' +
    `Alternatively, you can create and share a view-only link to the file. This will allow ${name} to view the content without making any changes.\r\n` +
    '\r\n' +
    'Click the link below to generate and send the link:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you do not wish to grant access at this time, you can simply disregard this email.\r\n' +
    'Thank you\r\n' +
    '\r\n' +
    '\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkYourPenpotViewModeConfirmAccessText(
  text,
  name,
  email,
  teamName,
) {
  const messageText =
    'Hello!\r\n' +
    '\r\n' +
    `${name} (${email.toLowerCase()}) wants to have view-only access to the file named “New File 1”.\r\n` +
    '\r\n' +
    `Since this file is in your Personal Projects, you can provide access by sending a view-only link. This will allow ${name} to view the content without making any changes.\r\n` +
    '\r\n' +
    'To proceed, please click the link below to generate and send the view-only link:\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'If you do not wish to grant access at this time, you can simply disregard this email.\r\n' +
    'Thank you\r\n' +
    '\r\n' +
    '\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function checkSigningText(text, name, teamName) {
  const messageText =
    'Hello!\r\n' +
    '\r\n' +
    `As you requested, ${name} has added you to the team “${teamName}”.\r\n` +
    '\r\n' +
    `Go to the team with this link:\r\n` +
    '\r\n' +
    '\r\n' +
    '\r\n' +
    'Enjoy!\r\n' +
    'The Penpot team.';
  await expect(text).toBe(messageText);
}

async function waitMessage(page, email, timeoutSec = 40) {
  const timeout = timeoutSec * 1000;
  const interval = 4000;
  const startTime = Date.now();
  let invite;

  await page.waitForTimeout(interval);
  while (Date.now() - startTime < timeout) {
    invite = await getRegisterMessage(email);
    if (invite) {
      return invite;
    }
    await page.waitForTimeout(interval);
  }

  if (!invite) {
    throw new Error('Timeout reached: invite is still undefined');
  }
}

async function waitSecondMessage(page, email, timeoutSec = 40) {
  const timeout = timeoutSec * 1000;
  const interval = 4000;
  const startTime = Date.now();
  let count = 0;

  await page.waitForTimeout(interval);
  while (Date.now() - startTime < timeout) {
    count = await getMessagesCount(email);
    if (count >= 2) {
      return 1;
    }
    await page.waitForTimeout(interval);
  }

  if (count < 2) {
    throw new Error(
      `Timeout reached: expected at least 2 messages, but got ${count}`,
    );
  }

  return 1;
}

/** Like waitSecondMessage(), but for an arbitrary target count — safe to
 * call repeatedly against the same inbox (e.g. once per loop iteration),
 * unlike waitSecondMessage()'s hardcoded >=2, which is already true after
 * the first call and would return instantly, letting waitMessage() return
 * a stale, already-read message. */
async function waitForMessageCount(page, email, count, timeoutSec = 40) {
  const timeout = timeoutSec * 1000;
  const interval = 4000;
  const startTime = Date.now();
  let actual = 0;

  await page.waitForTimeout(interval);
  while (Date.now() - startTime < timeout) {
    actual = await getMessagesCount(email);
    if (actual >= count) {
      return actual;
    }
    await page.waitForTimeout(interval);
  }

  throw new Error(
    `Timeout reached: expected at least ${count} messages for "${email}", got ${actual}`,
  );
}

async function waitRequestMessage(page, email, timeoutSec = 40) {
  const timeout = timeoutSec * 1000;
  const interval = 4000;
  const startTime = Date.now();
  let invite;

  await page.waitForTimeout(interval);
  while (Date.now() - startTime < timeout) {
    invite = await getRequestAccessMessage(email);
    if (invite) {
      return invite;
    }
    await page.waitForTimeout(interval);
  }

  if (!invite) {
    throw new Error('Timeout reached: invite is still undefined');
  }
}

async function getVerificationMessage(email) {
  const msg = await getRegisterMessage(email);
  if (!msg?.inviteUrl) {
    throw new Error(
      `No verification email with URL found for ${email}. Gmail API may have failed or the email was not delivered.`,
    );
  }
  return msg;
}

module.exports = {
  checkInviteText,
  checkEnterpriseInviteText,
  checkEnterpriseInviteSubject,
  getRegisterMessage,
  getMessageSubject,
  getVerificationMessage,
  checkRegisterText,
  checkRecoveryText,
  checkNewEmailText,
  checkMessagesCount,
  checkConfirmAccessText,
  checkDashboardConfirmAccessText,
  checkYourPenpotConfirmAccessText,
  checkYourPenpotViewModeConfirmAccessText,
  checkSigningText,
  waitMessage,
  waitSecondMessage,
  waitForMessageCount,
  waitRequestMessage,
};
