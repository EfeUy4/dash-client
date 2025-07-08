import { useState } from "react";
import { X } from "lucide-react";
import api from "@/utils/api";
import { useToastUtils } from "@/services/toast";

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
}

interface UserEditModalProps {
	user: User;
	onClose: () => void;
	onSave: (user: User) => void;
}

const UserEditModal = ({ user, onClose, onSave }: UserEditModalProps) => {
	const [formData, setFormData] = useState({
		firstName: user.firstName,
		lastName: user.lastName,
		username: user.username,
		email: user.email,
		phone: user.phone || "",
		role: user.role,
		isActive: user.isActive,
  });
  
  console.log(user)

	const [loading, setLoading] = useState(false);
	const { showSuccessToast, showErrorToast } = useToastUtils();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Send the PUT request to update the user
			const { data } = await api.put(`/users/${user.id}`, formData);

			onSave(data.user);
			showSuccessToast("Data saved successfully...");
			setTimeout(() => {
				onClose();
			}, 2000);
		} catch (error: any) {
			showErrorToast(error.message || "An error occurred while updating the user");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 transition-opacity" aria-hidden="true">
					<div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
				</div>

				<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
					<div className="absolute top-0 right-0 pt-4 pr-4">
						<button
							type="button"
							onClick={onClose}
							className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<div className="sm:flex sm:items-start">
						<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
							<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit User</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
											First Name
										</label>
										<input
											type="text"
											name="firstName"
											id="firstName"
											required
											value={formData.firstName}
											onChange={handleChange}
											className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
										/>
									</div>

									<div>
										<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
											Last Name
										</label>
										<input
											type="text"
											name="lastName"
											id="lastName"
											required
											value={formData.lastName}
											onChange={handleChange}
											className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
										/>
									</div>
								</div>

								<div>
									<label htmlFor="username" className="block text-sm font-medium text-gray-700">
										Username
									</label>
									<input
										type="text"
										name="username"
										id="username"
										required
										value={formData.username}
										onChange={handleChange}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
									/>
								</div>

								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700">
										Email
									</label>
									<input
										type="email"
										name="email"
										id="email"
										required
										value={formData.email}
										onChange={handleChange}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
									/>
								</div>

								<div>
									<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
										Phone
									</label>
									<input
										type="tel"
										name="phone"
										id="phone"
										value={formData.phone}
										onChange={handleChange}
										placeholder="+234 xxx xxx xxxx"
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
									/>
								</div>

								<div>
									<label htmlFor="role" className="block text-sm font-medium text-gray-700">
										Role
									</label>
									<select
										name="role"
										id="role"
										value={formData.role}
										onChange={handleChange}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
									>
										<option value="customer">Customer</option>
										<option value="salesrep">Sales Rep</option>
										<option value="storekeeper">Store Keeper</option>
										<option value="admin">Admin</option>
									</select>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										name="isActive"
										id="isActive"
										checked={formData.isActive}
										onChange={handleChange}
										className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
									/>
									<label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
										Active Account
									</label>
								</div>

								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={onClose}
										className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={loading}
										className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
									>
										{loading ? "Saving..." : "Save Changes"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserEditModal;
