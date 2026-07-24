import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi, type UpdateProfilePayload, type ChangePasswordPayload } from '../api/profile.api';

export const PROFILE_KEY = ['profile', 'me'];
export const SESSIONS_KEY = ['profile', 'sessions'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: profileApi.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateMe(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_KEY, data);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      // Patch only the avatarUrl in the cached profile
      queryClient.setQueryData(PROFILE_KEY, (old: any) =>
        old ? { ...old, avatarUrl: data.avatarUrl } : old
      );
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: () => {
      queryClient.setQueryData(PROFILE_KEY, (old: any) =>
        old ? { ...old, avatarUrl: null } : old
      );
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: profileApi.getSessions,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileApi.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });
}

export function useRevokeAllOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileApi.revokeAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });
}
