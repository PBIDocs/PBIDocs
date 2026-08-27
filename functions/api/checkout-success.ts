import Stripe from 'stripe';
import { buildSubscriberSetCookieHeader, signSubscriberCookie } from '../_lib/cookie';

interface Env {
  STRIPE_SECRET_KEY: string;
  COOKIE_SIGNING_SECRET: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

export async function onRequestGet({ request, env }: RequestContext): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  const redirectTo = `${url.origin}/tools/dax-formula-builder`;

  if (!sessionId || !env.STRIPE_SECRET_KEY || !env.COOKIE_SIGNING_SECRET) {
    return Response.redirect(redirectTo, 302);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== 'complete' || typeof session.customer !== 'string') {
      return Response.redirect(redirectTo, 302);
    }

    const token = await signSubscriberCookie(session.customer, env.COOKIE_SIGNING_SECRET);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${redirectTo}?subscribed=1`,
        'Set-Cookie': buildSubscriberSetCookieHeader(token),
      },
    });
  } catch {
    return Response.redirect(redirectTo, 302);
  }
}
