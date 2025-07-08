import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	role: "customer" | "storekeeper" | "salesrep" | "admin";
	phone?: string;
	isActive: boolean;
	lastLogin?: Date;
	createdAt: Date;
	wishlist: string[]; // Array of product IDs
	avatar?: string;
}

export interface CreateUserData {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	role: "customer" | "storekeeper" | "salesrep" | "admin";
	phone?: string;
	isActive?: boolean;
}

export interface UpdateUserData {
	firstName?: string;
	lastName?: string;
	username?: string;
	email?: string;
	role?: "customer" | "storekeeper" | "salesrep" | "admin";
	phone?: string;
	isActive?: boolean;
	avatar?: string;
}


export interface Address {
  id: string;
  type: "billing" | "shipping";
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface AddressFormData {
  type: "billing" | "shipping";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

class UserManagementService {
	private getAuthHeaders() {
		const token = localStorage.getItem("dashngshop-token");
		return {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		};
	}

	// Get all users (Admin only)
	async getUsers() {
		try {
			const response = await axios.get(`${API_URL}/users`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to fetch users");
			}
			throw new Error("Network error");
		}
	}

	// Get single user by ID
	async getUser(userId: string) {
		try {
			const response = await axios.get(`${API_URL}/users/${userId}`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to fetch user");
			}
			throw new Error("Network error");
		}
	}

	// Create new user (Admin only)
	async createUser(userData: CreateUserData) {
		try {
			const response = await axios.post(`${API_URL}/users`, userData, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to create user");
			}
			throw new Error("Network error");
		}
	}

	// Update user (Admin only)
	async updateUser(userId: string, userData: UpdateUserData) {
		try {
			const response = await axios.put(`${API_URL}/users/${userId}`, userData, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to update user");
			}
			throw new Error("Network error");
		}
	}

	// Delete user (Admin only)
	async deleteUser(userId: string) {
		try {
			const response = await axios.delete(`${API_URL}/users/${userId}`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to delete user");
			}
			throw new Error("Network error");
		}
	}

	// Update user profile (Own profile)
	async updateProfile(userData: UpdateUserData) {
		try {
			const response = await axios.put(`${API_URL}/auth/updatedetails`, userData, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to update profile");
			}
			throw new Error("Network error");
		}
	}

	// Change password
	async changePassword(currentPassword: string, newPassword: string) {
		try {
			const response = await axios.put(
				`${API_URL}/auth/change-password`,
				{ currentPassword, newPassword },
				this.getAuthHeaders(),
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to change password");
			}
			throw new Error("Network error");
		}
	}

	// Get user's wishlist
	async getWishlist() {
		try {
			const response = await axios.get(`${API_URL}/auth/wishlist`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to fetch wishlist");
			}
			throw new Error("Network error");
		}
	}

	// Clear entire wishlist
	async clearWishlist() {
		try {
			const response = await axios.delete(`${API_URL}/auth/wishlist`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to clear wishlist");
			}
			throw new Error("Network error");
		}
	}

	// Toggle product in wishlist (add if not present, remove if present)
	async toggleWishlist(productId: string) {
		try {
			const response = await axios.post(
				`${API_URL}/auth/wishlist/toggle`,
				{ productId },
				this.getAuthHeaders(),
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to toggle wishlist");
			}
			throw new Error("Network error");
		}
	}

	// Sync local wishlist with user account
	async syncWishlist(userId: string, ids: string[]) {
		try {
			const response = await axios.post(
				`${API_URL}/auth/wishlist/sync`,
				{ userId, ids },
				this.getAuthHeaders(),
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to sync wishlist");
			}
			throw new Error("Network error");
		}
	}

	// Get user statistics (Admin only)
	async getUserStats() {
		try {
			const response = await axios.get(`${API_URL}/users/stats`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to fetch user statistics");
			}
			throw new Error("Network error");
		}
	}

	// Bulk update users (Admin only)
	async bulkUpdateUsers(userIds: string[], updateData: UpdateUserData) {
		try {
			const response = await axios.put(
				`${API_URL}/users/bulk-update`,
				{ userIds, updateData },
				this.getAuthHeaders(),
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to bulk update users");
			}
			throw new Error("Network error");
		}
	}

	// Search users (Admin only)
	async searchUsers(query: string, filters?: { role?: string; isActive?: boolean }) {
		try {
			const params = new URLSearchParams();
			params.append("q", query);

			if (filters?.role) {
				params.append("role", filters.role);
			}

			if (filters?.isActive !== undefined) {
				params.append("isActive", filters.isActive.toString());
			}

			const response = await axios.get(`${API_URL}/users/search?${params.toString()}`, this.getAuthHeaders());
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to search users");
			}
			throw new Error("Network error");
		}
	}

	// Get user addresses
	async getAddresses() {
		const response = await axios.get(`${API_URL}/auth/addresses`, this.getAuthHeaders());
		return response.data;
	}

	// Create new address
	async createAddress(addressData: AddressFormData) {
		const response = await axios.post(`${API_URL}/auth/addresses`, addressData, this.getAuthHeaders());
		return response.data;
	}

	// Update existing address
	async updateAddress(addressId: string, addressData: AddressFormData) {
		const response = await axios.put(
			`${API_URL}/auth/addresses/${addressId}`,
			addressData,
			this.getAuthHeaders(),
		);
		return response.data;
	}

	// Delete address
	async deleteAddress(addressId: string) {
		const response = await axios.delete(`${API_URL}/auth/addresses/${addressId}`, this.getAuthHeaders());
		return response.data;
	}

	// Set default address
	async setDefaultAddress(addressId: string) {
		const response = await axios.put(
			`${API_URL}/auth/addresses/${addressId}/default`,
			{},
			this.getAuthHeaders(),
		);
		return response.data;
	}
}

export const userManagementService = new UserManagementService();
