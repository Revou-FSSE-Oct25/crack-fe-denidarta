"use client";

import { useState, useEffect, useCallback } from "react";
import type { Profile, ProfileFormValues } from "@/types/index.type";
import {
	getCurrentUser,
	getProfileByUserId,
	upsertProfileByUserId,
} from "@/services/profile.service";

interface UseProfileState {
	profile: Profile | null;
	userId: string | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	saveError: string | null;
}

interface UseProfileReturn extends UseProfileState {
	saveProfile: (values: ProfileFormValues) => Promise<void>;
	refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
	const [state, setState] = useState<UseProfileState>({
		profile: null,
		userId: null,
		isLoading: true,
		isSaving: false,
		error: null,
		saveError: null,
	});

	const fetchProfile = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }));
		try {
			const user = await getCurrentUser();
			// Profile may not exist yet for new users — treat 404 as empty profile.
			let profile: Profile | null = null;
			try {
				profile = await getProfileByUserId(user.id);
			} catch {
				// Profile not found is expected for first-time completion.
			}
			setState((prev) => ({
				...prev,
				userId: user.id,
				profile,
				isLoading: false,
			}));
		} catch (err) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: err instanceof Error ? err.message : "Failed to load profile",
			}));
		}
	}, []);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	const saveProfile = useCallback(
		async (values: ProfileFormValues) => {
			if (!state.userId) return;
			setState((prev) => ({ ...prev, isSaving: true, saveError: null }));
			try {
				const updated = await upsertProfileByUserId(state.userId, values);
				setState((prev) => ({
					...prev,
					profile: updated,
					isSaving: false,
				}));
			} catch (err) {
				setState((prev) => ({
					...prev,
					isSaving: false,
					saveError:
						err instanceof Error ? err.message : "Failed to save profile",
				}));
			}
		},
		[state.userId],
	);

	return {
		...state,
		saveProfile,
		refetch: fetchProfile,
	};
}
