import type { APIRequestContext } from '@playwright/test';
import { callPenpotApi } from 'helpers/api/penpot-api';

/**
 * Puts the logged-in profile in the onboarding state of a user who signed up
 * through a team invite: questions answered, team step still pending. Demo users
 * skip onboarding entirely, so without this Penpot never shows them the team
 * choice ("Continue without team") on Personal Projects, e.g. after leaving
 * their only team. Reload the page afterwards so the UI picks up the change.
 */
export async function setInvitedUserOnboarding(request: APIRequestContext) {
  await callPenpotApi(request, 'update-profile-props', {
    props: { onboardingViewed: false, onboardingQuestions: { role: 'manager' } },
  });
}
