/**
 * Safe API fetch helper to eliminate "Unexpected token '<', <!DOCTYPE... is not valid JSON" errors
 * across both full-stack (Express) and static/deployed environments.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    const trimmed = text.trim();
    const looksLikeJson =
      contentType.includes('application/json') ||
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'));

    if (looksLikeJson) {
      try {
        const json = JSON.parse(trimmed) as T;
        return {
          ok: res.ok,
          status: res.status,
          data: json,
          error: !res.ok ? ((json as any)?.error || (json as any)?.message || `Request failed with status ${res.status}`) : undefined,
        };
      } catch (jsonErr: any) {
        return {
          ok: false,
          status: res.status,
          data: null,
          error: 'Response was malformed JSON.',
        };
      }
    }

    // Response was NOT JSON (e.g., HTML from static SPA fallback, 404 HTML, or 502/504 proxy)
    return {
      ok: false,
      status: res.status,
      data: null,
      error: res.ok
        ? 'Unexpected HTML response from server.'
        : `Server responded with status ${res.status}`,
    };
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: netErr?.message || 'Network request failed. Please check your connection.',
    };
  }
}
