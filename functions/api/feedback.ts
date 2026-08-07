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

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  let page: unknown;
  let helpful: unknown;
  try {
    const body = (await request.json()) as { page?: unknown; helpful?: unknown };
    page = body?.page;
    helpful = body?.helpful;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (typeof page !== 'string' || !page.startsWith('/') || page.length > 200) {
    return json({ error: 'Invalid page.' }, 400);
  }
  if (typeof helpful !== 'boolean') {
    return json({ error: 'Invalid feedback value.' }, 400);
  }

  try {
    await env.DB.prepare('INSERT INTO page_feedback (page, helpful) VALUES (?, ?)')
      .bind(page, helpful ? 1 : 0)
      .run();
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }

  return json({ ok: true }, 200);
}
