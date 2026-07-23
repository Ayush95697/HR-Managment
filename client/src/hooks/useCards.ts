import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { cardsApi, type CreateCardRequest, type PatchCardRequest } from '../api/cards.api';
import { boardDetailQueryKey } from './useBoards';
import type { TaskCard, Board, BoardColumn } from '../types';
import type { ApiErrorResponse } from '../api/client';

export type BoardDetail = Board & { columns: BoardColumn[] };

export const cardDetailQueryKey = (id: string) => ['cards', id];
export const cardActivityQueryKey = (id: string) => ['cards', id, 'activity'];

export function useCard(id: string | null) {
  return useQuery({
    queryKey: cardDetailQueryKey(id!),
    queryFn: () => cardsApi.getById(id!),
    enabled: !!id,
  });
}



export function useCardActivity(cardId: string | null) {
  return useQuery({
    queryKey: cardActivityQueryKey(cardId!),
    queryFn: () => cardsApi.getActivity(cardId!),
    enabled: !!cardId,
  });
}

export function useCreateCard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCardRequest) => cardsApi.create(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
    },
  });
}

export function usePatchCard(boardId: string, cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatchCardRequest) => cardsApi.patch(cardId, data),

    // Optimistic Update for Snappy Drag-and-Drop & Inline Edit
    onMutate: async (newCardData) => {
      await queryClient.cancelQueries({ queryKey: boardDetailQueryKey(boardId) });
      const previousBoard = queryClient.getQueryData<BoardDetail>(
        boardDetailQueryKey(boardId)
      );

      if (previousBoard && newCardData.columnId && newCardData.position !== undefined) {
        const updatedColumns = previousBoard.columns.map((col: BoardColumn) => {
          // Remove card from previous column
          const filteredCards = col.cards.filter((c: TaskCard) => c.id !== cardId);

          if (col.id === newCardData.columnId) {
            const existingCard = previousBoard.columns
              .flatMap((c: BoardColumn) => c.cards)
              .find((c: TaskCard) => c.id === cardId);

            if (existingCard) {
              const updatedCard: TaskCard = {
                ...existingCard,
                columnId: newCardData.columnId,
                position: newCardData.position ?? existingCard.position,
                ...(newCardData.title !== undefined && { title: newCardData.title ?? existingCard.title }),
                ...(newCardData.description !== undefined && { description: newCardData.description }),
                ...(newCardData.dueDate !== undefined && { dueDate: newCardData.dueDate }),
              };
              filteredCards.push(updatedCard);
              filteredCards.sort((a: TaskCard, b: TaskCard) => a.position - b.position);
            }
          }
          return { ...col, cards: filteredCards };
        });

        queryClient.setQueryData(boardDetailQueryKey(boardId), {
          ...previousBoard,
          columns: updatedColumns,
        });
      }

      return { previousBoard };
    },

    onError: (_err: ApiErrorResponse, _variables, context) => {
      // Rollback to previous board state on failure (including 409 conflict)
      if (context?.previousBoard) {
        queryClient.setQueryData(boardDetailQueryKey(boardId), context.previousBoard);
      }
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: cardDetailQueryKey(cardId) });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: cardDetailQueryKey(cardId) });
      queryClient.invalidateQueries({ queryKey: cardActivityQueryKey(cardId) });
    },
  });
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { cardId: string; columnId: string; position: number; rowVersion: string }) =>
      cardsApi.patch(payload.cardId, {
        columnId: payload.columnId,
        position: payload.position,
        rowVersion: payload.rowVersion,
      }),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: boardDetailQueryKey(boardId) });
      const previous = queryClient.getQueryData<BoardDetail>(boardDetailQueryKey(boardId));

      queryClient.setQueryData<BoardDetail>(boardDetailQueryKey(boardId), (old) => {
        if (!old) return old;
        const updatedColumns = old.columns.map((col: BoardColumn) => {
          // Remove card from previous column
          const filteredCards = col.cards.filter((c: TaskCard) => c.id !== payload.cardId);

          if (col.id === payload.columnId) {
            const existingCard = old.columns
              .flatMap((c: BoardColumn) => c.cards)
              .find((c: TaskCard) => c.id === payload.cardId);

            if (existingCard) {
              const updatedCard: TaskCard = {
                ...existingCard,
                columnId: payload.columnId,
                position: payload.position,
              };
              filteredCards.push(updatedCard);
              filteredCards.sort((a: TaskCard, b: TaskCard) => a.position - b.position);
            }
          }
          return { ...col, cards: filteredCards };
        });

        return {
          ...old,
          columns: updatedColumns,
        };
      });

      return { previous };
    },

    onError: (err, _payload, context) => {
      // Always roll back local cache on any failure, including 409
      if (context?.previous) {
        queryClient.setQueryData(boardDetailQueryKey(boardId), context.previous);
      }
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error('This card changed elsewhere — refreshing.');
      } else {
        toast.error('Could not move card. Please try again.');
      }
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
    },

    onSuccess: (updatedCard, payload) => {
      // Reconcile with server-authoritative rowVersion/position
      queryClient.setQueryData<BoardDetail>(boardDetailQueryKey(boardId), (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.map(col => {
            if (col.id === updatedCard.columnId || col.cards.some(c => c.id === updatedCard.id)) {
              const filtered = col.cards.filter(c => c.id !== updatedCard.id);
              if (col.id === updatedCard.columnId) {
                filtered.push(updatedCard);
                filtered.sort((a, b) => a.position - b.position);
              }
              return { ...col, cards: filtered };
            }
            return col;
          })
        };
      });
      queryClient.invalidateQueries({ queryKey: cardDetailQueryKey(payload.cardId) });
    },
  });
}

export function useDeleteCard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => cardsApi.delete(cardId),
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: boardDetailQueryKey(boardId) });
      queryClient.removeQueries({ queryKey: cardDetailQueryKey(cardId) });
    },
  });
}

export function useAddComment(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => cardsApi.addComment(cardId, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardActivityQueryKey(cardId) });
      queryClient.invalidateQueries({ queryKey: cardDetailQueryKey(cardId) });
    },
  });
}
