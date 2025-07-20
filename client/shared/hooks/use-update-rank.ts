import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../config/api';
import { fetchData } from '../domain/base.service';


export function useUpdateRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ xp, rank, level }: { xp: number; rank: string; level: number }) => {
      await fetchData<unknown>(API_ENDPOINTS.user.rank, {
        method: 'PUT',
        body: JSON.stringify({ xp, rank, level }),
      });
      queryClient.invalidateQueries({ queryKey: ['user-info-rank'] });
    },
  });
}
