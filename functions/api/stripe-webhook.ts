import Stripe from 'stripe';
import type { D1Database } from '../_lib/types';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (!event.type.startsWith('customer.subscription.')) {
    return new Response('ok', { status: 200 });
  }

  const subscription = event.data.object as Stripe.Subscription;

  // The Stripe account is shared with other sites/products — only track subscriptions
  // for pbidocs' own price, or another product's subscribers would get pbidocs access too.
  const matchesOwnPrice = subscription.items.data.some((item) => item.price?.id === env.STRIPE_PRICE_ID);
  if (!matchesOwnPrice) {
    return new Response('ignored: not pbidocs price', { status: 200 });
  }

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null;

  try {
    await env.DB.prepare(
      `INSERT INTO stripe_subscriptions (customer_id, subscription_id, status, current_period_end, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(customer_id) DO UPDATE SET
         subscription_id = excluded.subscription_id,
         status = excluded.status,
         current_period_end = excluded.current_period_end,
         updated_at = datetime('now')`,
    )
      .bind(customerId, subscription.id, subscription.status, currentPeriodEnd)
      .run();
  } catch {
    // Non-200 tells Stripe to retry the webhook.
    return new Response('Storage error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
