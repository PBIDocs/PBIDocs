export const SUBSCRIBER_COOKIE_NAME = 'pbi_sub';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

export interface SubscriberCookiePayload {
  cid: string; // Stripe customer ID
  iat: number; // issued at, unix seconds
  exp: number; // expires at, unix seconds
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

export async function signSubscriberCookie(customerId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SubscriberCookiePayload = { cid: customerId, iat: now, exp: now + MAX_AGE_SECONDS };
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${base64UrlEncode(signature)}`;
}

export async function verifySubscriberCookie(
  cookieValue: string,
  secret: string,
): Promise<SubscriberCookiePayload | null> {
  const [payloadB64, sigB64] = cookieValue.split('.');
  if (!payloadB64 || !sigB64) return null;

  const key = await importKey(secret);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlDecode(sigB64) as unknown as BufferSource,
    new TextEncoder().encode(payloadB64),
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as SubscriberCookiePayload;
    if (typeof payload.cid !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildSubscriberSetCookieHeader(token: string): string {
  return `${SUBSCRIBER_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`;
}

export function getSubscriberCookieValue(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${SUBSCRIBER_COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}
