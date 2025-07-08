import axios from "axios";

// services/uploadService.ts
interface UploadResponse {
	success: boolean;
	data: {
		url: string;
		publicId: string;
		width: number;
		height: number;
	};
}

class UploadService {
	async uploadImage(file: File): Promise<UploadResponse> {
		try {
			const formData = new FormData();
			formData.append("image", file);

			const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload/image`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
      });

			return response.data;
		} catch (error) {
			console.error("Error uploading image:", error);
			throw error;
		}
	}

	async deleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
		try {
			const response = await axios.delete(`${import.meta.env.VITE_API_URL}/upload/image/${publicId}`);
			return response.data;
		} catch (error) {
			console.error("Error deleting image:", error);
			throw error;
		}
	}

	// Client-side image validation
	validateImage(file: File): { valid: boolean; error?: string } {
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

		if (!allowedTypes.includes(file.type)) {
			return {
				valid: false,
				error: "Please upload a valid image file (JPEG, PNG, or WebP)",
			};
		}

		if (file.size > maxSize) {
			return {
				valid: false,
				error: "Image size must be less than 5MB",
			};
		}

		return { valid: true };
	}

	// Generate thumbnail URL (for Cloudinary)
	getThumbnailUrl(imageUrl: string, width = 300, height = 300): string {
		if (imageUrl.includes("cloudinary.com")) {
			// Insert transformation parameters for Cloudinary URLs
			return imageUrl.replace("/upload/", `/upload/w_${width},h_${height},c_fill,q_auto/`);
		}
		return imageUrl;
	}
}

export const uploadService = new UploadService();
