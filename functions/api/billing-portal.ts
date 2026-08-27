import Stripe from 'stripe';
import { getSubscriberCookieValue, verifySubscriberCookie } from '../_lib/cookie';

interface Env {
  STRIPE_SECRET_KEY: string;
  COOKIE_SIGNING_SECRET: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  const cookieValue = getSubscriberCookieValue(request);
  const payload = cookieValue ? await verifySubscriberCookie(cookieValue, env.COOKIE_SIGNING_SECRET) : null;

  if (!payload) {
    return json({ error: 'No active subscription found.' }, 401);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  const origin = new URL(request.url).origin;

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: payload.cid,
      return_url: `${origin}/tools/dax-formula-builder`,
    });
    return json({ url: portalSession.url }, 200);
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
