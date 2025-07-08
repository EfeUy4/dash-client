import { useState } from "react";
import { X } from "lucide-react";
import api from "@/utils/api";
import { useToastUtils } from "@/services/toast";

interface NewUser {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	phone?: string;
	role: "customer" | "storekeeper" | "salesrep" | "admin";
	isActive: boolean;
}

interface UserCreateModalProps {
	onClose: () => void;
	onSave: (user: NewUser) => void;
}

const UserCreateModal = ({ onClose, onSave }: UserCreateModalProps) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		phone: "",
		role: "customer" as const,
		isActive: true,
		password: "",
		confirmPassword: "",
	});

	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const { showSuccessToast, showErrorToast } = useToastUtils();

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
		if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
		if (!formData.username.trim()) newErrors.username = "Username is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";
		if (!formData.password) newErrors.password = "Password is required";
		if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
		if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

		const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
		if (formData.email && !emailRegex.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			// Send the POST request to create the user
			const { confirmPassword, password, ...userData } = formData;
			const { data } = await api.post("/auth/register", {
				...userData,
				password,
			});

			onSave(data.user);
			showSuccessToast("User created successfully!");
			setTimeout(() => {
				onClose();
			}, 2000);
		} catch (error: any) {
			showErrorToast(error.message || "An error occurred while creating the user");
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

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
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
							<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New User</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
											First Name *
										</label>
										<input
											type="text"
											name="firstName"
											id="firstName"
											required
											value={formData.firstName}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
												errors.firstName ? "border-red-300" : "border-gray-300"
											}`}
										/>
										{errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
									</div>

									<div>
										<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
											Last Name *
										</label>
										<input
											type="text"
											name="lastName"
											id="lastName"
											required
											value={formData.lastName}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
												errors.lastName ? "border-red-300" : "border-gray-300"
											}`}
										/>
										{errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
									</div>
								</div>

								<div>
									<label htmlFor="username" className="block text-sm font-medium text-gray-700">
										Username *
									</label>
									<input
										type="text"
										name="username"
										id="username"
										autoComplete="off"
										required
										value={formData.username}
										onChange={handleChange}
										className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
											errors.username ? "border-red-300" : "border-gray-300"
										}`}
									/>
									{errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
								</div>

								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700">
										Email *
									</label>
									<input
										type="email"
										name="email"
										id="email"
										required
										value={formData.email}
										onChange={handleChange}
										className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
											errors.email ? "border-red-300" : "border-gray-300"
										}`}
									/>
									{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
										Role *
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

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label htmlFor="password" className="block text-sm font-medium text-gray-700">
											Password *
										</label>
										<input
											type="password"
											name="password"
											id="password"
											required
											value={formData.password}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
												errors.password ? "border-red-300" : "border-gray-300"
											}`}
										/>
										{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
									</div>

									<div>
										<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
											Confirm Password *
										</label>
										<input
											type="password"
											name="confirmPassword"
											id="confirmPassword"
											required
											value={formData.confirmPassword}
											onChange={handleChange}
											className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
												errors.confirmPassword ? "border-red-300" : "border-gray-300"
											}`}
										/>
										{errors.confirmPassword && (
											<p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
										)}
									</div>
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
										{loading ? "Creating..." : "Create User"}
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

export default UserCreateModal;
