"use strict";
/**
 * BINLookupAPI TypeScript SDK
 * * A production-ready client for interacting with the BINLookupAPI.
 * Features:
 * - Full TypeScript support for all request/response objects
 * - Custom error handling for API-specific error codes
 * - Built-in retry logic with exponential backoff
 * - Quota monitoring via response headers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BINLookupClient = exports.BINLookupAPIError = void 0;
// --- Custom Error Class ---
class BINLookupAPIError extends Error {
    constructor(code, message, statusCode) {
        super(`[${code}] ${message}`);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.name = 'BINLookupAPIError';
    }
}
exports.BINLookupAPIError = BINLookupAPIError;
class BINLookupClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://api.binlookupapi.com';
        this.maxRetries = config.maxRetries ?? 5;
        this.timeout = config.timeout ?? 10000;
    }
    /**
     * Look up information for a specific BIN.
     * @param bin The 4-8 digit BIN as a number or string.
     */
    async lookup(bin) {
        const binNumber = typeof bin === 'string' ? parseInt(bin, 10) : bin;
        if (isNaN(binNumber) || binNumber < 1000 || binNumber > 99999999) {
            throw new BINLookupAPIError('BAD_REQUEST', 'BIN must be an integer between 4 and 8 digits.', 400);
        }
        return this.requestWithRetry({ number: binNumber });
    }
    /**
     * Internal request handler with exponential backoff retry logic.
     */
    async requestWithRetry(body, attempt = 0) {
        // AbortController allows us to cancel the fetch if it exceeds the configured timeout.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(`${this.baseUrl}/v1/bin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
            clearTimeout(timer);
            // Handle Success
            if (response.ok) {
                const json = await response.json();
                return {
                    ...json,
                    quota: {
                        limit: parseInt(response.headers.get('X-Quota-Limit') || '0', 10),
                        remaining: parseInt(response.headers.get('X-Quota-Remaining') || '0', 10),
                        reset: parseInt(response.headers.get('X-Quota-Reset') || '0', 10),
                    },
                };
            }
            // Handle Errors
            // Guard against non-JSON error bodies (e.g. HTML gateway errors from a reverse proxy).
            // Without this, a malformed error response would throw an untyped parse error that
            // bypasses retry logic and surfaces as a confusing crash.
            let errorJson;
            try {
                errorJson = await response.json();
            }
            catch {
                errorJson = { error: 'SERVICE_ERROR', message: `HTTP ${response.status}` };
            }
            // Retry logic for 5xx errors (Service Errors)
            if (response.status >= 500 && attempt < this.maxRetries) {
                return this.retry(body, attempt);
            }
            throw new BINLookupAPIError(errorJson.error, errorJson.message, response.status);
        }
        catch (error) {
            clearTimeout(timer);
            // Retry logic for network/fetch errors (including AbortError from timeout)
            if (!(error instanceof BINLookupAPIError) && attempt < this.maxRetries) {
                return this.retry(body, attempt);
            }
            throw error;
        }
    }
    async retry(body, attempt) {
        // Jitter (±20%) prevents multiple concurrent clients from thundering-herd retrying
        // at identical intervals after a shared outage.
        const base = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s, 16s
        const delay = base * (1 + Math.random() * 0.2);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.requestWithRetry(body, attempt + 1);
    }
}
exports.BINLookupClient = BINLookupClient;
/**
 * Usage Example:
 * * const client = new BINLookupClient({ apiKey: 'YOUR_API_KEY' });
 * * try {
 * const result = await client.lookup(42467101);
 * console.log(`Bank: ${result.data.issuer.name}`);
 * console.log(`Remaining Quota: ${result.quota?.remaining}`);
 * } catch (err) {
 * if (err instanceof BINLookupAPIError) {
 * console.error(`API Error: ${err.code} - ${err.message}`);
 * }
 * }
 */
//# sourceMappingURL=index.js.map