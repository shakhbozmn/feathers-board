import { apiClient } from '@/lib/api-client';
import { ServiceInfo } from '@feathers-playground/types';
import { useQuery } from '@tanstack/react-query';

export function useServices() {
  return useQuery<ServiceInfo[]>({
    queryKey: ['services'],
    queryFn: () => apiClient.getServices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}