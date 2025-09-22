import { HyperliquidHttpError, buildExchangePayload, parseJsonResponse, pruneUndefined, resolveFetch } from './helpers';
import {
  ExchangeAction,
  ExchangeEnvelope,
  HttpClientConfig,
  JsonRequestOptions,
  NonEmptyArray,
} from './types';

const DEFAULT_EXCHANGE_URL = 'https://api.hyperliquid.xyz/exchange';

type FetchLike = typeof fetch;

interface PlaceOrderParams extends ExchangeEnvelope {
  orders: NonEmptyArray<Record<string, unknown>>;
  grouping?: 'na' | 'normalTpsl' | 'positionTpsl';
  builder?: Record<string, unknown>;
}

interface CancelParams extends ExchangeEnvelope {
  cancels: NonEmptyArray<Record<string, unknown>>;
}

interface BatchModifyParams extends ExchangeEnvelope {
  modifies: NonEmptyArray<Record<string, unknown>>;
}

interface ScheduleCancelParams extends ExchangeEnvelope {
  time?: number;
}

interface ModifyOrderParams extends ExchangeEnvelope {
  oid?: number;
  cloid?: string;
  order?: Record<string, unknown>;
}

interface UpdateLeverageParams extends ExchangeEnvelope {
  asset: number;
  isCross?: boolean;
  leverage: number;
}

interface UpdateIsolatedMarginParams extends ExchangeEnvelope {
  asset: number;
  isBuy?: boolean;
  ntli: number | string;
}

interface TopUpIsolatedMarginParams extends ExchangeEnvelope {
  asset: number;
  leverage: number | string;
}

interface SendCoreAssetParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  destination?: string;
  amount?: string;
  time?: number;
  actionNonce?: number;
}

interface SendCoreSpotParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  destination?: string;
  token?: string;
  amount?: string;
  time?: number;
  actionNonce?: number;
}

interface InitiateWithdrawalParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  destination?: string;
  amount?: string;
  time?: number;
  actionNonce?: number;
}

interface TransferBetweenAccountsParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  amount?: string;
  toPerp?: boolean;
  actionNonce?: number;
}

interface SendAssetParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  destination?: string;
  sourceDex?: string;
  destinationDex?: string;
  token?: string;
  amount?: string;
  fromSubAccount?: string;
  actionNonce?: number;
}

interface StakingMutationParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  wei?: number | string;
  actionNonce?: number;
}

interface DelegateStakeParams extends StakingMutationParams {
  validator?: string;
  isUndelegate?: boolean;
}

interface VaultTransferParams extends ExchangeEnvelope {
  targetVaultAddress?: string;
  isDeposit?: boolean;
  usd?: number | string;
}

interface ApproveApiWalletParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  agentAddress?: string;
  agentName?: string;
  actionNonce?: number;
}

interface ApproveBuilderFeeParams extends ExchangeEnvelope {
  hyperliquidChain?: string;
  signatureChainId?: string;
  builder?: string;
  maxFeeRate?: string;
  actionNonce?: number;
}

interface TwapOrderParams extends ExchangeEnvelope {
  twap?: Record<string, unknown>;
}

interface CancelTwapParams extends ExchangeEnvelope {
  asset?: number;
  twapId?: number;
}

interface ReserveWeightParams extends ExchangeEnvelope {
  weight?: number;
}

export class HyperliquidExchangeClient {
  private readonly baseUrl: string;

  private readonly fetch: FetchLike;

  constructor(config: HttpClientConfig = {}) {
    const { baseUrl = DEFAULT_EXCHANGE_URL, fetchImpl } = config;
    this.baseUrl = baseUrl;
    this.fetch = resolveFetch(fetchImpl);
  }

  private async sendAction<T = unknown>(
    action: ExchangeAction,
    envelope: ExchangeEnvelope = {},
    requestOptions: JsonRequestOptions = {},
  ): Promise<T> {
    if (!action || typeof action !== 'object') {
      throw new Error('HyperliquidExchangeClient.sendAction requires an action object.');
    }

    const payload = buildExchangePayload(action, envelope);
    const { headers: requestHeaders, ...restOptions } = requestOptions;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.fromEntries(Object.entries(requestHeaders ?? {})),
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
        const error = new Error('Hyperliquid exchange response was not valid JSON.');
        (error as Error & { rawBody?: string }).rawBody = rawBody;
        (error as Error & { cause?: unknown }).cause = parseError;
        throw error;
      }

