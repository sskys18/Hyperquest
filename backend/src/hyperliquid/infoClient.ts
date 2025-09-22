import { HyperliquidHttpError, parseJsonResponse, pruneUndefined, resolveFetch } from './helpers';
import { HttpClientConfig, JsonRequestOptions } from './types';

const DEFAULT_INFO_URL = 'https://api.hyperliquid.xyz/info';

type FetchLike = typeof fetch;

type BaseParams = Record<string, unknown>;

type DexScopedParams = BaseParams & { dex?: string };

type UserScopedParams = BaseParams & { user: string };

type UserFillsParams = UserScopedParams & { aggregateByTime?: boolean };

type UserFillsByTimeParams = UserFillsParams & { startTime: number; endTime?: number };

type OrderStatusParams = UserScopedParams & { oid?: number | string; cloid?: string };

type L2BookParams = BaseParams & { coin: string; nSigFigs?: number; mantissa?: number };

type CandleSnapshotParams = DexScopedParams & {
  req?: Record<string, unknown>;
  coin?: string;
  interval?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
};

type MaxBuilderFeeParams = UserScopedParams & { builder: string };

type VaultDetailsParams = BaseParams & { vaultAddress: string; user?: string };

export class HyperliquidInfoClient {
  private readonly baseUrl: string;

  private readonly fetch: FetchLike;

  constructor(config: HttpClientConfig = {}) {
    const { baseUrl = DEFAULT_INFO_URL, fetchImpl } = config;
    this.baseUrl = baseUrl;
    this.fetch = resolveFetch(fetchImpl);
  }

