"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileFormValues } from "@/types/index.type";
import {
	getCurrentUser,
	getProfileByUserId,
	upsertProfileByUserId,
} from "@/services/profile.service";

export function useProfile() {
	const queryClient = useQueryClient();

	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useQuery({
		queryKey: ["current-user"],
		queryFn: getCurrentUser,
	});

	const {
		data: profile,
		isLoading: profileLoading,
		error: profileError,
	} = useQuery({
		queryKey: ["profile", user?.id],
		queryFn: () => getProfileByUserId(user!.id),
		enabled: !!user?.id,
	});

	const {
		mutateAsync: saveProfile,
		isPending: isSaving,
		error: saveError,
	} = useMutation({
		mutationFn: (values: ProfileFormValues) =>
			upsertProfileByUserId(user!.id, values),
		onSuccess: (updated) => {
			queryClient.setQueryData(["profile", user?.id], updated);
		},
	});

	return {
		profile: profile ?? null,
		userId: user?.id ?? null,
		isLoading: userLoading || profileLoading,
		isSaving,
		error: userError
			? userError.message
			: profileError
				? profileError.message
				: null,
		saveError: saveError ? saveError.message : null,
		saveProfile,
		refetch: () =>
			queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }),
	};
}
