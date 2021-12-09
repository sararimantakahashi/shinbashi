import type { Confidential } from "../api/types";
import { APIBase, SwapAPIBase } from "../default";
import HTTP from "./http";

class API {
  private client: HTTP;

  constructor(
    http: HTTP,
  ) {
    this.client = http;
  }

  public async assets() {
    return await this.client.get('/assets', {});
  }

  public async asset(assetId:string) {
    return await this.client.get('/assets/' + assetId, {});
  }

  public async snapshots(assetId:string) {
    return await this.client.get(`/snapshots?asset=${assetId}`, {});
  }

  public async transfer(assetId:string, opponentId:string, amount:string, traceId:string, memo:string, pin:string): Promise<any> {
    return await this.client.post(`/transfers`, {
      "asset_id": assetId,
      "opponent_id": opponentId,
      "amount":  amount,
      "traceId": traceId,
      "memo": memo,
      "pin": pin
    }, {});
  }

  public async deposits(assetId:string, destination:string) {
    return await this.client.get(`/external/transactions?limit=&asset=${assetId}&destination=${destination}`, {});
  }

  public async withdraw(addressId:string, amount:string, traceId:string, pin:string): Promise<any> {
    return await this.client.post(`/withdrawals`, {
      "address_id": addressId,
      "amount":  amount,
      "traceId": traceId,
      "memo": "",
      "pin": pin
    }, {});
  }

  public async createAddress(assetId:string, destination:string, tag:string, label:string, pin:string): Promise<any> {
    return await this.client.post(`/addresses`, {
      "asset_id": assetId,
      "label": label,
      "destination":  destination,
      "tag": tag,
      "pin": pin
    }, {});
  }

  public async deleteAddress(addressId:string, pin:string): Promise<any> {
    return await this.client.post(`/addresses/${addressId}/delete`, { "pin": pin }, {});
  }

  public async addresses(assetId:string): Promise<any> {
    return await this.client.get(`/assets/${assetId}/addresses`, {});
  }

  public async address(addrId:string): Promise<any> {
    return await this.client.get(`/addresses/${addrId}`, {});
  }

  public async register(name:string, publicKey: string): Promise<any> {
    return await this.client.post("/users", {
      "full_name": name,
      "session_secret": publicKey,
    }, {});
  }

  public async updatePIN(oldPin:string, newPin:string): Promise<any> {
    return await this.client.post("/pin/update", {
      "old_pin": oldPin,
      "pin": newPin,
    }, {});
  }

  public async verifyPIN(pin:string): Promise<any> {
    return await this.client.post("/pin/verify", {
      "pin": pin,
    }, {});
  }

  public async updateMe(name:string): Promise<any> {
    return await this.client.post("/me", {
      "full_name": name,
      "avatar_base64": "",
    }, {});
  }

  public async transactions(data:any): Promise<any>  {
    return await this.client.post("/transactions", data, {});
  }
}

class SwapAPI {
  private client: HTTP;

  constructor(
    http: HTTP,
  ) {
    this.client = http;
  }

  public async mtg(): Promise<any> {
    return await this.client.get("/info", {});
  }

  public async pairs(): Promise<any> {
    return await this.client.get("/pairs", {});
  }

  public async action(data: any): Promise<any> {
    return await this.client.post(`/actions`, data, {});
  }

  public async order(followId: string): Promise<any> {
    return await this.client.get(`/orders/${followId}`, {});
  }
}


const getAPI = (user:any, keypair:any, onError:any=null) => {
  const cf:Confidential = {
    userId : user.user_id,
    sessionId : user.session_id,
    privateKey: keypair.privateKey
  };

  const client = new HTTP(APIBase, cf, {}, { onError });
  const api = new API(client);
  return api;
}

const getSwapAPI = (user:any, keypair:any, onError:any=null) => {
  const cf:Confidential = {
    userId : user.user_id,
    sessionId : user.session_id,
    privateKey: keypair.privateKey
  };

  const client = new HTTP(SwapAPIBase, cf, {}, { onError });
  const api = new SwapAPI(client);
  return api;
}

export {
  API,
  SwapAPI,
  HTTP,
  getAPI,
  getSwapAPI,
};