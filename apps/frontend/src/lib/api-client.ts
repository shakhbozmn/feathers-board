import {
  ApiError,
  ApiRequest,
  ApiResponse,
  ServiceInfo,
  ServiceMethod,
} from '@feathers-playground/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

const HTTP_VERB: Record<ServiceMethod, string> = {
  find: 'GET',
  get: 'GET',
  create: 'POST',
  patch: 'PATCH',
  remove: 'DELETE',
};

export const httpVerbFor = (method: ServiceMethod): string =>
  HTTP_VERB[method] ?? 'GET';

export interface PreparedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  // The literal body string that will be sent, or null when no body.
  body: string | null;
  // Echo metadata kept separate from the literal body so consumers can
  // re-render the body in JSON pretty form without re-stringifying.
  bodyJson: any;
  // Echo's view of the input: method as the Feathers verb the developer
  // picked, not the HTTP verb — that's what they typed.
  input: ApiRequest;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Build the exact request the API client will fetch. Single source of
   * truth for URL, HTTP method, headers, and body. The echo panel and the
   * Copy-as-cURL feature consume this output verbatim — no second path
   * means no drift between what is shown and what is sent.
   */
  prepareRequest(request: ApiRequest): PreparedRequest {
    const { method, servicePath, query, data, headers = {}, id } = request;

    // 1. Base URL + service path. Strip a leading slash on servicePath so
    //    we don't end up with `host:port//path`. Don't double-up.
    const cleanPath = servicePath.startsWith('/')
      ? servicePath
      : `/${servicePath}`;
    let url = `${this.baseUrl}${cleanPath}`;

    // 2. ID only on the methods that take it. Use the explicit verb list,
    //    not `['get','patch','remove'].length` (always truthy, always wrong).
    if (
      id !== undefined &&
      id !== '' &&
      ['get', 'patch', 'remove'].includes(method)
    ) {
      url += `/${encodeURIComponent(id)}`;
    }

    // 3. Query string. URLSearchParams handles encoding.
    if (query && Object.keys(query).length > 0) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== '') {
          sp.append(k, String(v));
        }
      }
      if (sp.toString()) url += `?${sp.toString()}`;
    }

    // 4. HTTP method. The Feathers verb → HTTP verb mapping must be the
    //    single source of truth so the cURL export matches the fetch.
    const httpMethod = httpVerbFor(method);

    // 5. Headers. Content-Type: application/json is added for any request
    //    that carries a JSON body so the cURL export (which has to include
    //    it explicitly) matches what fetch would have set automatically.
    const finalHeaders: Record<string, string> = { ...headers };
    const shouldHaveBody =
      (method === 'create' || method === 'patch') && data !== undefined;
    if (shouldHaveBody && !('Content-Type' in finalHeaders)) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    // 6. Body. JSON-stringify if there is one. Never stringifies `{}` to
    //    "null" or anything weird; if the data is invalid we just send
    //    the stringified version verbatim and let the server reject.
    let body: string | null = null;
    if (shouldHaveBody) {
      body = JSON.stringify(data);
    }

    return {
      url,
      method: httpMethod,
      headers: finalHeaders,
      body,
      bodyJson: data,
      input: request,
    };
  }

  async getServices(): Promise<ServiceInfo[]> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/services`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown error';
      throw {
        message: `Couldn’t reach the API at ${this.baseUrl}. Is the backend running? (${reason})`,
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
    if (!response.ok) {
      throw {
        message: `API returned ${response.status} ${response.statusText} while listing services.`,
        code: response.status,
      } as ApiError;
    }
    return response.json() as Promise<ServiceInfo[]>;
  }

  async makeRequest(request: ApiRequest): Promise<ApiResponse> {
    const prepared = this.prepareRequest(request);

    const requestOptions: RequestInit = {
      method: prepared.method,
      headers: prepared.headers,
    };
    if (prepared.body !== null) requestOptions.body = prepared.body;

    try {
      const response = await fetch(prepared.url, requestOptions);
      const responseData = await response.json().catch(() => null);

      const apiResponse: ApiResponse = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(response.headers),
      };

      if (!response.ok) {
        const errorData = responseData as any;
        const error: ApiError = {
          message: errorData?.message || response.statusText,
          code: errorData?.code || response.status,
          className: errorData?.className,
          data: errorData?.data,
          errors: errorData?.errors,
        };
        throw error;
      }

      return apiResponse;
    } catch (error) {
      // A server error we threw above is a plain ApiError object (has `code`).
      // Re-throw it as-is so the real status/message surfaces (e.g. 401 "Not
      // authenticated") instead of being masked as a network error.
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      // Genuine network/transport failure (fetch rejected, CORS blocked, DNS).
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

export const apiClient = new ApiClient();
