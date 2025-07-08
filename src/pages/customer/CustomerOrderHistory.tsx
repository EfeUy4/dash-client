import { useState, useEffect, useMemo } from "react";
import {
	Search,
	Eye,
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
	Filter,
	Star,
	X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectOrderError,
	selectOrderLoading,
	selectMyOrders,
	selectOrderHasBeenFetched,
} from "@/redux/selectors/ordersSelectors";
import { fetchMyOrders, cancelOrder } from "@/redux/thunks/orders";
import { useToastUtils } from "@/services/toast";
import { Order } from "@/data/types";

const CustomerOrderHistory = () => {
	const dispatch = useAppDispatch();
	const myOrders = useAppSelector(selectMyOrders);
	const isLoading = useAppSelector(selectOrderLoading);
	const error = useAppSelector(selectOrderError);
	const hasBeenFetched = useAppSelector(selectOrderHasBeenFetched);

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [dateRange, setDateRange] = useState<string>("all");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showOrderModal, setShowOrderModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const { showErrorToast, showSuccessToast } = useToastUtils();

	// Fetch user's orders on mount
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchMyOrders());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter, dateRange]);

	const filterOrdersByDate = (order: Order) => {
		if (dateRange === "all") return true;

		const orderDate = new Date(order.createdAt);
		const now = new Date();

		switch (dateRange) {
			case "week":
				const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				return orderDate >= weekAgo;
			case "month":
				const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				return orderDate >= monthAgo;
			case "quarter":
				const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				return orderDate >= quarterAgo;
			case "year":
				const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				return orderDate >= yearAgo;
			default:
				return true;
		}
	};

	const filteredOrders = useMemo(() => {
		return myOrders.filter((order) => {
			const matchesSearch =
				order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesStatus = statusFilter === "all" || order.status === statusFilter;
			const matchesDate = filterOrdersByDate(order);

			return matchesSearch && matchesStatus && matchesDate;
		});
	}, [myOrders, searchTerm, statusFilter, dateRange]);

	// Pagination calculations
	const totalItems = filteredOrders.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

	// Calculate order statistics
	const orderStats = useMemo(() => {
		return {
			total: myOrders.length,
			pending: myOrders.filter((o) => o.status === "pending").length,
			confirmed: myOrders.filter((o) => o.status === "confirmed").length,
			shipped: myOrders.filter((o) => o.status === "shipped").length,
			delivered: myOrders.filter((o) => o.status === "delivered").length,
			cancelled: myOrders.filter((o) => o.status === "cancelled").length,
			totalSpent: myOrders.reduce((sum, order) => sum + order.total, 0),
		};
	}, [myOrders]);

	const handleRefresh = () => {
		dispatch(fetchMyOrders());
	};

	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
		setShowOrderModal(true);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleCancelOrder = (order: Order) => {
		setOrderToCancel(order);
		setShowCancelModal(true);
	};

	const confirmCancelOrder = async () => {
		if (!orderToCancel || !cancelReason.trim()) {
			showErrorToast("Please provide a reason for cancellation");
			return;
		}

		try {
			await dispatch(cancelOrder({ id: orderToCancel.id, reason: cancelReason })).unwrap();
			setShowCancelModal(false);
			setCancelReason("");
			setOrderToCancel(null);
			showSuccessToast("Order cancelled successfully");
		} catch (error: any) {
			showErrorToast(error.message || "Failed to cancel order");
		}
	};

	const canCancelOrder = (order: Order) => {
		return order.status === "pending" || order.status === "confirmed";
	};

	const handleExport = () => {
		try {
			const csvContent = [
				["Order Number", "Date", "Items", "Total", "Status", "Payment Method"],
				...filteredOrders.map((order) => [
					order.orderNumber,
					new Date(order.createdAt).toLocaleDateString(),
					order.items.length.toString(),
					order.total.toString(),
					order.status.toUpperCase(),
					order.paymentMethod || "N/A",
				]),
			]
				.map((row) => row.join(","))
				.join("\n");

			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `my-orders-${Date.now()}.csv`);
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

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
						<p className="text-gray-600">Track and manage your orders</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Orders</h3>
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
	if (isLoading && !hasBeenFetched) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your orders...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center flex-wrap gap-y-5">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
					<p className="text-gray-600">Track and manage your orders</p>
				</div>
				<div className="flex items-center space-x-3">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</button>
					<button
						onClick={handleExport}
						disabled={filteredOrders.length === 0}
						className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
					>
						<Download className="w-5 h-5" />
						<span>Export</span>
					</button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<Package className="w-8 h-8 text-blue-600" strokeWidth={1} />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-gray-900">{orderStats.total}</h3>
							<p className="text-sm text-gray-600">Total Orders</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<CheckCircle className="w-8 h-8 text-green-500" strokeWidth={1} />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-gray-900">{orderStats.delivered}</h3>
							<p className="text-sm text-gray-600">Delivered</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<Truck className="w-8 h-8 text-indigo-600" strokeWidth={1} />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-gray-900">{orderStats.shipped}</h3>
							<p className="text-sm text-gray-600">In Transit</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<Star className="w-8 h-8 text-purple-600" strokeWidth={1} />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-gray-900">{formatPrice(orderStats.totalSpent)}</h3>
							<p className="text-sm text-gray-600">Total Spent</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="flex items-center mb-4">
					<Filter className="w-5 h-5 text-gray-400 mr-2" />
					<h3 className="text-lg font-medium text-gray-900">Filters</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search by order number or product..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					{/* Status Filter */}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="pending">Pending</option>
						<option value="confirmed">Confirmed</option>
						<option value="processing">Processing</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
						<option value="cancelled">Cancelled</option>
					</select>

					{/* Date Range */}
					<select
						value={dateRange}
						onChange={(e) => setDateRange(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Time</option>
						<option value="week">Last 7 Days</option>
						<option value="month">Last 30 Days</option>
						<option value="quarter">Last 90 Days</option>
						<option value="year">Last Year</option>
					</select>
				</div>

				<div className="flex justify-between items-center mt-4">
					<span className="text-sm text-gray-600">
						Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} orders
					</span>
					<select
						value={itemsPerPage}
						onChange={(e) => setItemsPerPage(Number(e.target.value))}
						className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value={5}>5 per page</option>
						<option value={10}>10 per page</option>
						<option value={25}>25 per page</option>
					</select>
				</div>
			</div>

			{/* Orders List */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<div className="space-y-4 p-6">
					{paginatedOrders.map((order) => (
						<div
							key={order.id}
							className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
						>
							<div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
								<div className="flex-1">
									<div className="flex items-center space-x-3 mb-2">
										<h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
												order.status,
											)}`}
										>
											{getStatusIcon(order.status)}
											<span className="ml-1 capitalize">{order.status}</span>
										</span>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
										<div>
											<p>
												<span className="font-medium">Date:</span> {formatDate(order.createdAt)}
											</p>
											<p>
												<span className="font-medium">Items:</span> {order.items.length} item
												{order.items.length !== 1 ? "s" : ""}
											</p>
										</div>
										<div>
											<p>
												<span className="font-medium">Total:</span> {formatPrice(order.total)}
											</p>
											<p>
												<span className="font-medium">Payment:</span> {order.paymentMethod || "N/A"}
											</p>
										</div>
										<div>
											{order.trackingNumber && (
												<p>
													<span className="font-medium">Tracking:</span> {order.trackingNumber}
												</p>
											)}
											{order.estimatedDelivery && (
												<p>
													<span className="font-medium">Est. Delivery:</span>{" "}
													{formatDate(order.estimatedDelivery)}
												</p>
											)}
										</div>
									</div>

									{/* Order Items Preview */}
									<div className="mt-3">
										<div className="flex flex-wrap gap-2">
											{order.items.slice(0, 3).map((item, index) => (
												<div
													key={index}
													className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1"
												>
													{item.image && (
														<img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
													)}
													<span className="text-sm text-gray-700">{item.name}</span>
													<span className="text-xs text-gray-500">×{item.quantity}</span>
												</div>
											))}
											{order.items.length > 3 && (
												<div className="flex items-center justify-center bg-gray-100 rounded-lg px-3 py-1">
													<span className="text-sm text-gray-600">+{order.items.length - 3} more</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-col space-y-2">
									<button
										onClick={() => handleViewOrder(order)}
										className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
									>
										<Eye className="w-4 h-4" />
										<span>View Details</span>
									</button>

									{canCancelOrder(order) && (
										<button
											onClick={() => handleCancelOrder(order)}
											className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
										>
											<XCircle className="w-4 h-4" />
											<span>Cancel</span>
										</button>
									)}

									{order.status === "delivered" && (
										<button className="flex items-center justify-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
											<Star className="w-4 h-4" />
											<span>Rate</span>
										</button>
									)}
								</div>
							</div>
						</div>
					))}

					{paginatedOrders.length === 0 && (
						<div className="text-center py-12">
							<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
							<p className="text-gray-500 mb-4">
								{filteredOrders.length === 0
									? "You haven't placed any orders yet."
									: "No orders match your current filters."}
							</p>
							{myOrders.length === 0 && (
								<button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
									Start Shopping
								</button>
							)}
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
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
								<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
									<button
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
										className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft className="h-5 w-5" />
									</button>

									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<button
											key={page}
											onClick={() => handlePageChange(page)}
											className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
												page === currentPage
													? "z-10 bg-blue-50 border-blue-500 text-blue-600"
													: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
											}`}
										>
											{page}
										</button>
									))}

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

			{/* Order Details Modal */}
			{showOrderModal && selectedOrder && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold text-gray-900">
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

						<div className="p-6 space-y-6">
							{/* Order Status & Info */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
									<h3 className="font-medium text-gray-900 mb-2">Order Date</h3>
									<p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Total Amount</h3>
									<p className="text-lg font-semibold text-gray-900">{formatPrice(selectedOrder.total)}</p>
								</div>
							</div>

							{/* Shipping Address */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
								<p className="text-sm text-gray-600">
									{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
									<br />
									{selectedOrder.shippingAddress.street}
									<br />
									{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
									{selectedOrder.shippingAddress.zipCode}
									<br />
									{selectedOrder.shippingAddress.country}
									{selectedOrder.shippingAddress.phone && (
										<>
											<br />
											Phone: {selectedOrder.shippingAddress.phone}
										</>
									)}
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
												<img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
											) : (
												<div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
													<Package className="w-8 h-8 text-gray-400" strokeWidth={1} />
												</div>
											)}
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">{item.name}</h4>
												<p className="text-sm text-gray-600">
													Size: {item.size} | Color: {item.color}
												</p>
												<p className="text-sm text-gray-600">
													Quantity: {item.quantity} × {formatPrice(item.price)}
												</p>
											</div>
											<div className="text-right">
												<p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
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
									<p className="text-sm text-gray-600">
										Tracking Number: <span className="font-mono">{selectedOrder.trackingNumber}</span>
									</p>
									{selectedOrder.estimatedDelivery && (
										<p className="text-sm text-gray-600 mt-1">
											Estimated Delivery: {formatDate(selectedOrder.estimatedDelivery)}
										</p>
									)}
								</div>
							)}
						</div>

						<div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
							{canCancelOrder(selectedOrder) && (
								<button
									onClick={() => {
										setShowOrderModal(false);
										handleCancelOrder(selectedOrder);
									}}
									className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
								>
									Cancel Order
								</button>
							)}
							<button
								onClick={() => setShowOrderModal(false)}
								className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Cancel Order Modal */}
			{showCancelModal && orderToCancel && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
							<button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
								<X className="w-6 h-6" />
							</button>
						</div>

						<div className="space-y-4">
							<p className="text-sm text-gray-600">
								Are you sure you want to cancel order <strong>{orderToCancel.orderNumber}</strong>?
							</p>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Reason for cancellation
								</label>
								<textarea
									value={cancelReason}
									onChange={(e) => setCancelReason(e.target.value)}
									placeholder="Please provide a reason for cancelling this order..."
									rows={3}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
							</div>
						</div>

						<div className="flex space-x-3 mt-6">
							<button
								onClick={confirmCancelOrder}
								disabled={!cancelReason.trim()}
								className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
							>
								Cancel Order
							</button>
							<button
								onClick={() => setShowCancelModal(false)}
								className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
							>
								Keep Order
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomerOrderHistory;
