import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID: string;
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
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return json({ error: 'Billing is temporarily unavailable.' }, 500);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/api/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tools/dax-formula-builder?canceled=1`,
    });

    if (!session.url) {
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }

    return json({ url: session.url }, 200);
  } catch (err) {
    // TEMP-DEBUG: remove `debug` field once the live checkout failure is diagnosed.
    return json(
      { error: 'Something went wrong. Please try again.', debug: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
}
