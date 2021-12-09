
export const AccessEndpoint = "https://app-api.shinbashi.network";

export const APIBase = "https://api.mixin.one";

export const SwapAPIBase = "https://api.4swap.org/api";

export const SignInputAccountTpl = `Authorize shinbashi.netowork using: {"alg":"sha256","ver":"1","id":"$ID$"}`

export const SignInputPINTpl = `Sign transaction for shinbashi.netowork using: {"alg":"ed25519","ver":"1","id":"$ID$"}`

export const ETHAssetId = '43d61dcd-e413-450d-80b8-101d5e903357';

export const SupportedCryptos = {
  'c6d0c728-2624-429b-8e0d-d9d19b6592fa': 1, //	BTC
  '6770a1e5-6086-44d5-b60f-545f9d9e8ffd': 1, //	DOGE
  '54c61a72-b982-4034-a556-0d99e3c21e39': 1, //	DOT
  '43d61dcd-e413-450d-80b8-101d5e903357': 1, //	ETH
  '76c802a2-7c88-447f-a93e-c29c9e5dd9c8': 1, //	LTC
  'eea900a8-b327-488c-8d8d-1428702fe240': 1, //	MOB
  '64692c23-8971-4cf4-84a7-4dd1271dd887': 1, //	SOL
  '9b180ab6-6abe-3dc0-a13f-04169eb34bfa': 1, //	USDC
  'c996abc9-d94e-4494-b1cf-2a3fd3ac5714': 1, //	ZEC
}