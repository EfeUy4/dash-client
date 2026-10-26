// services/privateLinkService.ts
import api from "@/utils/api";

export type PrivateLinkStatus = "active" | "expired" | "revoked" | "exhausted";

export type LinkItemSpecMode = "locked" | "choosable";

export interface PrivateLinkItemInput {
	product: string;
	size?: string;
	color?: string;
	quantity: number;
	// "choosable" lets the buyer pick from allowedSizes/allowedColors (empty = all product options)
	specMode?: LinkItemSpecMode;
	allowedSizes?: string[];
	allowedColors?: string[];
}

export interface PrivateLink {
	id: string;
	title: string;
	note?: string;
	items: Array<{
		product: { id?: string; _id?: string; name: string; images?: string[]; sku?: string; visibility?: string } | string;
		size?: string;
		color?: string;
		quantity: number;
		specMode?: LinkItemSpecMode;
		allowedSizes?: string[];
		allowedColors?: string[];
	}>;
	expiresAt: string;
	maxUses?: number | null;
	uses: number;
	status: PrivateLinkStatus;
	createdBy?: { firstName: string; lastName: string; role: string } | string;
	revokedAt?: string | null;
	createdAt: string;
	// false for links created before re-copy existed (only a hash of their token is stored)
	recopyable?: boolean;
	// Only present in the create response; cannot be retrieved again
	token?: string;
	url?: string;
	events?: Array<{ _id: string; action: string; createdAt: string; actor?: { firstName: string; lastName: string } }>;
	orders?: Array<{ _id: string; orderNumber: string; status: string; paymentStatus: string; total: number; notes?: string }>;
}

export interface PrivateLinkPayload {
	title: string;
	note?: string;
	items: PrivateLinkItemInput[];
	expiresInHours?: number;
	expiresAt?: string;
	maxUses?: number | null;
}

export interface ResolvedPrivateLink {
	title: string;
	note?: string;
	expiresAt: string;
	items: Array<{
		product?: {
			id: string;
			name: string;
			description: string;
			images: string[];
			price: number;
			priceNGN: number;
			originalPrice?: number;
			category: string;
			subcategory?: string;
			features?: string[];
			sizes?: string[];
			colors?: string[];
		};
		size?: string;
		color?: string;
		quantity: number;
		specMode?: LinkItemSpecMode;
		sizeOptions?: string[];
		colorOptions?: string[];
		lineTotalNGN?: number;
		available: boolean;
	}>;
}

class PrivateLinkService {
	async list(status?: PrivateLinkStatus): Promise<PrivateLink[]> {
		const response = await api.get("/private-links", { params: status ? { status } : undefined });
		return response.data;
	}

	async get(id: string): Promise<PrivateLink> {
		const response = await api.get(`/private-links/${id}`);
		return response.data;
	}

	async getUrl(id: string): Promise<{ url: string | null; legacy: boolean; unrecoverable?: boolean }> {
		const response = await api.get(`/private-links/${id}/url`);
		return response.data;
	}

	async create(payload: PrivateLinkPayload): Promise<PrivateLink> {
		const response = await api.post("/private-links", payload);
		return response.data;
	}

	async update(id: string, payload: Partial<PrivateLinkPayload>): Promise<PrivateLink> {
		const response = await api.patch(`/private-links/${id}`, payload);
		return response.data;
	}

	async revoke(id: string): Promise<PrivateLink> {
		const response = await api.post(`/private-links/${id}/revoke`);
		return response.data;
	}

	// Public: invalid, expired, revoked and used-up links all return 404
	async resolve(token: string): Promise<ResolvedPrivateLink> {
		const response = await api.get(`/private-links/resolve/${encodeURIComponent(token)}`);
		return response.data;
	}
}

export const privateLinkService = new PrivateLinkService();
