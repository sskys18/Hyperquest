export type FetchLike = typeof fetch;

export type JsonRequestOptions = Omit<RequestInit, 'body' | 'method' | 'headers'> & {
  headers?: Record<string, string>;
};

export type NonEmptyArray<T> = [T, ...T[]];

export interface HttpClientConfig {
  baseUrl?: string;
  fetchImpl?: FetchLike;
}

export interface ExchangeEnvelope extends Record<string, unknown> {
  nonce?: number;
  signature?: unknown;
  vaultAddress?: string;
  expiresAfter?: number;
}

export interface ExchangeAction extends Record<string, unknown> {
  type: string;
}

export interface ParsedJson<T> {
  parsed: T | null;
  rawBody: string;
  parseError: unknown;
}
