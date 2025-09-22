import { ExchangeEnvelope, FetchLike, ParsedJson } from './types';

export class HyperliquidHttpError extends Error {
  status: number;
  body: unknown;
  rawBody: string;
  parseError?: unknown;

  constructor(message: string, status: number, body: unknown, rawBody: string, parseError?: unknown) {
    super(message);
    this.name = 'HyperliquidHttpError';
    this.status = status;
    this.body = body;
    this.rawBody = rawBody;
    if (parseError !== undefined && parseError !== null) {
      this.parseError = parseError;
    }
  }
}

export function resolveFetch(fetchImpl?: FetchLike): FetchLike {
  const resolved = fetchImpl ?? globalThis.fetch;
  if (typeof resolved !== 'function') {
    throw new Error('Fetch API is not available in this environment. Provide fetchImpl to the Hyperliquid client.');
  }
  return resolved as FetchLike;
}

export function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => pruneUndefined(item)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([key, val]) => [key, pruneUndefined(val)]);

    return Object.fromEntries(entries) as unknown as T;
  }

  return value;
}

export async function parseJsonResponse<T>(response: Response): Promise<ParsedJson<T>> {
  const rawBody = await response.text();

  if (!rawBody) {
    return { parsed: null, rawBody, parseError: null };
  }

  try {
    return { parsed: JSON.parse(rawBody) as T, rawBody, parseError: null };
  } catch (error) {
    return { parsed: null, rawBody, parseError: error };
  }
}

export function buildExchangePayload(action: Record<string, unknown>, envelope: ExchangeEnvelope = {}): Record<string, unknown> {
  return pruneUndefined({
    action: pruneUndefined(action),
    ...pruneUndefined(envelope),
  });
}
