import { useState, useEffect } from "react";
import { Edit2, Save, X, User, Lock, Bell, Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userManagementService } from "@/services/userManagementService";
import { avatarService } from "@/services/avatarService";
import { useToastUtils } from "@/services/toast";

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	username: string;
}

interface PasswordData {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

interface PreferencesData {
	emailNotifications: boolean;
	smsNotifications: boolean;
	newsletter: boolean;
}

const CustomerAccount = () => {
	const { user, updateUser } = useAuth();
	const { showSuccessToast, showErrorToast } = useToastUtils();

	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		username: "",
	});

	const [passwordData, setPasswordData] = useState<PasswordData>({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [preferences, setPreferences] = useState<PreferencesData>({
		emailNotifications: true,
		smsNotifications: false,
		newsletter: true,
	});

	// Initialize form data when user is loaded
	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				phone: user.phone || "",
				username: user.username || "",
      });
      console.log(user)
		}
	}, [user]);

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handlePasswordChange = (field: keyof PasswordData, value: string) => {
		setPasswordData((prev) => ({ ...prev, [field]: value }));
	};

	const handlePreferenceChange = (field: keyof PreferencesData, value: boolean) => {
		setPreferences((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveProfile = async () => {
		if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
			showErrorToast("Please fill in all required fields");
			return;
		}

		setIsLoading(true);
		try {
			const updatedUser = await userManagementService.updateProfile({
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				username: formData.username,
			});

			// Update user in auth context
			updateUser(updatedUser);
			setIsEditing(false);
			showSuccessToast("Profile updated successfully");
		} catch (error: any) {
			showErrorToast(error.message || "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangePassword = async () => {
		if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
			showErrorToast("Please fill in all password fields");
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			showErrorToast("New passwords do not match");
			return;
		}

		if (passwordData.newPassword.length < 6) {
			showErrorToast("New password must be at least 6 characters long");
			return;
		}

		setIsLoading(true);
		try {
			await userManagementService.changePassword(passwordData.currentPassword, passwordData.newPassword);

			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setShowPasswordModal(false);
			showSuccessToast("Password changed successfully");
		} catch (error: any) {
			showErrorToast(error.message || "Failed to change password");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate image using avatar service (which delegates to upload service)
		const validation = avatarService.validateImage(file);
		if (!validation.valid) {
			showErrorToast(validation.error || "Invalid image file");
			return;
		}

		setIsUploadingAvatar(true);

		try {
			// Create preview
			const previewUrl = avatarService.createPreviewUrl(file);
			setAvatarPreview(previewUrl);

			// Upload image and update user avatar
			const result = await avatarService.uploadAvatar(file);

			// Update user in auth context with the returned user data
			updateUser(result.user as any);

			// Clean up preview
			avatarService.revokePreviewUrl(previewUrl);
			setAvatarPreview(null);

			showSuccessToast("Profile picture updated successfully");
		} catch (error: any) {
			// Clean up preview on error
			if (avatarPreview) {
				avatarService.revokePreviewUrl(avatarPreview);
				setAvatarPreview(null);
			}
			showErrorToast(error.message || "Failed to upload profile picture");
		} finally {
			setIsUploadingAvatar(false);
			// Reset file input
			event.target.value = "";
		}
	};

	const handleDeleteAvatar = async () => {
		if (!user?.avatar) return;

		if (!confirm("Are you sure you want to remove your profile picture?")) {
			return;
		}

		setIsUploadingAvatar(true);
		try {
			const result = await avatarService.deleteAvatar();

			// Update user in auth context
			updateUser(result.user as any);

			showSuccessToast("Profile picture removed successfully");
		} catch (error: any) {
			showErrorToast(error.message || "Failed to remove profile picture");
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleCancel = () => {
		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				phone: user.phone || "",
				username: user.username || "",
      });
      console.log(user)
		}
		setIsEditing(false);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Profile Section */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900 flex items-center">
						<User className="w-6 h-6 mr-2" />
						My Account
					</h1>
					{!isEditing ? (
						<button
							onClick={() => setIsEditing(true)}
							className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
						>
							<Edit2 className="w-4 h-4" />
							<span>Edit</span>
						</button>
					) : (
						<div className="flex space-x-2">
							<button
								onClick={handleSaveProfile}
								disabled={isLoading}
								className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
							>
								<Save className="w-4 h-4" />
								<span>{isLoading ? "Saving..." : "Save"}</span>
							</button>
							<button
								onClick={handleCancel}
								disabled={isLoading}
								className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
							>
								<X className="w-4 h-4" />
								<span>Cancel</span>
							</button>
						</div>
					)}
				</div>

				{/* Avatar Section */}
				<div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-200">
					<div className="relative">
						<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
							{avatarPreview ? (
								<img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
							) : user?.avatar ? (
								<img
									src={avatarService.getThumbnailUrl(user.avatar, 80, 80)}
									alt="Profile"
									className="w-full h-full object-cover"
								/>
							) : (
								<User className="w-8 h-8 text-gray-400" />
							)}
						</div>
						<label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors">
							<Camera className="w-3 h-3 text-white" />
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleAvatarUpload}
								disabled={isUploadingAvatar}
							/>
						</label>
						{isUploadingAvatar && (
							<div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							</div>
						)}
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-medium text-gray-900">
							{user?.firstName} {user?.lastName}
						</h3>
						<p className="text-sm text-gray-600">{user?.email}</p>
						<p className="text-xs text-gray-500 mt-1">
							Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
						</p>
						{user?.avatar && (
							<button
								onClick={handleDeleteAvatar}
								disabled={isUploadingAvatar}
								className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 disabled:opacity-50"
							>
								<Trash2 className="w-3 h-3" />
								<span>Remove photo</span>
							</button>
						)}
					</div>
				</div>

				{/* Profile Form */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
						{isEditing ? (
							<input
								type="text"
								value={formData.firstName}
								onChange={(e) => handleInputChange("firstName", e.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						) : (
							<p className="text-gray-900 py-2">{formData.firstName}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
						{isEditing ? (
							<input
								type="text"
								value={formData.lastName}
								onChange={(e) => handleInputChange("lastName", e.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						) : (
							<p className="text-gray-900 py-2">{formData.lastName}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
						{isEditing ? (
							<input
								type="text"
								value={formData.username}
								onChange={(e) => handleInputChange("username", e.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						) : (
							<p className="text-gray-900 py-2">{formData.username || "Not set"}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
						{isEditing ? (
							<input
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange("email", e.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						) : (
							<p className="text-gray-900 py-2">{formData.email}</p>
						)}
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
						{isEditing ? (
							<input
								type="tel"
								value={formData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="+234 801 234 5678"
							/>
						) : (
							<p className="text-gray-900 py-2">{formData.phone || "Not provided"}</p>
						)}
					</div>
				</div>
			</div>

			{/* Security Section */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<Lock className="w-5 h-5 mr-2" />
					Security
				</h2>
				<div className="space-y-4">
					<div className="flex items-center justify-between flex-wrap gap-y-5 p-4 border border-gray-200 rounded-lg">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Password</h3>
							<p className="text-sm text-gray-600">Last changed: Not available</p>
						</div>
						<button
							onClick={() => setShowPasswordModal(true)}
							className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
						>
							Change Password
						</button>
					</div>
				</div>
			</div>

			{/* Preferences Section */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<Bell className="w-5 h-5 mr-2" />
					Preferences
				</h2>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
							<p className="text-sm text-gray-600">Receive order updates and promotions</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.emailNotifications}
							onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
							<p className="text-sm text-gray-600">Receive order status via SMS</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.smsNotifications}
							onChange={(e) => handlePreferenceChange("smsNotifications", e.target.checked)}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Newsletter</h3>
							<p className="text-sm text-gray-600">Weekly deals and new arrivals</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.newsletter}
							onChange={(e) => handlePreferenceChange("newsletter", e.target.checked)}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>

			{/* Password Change Modal */}
			{showPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
							<button
								onClick={() => setShowPasswordModal(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
								<input
									type="password"
									value={passwordData.currentPassword}
									onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
								<input
									type="password"
									value={passwordData.newPassword}
									onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
								<p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
								<input
									type="password"
									value={passwordData.confirmPassword}
									onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
							</div>
						</div>

						<div className="flex space-x-3 mt-6">
							<button
								onClick={handleChangePassword}
								disabled={isLoading}
								className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
							>
								{isLoading ? "Changing..." : "Change Password"}
							</button>
							<button
								onClick={() => setShowPasswordModal(false)}
								disabled={isLoading}
								className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomerAccount;
