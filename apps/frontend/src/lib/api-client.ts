import {
  ApiError,
  ApiRequest,
  ApiResponse,
  ServiceInfo,
  ServiceMethod,
} from '@feathers-playground/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getServices(): Promise<ServiceInfo[]> {
    const response = await fetch(`${this.baseUrl}/services`);
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    return response.json() as Promise<ServiceInfo[]>;
  }

  async makeRequest(request: ApiRequest): Promise<ApiResponse> {
    const { method, servicePath, query, data, headers = {}, id } = request;

    let url = `${this.baseUrl}${servicePath.startsWith('/') ? servicePath : '/' + servicePath}`;

    // Add ID to URL for get, patch, remove methods
    if (id && ['get', 'patch', 'remove'].includes(method)) {
      url += `/${id}`;
    }

    // Add query parameters for find method or when query is provided
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    const requestOptions: RequestInit = {
      method: this.getHttpMethod(method),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Add body for create and patch methods
    if (['create', 'patch'].includes(method) && data) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);

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
      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw API errors
      }

      // Handle network errors
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  private getHttpMethod(method: ServiceMethod): string {
    switch (method) {
      case 'find':
        return 'GET';
      case 'get':
        return 'GET';
      case 'create':
        return 'POST';
      case 'patch':
        return 'PATCH';
      case 'remove':
        return 'DELETE';
      default:
        return 'GET';
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
