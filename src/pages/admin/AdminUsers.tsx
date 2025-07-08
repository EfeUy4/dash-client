import { useState, useEffect, useMemo } from "react";
import {
	Search,
	UserPlus,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	RefreshCw,
	AlertTriangle,
} from "lucide-react";
import UserEditModal, { User } from "../../components/admin/UserEditModal";
import UserCreateModal from "../../components/admin/UserCreateModal";
import { userManagementService } from "@/services/userManagementService";
import { useToastUtils } from "@/services/toast";

const AdminUsers = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const { showSuccessToast, showErrorToast } = useToastUtils();

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await userManagementService.getUsers();
			setUsers(response.users || []);
		} catch (err: any) {
			console.error("Fetch users error:", err);
			setError(err.message || "Failed to fetch users");
			showErrorToast(err.message || "Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, roleFilter, statusFilter]);

	// Filtered users with memoization
	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			const matchesSearch = `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""} ${
				user.username || ""
			}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			const matchesRole = roleFilter === "all" || user.role === roleFilter;

			const matchesStatus =
				statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive);

			return matchesSearch && matchesRole && matchesStatus;
		});
	}, [users, searchTerm, roleFilter, statusFilter]);

	// Pagination calculations
	const totalItems = filteredUsers.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

	// Stats calculations
	const stats = useMemo(() => {
		return {
			customers: users.filter((u) => u.role === "customer").length,
			salesreps: users.filter((u) => u.role === "salesrep").length,
			storekeepers: users.filter((u) => u.role === "storekeeper").length,
			admins: users.filter((u) => u.role === "admin").length,
			activeUsers: users.filter((u) => u.isActive).length,
			totalUsers: users.length,
		};
	}, [users]);

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setShowEditModal(true);
	};

	const handleDeleteUser = async (userId: string, userName: string) => {
		if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
			return;
		}

		setDeleteLoading(userId);

		try {
			await userManagementService.deleteUser(userId);

			// Remove user from array (soft delete on backend)
			setUsers(users.map((user) => (user.id === userId ? { ...user, isActive: false } : user)));

			// Adjust current page if needed
			const remainingItems = totalItems - 1;
			const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
			if (currentPage > newTotalPages && newTotalPages > 0) {
				setCurrentPage(newTotalPages);
			}

			showSuccessToast(`${userName} has been deleted successfully`);
		} catch (error: any) {
			showErrorToast(error.message || "Failed to delete user");
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleRefresh = () => {
		fetchUsers();
	};

	const getRoleBadgeColor = (role: string) => {
		const colors = {
			admin: "bg-purple-100 text-purple-800",
			salesrep: "bg-green-100 text-green-800",
			storekeeper: "bg-orange-100 text-orange-800",
			customer: "bg-blue-100 text-blue-800",
		};
		return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setCurrentPage(1);
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">User Management</h1>
						<p className="text-gray-600">Manage user accounts and roles</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Users</h3>
						<p className="text-red-600 mb-4">{error}</p>
						<button
							onClick={handleRefresh}
							className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							<RefreshCw className="w-4 h-4" />
							Try Again
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading users...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center flex-wrap gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">User Management</h1>
					<p className="text-gray-600">Manage user accounts and roles</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={handleRefresh}
						disabled={loading}
						className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
					>
						<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
					>
						<UserPlus className="w-5 h-5" />
						<span>Add User</span>
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 rounded-lg">
							<UserPlus className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.customers}</h3>
							<p className="text-sm text-gray-600">Customers</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 rounded-lg">
							<UserPlus className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.salesreps}</h3>
							<p className="text-sm text-gray-600">Sales Reps</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-orange-100 rounded-lg">
							<UserPlus className="w-6 h-6 text-orange-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.storekeepers}</h3>
							<p className="text-sm text-gray-600">Store Keepers</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-purple-100 rounded-lg">
							<UserPlus className="w-6 h-6 text-purple-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.admins}</h3>
							<p className="text-sm text-gray-600">Admins</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Search */}
					<div className="lg:col-span-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search users by name, email, or username..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Role Filter */}
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="all">All Roles</option>
						<option value="admin">Admin</option>
						<option value="salesrep">Sales Rep</option>
						<option value="storekeeper">Store Keeper</option>
						<option value="customer">Customer</option>
					</select>

					{/* Status Filter */}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>

				{/* Additional Controls Row */}
				<div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between">
					<div className="flex gap-4">
						{/* Items per page selector */}
						<select
							value={itemsPerPage}
							onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value={5}>5 per page</option>
							<option value={10}>10 per page</option>
							<option value={25}>25 per page</option>
							<option value={50}>50 per page</option>
						</select>
					</div>

					{/* Results info */}
					<div className="flex items-center text-sm text-gray-600">
						Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} users
					</div>
				</div>
			</div>

			{/* Users Table */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									User
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Role
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Phone
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Last Login
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedUsers.map((user) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10">
												<div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
													<span className="text-sm font-medium text-purple-600">
														{user.firstName?.[0] || ""}
														{user.lastName?.[0] || ""}
													</span>
												</div>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													{user.firstName} {user.lastName}
												</div>
												<div className="text-sm text-gray-500">{user.email}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
												user.role,
											)}`}
										>
											{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || "-"}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
											}`}
										>
											{user.isActive ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex items-center space-x-2">
											<button
												onClick={() => handleEditUser(user)}
												className="text-purple-600 hover:text-purple-900 transition-colors"
												title="Edit User"
											>
												<Edit className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDeleteUser(user.id, user.username)}
												disabled={deleteLoading === user.id}
												className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
												title="Delete User"
											>
												{deleteLoading === user.id ? (
													<div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
												) : (
													<Trash2 className="w-4 h-4" />
												)}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{paginatedUsers.length === 0 && (
						<div className="text-center py-8">
							<UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">
								{filteredUsers.length === 0
									? "No users found matching your criteria."
									: "No users to display on this page."}
							</p>
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
						<div className="flex-1 flex justify-between sm:hidden">
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Previous
							</button>
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Next
							</button>
						</div>
						<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
							<div>
								<p className="text-sm text-gray-700">
									Showing page <span className="font-medium">{currentPage}</span> of{" "}
									<span className="font-medium">{totalPages}</span>
								</p>
							</div>
							<div>
								<nav
									className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
									aria-label="Pagination"
								>
									<button
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
										className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft className="h-5 w-5" />
									</button>

									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
										const shouldShow =
											page === 1 ||
											page === totalPages ||
											(page >= currentPage - 1 && page <= currentPage + 1);

										if (!shouldShow) {
											if (page === currentPage - 2 || page === currentPage + 2) {
												return (
													<span
														key={page}
														className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500"
													>
														...
													</span>
												);
											}
											return null;
										}

										return (
											<button
												key={page}
												onClick={() => handlePageChange(page)}
												className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
													page === currentPage
														? "z-10 bg-purple-50 border-purple-500 text-purple-600"
														: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
												}`}
											>
												{page}
											</button>
										);
									})}

									<button
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronRight className="h-5 w-5" />
									</button>
								</nav>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Modals */}
			{showEditModal && selectedUser && (
				<UserEditModal
					user={selectedUser}
					onClose={() => {
						setShowEditModal(false);
						setSelectedUser(null);
					}}
					onSave={(updatedUser) => {
						setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
						setShowEditModal(false);
						setSelectedUser(null);
					}}
				/>
			)}

			{showCreateModal && (
				<UserCreateModal
					onClose={() => setShowCreateModal(false)}
					onSave={(newUser: any) => {
						setUsers([newUser, ...users]);
						setShowCreateModal(false);
						if (currentPage !== 1) {
							setCurrentPage(1);
						}
					}}
				/>
			)}
		</div>
	);
};

export default AdminUsers;