      return parsed as T;
    }

    throw new HyperliquidHttpError(
      `Hyperliquid exchange request failed with status ${response.status}`,
      response.status,
      parseError ? rawBody : parsed,
      rawBody,
      parseError,
    );
  }

  async placeOrder<T = unknown>(params: PlaceOrderParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { orders, grouping = 'na', builder, ...envelope } = params;

    if (!orders || orders.length === 0) {
      throw new Error('placeOrder requires a non-empty orders array.');
    }

    return this.sendAction<T>({ type: 'order', orders, grouping, builder }, envelope, requestOptions);
  }

  async cancelOrders<T = unknown>(params: CancelParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { cancels, ...envelope } = params;

    if (!cancels || cancels.length === 0) {
      throw new Error('cancelOrders requires a non-empty cancels array.');
    }

    return this.sendAction<T>({ type: 'cancel', cancels }, envelope, requestOptions);
  }

  async cancelOrdersByCloid<T = unknown>(params: CancelParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { cancels, ...envelope } = params;

    if (!cancels || cancels.length === 0) {
      throw new Error('cancelOrdersByCloid requires a non-empty cancels array.');
    }

    return this.sendAction<T>({ type: 'cancelByCloid', cancels }, envelope, requestOptions);
  }

  async batchModifyOrders<T = unknown>(params: BatchModifyParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { modifies, ...envelope } = params;

    if (!modifies || modifies.length === 0) {
      throw new Error('batchModifyOrders requires a non-empty modifies array.');
    }

    return this.sendAction<T>({ type: 'batchModify', modifies }, envelope, requestOptions);
  }

  async scheduleCancel<T = unknown>(params: ScheduleCancelParams = {}, requestOptions?: JsonRequestOptions): Promise<T> {
    const { time, ...envelope } = params;

    return this.sendAction<T>({ type: 'scheduleCancel', time }, envelope, requestOptions);
  }

  async modifyOrder<T = unknown>(params: ModifyOrderParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { oid, cloid, order, ...envelope } = params;

    if (oid === undefined && cloid === undefined) {
      throw new Error('modifyOrder requires either an oid or cloid property.');
    }

    return this.sendAction<T>({ type: 'modify', oid, cloid, order }, envelope, requestOptions);
  }

  async updateLeverage<T = unknown>(params: UpdateLeverageParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { asset, isCross, leverage, ...envelope } = params;

    if (asset === undefined || leverage === undefined) {
      throw new Error('updateLeverage requires asset and leverage values.');
    }

    return this.sendAction<T>({ type: 'updateLeverage', asset, isCross, leverage }, envelope, requestOptions);
  }

  async updateIsolatedMargin<T = unknown>(params: UpdateIsolatedMarginParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { asset, isBuy, ntli, ...envelope } = params;

    if (asset === undefined || ntli === undefined) {
      throw new Error('updateIsolatedMargin requires asset and ntli values.');
    }

    return this.sendAction<T>({ type: 'updateIsolatedMargin', asset, isBuy, ntli }, envelope, requestOptions);
  }

  async topUpIsolatedOnlyMargin<T = unknown>(
    params: TopUpIsolatedMarginParams,
    requestOptions?: JsonRequestOptions,
  ): Promise<T> {
    const { asset, leverage, ...envelope } = params;

    if (asset === undefined || leverage === undefined) {
      throw new Error('topUpIsolatedOnlyMargin requires asset and leverage values.');
    }

    return this.sendAction<T>({ type: 'topUpIsolatedOnlyMargin', asset, leverage }, envelope, requestOptions);
  }

  async sendCoreUsdc<T = unknown>(params: SendCoreAssetParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, destination, amount, time, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'usdSend',
        hyperliquidChain,
        signatureChainId,
        destination,
        amount,
        time: time ?? actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async sendCoreSpot<T = unknown>(params: SendCoreSpotParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, destination, token, amount, time, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'spotSend',
        hyperliquidChain,
        signatureChainId,
        destination,
        token,
        amount,
        time: time ?? actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async initiateWithdrawal<T = unknown>(
    params: InitiateWithdrawalParams,
    requestOptions?: JsonRequestOptions,
  ): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, destination, amount, time, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'withdraw3',
        hyperliquidChain,
        signatureChainId,
        destination,
        amount,
        time: time ?? actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async transferBetweenSpotAndPerp<T = unknown>(
    params: TransferBetweenAccountsParams,
    requestOptions?: JsonRequestOptions,
  ): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, amount, toPerp, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'usdClassTransfer',
        hyperliquidChain,
        signatureChainId,
        amount,
        toPerp,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async sendAsset<T = unknown>(params: SendAssetParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const {
      hyperliquidChain = 'Mainnet',
      signatureChainId,
      destination,
      sourceDex,
      destinationDex,
      token,
      amount,
      fromSubAccount,
      actionNonce,
      ...envelope
    } = params;

    return this.sendAction<T>(
      {
        type: 'sendAsset',
        hyperliquidChain,
        signatureChainId,
        destination,
        sourceDex,
        destinationDex,
        token,
        amount,
        fromSubAccount,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async depositIntoStaking<T = unknown>(params: StakingMutationParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, wei, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'cDeposit',
        hyperliquidChain,
        signatureChainId,
        wei,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async withdrawFromStaking<T = unknown>(
    params: StakingMutationParams,
    requestOptions?: JsonRequestOptions,
  ): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, wei, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'cWithdraw',
        hyperliquidChain,
        signatureChainId,
        wei,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async delegateStake<T = unknown>(params: DelegateStakeParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, validator, isUndelegate, wei, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'tokenDelegate',
        hyperliquidChain,
        signatureChainId,
        validator,
        isUndelegate,
        wei,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async vaultTransfer<T = unknown>(params: VaultTransferParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { targetVaultAddress, isDeposit, usd, ...envelope } = params;

    const actionVaultAddress = targetVaultAddress ?? (envelope.vaultAddress as string | undefined);

    return this.sendAction<T>({ type: 'vaultTransfer', vaultAddress: actionVaultAddress, isDeposit, usd }, envelope, requestOptions);
  }

  async approveApiWallet<T = unknown>(params: ApproveApiWalletParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, agentAddress, agentName, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'approveAgent',
        hyperliquidChain,
        signatureChainId,
        agentAddress,
        agentName,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async approveBuilderFee<T = unknown>(params: ApproveBuilderFeeParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { hyperliquidChain = 'Mainnet', signatureChainId, builder, maxFeeRate, actionNonce, ...envelope } = params;

    return this.sendAction<T>(
      {
        type: 'approveBuilderFee',
        hyperliquidChain,
        signatureChainId,
        builder,
        maxFeeRate,
        nonce: actionNonce ?? (envelope.nonce as number | undefined),
      },
      envelope,
      requestOptions,
    );
  }

  async placeTwapOrder<T = unknown>(params: TwapOrderParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { twap, ...envelope } = params;

    if (!twap || typeof twap !== 'object') {
      throw new Error('placeTwapOrder requires a twap object.');
    }

    return this.sendAction<T>({ type: 'twapOrder', twap }, envelope, requestOptions);
  }

  async cancelTwapOrder<T = unknown>(params: CancelTwapParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { asset, twapId, ...envelope } = params;

    if (asset === undefined || twapId === undefined) {
      throw new Error('cancelTwapOrder requires asset and twapId.');
    }

    return this.sendAction<T>({ type: 'twapCancel', a: asset, t: twapId }, envelope, requestOptions);
  }

  async reserveAdditionalActions<T = unknown>(params: ReserveWeightParams, requestOptions?: JsonRequestOptions): Promise<T> {
    const { weight, ...envelope } = params;

    if (weight === undefined) {
      throw new Error('reserveAdditionalActions requires a weight value.');
    }

    return this.sendAction<T>({ type: 'reserveRequestWeight', weight }, envelope, requestOptions);
  }

  async invalidatePendingNonce<T = unknown>(envelope: ExchangeEnvelope = {}, requestOptions?: JsonRequestOptions): Promise<T> {
    return this.sendAction<T>({ type: 'noop' }, envelope, requestOptions);
  }
}

export default HyperliquidExchangeClient;
export { DEFAULT_EXCHANGE_URL };
