import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	Plus,
	Eye,
	BarChart3,
	DollarSign,
	Package,
	Users,
	TrendingUp,
	Calendar,
	ShoppingCart,
	Award,
	Target,
	RefreshCw,
	ArrowRight,
	AlertTriangle
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectOrderError,
	selectOrderLoading,
	selectOrders,
	selectOrderHasBeenFetched,
} from "@/redux/selectors/ordersSelectors";
import { fetchOrders } from "@/redux/thunks/orders";


const SalesRepDashboard = () => {
	const dispatch = useAppDispatch();
	const allOrders = useAppSelector(selectOrders);
	const isLoading = useAppSelector(selectOrderLoading);
	const error = useAppSelector(selectOrderError);
	const hasBeenFetched = useAppSelector(selectOrderHasBeenFetched);

	// Filter sales rep orders
	const salesRepOrders = useMemo(() => {
		return allOrders.filter((order) => {
			const isSalesRepOrder = 
				order.paymentMethod === "cash" ||
				order.paymentMethod === "bank_transfer" ||
				order.paymentMethod === "card_terminal" ||
				(order.paymentDetails && order.paymentDetails.processedBy === "sales_rep");
			
			return isSalesRepOrder;
		});
	}, [allOrders]);

	// Fetch orders on mount
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchOrders());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Calculate dashboard metrics
	const dashboardMetrics = useMemo(() => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Today's metrics
		const todayOrders = salesRepOrders.filter(order => 
			new Date(order.createdAt) >= today
		);
		const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

		// This week's metrics
		const weekOrders = salesRepOrders.filter(order => 
			new Date(order.createdAt) >= thisWeek
		);
		const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);

		// This month's metrics
		const monthOrders = salesRepOrders.filter(order => 
			new Date(order.createdAt) >= thisMonth
		);
		const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

		// All time metrics
		const totalOrders = salesRepOrders.length;
		const totalRevenue = salesRepOrders.reduce((sum, order) => sum + order.total, 0);
		const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		// Unique customers
		const uniqueCustomers = new Set(salesRepOrders.map(order => 
			`${order.shippingAddress.firstName}-${order.shippingAddress.lastName}-${order.shippingAddress.phone}`
		)).size;

		// Recent orders (last 5)
		const recentOrders = salesRepOrders
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5);

		// Status breakdown
		const statusBreakdown = salesRepOrders.reduce((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Payment method breakdown
		const paymentBreakdown = salesRepOrders.reduce((acc, order) => {
			acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Top products this month
		const monthProductSales = monthOrders.reduce((acc, order) => {
			order.items.forEach(item => {
				if (!acc[item.name]) {
					acc[item.name] = { quantity: 0, revenue: 0 };
				}
				acc[item.name].quantity += item.quantity;
				acc[item.name].revenue += item.price * item.quantity;
			});
			return acc;
		}, {} as Record<string, { quantity: number; revenue: number }>);

		const topProducts = Object.entries(monthProductSales)
			.sort((a, b) => b[1].revenue - a[1].revenue)
			.slice(0, 3);

		return {
			today: { orders: todayOrders.length, revenue: todayRevenue },
			week: { orders: weekOrders.length, revenue: weekRevenue },
			month: { orders: monthOrders.length, revenue: monthRevenue },
			total: { orders: totalOrders, revenue: totalRevenue, avgOrderValue, customers: uniqueCustomers },
			recentOrders,
			statusBreakdown,
			paymentBreakdown,
			topProducts
		};
	}, [salesRepOrders]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};


	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "confirmed":
				return "bg-green-100 text-green-800";
			case "processing":
				return "bg-blue-100 text-blue-800";
			case "shipped":
				return "bg-indigo-100 text-indigo-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPaymentMethodLabel = (method: string) => {
		switch (method) {
			case "cash":
				return "Cash";
			case "bank_transfer":
				return "Bank Transfer";
			case "card_terminal":
				return "Card Terminal";
			default:
				return method.replace("_", " ");
		}
	};

	const handleRefresh = () => {
		dispatch(fetchOrders());
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	// Loading state
	if (isLoading && !hasBeenFetched) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Welcome Header */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold">{getGreeting()}! 👋</h1>
						<p className="text-green-100 mt-1">Ready to help customers and boost sales today?</p>
					</div>
					<div className="flex items-center space-x-3">
						<button
							onClick={handleRefresh}
							disabled={isLoading}
							className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 disabled:opacity-50 transition-colors"
						>
							<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
							<span>Refresh</span>
						</button>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Link
					to="/salesrep/create-order"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
							<Plus className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">Create Order</h3>
							<p className="text-sm text-gray-600">Process new customer order</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
					</div>
				</Link>

				<Link
					to="/salesrep/orders"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
							<Eye className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">View Orders</h3>
							<p className="text-sm text-gray-600">Check order history & status</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
					</div>
				</Link>

				<Link
					to="/salesrep/reports"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
							<BarChart3 className="w-6 h-6 text-purple-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
							<p className="text-sm text-gray-600">View sales performance</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
					</div>
				</Link>
			</div>

			{/* Performance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-green-100 rounded-full">
							<Calendar className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{dashboardMetrics.today.orders}</h3>
							<p className="text-sm text-gray-600">Today's Orders</p>
							<p className="text-xs text-green-600 font-medium">{formatPrice(dashboardMetrics.today.revenue)}</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-blue-100 rounded-full">
							<TrendingUp className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{dashboardMetrics.week.orders}</h3>
							<p className="text-sm text-gray-600">This Week</p>
							<p className="text-xs text-blue-600 font-medium">{formatPrice(dashboardMetrics.week.revenue)}</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-purple-100 rounded-full">
							<DollarSign className="w-6 h-6 text-purple-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{formatPrice(dashboardMetrics.total.avgOrderValue)}</h3>
							<p className="text-sm text-gray-600">Avg Order Value</p>
							<p className="text-xs text-purple-600 font-medium">{dashboardMetrics.total.orders} total orders</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-yellow-100 rounded-full">
							<Users className="w-6 h-6 text-yellow-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{dashboardMetrics.total.customers}</h3>
							<p className="text-sm text-gray-600">Customers Served</p>
							<p className="text-xs text-yellow-600 font-medium">All time</p>
						</div>
					</div>
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Orders */}
				<div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center">
							<ShoppingCart className="w-5 h-5 mr-2" />
							Recent Orders
						</h3>
						<Link
							to="/salesrep/orders"
							className="text-green-600 hover:text-green-700 text-sm font-medium"
						>
							View all
						</Link>
					</div>

					<div className="space-y-3">
						{dashboardMetrics.recentOrders.map((order) => (
							<div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
								<div className="flex items-center space-x-3">
									<div className="flex-shrink-0">
										<Package className="w-8 h-8 text-gray-400" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
										<p className="text-xs text-gray-500">
											{order.shippingAddress.firstName} {order.shippingAddress.lastName}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</p>
									<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
										{order.status}
									</span>
								</div>
							</div>
						))}
					</div>

					{dashboardMetrics.recentOrders.length === 0 && (
						<div className="text-center py-8">
							<ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">No orders yet. Create your first order!</p>
							<Link
								to="/salesrep/create-order"
								className="inline-flex items-center mt-2 text-green-600 hover:text-green-700"
							>
								<Plus className="w-4 h-4 mr-1" />
								Create Order
							</Link>
						</div>
					)}
				</div>

				{/* Quick Stats */}
				<div className="space-y-6">
					{/* Monthly Performance */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<Target className="w-5 h-5 mr-2" />
							This Month
						</h3>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Orders</span>
								<span className="text-sm font-medium text-gray-900">{dashboardMetrics.month.orders}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Revenue</span>
								<span className="text-sm font-medium text-gray-900">{formatPrice(dashboardMetrics.month.revenue)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Total Revenue</span>
								<span className="text-sm font-medium text-gray-900">{formatPrice(dashboardMetrics.total.revenue)}</span>
							</div>
						</div>
					</div>

					{/* Top Products */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<Award className="w-5 h-5 mr-2" />
							Top Products
						</h3>
						<div className="space-y-3">
							{dashboardMetrics.topProducts.map(([productName, data], index) => (
								<div key={productName} className="flex items-center space-x-3">
									<div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
										index === 0 ? 'bg-yellow-500' :
										index === 1 ? 'bg-gray-400' :
										'bg-yellow-600'
									}`}>
										{index + 1}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
										<p className="text-xs text-gray-500">{data.quantity} sold</p>
									</div>
									<div className="text-right">
										<p className="text-xs font-medium text-gray-900">{formatPrice(data.revenue)}</p>
									</div>
								</div>
							))}
						</div>

						{dashboardMetrics.topProducts.length === 0 && (
							<div className="text-center py-4">
								<Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
								<p className="text-xs text-gray-500">No sales this month</p>
							</div>
						)}
					</div>

					{/* Payment Methods */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
						<div className="space-y-2">
							{Object.entries(dashboardMetrics.paymentBreakdown).map(([method, count]) => (
								<div key={method} className="flex justify-between items-center">
									<span className="text-sm text-gray-600">{getPaymentMethodLabel(method)}</span>
									<span className="text-sm font-medium text-gray-900">{count}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Error Banner */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center">
						<AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
						<div className="text-sm text-red-700">
							<p><strong>Error loading data:</strong> {error}</p>
						</div>
						<button
							onClick={handleRefresh}
							className="ml-auto bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
						>
							Retry
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SalesRepDashboard;