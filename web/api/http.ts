import axios, { AxiosInstance, AxiosResponse } from "axios";
import utils from "../utils";
import type { Method, Confidential } from './types';

export default class HTTP {
  private axios: AxiosInstance;
  private confidential: Confidential | null;

  constructor(
    baseURL: string = "https://api.mixin.one",
    confidential: Confidential | null,
    headers: Record<string, string> = {},
    options: Record<string, any> = {}
  ) {
    this.axios = axios.create({
      baseURL: baseURL,
      headers
    });

    this.confidential = confidential;

    this.axios.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        if (response.data.error) {
          const { code, description } = response.data.error;
          if (options.onError) {
            options.onError(code, description);
            // return Promise.resolve(response);
          }
          return Promise.reject(new Error(`${code}: ${description}`));
        }
        return Promise.resolve(response);
      },
      (error: any) => {
        if (options.onError) {
          options.onError('-1', '');
        }
        return Promise.reject(error);
      }
    );
  }

  public get instance(): AxiosInstance {
    return this.axios;
  }

  public c(): AxiosInstance {
    if (this.confidential) {
      this.axios.interceptors.request.use((cfg) => {
        const uri = axios.getUri(cfg);
        const token = utils.encrypt.signAuthenticationToken(
          this.confidential?.userId ?? "",
          this.confidential?.sessionId ?? "",
          this.confidential?.privateKey ?? "",
          cfg.method?.toUpperCase() ?? "GET",
          uri,
          cfg.data ?? ""
        );
        cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
        return cfg;
      });
    }
    return this.axios;
  }

  public async request(
    method: Method | string,
    path: string,
    body?: Record<string, any>,
    query?: Record<string, string>
  ): Promise<any> {
    const response = await this.axios.request<
      unknown,
      AxiosResponse<any>
    >({
      data: body,
      method: method as Method,
      params: query,
      url: path
    });

    return response.data;
  }

  public async get(path: string, query?: Record<string, string>): Promise<any> {
    this.c()
    return await this.request('GET', path, {}, query);
  }

  public async post(path: string, data: any, query?: Record<string, string>): Promise<any> {
    this.c()
    return await this.request('POST', path, data, query);
  }
}