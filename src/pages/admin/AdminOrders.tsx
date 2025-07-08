import { useState, useEffect, useMemo } from "react";
import {
	Search,
	Eye,
	Edit,
	Package,
	Truck,
	CheckCircle,
	XCircle,
	Clock,
	ChevronLeft,
	ChevronRight,
	Download,
	RefreshCw,
	AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectOrderError,
	selectOrderLoading,
	selectOrders,
	selectOrderHasBeenFetched,
} from "@/redux/selectors/ordersSelectors";
import { fetchOrders, updateOrder } from "@/redux/thunks/orders";
import { useToastUtils } from "@/services/toast";
import { Order } from "@/data/types";
import OrderUpdateModal from "@/components/OrderUpdateModal";

const AdminOrders = () => {
	const dispatch = useAppDispatch();
	const orders = useAppSelector(selectOrders);
	const isLoading = useAppSelector(selectOrderLoading);
	const error = useAppSelector(selectOrderError);
	const hasBeenFetched = useAppSelector(selectOrderHasBeenFetched);

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [paymentFilter, setPaymentFilter] = useState<string>("all");
	const [dateRange, setDateRange] = useState<string>("all");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showOrderModal, setShowOrderModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const { showErrorToast, showSuccessToast } = useToastUtils();

	// Fetch orders on mount if not already fetched
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchOrders());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter, paymentFilter, dateRange]);

	// Calculate order statistics
	const orderStats = useMemo(() => {
		return {
			total: orders.length,
			pending: orders.filter((o) => o.status === "pending").length,
			shipped: orders.filter((o) => o.status === "shipped").length,
			delivered: orders.filter((o) => o.status === "delivered").length,
			cancelled: orders.filter((o) => o.status === "cancelled").length,
		};
	}, [orders]);

	const filterOrdersByDate = (order: Order) => {
		if (dateRange === "all") return true;

		const orderDate = new Date(order.createdAt);
		const now = new Date();

		switch (dateRange) {
			case "today":
				return orderDate.toDateString() === now.toDateString();
			case "week":
				const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				return orderDate >= weekAgo;
			case "month":
				const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				return orderDate >= monthAgo;
			case "quarter":
				const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				return orderDate >= quarterAgo;
			default:
				return true;
		}
	};

	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			const matchesSearch =
				order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.shippingAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.shippingAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === "all" || order.status === statusFilter;
			const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;
			const matchesDate = filterOrdersByDate(order);

			return matchesSearch && matchesStatus && matchesPayment && matchesDate;
		});
	}, [orders, searchTerm, statusFilter, paymentFilter, dateRange]);

	// Pagination calculations
	const totalItems = filteredOrders.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

	const handleRefresh = () => {
		dispatch(fetchOrders());
	};

	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
		setShowOrderModal(true);
	};

	const handleUpdateOrder = (order: Order) => {
		setSelectedOrder(order);
		setShowUpdateModal(true);
	};

	const handleOrderUpdate = async (orderId: string, updates: Partial<Order>) => {
		setIsUpdating(true);
		try {
			await dispatch(updateOrder({ orderId, updates })).unwrap();
			showSuccessToast("Order updated successfully");
			setShowUpdateModal(false);
			setSelectedOrder(null);
		} catch (error) {
			showErrorToast("Failed to update order");
			throw error;
		} finally {
			setIsUpdating(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleExport = () => {
		try {
			// Create CSV content
			const csvContent = [
				["Order Number", "Customer", "Email", "Total", "Status", "Payment", "Date"],
				...filteredOrders.map((order) => [
					order.orderNumber,
					`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
					order.shippingAddress.email,
					order.total.toString(),
					order.status,
					order.paymentStatus,
					new Date(order.createdAt).toLocaleDateString(),
				]),
			]
				.map((row) => row.join(","))
				.join("\n");

			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `orders-${Date.now()}.csv`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			showSuccessToast("Orders exported successfully");
		} catch (error) {
			showErrorToast("Failed to export orders");
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="w-4 h-4" />;
			case "confirmed":
			case "processing":
				return <Package className="w-4 h-4" />;
			case "shipped":
				return <Truck className="w-4 h-4" />;
			case "delivered":
				return <CheckCircle className="w-4 h-4" />;
			case "cancelled":
			case "refunded":
				return <XCircle className="w-4 h-4" />;
			default:
				return <Clock className="w-4 h-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "confirmed":
				return "bg-blue-100 text-blue-800";
			case "processing":
				return "bg-purple-100 text-purple-800";
			case "shipped":
				return "bg-indigo-100 text-indigo-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			case "refunded":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPaymentStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "refunded":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order History</h1>
						<p className="text-gray-600 text-sm sm:text-base">Track and manage customer orders</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 sm:p-8">
					<div className="text-center">
						<AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-base sm:text-lg font-semibold text-red-700 mb-2">Error Loading Orders</h3>
						<p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
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
	if (isLoading && !hasBeenFetched) {
		return (
			<div className="flex items-center justify-center h-64 p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading orders...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order History</h1>
					<p className="text-gray-600 text-sm sm:text-base">Track and manage customer orders</p>
				</div>
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</button>
					<button
						onClick={handleExport}
						disabled={filteredOrders.length === 0}
						className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
					>
						<Download className="w-5 h-5" />
						<span>Export</span>
					</button>
				</div>
			</div>

			{/* Data Info Banner */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
				<div className="flex flex-col sm:flex-row sm:items-center gap-2">
					<Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
					<div className="text-xs sm:text-sm text-blue-700">
						<p>
							<strong>Orders Data:</strong> {orders.length} total orders • Showing {filteredOrders.length}{" "}
							filtered results
						</p>
						<p>Last updated: {new Date().toLocaleString()}</p>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
				<div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
						<div className="ml-2 sm:ml-3">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900">
								{isLoading ? "..." : orderStats.total}
							</h3>
							<p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
						<div className="ml-2 sm:ml-3">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900">
								{isLoading ? "..." : orderStats.pending}
							</h3>
							<p className="text-xs sm:text-sm text-gray-600">Pending</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<Truck className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
						<div className="ml-2 sm:ml-3">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900">
								{isLoading ? "..." : orderStats.shipped}
							</h3>
							<p className="text-xs sm:text-sm text-gray-600">Shipped</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
						<div className="ml-2 sm:ml-3">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900">
								{isLoading ? "..." : orderStats.delivered}
							</h3>
							<p className="text-xs sm:text-sm text-gray-600">Delivered</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 sm:col-span-1">
					<div className="flex items-center">
						<XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
						<div className="ml-2 sm:ml-3">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900">
								{isLoading ? "..." : orderStats.cancelled}
							</h3>
							<p className="text-xs sm:text-sm text-gray-600">Cancelled</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="grid grid-cols-1 gap-4">
					{/* Search */}
					<div className="lg:col-span-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search by order number, customer name, or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Filter Dropdowns */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Status Filter */}
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="confirmed">Confirmed</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="delivered">Delivered</option>
							<option value="cancelled">Cancelled</option>
							<option value="refunded">Refunded</option>
						</select>

						{/* Payment Filter */}
						<select
							value={paymentFilter}
							onChange={(e) => setPaymentFilter(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value="all">All Payments</option>
							<option value="paid">Paid</option>
							<option value="pending">Payment Pending</option>
							<option value="failed">Payment Failed</option>
							<option value="refunded">Refunded</option>
						</select>

						{/* Date Range */}
						<select
							value={dateRange}
							onChange={(e) => setDateRange(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value="all">All Time</option>
							<option value="today">Today</option>
							<option value="week">Last 7 Days</option>
							<option value="month">Last 30 Days</option>
							<option value="quarter">Last 90 Days</option>
						</select>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3">
					<span className="text-sm text-gray-600">
						Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} orders
					</span>
					<select
						value={itemsPerPage}
						onChange={(e) => setItemsPerPage(Number(e.target.value))}
						className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value={10}>10 per page</option>
						<option value={25}>25 per page</option>
						<option value={50}>50 per page</option>
					</select>
				</div>
			</div>

			{/* Orders Table */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Order Details
								</th>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Customer
								</th>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Total
								</th>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Payment
								</th>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Date
								</th>
								<th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedOrders.map((order) => (
								<tr key={order.id} className="hover:bg-gray-50">
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
											<div className="text-sm text-gray-500">
												{order.items.length} item{order.items.length !== 1 ? "s" : ""}
											</div>
											{order.trackingNumber && (
												<div className="text-xs text-blue-600">Track: {order.trackingNumber}</div>
											)}
										</div>
									</td>
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm font-medium text-gray-900">
												{order.shippingAddress.firstName} {order.shippingAddress.lastName}
											</div>
											<div className="text-sm text-gray-500">{order.shippingAddress.email}</div>
											<div className="text-xs text-gray-500">
												{order.shippingAddress.city}, {order.shippingAddress.state}
											</div>
										</div>
									</td>
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</div>
										<div className="text-xs text-gray-500">{order.paymentMethod}</div>
									</td>
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
												order.status,
											)}`}
										>
											{getStatusIcon(order.status)}
											<span className="ml-1 capitalize">{order.status}</span>
										</span>
									</td>
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
												order.paymentStatus,
											)}`}
										>
											{order.paymentStatus}
										</span>
									</td>
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatDate(order.createdAt)}
									</td>
									<td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex items-center space-x-2">
											<button
												onClick={() => handleViewOrder(order)}
												className="text-blue-600 hover:text-blue-900 transition-colors p-1"
												title="View Order Details"
											>
												<Eye className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleUpdateOrder(order)}
												className="text-purple-600 hover:text-purple-900 transition-colors p-1"
												title="Update Order"
											>
												<Edit className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{paginatedOrders.length === 0 && (
						<div className="text-center py-8">
							<Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
							<p className="text-gray-500 text-sm sm:text-base">
								{filteredOrders.length === 0
									? "No orders found matching your criteria."
									: "No orders to display on this page."}
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

			{/* Order Details Modal (View Only) */}
			{showOrderModal && selectedOrder && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-4 sm:p-6 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<h2 className="text-lg sm:text-xl font-semibold text-gray-900">
									Order Details - {selectedOrder.orderNumber}
								</h2>
								<button
									onClick={() => setShowOrderModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<XCircle className="w-6 h-6" />
								</button>
							</div>
						</div>

						<div className="p-4 sm:p-6 space-y-6">
							{/* Order Status */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Order Status</h3>
									<span
										className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
											selectedOrder.status,
										)}`}
									>
										{getStatusIcon(selectedOrder.status)}
										<span className="ml-1 capitalize">{selectedOrder.status}</span>
									</span>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Payment Status</h3>
									<span
										className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
											selectedOrder.paymentStatus,
										)}`}
									>
										{selectedOrder.paymentStatus}
									</span>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Order Total</h3>
									<p className="text-lg font-semibold text-gray-900">{formatPrice(selectedOrder.total)}</p>
								</div>
							</div>

							{/* Customer Information */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">Name</p>
										<p className="font-medium">
											{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Email</p>
										<p className="font-medium">{selectedOrder.shippingAddress.email}</p>
									</div>
									{selectedOrder.shippingAddress.phone && (
										<div>
											<p className="text-sm text-gray-600">Phone</p>
											<p className="font-medium">{selectedOrder.shippingAddress.phone}</p>
										</div>
									)}
									<div>
										<p className="text-sm text-gray-600">Order Date</p>
										<p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
									</div>
								</div>
							</div>

							{/* Shipping Address */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
								<p>
									{selectedOrder.shippingAddress.street}
									<br />
									{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
									{selectedOrder.shippingAddress.zipCode}
									<br />
									{selectedOrder.shippingAddress.country}
								</p>
							</div>

							{/* Order Items */}
							<div>
								<h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
								<div className="space-y-3">
									{selectedOrder.items.map((item, index) => (
										<div
											key={index}
											className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg"
										>
											{item.image ? (
												<img
													src={item.image}
													alt={item.name}
													className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
												/>
											) : (
												<div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
													<Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
												<p className="text-xs sm:text-sm text-gray-600">
													Size: {item.size} | Color: {item.color}
												</p>
												<p className="text-xs sm:text-sm text-gray-600">
													Quantity: {item.quantity} × {formatPrice(item.price)}
												</p>
											</div>
											<div className="text-right">
												<p className="font-medium text-sm sm:text-base">
													{formatPrice(item.price * item.quantity)}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Order Summary */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Subtotal:</span>
										<span>{formatPrice(selectedOrder.subtotal)}</span>
									</div>
									<div className="flex justify-between">
										<span>Shipping:</span>
										<span>{formatPrice(selectedOrder.shipping)}</span>
									</div>
									<div className="flex justify-between">
										<span>Tax:</span>
										<span>{formatPrice(selectedOrder.tax)}</span>
									</div>
									<div className="border-t border-gray-300 pt-2">
										<div className="flex justify-between font-semibold">
											<span>Total:</span>
											<span>{formatPrice(selectedOrder.total)}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Tracking Information */}
							{selectedOrder.trackingNumber && (
								<div className="bg-blue-50 p-4 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Tracking Information</h3>
									<p className="text-sm text-gray-600">Tracking Number: {selectedOrder.trackingNumber}</p>
									{selectedOrder.estimatedDelivery && (
										<p className="text-sm text-gray-600">
											Estimated Delivery: {formatDate(selectedOrder.estimatedDelivery)}
										</p>
									)}
								</div>
							)}

							{/* Notes */}
							{selectedOrder.notes && (
								<div className="bg-yellow-50 p-4 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Notes</h3>
									<p className="text-sm text-gray-600">{selectedOrder.notes}</p>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
								<button
									onClick={() => {
										setShowOrderModal(false);
										handleUpdateOrder(selectedOrder);
									}}
									className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
								>
									<Edit className="w-4 h-4" />
									Update Order
								</button>
								<button
									onClick={() => setShowOrderModal(false)}
									className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Order Update Modal */}
			{selectedOrder && (
				<OrderUpdateModal
					order={selectedOrder}
					isOpen={showUpdateModal}
					onClose={() => setShowUpdateModal(false)}
					onUpdate={handleOrderUpdate}
					isUpdating={isUpdating}
				/>
			)}
		</div>
	);
};

export default AdminOrders;
