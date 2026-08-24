interface D1Result {
  success: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T = unknown>(): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const FREE_LIMIT_PER_DAY = 5;
const MAX_PROMPT_LENGTH = 300;
const DEFAULT_MODEL = 'claude-sonnet-5';

interface FunctionUsed {
  name: string;
  description: string;
}

interface BuilderResult {
  measureName?: unknown;
  formula?: unknown;
  explanation?: unknown;
  functionsUsed?: unknown;
  error?: unknown;
}

const SYSTEM_PROMPT = `You are a DAX formula assistant for Power BI. Given a plain-English description of a calculation, produce a single well-formed DAX measure.

Respond with ONLY a JSON object (no markdown fences, no text outside the JSON) in exactly this shape:
{
  "measureName": "A short measure name, e.g. \\"Total Sales\\"",
  "formula": "The complete DAX expression (the part after 'MeasureName =', formatted with line breaks and indentation)",
  "explanation": "2-4 plain-English sentences on what the formula does and why it's written this way",
  "functionsUsed": [{ "name": "FUNCTIONNAME", "description": "one sentence on what it does here" }]
}

Rules:
- Prefer DIVIDE() over the / operator for any division.
- Prefer VAR/RETURN once the expression needs more than one nested function call.
- If the request is ambiguous, make a reasonable assumption and state it briefly in the explanation — you cannot ask a follow-up question.
- If the request has nothing to do with DAX, Power BI, or a tabular data calculation, respond instead with {"error": "a short one-sentence explanation"} and omit the other fields.
- Never wrap the formula in markdown code fences.`;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function hashClientId(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  let prompt: unknown;
  try {
    const body = (await request.json()) as { prompt?: unknown };
    prompt = body?.prompt;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return json({ error: 'Describe what you want to calculate.' }, 400);
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return json({ error: `Keep it under ${MAX_PROMPT_LENGTH} characters.` }, 400);
  }

  const clientId = await hashClientId(request.headers.get('CF-Connecting-IP') ?? 'unknown');

  let usedToday = 0;
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM dax_builder_usage WHERE client_id = ? AND created_at >= datetime('now', '-1 day')`,
    )
      .bind(clientId)
      .first<{ count: number }>();
    usedToday = row?.count ?? 0;
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }

  if (usedToday >= FREE_LIMIT_PER_DAY) {
    return json(
      { error: `You've used all ${FREE_LIMIT_PER_DAY} free requests for today. Try again tomorrow.` },
      429,
    );
  }

  let result: BuilderResult;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
        max_tokens: 800,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: trimmedPrompt }],
      }),
    });

    if (!res.ok) {
      return json({ error: 'The formula builder is temporarily unavailable. Please try again shortly.' }, 502);
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === 'text')?.text ?? '';
    result = JSON.parse(text) as BuilderResult;
  } catch {
    return json({ error: 'The formula builder is temporarily unavailable. Please try again shortly.' }, 502);
  }

  if (typeof result.error === 'string') {
    return json({ error: result.error }, 422);
  }

  if (typeof result.formula !== 'string' || typeof result.explanation !== 'string') {
    return json({ error: 'Something went wrong generating that formula. Please try again.' }, 502);
  }

  try {
    await env.DB.prepare('INSERT INTO dax_builder_usage (client_id) VALUES (?)').bind(clientId).run();
  } catch {
    // Non-fatal — the generated formula is still returned even if usage logging fails.
  }

  const functionsUsed: FunctionUsed[] = Array.isArray(result.functionsUsed)
    ? result.functionsUsed.filter(
        (item): item is FunctionUsed =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as FunctionUsed).name === 'string' &&
          typeof (item as FunctionUsed).description === 'string',
      )
    : [];

  return json(
    {
      measureName: typeof result.measureName === 'string' ? result.measureName : 'Measure',
      formula: result.formula,
      explanation: result.explanation,
      functionsUsed,
      remaining: Math.max(0, FREE_LIMIT_PER_DAY - usedToday - 1),
    },
    200,
  );
}
