export interface LocationItem {
	code: string;
	name: string;
}

interface LocationResponse {
	data: LocationItem[];
	meta: {
		administrative_area_level: number;
		updated_at: string;
	};
}

const BASE_URL = "https://wilayah.id/api";

/**
 * Helper service to fetch location data from wilayah.id
 */
export const LocationService = {
	/**
	 * Fetch all provinces in Indonesia
	 */
	async getProvinces(): Promise<LocationItem[]> {
		try {
			const response = await fetch(`${BASE_URL}/provinces.json`);
			if (!response.ok) throw new Error("Failed to fetch provinces");
			const result = (await response.json()) as LocationResponse;
			return result.data;
		} catch (error) {
			console.error("Error fetching provinces:", error);
			return [];
		}
	},

	/**
	 * Fetch regencies based on province code
	 */
	async getRegencies(provinceCode: string): Promise<LocationItem[]> {
		if (!provinceCode) return [];
		try {
			const response = await fetch(
				`${BASE_URL}/regencies/${provinceCode}.json`,
			);
			if (!response.ok)
				throw new Error(
					`Failed to fetch regencies for province ${provinceCode}`,
				);
			const result = (await response.json()) as LocationResponse;
			return result.data;
		} catch (error) {
			console.error(
				`Error fetching regencies for province ${provinceCode}:`,
				error,
			);
			return [];
		}
	},

	/**
	 * Fetch districts based on regency code
	 */
	async getDistricts(regencyCode: string): Promise<LocationItem[]> {
		if (!regencyCode) return [];
		try {
			const response = await fetch(`${BASE_URL}/districts/${regencyCode}.json`);
			if (!response.ok)
				throw new Error(`Failed to fetch districts for regency ${regencyCode}`);
			const result = (await response.json()) as LocationResponse;
			return result.data;
		} catch (error) {
			console.error(
				`Error fetching districts for regency ${regencyCode}:`,
				error,
			);
			return [];
		}
	},

	/**
	 * Fetch villages based on district code
	 */
	async getVillages(districtCode: string): Promise<LocationItem[]> {
		if (!districtCode) return [];
		try {
			const response = await fetch(`${BASE_URL}/villages/${districtCode}.json`);
			if (!response.ok)
				throw new Error(
					`Failed to fetch villages for district ${districtCode}`,
				);
			const result = (await response.json()) as LocationResponse;
			return result.data;
		} catch (error) {
			console.error(
				`Error fetching villages for district ${districtCode}:`,
				error,
			);
			return [];
		}
	},
};
