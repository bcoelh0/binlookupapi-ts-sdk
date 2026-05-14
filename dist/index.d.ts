/**
 * BINLookupAPI TypeScript SDK
 * * A production-ready client for interacting with the BINLookupAPI.
 * Features:
 * - Full TypeScript support for all request/response objects
 * - Custom error handling for API-specific error codes
 * - Built-in retry logic with exponential backoff
 * - Quota monitoring via response headers
 */
export type BINScheme = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unionpay' | 'diners' | 'unknown';
export type BINFunding = 'credit' | 'debit' | 'prepaid' | 'unknown';
export interface BINLookupRequest {
    /**
     * The first 4 to 8 digits of a payment card number.
     * Range: 1000 to 99999999.
     */
    number: number;
}
export interface BINCountry {
    code: string;
    name: string;
}
export interface BINIssuer {
    name: string | null;
    website: string | null;
    phone: string | null;
}
export interface BINData {
    bin: string;
    scheme: BINScheme;
    funding: BINFunding;
    brand: string | null;
    category: string | null;
    country: BINCountry;
    issuer: BINIssuer;
    currency: string | null;
    prepaid: boolean;
    commercial: boolean;
}
export interface BINLookupResponse {
    data: BINData;
    /** Quota information extracted from response headers */
    quota?: {
        limit: number;
        remaining: number;
        reset: number;
    };
}
export type BINErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'PAYMENT_REQUIRED' | 'FORBIDDEN' | 'NOT_FOUND' | 'QUOTA_EXCEEDED' | 'SERVICE_ERROR';
export interface BINErrorResponse {
    error: BINErrorCode;
    message: string;
}
export declare class BINLookupAPIError extends Error {
    code: BINErrorCode;
    message: string;
    statusCode: number;
    constructor(code: BINErrorCode, message: string, statusCode: number);
}
export interface SDKConfig {
    apiKey: string;
    baseUrl?: string;
    /** Maximum number of retries for 5xx errors or network failures */
    maxRetries?: number;
    /**
     * Request timeout in milliseconds. Defaults to 10,000ms (10 seconds).
     * Without a timeout, a slow or unresponsive server would stall the caller indefinitely.
     */
    timeout?: number;
}
export declare class BINLookupClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly maxRetries;
    private readonly timeout;
    constructor(config: SDKConfig);
    /**
     * Look up information for a specific BIN.
     * @param bin The 4-8 digit BIN as a number or string.
     */
    lookup(bin: number | string): Promise<BINLookupResponse>;
    /**
     * Internal request handler with exponential backoff retry logic.
     */
    private requestWithRetry;
    private retry;
}
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
//# sourceMappingURL=index.d.ts.map