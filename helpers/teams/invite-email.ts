import { random } from 'helpers/string-generator';

type InviteRole = 'editor' | 'admin';

export function createInviteEmail(role: InviteRole, tag?: string) {
  const name = process.env.GMAIL_NAME;
  const domain = process.env.GMAIL_DOMAIN;

  if (!name || !domain) {
    throw new Error('Missing GMAIL_NAME or GMAIL_DOMAIN env vars');
  }

  const unique = tag ?? `${Date.now()}${random()}`;

  return `${name}+${role}+${unique}${domain}`;
}
