import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '../api/boards.api';
import { columnsApi } from '../api/columns.api';
import type { BoardFormData, ColumnFormData } from '../types/schemas';

export const BOARDS_QUERY_KEY = ['boards'];
export const boardDetailQueryKey = (id: string) => ['boards', id];

export function useBoards() {
  return useQuery({
    queryKey: BOARDS_QUERY_KEY,
    queryFn: boardsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useBoard(id: string) {
  return useQuery({
    queryKey: boardDetailQueryKey(id),
    queryFn: () => boardsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BoardFormData) => boardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
    },
  });
}

export function useUpdateBoard(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => boardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(id) });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => boardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
    },
  });
}

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ColumnFormData) => columnsApi.create(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
    },
  });
}

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: { name: string; order?: number } }) =>
      columnsApi.update(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columnId: string) => columnsApi.delete(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
    },
  });
}
