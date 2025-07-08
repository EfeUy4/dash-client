import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, CheckCircle, X, Save } from "lucide-react";
import { useToastUtils } from "@/services/toast";
import { userManagementService } from "@/services/userManagementService";

interface Address {
	id: string;
	type: "billing" | "shipping";
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone?: string;
	isDefault: boolean;
}

interface AddressFormData {
	type: "billing" | "shipping";
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone: string;
	isDefault: boolean;
}

const CustomerAddresses = () => {
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

	const [formData, setFormData] = useState<AddressFormData>({
		type: "shipping",
		street: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Nigeria",
		phone: "",
		isDefault: false,
	});

	const { showSuccessToast, showErrorToast } = useToastUtils();

	// Load addresses on component mount
	useEffect(() => {
		loadAddresses();
	}, []);

	const loadAddresses = async () => {
		try {
			setIsLoading(true);
			// You'll need to implement this endpoint in your userManagementService
			const response = await userManagementService.getAddresses();
			setAddresses(response.data || []);
		} catch (error: any) {
			showErrorToast(error.message || "Failed to load addresses");
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			type: "shipping",
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "Nigeria",
			phone: "",
			isDefault: false,
		});
		setShowAddForm(false);
		setEditingAddress(null);
	};

	const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const validateForm = (): boolean => {
		const requiredFields = ['street', 'city', 'state', 'zipCode'];
		
		for (const field of requiredFields) {
			if (!formData[field as keyof AddressFormData]) {
				showErrorToast(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
				return false;
			}
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm()) return;

		setIsSubmitting(true);
		try {
			if (editingAddress) {
				// Update existing address
				await userManagementService.updateAddress(editingAddress.id, formData);
				showSuccessToast("Address updated successfully");
			} else {
				// Create new address
				await userManagementService.createAddress(formData);
				showSuccessToast("Address added successfully");
			}
			
			await loadAddresses();
			resetForm();
		} catch (error: any) {
			showErrorToast(error.message || "Failed to save address");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (address: Address) => {
		setFormData({
			type: address.type,
			street: address.street,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			country: address.country,
			phone: address.phone || "",
			isDefault: address.isDefault,
		});
		setEditingAddress(address);
		setShowAddForm(true);
	};

	const handleDelete = async (addressId: string) => {
		if (!confirm("Are you sure you want to delete this address?")) {
			return;
		}

		setDeletingAddressId(addressId);
		try {
			await userManagementService.deleteAddress(addressId);
			showSuccessToast("Address deleted successfully");
			await loadAddresses();
		} catch (error: any) {
			showErrorToast(error.message || "Failed to delete address");
		} finally {
			setDeletingAddressId(null);
		}
	};

	const handleSetDefault = async (addressId: string) => {
		try {
			await userManagementService.setDefaultAddress(addressId);
			showSuccessToast("Default address updated");
			await loadAddresses();
		} catch (error: any) {
			showErrorToast(error.message || "Failed to set default address");
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading addresses...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 flex items-center">
						<MapPin className="w-6 h-6 mr-2" />
						My Addresses
					</h1>
					<p className="text-gray-600">Manage your shipping and billing addresses</p>
				</div>
				<button
					onClick={() => setShowAddForm(true)}
					className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
					<Plus className="w-4 h-4" />
					<span>Add Address</span>
				</button>
			</div>

			{/* Addresses Grid */}
			{addresses.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{addresses.map((address) => (
						<div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center space-x-2">
									<MapPin className="w-5 h-5 text-gray-400" />
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											address.type === "shipping" 
												? "bg-blue-100 text-blue-800" 
												: "bg-green-100 text-green-800"
										}`}
									>
										{address.type.charAt(0).toUpperCase() + address.type.slice(1)}
									</span>
									{address.isDefault && (
										<span className="flex items-center space-x-1 text-xs text-green-600">
											<CheckCircle className="w-3 h-3" />
											<span>Default</span>
										</span>
									)}
								</div>
								<div className="flex space-x-2">
									<button 
										onClick={() => handleEdit(address)}
										className="text-gray-400 hover:text-blue-600 transition-colors"
										title="Edit address"
									>
										<Edit2 className="w-4 h-4" />
									</button>
									<button 
										onClick={() => handleDelete(address.id)}
										disabled={deletingAddressId === address.id}
										className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
										title="Delete address"
									>
										{deletingAddressId === address.id ? (
											<div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
										) : (
											<Trash2 className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-sm text-gray-700">{address.street}</p>
								<p className="text-sm text-gray-600">
									{address.city}, {address.state} {address.zipCode}
								</p>
								<p className="text-sm text-gray-600">{address.country}</p>
								{address.phone && (
									<p className="text-sm text-gray-600">{address.phone}</p>
								)}
							</div>

							{!address.isDefault && (
								<button 
									onClick={() => handleSetDefault(address.id)}
									className="mt-4 text-sm text-blue-600 hover:text-blue-700 transition-colors"
								>
									Set as default
								</button>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
					<MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
					<p className="text-gray-500 mb-4">Add your first address to get started</p>
					<button
						onClick={() => setShowAddForm(true)}
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Add Address
					</button>
				</div>
			)}

			{/* Add/Edit Address Form */}
			{showAddForm && (
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-semibold text-gray-900">
							{editingAddress ? "Edit Address" : "Add New Address"}
						</h2>
						<button
							onClick={resetForm}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Address Type */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
							<div className="grid grid-cols-2 gap-4">
								{(['shipping', 'billing'] as const).map((type) => (
									<label
										key={type}
										className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
											formData.type === type
												? "border-blue-500 bg-blue-50"
												: "border-gray-300 hover:border-gray-400"
										}`}
									>
										<input
											type="radio"
											value={type}
											checked={formData.type === type}
											onChange={(e) => handleInputChange("type", e.target.value)}
											className="sr-only"
										/>
										<div className={`w-4 h-4 rounded-full border-2 mr-3 ${
											formData.type === type
												? "border-blue-500 bg-blue-500"
												: "border-gray-300"
										}`}>
											{formData.type === type && (
												<div className="w-full h-full rounded-full bg-white scale-50"></div>
											)}
										</div>
										<span className="text-sm font-medium capitalize">{type}</span>
									</label>
								))}
							</div>
						</div>

						{/* Personal Information - REMOVED */}

						{/* Address Information */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Street Address *
							</label>
							<input
								type="text"
								value={formData.street}
								onChange={(e) => handleInputChange("street", e.target.value)}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter street address"
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									City *
								</label>
								<input
									type="text"
									value={formData.city}
									onChange={(e) => handleInputChange("city", e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter city"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									State *
								</label>
								<input
									type="text"
									value={formData.state}
									onChange={(e) => handleInputChange("state", e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter state"
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									ZIP Code *
								</label>
								<input
									type="text"
									value={formData.zipCode}
									onChange={(e) => handleInputChange("zipCode", e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter ZIP code"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Country
								</label>
								<select
									value={formData.country}
									onChange={(e) => handleInputChange("country", e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="Nigeria">Nigeria</option>
									{/* Add more countries as needed */}
								</select>
							</div>
						</div>

						{/* Phone Number */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Phone Number
							</label>
							<input
								type="tel"
								value={formData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter phone number"
							/>
						</div>

						{/* Default Address Checkbox */}
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="isDefault"
								checked={formData.isDefault}
								onChange={(e) => handleInputChange("isDefault", e.target.checked)}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label htmlFor="isDefault" className="text-sm text-gray-900">
								Set as default address
							</label>
						</div>

						{/* Form Actions */}
						<div className="flex space-x-3 pt-6 border-t border-gray-200">
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
							>
								<Save className="w-4 h-4" />
								<span>{isSubmitting ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}</span>
							</button>
							<button
								type="button"
								onClick={resetForm}
								disabled={isSubmitting}
								className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default CustomerAddresses;