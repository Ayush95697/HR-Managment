import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { useAuthStore } from '../store/authStore';

export function useTaskVelocity(range: number = 30) {
  return useQuery({
    queryKey: ['dashboard', 'velocity', range],
    queryFn: () => dashboardApi.getTaskVelocity(range),
  });
}

export function useDepartmentDistribution() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard', 'department-distribution'],
    queryFn: dashboardApi.getDepartmentDistribution,
    enabled: user?.role === 'Admin',
  });
}

export function useWorkloadBalance() {
  return useQuery({
    queryKey: ['dashboard', 'workload-balance'],
    queryFn: dashboardApi.getWorkloadBalance,
  });
}

export function useActivityFeed() {
  return useInfiniteQuery({
    queryKey: ['dashboard', 'activity-feed'],
    queryFn: ({ pageParam = 1 }) => dashboardApi.getActivityFeed(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => lastPage.length === 20 ? pages.length + 1 : undefined,
    refetchInterval: 20000,
  });
}
