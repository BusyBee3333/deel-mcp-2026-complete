// ─── Deel API Client ──────────────────────────────────────────────────────────
export class DeelClient {
    baseUrl;
    apiKey;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl ?? "https://app.deel.com/api").replace(/\/$/, "");
    }
    buildUrl(path, params) {
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
    async request(method, path, options) {
        const url = this.buildUrl(path, options?.params);
        const headers = {
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
            let errorMessage;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.message ?? errorJson.error ?? `HTTP ${response.status}`;
            }
            catch {
                errorMessage = errorText || `HTTP ${response.status}`;
            }
            throw new Error(`Deel API error ${response.status}: ${errorMessage}`);
        }
        const text = await response.text();
        if (!text) {
            return {};
        }
        return JSON.parse(text);
    }
    async get(path, params) {
        return this.request("GET", path, { params });
    }
    async post(path, body, params) {
        return this.request("POST", path, { body, params });
    }
    async patch(path, body, params) {
        return this.request("PATCH", path, { body, params });
    }
    async put(path, body, params) {
        return this.request("PUT", path, { body, params });
    }
    async delete(path, params) {
        return this.request("DELETE", path, { params });
    }
}
// ─── Singleton Factory ────────────────────────────────────────────────────────
let _client = null;
export function getClient() {
    if (!_client) {
        const apiKey = process.env["DEEL_API_KEY"];
        if (!apiKey) {
            throw new Error("DEEL_API_KEY environment variable is required. " +
                "Get your API key from Deel Settings > API & Webhooks.");
        }
        _client = new DeelClient({
            apiKey,
            baseUrl: process.env["DEEL_BASE_URL"],
        });
    }
    return _client;
}
//# sourceMappingURL=client.js.map