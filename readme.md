BINLookupAPI TypeScript SDKA production-ready, fully-typed TypeScript SDK for the BINLookupAPI. Easily retrieve card network, issuing bank, country, and funding information from Bank Identification Numbers (BINs).FeaturesFull TypeScript Support: Comprehensive interfaces for all request and response objects.Resilient: Built-in exponential backoff retry logic (1s, 2s, 4s, 8s, 16s) for transient network or server errors.Detailed Error Handling: Custom BINLookupAPIError class mapping directly to API error codes.Quota Monitoring: Automatic extraction of rate-limit headers (X-Quota-Limit, X-Quota-Remaining).Zero Dependencies: Lightweight and uses the native fetch API.Installationnpm install binlookupapi-sdk
# or
yarn add binlookupapi-sdk
Quick Startimport { BINLookupClient, BINLookupAPIError } from './binlookup-sdk';

const client = new BINLookupClient({
  apiKey: 'your_api_key_here'
});

async function checkCard(bin: string) {
  try {
    const result = await client.lookup(bin);

    console.log(`Scheme: ${result.data.scheme}`);     // e.g., "visa"
    console.log(`Bank: ${result.data.issuer.name}`);  // e.g., "ING BANK SLASKI SA"
    console.log(`Country: ${result.data.country.name}`); // e.g., "POLAND"

    // Check remaining daily quota
    console.log(`Quota remaining: ${result.quota?.remaining}`);
  } catch (error) {
    if (error instanceof BINLookupAPIError) {
      console.error(`API Error [${error.code}]: ${error.message}`);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

checkCard('42467101');
ConfigurationThe BINLookupClient constructor accepts a configuration object:PropertyTypeDefaultDescriptionapiKeystringRequiredYour API key from the dashboard.baseUrlstringhttps://api.binlookupapi.comCustom API endpoint (if using a proxy).maxRetriesnumber5Max retries for 5xx errors or network timeouts.API Reference.lookup(bin: number | string)Performs a POST request to /v1/bin. The BIN must be between 4 and 8 digits.Response Object (BINLookupResponse)data:bin: The searched BIN.scheme: visa, mastercard, amex, discover, jcb, unionpay, diners, or unknown.funding: credit, debit, prepaid, or unknown.brand: Product name (e.g., "PLATINUM").country: { code: string, name: string }.issuer: { name: string, website: string, phone: string }.prepaid: boolean.commercial: boolean.quota:limit: Total daily allowance.remaining: Requests left for the day.reset: Unix timestamp of the next reset.Error HandlingThe SDK throws a BINLookupAPIError for non-200 responses.Error CodeDescriptionBAD_REQUESTInvalid BIN format.UNAUTHORIZEDAPI key is missing or invalid.PAYMENT_REQUIREDNo active subscription.NOT_FOUNDBIN not in database.QUOTA_EXCEEDEDDaily limit reached.SERVICE_ERRORInternal API error.Best PracticesCaching: BIN data rarely changes. We recommend caching results for 24-48 hours to save on quota.Environment Variables: Never hardcode your API key. Use process.env.BIN_API_KEY.8-Digit BINs: When possible, provide 8 digits for the highest accuracy.SupportDocumentation: https://binlookupapi.com/docsSupport: https://binlookupapi.com/contact/