  private async request<T = unknown>(body: Record<string, unknown>, requestOptions: JsonRequestOptions = {}): Promise<T> {
    if (!body || typeof body !== 'object') {
      throw new Error('HyperliquidInfoClient.request expects a request body object.');
    }

    const payload = pruneUndefined(body);
    const { headers: requestHeaders, ...restOptions } = requestOptions;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestHeaders ?? {}),
    };

    const response = await this.fetch(this.baseUrl, {
      ...restOptions,
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const { parsed, rawBody, parseError } = await parseJsonResponse<T>(response);

    if (response.ok) {
      if (parseError) {
        const error = new Error('Hyperliquid info response was not valid JSON.');
        (error as Error & { rawBody?: string }).rawBody = rawBody;
        (error as Error & { cause?: unknown }).cause = parseError;
        throw error;
      }

      return parsed as T;
    }

    throw new HyperliquidHttpError(
      `Hyperliquid info request failed with status ${response.status}`,
      response.status,
      parseError ? rawBody : parsed,
      rawBody,
      parseError,
    );
  }

  async getAllMids<T = unknown>(params: DexScopedParams = {}, requestOptions?: JsonRequestOptions): Promise<T> {
    const { dex, type: _ignored, ...extraBody } = params;
    return this.request<T>({ type: 'allMids', dex, ...extraBody }, requestOptions);
  }

  async getOpenOrders<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, dex, type: _ignored, ...extraBody } = params as UserScopedParams & DexScopedParams;
    if (!user) {
      throw new Error('getOpenOrders requires a user address.');
    }
    return this.request<T>({ type: 'openOrders', user, dex, ...extraBody }, requestOptions);
  }

  async getFrontendOpenOrders<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, dex, type: _ignored, ...extraBody } = params as UserScopedParams & DexScopedParams;
    if (!user) {
      throw new Error('getFrontendOpenOrders requires a user address.');
    }
    return this.request<T>({ type: 'frontendOpenOrders', user, dex, ...extraBody }, requestOptions);
  }

  async getUserFills<T = unknown>(params: UserFillsParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, aggregateByTime, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserFills requires a user address.');
    }
    return this.request<T>({ type: 'userFills', user, aggregateByTime, ...extraBody }, requestOptions);
  }

  async getUserFillsByTime<T = unknown>(params: UserFillsByTimeParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, startTime, endTime, aggregateByTime, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserFillsByTime requires a user address.');
    }
    if (startTime === undefined) {
      throw new Error('getUserFillsByTime requires a startTime.');
    }
    return this.request<T>({ type: 'userFillsByTime', user, startTime, endTime, aggregateByTime, ...extraBody }, requestOptions);
  }

  async getUserRateLimit<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserRateLimit requires a user address.');
    }
    return this.request<T>({ type: 'userRateLimit', user, ...extraBody }, requestOptions);
  }

  async getOrderStatus<T = unknown>(params: OrderStatusParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, oid, cloid, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getOrderStatus requires a user address.');
    }
    if (oid === undefined && cloid === undefined) {
      throw new Error('getOrderStatus requires either an oid or cloid.');
    }
    return this.request<T>({ type: 'orderStatus', user, oid, cloid, ...extraBody }, requestOptions);
  }

  async getL2BookSnapshot<T = unknown>(params: L2BookParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { coin, nSigFigs, mantissa, type: _ignored, ...extraBody } = params;
    if (!coin) {
      throw new Error('getL2BookSnapshot requires a coin identifier.');
    }
    return this.request<T>({ type: 'l2Book', coin, nSigFigs, mantissa, ...extraBody }, requestOptions);
  }

  async getCandleSnapshot<T = unknown>(params: CandleSnapshotParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { req, coin, interval, startTime, endTime, limit, dex, type: _ignored, ...extraBody } = params;
    const payload = req ?? pruneUndefined({ coin, interval, startTime, endTime, limit, dex });

    if (!payload || typeof payload !== 'object' || !('coin' in payload) || !('interval' in payload)) {
      throw new Error('getCandleSnapshot requires coin and interval (either directly or via req).');
    }

    return this.request<T>({ type: 'candleSnapshot', req: payload, ...extraBody }, requestOptions);
  }

  async getMaxBuilderFee<T = unknown>(params: MaxBuilderFeeParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, builder, type: _ignored, ...extraBody } = params;
    if (!user || !builder) {
      throw new Error('getMaxBuilderFee requires user and builder addresses.');
    }
    return this.request<T>({ type: 'maxBuilderFee', user, builder, ...extraBody }, requestOptions);
  }

  async getHistoricalOrders<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getHistoricalOrders requires a user address.');
    }
    return this.request<T>({ type: 'historicalOrders', user, ...extraBody }, requestOptions);
  }

  async getUserTwapSliceFills<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserTwapSliceFills requires a user address.');
    }
    return this.request<T>({ type: 'userTwapSliceFills', user, ...extraBody }, requestOptions);
  }

  async getSubAccounts<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getSubAccounts requires a user address.');
    }
    return this.request<T>({ type: 'subAccounts', user, ...extraBody }, requestOptions);
  }

  async getVaultDetails<T = unknown>(params: VaultDetailsParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { vaultAddress, user, type: _ignored, ...extraBody } = params;
    if (!vaultAddress) {
      throw new Error('getVaultDetails requires a vaultAddress.');
    }
    return this.request<T>({ type: 'vaultDetails', vaultAddress, user, ...extraBody }, requestOptions);
  }

  async getUserVaultEquities<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserVaultEquities requires a user address.');
    }
    return this.request<T>({ type: 'userVaultEquities', user, ...extraBody }, requestOptions);
  }

  async getUserRole<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserRole requires a user address.');
    }
    return this.request<T>({ type: 'userRole', user, ...extraBody }, requestOptions);
  }

  async getPortfolio<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getPortfolio requires a user address.');
    }
    return this.request<T>({ type: 'portfolio', user, ...extraBody }, requestOptions);
  }

  async getReferralInfo<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getReferralInfo requires a user address.');
    }
    return this.request<T>({ type: 'referral', user, ...extraBody }, requestOptions);
  }

  async getUserFees<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getUserFees requires a user address.');
    }
    return this.request<T>({ type: 'userFees', user, ...extraBody }, requestOptions);
  }

  async getDelegations<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getDelegations requires a user address.');
    }
    return this.request<T>({ type: 'delegations', user, ...extraBody }, requestOptions);
  }

  async getDelegatorSummary<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getDelegatorSummary requires a user address.');
    }
    return this.request<T>({ type: 'delegatorSummary', user, ...extraBody }, requestOptions);
  }

  async getDelegatorHistory<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getDelegatorHistory requires a user address.');
    }
    return this.request<T>({ type: 'delegatorHistory', user, ...extraBody }, requestOptions);
  }

  async getDelegatorRewards<T = unknown>(params: UserScopedParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { user, type: _ignored, ...extraBody } = params;
    if (!user) {
      throw new Error('getDelegatorRewards requires a user address.');
    }
    return this.request<T>({ type: 'delegatorRewards', user, ...extraBody }, requestOptions);
  }
}

export default HyperliquidInfoClient;
export { DEFAULT_INFO_URL };
