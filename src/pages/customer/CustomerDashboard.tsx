import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	Package,
	Heart,
	User,
	ShoppingCart,
	Truck,
	CheckCircle,
	Clock,
	Star,
	TrendingUp,
	Gift,
	ArrowRight,
	RefreshCw,
	AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectOrderError,
	selectOrderLoading,
	selectMyOrders,
	selectOrderHasBeenFetched,
} from "@/redux/selectors/ordersSelectors";
import { fetchMyOrders } from "@/redux/thunks/orders";
import { useAuth } from "@/contexts/AuthContext";

const CustomerDashboard = () => {
	const dispatch = useAppDispatch();
	const { user } = useAuth();
	const myOrders = useAppSelector(selectMyOrders);
	const isLoading = useAppSelector(selectOrderLoading);
	const error = useAppSelector(selectOrderError);
	const hasBeenFetched = useAppSelector(selectOrderHasBeenFetched);

	// Fetch user's orders on mount
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchMyOrders());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Calculate dashboard metrics
	const dashboardMetrics = useMemo(() => {
		const now = new Date();
		const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// All time metrics
		const totalOrders = myOrders.length;
		const totalSpent = myOrders.reduce((sum, order) => sum + order.total, 0);

		// Recent orders (last 30 days)
		const recentOrders = myOrders.filter((order) => new Date(order.createdAt) >= thisMonth);
		const monthlySpent = recentOrders.reduce((sum, order) => sum + order.total, 0);

		// Order status breakdown
		const statusBreakdown = myOrders.reduce((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Recent orders for display (last 5)
		const recentOrdersDisplay = [...myOrders] // ✅ Create a copy first
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5);

		// Calculate average order value
		const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

		// Most purchased products
		const productPurchases = myOrders.reduce((acc, order) => {
			order.items.forEach((item) => {
				if (!acc[item.name]) {
					acc[item.name] = { quantity: 0, spent: 0 };
				}
				acc[item.name].quantity += item.quantity;
				acc[item.name].spent += item.price * item.quantity;
			});
			return acc;
		}, {} as Record<string, { quantity: number; spent: number }>);

		const favoriteProducts = Object.entries(productPurchases)
			.sort((a, b) => b[1].quantity - a[1].quantity)
			.slice(0, 3);

		return {
			totalOrders,
			totalSpent,
			monthlySpent,
			avgOrderValue,
			statusBreakdown,
			recentOrdersDisplay,
			favoriteProducts,
		};
	}, [myOrders]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
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
			default:
				return "bg-gray-100 text-gray-800";
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
			default:
				return <Clock className="w-4 h-4" />;
		}
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	const handleRefresh = () => {
		dispatch(fetchMyOrders());
	};

	// Loading state
	if (isLoading && !hasBeenFetched) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Welcome Header */}
			<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold">
							{getGreeting()}, {user?.firstName}! 👋
						</h1>
						<p className="text-blue-100 mt-1">Welcome back to your dashboard</p>
					</div>
					<div className="flex items-center space-x-3">
						<button
							onClick={handleRefresh}
							disabled={isLoading}
							className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 disabled:opacity-50 transition-colors"
						>
							<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
							<span>Refresh</span>
						</button>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Link
					to="/products"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
							<ShoppingCart className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">Shop</h3>
							<p className="text-sm text-gray-600">Browse products</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
					</div>
				</Link>

				<Link
					to="/customer/orders"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
							<Package className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">Orders</h3>
							<p className="text-sm text-gray-600">Track your orders</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
					</div>
				</Link>

				<Link
					to="/wishlist"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
							<Heart className="w-6 h-6 text-red-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
							<p className="text-sm text-gray-600">Saved items</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-red-600 transition-colors" />
					</div>
				</Link>

				<Link
					to="/customer/account"
					className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
				>
					<div className="flex items-center">
						<div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
							<User className="w-6 h-6 text-purple-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">Account</h3>
							<p className="text-sm text-gray-600">Manage profile</p>
						</div>
						<ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
					</div>
				</Link>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-blue-100 rounded-full">
							<Package className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{dashboardMetrics.totalOrders}</h3>
							<p className="text-sm text-gray-600">Total Orders</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-green-100 rounded-full">
							<TrendingUp className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{formatPrice(dashboardMetrics.totalSpent)}
							</h3>
							<p className="text-sm text-gray-600">Total Spent</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-purple-100 rounded-full">
							<Star className="w-6 h-6 text-purple-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{formatPrice(dashboardMetrics.avgOrderValue)}
							</h3>
							<p className="text-sm text-gray-600">Avg Order Value</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-3 bg-orange-100 rounded-full">
							<Gift className="w-6 h-6 text-orange-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{formatPrice(dashboardMetrics.monthlySpent)}
							</h3>
							<p className="text-sm text-gray-600">This Month</p>
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
							<Package className="w-5 h-5 mr-2" />
							Recent Orders
						</h3>
						<Link to="/customer/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
							View all
						</Link>
					</div>

					<div className="space-y-3">
						{dashboardMetrics.recentOrdersDisplay.map((order) => (
							<div
								key={order.id}
								className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
							>
								<div className="flex items-center space-x-3">
									<div className="flex-shrink-0">{getStatusIcon(order.status)}</div>
									<div>
										<p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
										<p className="text-xs text-gray-500">
											{formatDate(order.createdAt)} • {order.items.length} item
											{order.items.length !== 1 ? "s" : ""}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</p>
									<span
										className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
											order.status,
										)}`}
									>
										{order.status}
									</span>
								</div>
							</div>
						))}
					</div>

					{dashboardMetrics.recentOrdersDisplay.length === 0 && (
						<div className="text-center py-8">
							<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500 mb-2">No orders yet</p>
							<Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700">
								<ShoppingCart className="w-4 h-4 mr-1" />
								Start shopping
							</Link>
						</div>
					)}
				</div>

				{/* Side Panel */}
				<div className="space-y-6">
					{/* Order Status Summary */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
						<div className="space-y-3">
							{Object.entries(dashboardMetrics.statusBreakdown).map(([status, count]) => (
								<div key={status} className="flex justify-between items-center">
									<div className="flex items-center">
										<div className="w-3 h-3 rounded-full mr-3 bg-gray-300"></div>
										<span className="text-sm text-gray-700 capitalize">{status}</span>
									</div>
									<span className="text-sm font-medium text-gray-900">{count}</span>
								</div>
							))}
						</div>
					</div>

					{/* Favorite Products */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<Star className="w-5 h-5 mr-2" />
							Favorite Products
						</h3>
						<div className="space-y-3">
							{dashboardMetrics.favoriteProducts.map(([productName, data], index) => (
								<div key={productName} className="flex items-center space-x-3">
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
											index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-yellow-600"
										}`}
									>
										{index + 1}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
										<p className="text-xs text-gray-500">{data.quantity} purchased</p>
									</div>
									<div className="text-right">
										<p className="text-xs font-medium text-gray-900">{formatPrice(data.spent)}</p>
									</div>
								</div>
							))}
						</div>

						{dashboardMetrics.favoriteProducts.length === 0 && (
							<div className="text-center py-4">
								<Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
								<p className="text-xs text-gray-500">No purchases yet</p>
							</div>
						)}
					</div>

					{/* Account Summary */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Name</span>
								<span className="text-sm font-medium text-gray-900">
									{user?.firstName} {user?.lastName}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Email</span>
								<span className="text-sm font-medium text-gray-900">{user?.email}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Member since</span>
								<span className="text-sm font-medium text-gray-900">
									{user?.createdAt ? formatDate(user.createdAt.toString()) : "N/A"}
								</span>
							</div>
						</div>
						<Link
							to="/account"
							className="mt-4 block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
						>
							Manage Account
						</Link>
					</div>
				</div>
			</div>

			{/* Error Banner */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center">
						<AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
						<div className="text-sm text-red-700">
							<p>
								<strong>Error loading data:</strong> {error}
							</p>
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

export default CustomerDashboard;
