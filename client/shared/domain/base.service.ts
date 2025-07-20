import { ApiResponse } from '@/shared/lib/types/http';
import { PaginatedResponse } from '@/shared/lib/types/pagination';
import { Filter } from '@/shared/lib/types/filter';
import { API_URL } from '@/shared/lib/config/api';

export interface ResourceEndpoints {
  base: string;
  list: (qs: string) => string;
  create: string;
  detail: (slug: string) => string;
  update: (slug: string) => string;
  delete: (slug: string) => string;
  [key: string]: unknown;
}

export interface BaseService<T, TPayload> {
  list(filter: Filter): Promise<PaginatedResponse<T>>;
  detail(slug: string): Promise<T>;
  create(payload: TPayload): Promise<ApiResponse<T>>;
  update(slug: string, payload: TPayload): Promise<ApiResponse<T>>;
  remove(slug: string): Promise<ApiResponse>;
}


export async function fetchData<R>(url: string, options: RequestInit): Promise<R> {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      } catch {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
      }
    }

    // PATCH: Ne parser en JSON que si le body n'est pas vide (ex: DELETE 204)
    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
      return undefined as R;
    }
    const text = await response.text();
    if (!text) {
      return undefined as R;
    }
    return JSON.parse(text) as R;
  }

export abstract class BaseServiceImpl<T, TPayload> implements BaseService<T, TPayload> {
  protected abstract endpoints: ResourceEndpoints;

  protected abstract serializeParams(filter: Filter): string;
  

  protected get<R>(endpoint: string): Promise<R> {
    return fetchData<R>(endpoint, { method: 'GET' });
  }

  protected post<R>(endpoint: string, data: unknown): Promise<R> {
    return fetchData<R>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


  protected put<R>(endpoint: string, data: unknown): Promise<R> {
    return fetchData<R>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  protected delete<R>(endpoint: string): Promise<R> {
    return fetchData<R>(endpoint, { method: 'DELETE' });
  }

  async list(filter: Filter): Promise<PaginatedResponse<T>> {
    const queryString = this.serializeParams(filter);
    return this.get<PaginatedResponse<T>>(this.endpoints.list(queryString));
  }

  async detail(slug: string): Promise<T> {
    return this.get<T>(this.endpoints.detail(slug));
  }

  async create(payload: TPayload): Promise<ApiResponse<T>> {
    return this.post<ApiResponse<T>>(this.endpoints.create, payload);
  }

  async update(slug: string, payload: TPayload): Promise<ApiResponse<T>> {
    return this.put<ApiResponse<T>>(this.endpoints.update(slug), payload);
  }

  async remove(slug: string): Promise<ApiResponse> {
    return this.delete<ApiResponse>(this.endpoints.delete(slug));
  }

  protected handleApiError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Une erreur inconnue est survenue');
  }
}