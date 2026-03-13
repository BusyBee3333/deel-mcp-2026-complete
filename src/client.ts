import type { DeelConfig } from "./types.js";

// ─── Deel API Client ──────────────────────────────────────────────────────────

export class DeelClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: DeelConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://app.deel.com/api").replace(
      /\/$/,
      ""
    );
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      params?: Record<string, unknown>;
      body?: unknown;
    }
  ): Promise<T> {
    const url = this.buildUrl(path, options?.params);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorText) as {
          message?: string;
          error?: string;
        };
        errorMessage =
          errorJson.message ?? errorJson.error ?? `HTTP ${response.status}`;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      throw new Error(
        `Deel API error ${response.status}: ${errorMessage}`
      );
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  async get<T>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>("GET", path, { params });
  }

  async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>("POST", path, { body, params });
  }

  async patch<T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>("PATCH", path, { body, params });
  }

  async put<T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>("PUT", path, { body, params });
  }

  async delete<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>("DELETE", path, { params });
  }
}

// ─── Singleton Factory ────────────────────────────────────────────────────────

let _client: DeelClient | null = null;

export function getClient(): DeelClient {
  if (!_client) {
    const apiKey = process.env["DEEL_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "DEEL_API_KEY environment variable is required. " +
          "Get your API key from Deel Settings > API & Webhooks."
      );
    }
    _client = new DeelClient({
      apiKey,
      baseUrl: process.env["DEEL_BASE_URL"],
    });
  }
  return _client;
}
