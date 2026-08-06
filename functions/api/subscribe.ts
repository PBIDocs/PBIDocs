interface D1Result {
  success: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  DB: D1Database;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  let email: unknown;
  try {
    const body = (await request.json()) as { email?: unknown };
    email = body?.email;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (typeof email !== 'string') {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  try {
    await env.DB.prepare('INSERT INTO subscribers (email) VALUES (?)').bind(normalized).run();
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (!message.toUpperCase().includes('UNIQUE')) {
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
    // Already subscribed - treat as success rather than leaking whether an email is on the list.
  }

  return json({ ok: true }, 200);
}
