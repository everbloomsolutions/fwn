import useSWR, { SWRConfiguration } from 'swr';
import { apiRequest } from '@/shared/core/http/apiClient';

export function useApi<T = unknown>(url: string | null, config?: SWRConfiguration<T>) {
  const fetcher = async (requestUrl: string): Promise<T> => {
    return apiRequest<T>({ method: 'GET', url: requestUrl });
  };

  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}
