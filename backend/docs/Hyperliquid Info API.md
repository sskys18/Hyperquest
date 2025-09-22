# Hyperliquid Info API

### Pagination

Responses that take a time range will only return 500 elements or distinct blocks of data. To query larger ranges, use the last returned timestamp as the next `startTime` for pagination.

### Perpetuals vs Spot

The endpoints in this section as well as websocket subscriptions work for both Perpetuals and Spot. For perpetuals `coin` is the name returned in the `meta` response. For Spot, coin should be `PURR/USDC` for PURR, and `@{index}` e.g. `@1` for all other spot tokens where index is the index of the spot pair in the `universe` field of the `spotMeta` response. For example, the spot index for HYPE on mainnet is `@107` because the token index of HYPE is 150 and the spot pair `@107` has tokens `[150, 0]`. Note that some assets may be remapped on user interfaces. For example, `BTC/USDC` on app.hyperliquid.xyz corresponds to `UBTC/USDC` on mainnet HyperCore. The L1 name on the [token details page](https://app.hyperliquid.xyz/explorer/token/0x8f254b963e8468305d409b33aa137c67) can be used to detect remappings.

### User address

To query the account data associated with a master or sub-account, you must pass in the actual address of that account. A common pitfall is to use an agent wallet's address which leads to an empty result.

## Retrieve mids for all coins

<mark style="color:green;">`POST`</mark> `https://api.hyperliquid.xyz/info`

Note that if the book is empty, the last trade price will be used as a fallback

#### Headers

| Name | Type | Description |
| --- | --- | --- |
| Content-Type<mark style="color:red;">\*</mark> | String | "application/json" |

#### Request Body

```json
{
  "type": "allMids",
  "dex": "String" // Optional
}
```

#### Response

```json
{
    "APE": "4.33245",
    "ARB": "1.21695"
}
```

## Retrieve a user's open orders

<mark style="color:green;">`POST`</mark> `https://api.hyperliquid.xyz/info`

See a user's open orders

#### Headers

| Name | Type | Description |
| --- | --- | --- |
| Content-Type<mark style="color:red;">\*</mark> | String | "application/json" |

#### Request Body

```json
{
  "type": "openOrders",
  "user": "0x...",
  "dex": "String" // Optional
}
```

#### Response

```json
[
    {
        "coin": "BTC",
        "limitPx": "29792.0",
        "oid": 91490942,
        "side": "A",
        "sz": "0.0",
        "timestamp": 1681247412573
    }
]
```

## Retrieve a user's open orders with additional frontend info

<mark style="color:green;">`POST`</mark> `https://api.hyperliquid.xyz/info`

#### Headers

| Name | Type | Description |
| --- | --- | --- |
| Content-Type<mark style="color:red;">\*</mark> | String | "application/json" |

#### Request Body

```json
{
  "type": "frontendOpenOrders",
  "user": "0x...",
  "dex": "String" // Optional
}
```

#### Response

```json
[
    {
        "coin": "BTC",
        "isPositionTpsl": false,
        "isTrigger": false,
        "limitPx": "29792.0",
        "oid": 91490942,
        "orderType": "Limit",
        "origSz": "5.0",
        "reduceOnly": false,
        "side": "A",
        "sz": "5.0",
        "timestamp": 1681247412573,
        "triggerCondition": "N/A",
        "triggerPx": "0.0"
    }
]
```

## Retrieve a user's fills

<mark style="color:green;">`POST`</mark> `https://api.hyperliquid.xyz/info`

Returns at most 2000 most recent fills

#### Headers

| Name | Type | Description |
| --- | --- | --- |
| Content-Type<mark style="color:red;">\*</mark> | String | "application/json" |

#### Request Body

```json
{
  "type": "userFills",
  "user": "0x...",
  "aggregateByTime": "bool" // Optional
}
```

#### Response

```json
[
    // Perp fill
    {
        "closedPnl": "0.0",
        "coin": "AVAX",
        "crossed": false,
        "dir": "Open Long",
        "hash": "0xa166e3fa63c25663024b03f2e0da011a00307e4017465df020210d3d432e7cb8",
        "oid": 90542681,
        "px": "18.435",
        "side": "B",
        "startPosition": "26.86",
        "sz": "93.53",
        "time": 1681222254710,
        "fee": "0.01",
        "feeToken": "USDC",
        "builderFee": "0.01", // this is optional and will not be present if 0
        "tid": 118906512037719
    },
    // Spot fill
    {
        "coin": "@107",
        "px": "18.62041381",
        "sz": "43.84",
        "side": "A",
        "time": 1735969713869,
        "startPosition": "10659.65434798",
        "dir": "Sell",
        "closedPnl": "8722.988077",
        "hash": "0x2222138cc516e3fe746c0411dd733f02e60086f43205af2ae37c93f6a792430b",
        "oid": 59071663721,
        "crossed": true,
        "fee": "0.304521",
        "tid": 907359904431134,
        "feeToken": "USDC"
    }
]
```