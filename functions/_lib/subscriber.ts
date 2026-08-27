import type { D1Database } from './types';
import {
  buildSubscriberSetCookieHeader,
  getSubscriberCookieValue,
  signSubscriberCookie,
  verifySubscriberCookie,
} from './cookie';

const REVALIDATE_AFTER_SECONDS = 60 * 60 * 6; // 6 hours

export interface SubscriberResult {
  isSubscriber: boolean;
  setCookieHeader?: string;
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export async function checkSubscriber(
  request: Request,
  env: { DB: D1Database; COOKIE_SIGNING_SECRET?: string },
): Promise<SubscriberResult> {
  if (!env.COOKIE_SIGNING_SECRET) return { isSubscriber: false };

  const cookieValue = getSubscriberCookieValue(request);
  if (!cookieValue) return { isSubscriber: false };

  const payload = await verifySubscriberCookie(cookieValue, env.COOKIE_SIGNING_SECRET);
  if (!payload) return { isSubscriber: false };

  const ageSeconds = Math.floor(Date.now() / 1000) - payload.iat;
  if (ageSeconds < REVALIDATE_AFTER_SECONDS) {
    return { isSubscriber: true };
  }

  try {
    const row = await env.DB.prepare('SELECT status FROM stripe_subscriptions WHERE customer_id = ?')
      .bind(payload.cid)
      .first<{ status: string }>();

    if (!row || !ACTIVE_STATUSES.has(row.status)) {
      return { isSubscriber: false };
    }

    const freshToken = await signSubscriberCookie(payload.cid, env.COOKIE_SIGNING_SECRET);
    return { isSubscriber: true, setCookieHeader: buildSubscriberSetCookieHeader(freshToken) };
  } catch {
    // Fail open: a D1 outage shouldn't lock out an already-verified subscriber mid-session.
    return { isSubscriber: true };
  }
}
