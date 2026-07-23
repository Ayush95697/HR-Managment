import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../api/departments.api';
import type { DepartmentFormData } from '../types/schemas';

export const DEPARTMENTS_QUERY_KEY = ['departments'];

export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: departmentsApi.getAll,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentFormData) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
  });
}
