'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { settingsArrayToObject } from '@/lib/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { settings } = await api.public.settings();
      return settingsArrayToObject(settings, { mergeDefaults: false });
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });
}