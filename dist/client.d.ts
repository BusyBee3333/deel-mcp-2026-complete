import type { DeelConfig } from "./types.js";
export declare class DeelClient {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(config: DeelConfig);
    private buildUrl;
    private request;
    get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T>;
    patch<T>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T>;
    put<T>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T>;
    delete<T>(path: string, params?: Record<string, unknown>): Promise<T>;
}
export declare function getClient(): DeelClient;
//# sourceMappingURL=client.d.ts.map