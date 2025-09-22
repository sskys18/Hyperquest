# Hyperliquid Exchange API

## Table of Contents
- [Exchange endpoint](#exchange-endpoint)
  - [Asset](#asset)
  - [Subaccounts and vaults](#subaccounts-and-vaults)
  - [Expires After](#expires-after)
- [Place an order](#place-an-order)
- [Cancel order(s)](#cancel-orders)
- [Cancel order(s) by cloid](#cancel-orders-by-cloid)
- [Schedule cancel (dead man's switch)](#schedule-cancel-dead-mans-switch)
- [Modify an order](#modify-an-order)
- [Modify multiple orders](#modify-multiple-orders)
- [Update leverage](#update-leverage)
- [Update isolated margin](#update-isolated-margin)
- [Core USDC transfer](#core-usdc-transfer)
- [Core spot transfer](#core-spot-transfer)
- [Initiate a withdrawal request](#initiate-a-withdrawal-request)
- [Transfer from Spot account to Perp account (and vice versa)](#transfer-from-spot-account-to-perp-account-and-vice-versa)
- [Send Asset (testnet only)](#send-asset-testnet-only)
- [Deposit into staking](#deposit-into-staking)
- [Withdraw from staking](#withdraw-from-staking)
- [Delegate or undelegate stake from validator](#delegate-or-undelegate-stake-from-validator)
- [Deposit or withdraw from a vault](#deposit-or-withdraw-from-a-vault)
- [Approve an API wallet](#approve-an-api-wallet)
- [Approve a builder fee](#approve-a-builder-fee)
- [Place a TWAP order](#place-a-twap-order)
- [Cancel a TWAP order](#cancel-a-twap-order)
- [Reserve Additional Actions](#reserve-additional-actions)
- [Invalidate Pending Nonce (noop)](#invalidate-pending-nonce-noop)

# Exchange endpoint

### Asset

Many of the requests take asset as an input. For perpetuals this is the index in the `universe` field returned by the`meta` response. For spot assets, use `10000 + index` where `index` is the corresponding index in `spotMeta.universe`. For example, when submitting an order for `PURR/USDC`, the asset that should be used is `10000` because its asset index in the spot metadata is `0`.

### Subaccounts and vaults

Subaccounts and vaults do not have private keys. To perform actions on behalf of a subaccount or vault signing should be done by the master account and the vaultAddress field should be set to the address of the subaccount or vault. The basic_vault.py example in the Python SDK demonstrates this.

### Expires After

Some actions support an optional field `expiresAfter` which is a timestamp in milliseconds after which the action will be rejected. User-signed actions such as Core USDC transfer do not support the `expiresAfter` field. Note that actions consume 5x the usual address-based rate limit when canceled due to a stale `expiresAfter` field. 

See the Python SDK for details on how to incorporate this field when signing. 

## Place an order

<mark style="color:green;">`POST`</mark> `https://api.hyperliquid.xyz/exchange`

See Python SDK for full featured examples on the fields of the order request.

For limit orders, TIF (time-in-force) sets the behavior of the order upon first hitting the book.

- `ALO` (add liquidity only, i.e. "post only") will be canceled instead of immediately matching.
- `IOC` (immediate or cancel) will have the unfilled part canceled instead of resting.
- `GTC` (good til canceled) orders have no special behavior.

Client Order ID (cloid) is an optional 128 bit hex string, e.g. `0x1234567890abcdef1234567890abcdef`

#### Headers

| Name | Type | Description |
| --- | --- | --- |
| Content-Type<mark style="color:red;">*</mark> | String | "application/json" |

#### Request Body

```json
{
  "action": {
    "type": "order",
    "orders": [
      {
        "a": "Number",
        "b": "Boolean",
        "p": "String",
        "s": "String",
        "r": "Boolean",
        "t": {
          "limit": {
            "tif": "Alo" | "Ioc" | "Gtc" 
          }
        },
        "c": "Cloid (optional)"
      }
    ],
    "grouping": "na" | "normalTpsl" | "positionTpsl",
    "builder": {
      "b": "address",
      "f": "Number"
    }
  },
  "nonce": "Number",
  "signature": "Object",
  "vaultAddress": "String",
  "expiresAfter": "Number"
}
```

**Keys:**
- `a`: asset
- `b`: isBuy
- `p`: price
- `s`: size
- `r`: reduceOnly
- `t`: type
- `c`: cloid (client order id)

**Builder Keys:**
- `b`: the address the should receive the additional fee
- `f`: the size of the fee in tenths of a basis point e.g. if f is 10, 1bp of the order notional will be charged to the user and sent to the builder

#### Responses

{% tabs %}
{% tab title="200: OK Successful Response (resting)" %}
```json
{
   "status":"ok",
   "response":{
      "type":"order",
      "data":{
         "statuses":[
            {
               "resting":{
                  "oid":77738308
               }
            }
         ]
      }
   }
}
```
{% endtab %}
{% tab title="200: OK Error Response" %}
```json
{
   "status":"ok",
   "response":{
      "type":"order",
      "data":{
         "statuses":[
            {
               "error":"Order must have minimum value of $10."
            }
         ]
      }
   }
}
```
{% endtab %}
{% tab title="200: OK Successful Response (filled)" %}
```json
{
   "status":"ok",
   "response":{
      "type":"order",
      "data":{
         "statuses":[
            {
               "filled":{
                  "totalSz":"0.02",
                  "avgPx":"1891.4",
                  "oid":77747314
               }
            }
         ]
      }
   }
}
```
{% endtab %}
{% endtabs %}

## Cancel order(s)

<mark style="color:green;">`POST`</mark> `https://api.hyperliquid.xyz/exchange`

#### Headers

| Name | Type | Description |
| --- | --- | --- |
| Content-Type<mark style="color:red;">*</mark> | String | "application/json" |

#### Request Body
```json
{
    "action": {
        "type": "cancel",
        "cancels": [
            {
                "a": "Number",
                "o": "Number"
            }
        ]
    },
    "nonce": "Number",
    "signature": "Object",
    "vaultAddress": "String",
    "expiresAfter": "Number"
}
```

**Keys:**
- `a`: asset
- `o`: oid (order id)

#### Responses
{% tabs %}
{% tab title="200: OK Successful Response" %}
```json
{
   "status":"ok",
   "response":{
      "type":"cancel",
      "data":{
         "statuses":[
            "success"
         ]
      }
   }
}
```
{% endtab %}
{% tab title="200: OK Error Response" %}
```json
{
   "status":"ok",
   "response":{
      "type":"cancel",
      "data":{
         "statuses":[
            {
               "error":"Order was never placed, already canceled, or filled."
            }
         ]
      }
   }
}
```
{% endtab %}
{% endtabs %}