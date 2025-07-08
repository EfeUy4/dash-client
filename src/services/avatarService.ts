import axios from "axios";
import { User } from "./userManagementService";
import { uploadService } from "./uploadService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AvatarUpdateResponse {
	success: boolean;
	message: string;
	user: User;
}

class AvatarService {
	private getAuthHeaders() {
		const token = localStorage.getItem("dashngshop-token");
		return {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		};
	}

	// Upload image and update user avatar
	async uploadAvatar(file: File): Promise<AvatarUpdateResponse> {
		try {
			// First upload the image using the upload service
			const uploadResult = await uploadService.uploadImage(file);

			// Then update the user's avatar with the uploaded image URL
			const response = await axios.put(
				`${API_URL}/auth/update-avatar`,
				{
					avatar: uploadResult.data.url,
					publicId: uploadResult.data.publicId,
				},
				this.getAuthHeaders(),
			);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to upload avatar");
			}
			throw new Error("Network error while uploading avatar");
		}
	}

	// Delete user avatar
	async deleteAvatar(): Promise<AvatarUpdateResponse> {
		try {
			const response = await axios.delete(`${API_URL}/auth/delete-avatar`, this.getAuthHeaders());

			// If the response includes publicId, also delete from cloud storage
			if (response.data.publicId) {
				try {
					await uploadService.deleteImage(response.data.publicId);
				} catch (error) {
					console.warn("Failed to delete image from cloud storage:", error);
					// Don't throw here as the avatar was already removed from user profile
				}
			}

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || "Failed to delete avatar");
			}
			throw new Error("Network error while deleting avatar");
		}
	}

	// Validate image (delegate to upload service)
	validateImage(file: File): { valid: boolean; error?: string } {
		return uploadService.validateImage(file);
	}

	// Generate thumbnail URL (delegate to upload service)
	getThumbnailUrl(imageUrl: string, width = 300, height = 300): string {
		return uploadService.getThumbnailUrl(imageUrl, width, height);
	}

	// Create preview URL for selected image
	createPreviewUrl(file: File): string {
		return URL.createObjectURL(file);
	}

	// Clean up preview URL
	revokePreviewUrl(url: string): void {
		URL.revokeObjectURL(url);
	}
}

export const avatarService = new AvatarService();
