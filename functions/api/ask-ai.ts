import type { D1Database } from '../_lib/types';
import { checkSubscriber } from '../_lib/subscriber';

interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL?: string;
  COOKIE_SIGNING_SECRET?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const FREE_LIMIT_PER_DAY = 5;
const SUBSCRIBER_LIMIT_PER_DAY = 200;
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 20;
const DEFAULT_MODEL = 'claude-sonnet-5';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function json(body: unknown, status: number, extraHeaders?: HeadersInit): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (extraHeaders) {
    for (const [key, value] of new Headers(extraHeaders)) headers.append(key, value);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function hashClientId(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isValidMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    ((value as ChatMessage).role === 'user' || (value as ChatMessage).role === 'assistant') &&
    typeof (value as ChatMessage).content === 'string' &&
    (value as ChatMessage).content.length > 0 &&
    (value as ChatMessage).content.length <= MAX_MESSAGE_LENGTH
  );
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  let messages: unknown;
  let pageTitle: unknown;
  try {
    const body = (await request.json()) as { messages?: unknown; pageTitle?: unknown };
    messages = body?.messages;
    pageTitle = body?.pageTitle;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (typeof pageTitle !== 'string' || pageTitle.trim().length === 0 || pageTitle.length > 200) {
    return json({ error: 'Invalid page.' }, 400);
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return json({ error: 'Invalid conversation.' }, 400);
  }
  if (!messages.every(isValidMessage)) {
    return json({ error: 'Invalid message in conversation.' }, 400);
  }

  const subscriber = await checkSubscriber(request, env);
  const setCookieHeader = subscriber.setCookieHeader
    ? { 'Set-Cookie': subscriber.setCookieHeader }
    : undefined;
  const limit = subscriber.isSubscriber ? SUBSCRIBER_LIMIT_PER_DAY : FREE_LIMIT_PER_DAY;

  const clientId = await hashClientId(request.headers.get('CF-Connecting-IP') ?? 'unknown');

  let usedToday = 0;
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM ask_ai_usage WHERE client_id = ? AND created_at >= datetime('now', '-1 day')`,
    )
      .bind(clientId)
      .first<{ count: number }>();
    usedToday = row?.count ?? 0;
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500, setCookieHeader);
  }

  if (usedToday >= limit) {
    return json(
      {
        error: subscriber.isSubscriber
          ? `You've used all ${limit} questions for today. Try again tomorrow.`
          : `You've used all ${limit} free questions for today. Upgrade for more, or try again tomorrow.`,
      },
      429,
      setCookieHeader,
    );
  }

  const systemPrompt = `You are a concise Power BI expert helping a user who is reading the pbidocs.com documentation page titled "${pageTitle}". Keep answers short, practical, and specific to Power BI, DAX, and Power Query. Use backticks for formulas and function names.`;

  let reply: string;
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
        max_tokens: 600,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      return json(
        { error: 'Ask AI is temporarily unavailable. Please try again shortly.' },
        500,
        setCookieHeader,
      );
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    reply = data.content?.find((block) => block.type === 'text')?.text ?? '';
  } catch {
    return json(
      { error: 'Ask AI is temporarily unavailable. Please try again shortly.' },
      500,
      setCookieHeader,
    );
  }

  if (!reply) {
    return json({ error: 'Something went wrong. Please try again.' }, 500, setCookieHeader);
  }

  try {
    await env.DB.prepare('INSERT INTO ask_ai_usage (client_id) VALUES (?)').bind(clientId).run();
  } catch {
    // Non-fatal — the reply is still returned even if usage logging fails.
  }

  return json(
    {
      reply,
      remaining: Math.max(0, limit - usedToday - 1),
      isSubscriber: subscriber.isSubscriber,
    },
    200,
    setCookieHeader,
  );
}
