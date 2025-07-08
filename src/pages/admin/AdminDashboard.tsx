// pages/admin/AdminDashboard.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, ShoppingCart, Package, TrendingUp, AlertTriangle, Activity, RefreshCw, DollarSign } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import {
	selectOrderError,
	selectOrderLoading,
	selectOrders,
	selectOrderHasBeenFetched,
} from "@/redux/selectors/ordersSelectors";
import { fetchProducts } from "@/redux/thunks/products";
import { fetchOrders } from "@/redux/thunks/orders";
import api from "@/utils/api";
import { useToastUtils } from "@/services/toast";

interface User {
	id: string;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	role: "customer" | "storekeeper" | "salesrep" | "admin";
	phone?: string;
	isActive: boolean;
	lastLoginAt?: string;
	createdAt: string;
}

const AdminDashboard = () => {
	const dispatch = useAppDispatch();
	const { showErrorToast } = useToastUtils();

	// Product selectors
	const products = useAppSelector(selectProducts);
	const productsLoading = useAppSelector(selectProductLoading);
	const productsError = useAppSelector(selectProductError);
	const productsHasBeenFetched = useAppSelector(selectHasBeenFetched);

	// Order selectors
	const orders = useAppSelector(selectOrders);
	const ordersLoading = useAppSelector(selectOrderLoading);
	const ordersError = useAppSelector(selectOrderError);
	const ordersHasBeenFetched = useAppSelector(selectOrderHasBeenFetched);

	// Users state (direct fetch)
	const [users, setUsers] = useState<User[]>([]);
	const [usersLoading, setUsersLoading] = useState(true);
	const [usersError, setUsersError] = useState<string | null>(null);

	// Check if we're currently loading
	const isLoading = useMemo(() => {
		return (
			(productsLoading && !productsHasBeenFetched) || (ordersLoading && !ordersHasBeenFetched) || usersLoading
		);
	}, [productsLoading, productsHasBeenFetched, ordersLoading, ordersHasBeenFetched, usersLoading]);

	// Check if there are any errors
	const error = useMemo(() => {
		return productsError || ordersError || usersError;
	}, [productsError, ordersError, usersError]);

	// Fetch users function
	const fetchUsers = async () => {
		try {
			setUsersLoading(true);
			setUsersError(null);
			const response = await api.get("/users");
			setUsers(response.data.users || []);
		} catch (err: any) {
			console.error("API Error:", err);
			setUsersError(err.response?.data?.message || "Failed to fetch users");
			showErrorToast(err.response?.data?.message || "Failed to fetch users");
		} finally {
			setUsersLoading(false);
		}
	};

	// Fetch data on mount if not already fetched
	useEffect(() => {
		if (!productsHasBeenFetched && !productsLoading) {
			dispatch(fetchProducts());
		}
		if (!ordersHasBeenFetched && !ordersLoading) {
			dispatch(fetchOrders());
		}
		// Always fetch users on mount
		fetchUsers();
	}, [dispatch, productsHasBeenFetched, productsLoading, ordersHasBeenFetched, ordersLoading]);

	// Calculate real stats from Redux data (using reports page logic)
	const stats = useMemo(() => {
		// User stats
		const totalUsers = users.length;
		const activeUsers = users.filter((user) => user.isActive).length;

		// Order stats - using same logic as reports page
		const totalOrders = orders.length;
		const validOrders = orders.filter(
			(order) =>
				order.status !== "cancelled" &&
				order.paymentStatus === "paid",
		);
		const totalRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);

		// Product stats
		const totalProducts = products.filter((p) => p.isActive).length;

		return {
			totalUsers,
			totalOrders,
			totalProducts,
			totalRevenue,
			activeUsers,
		};
	}, [users, orders, products]);

	const getTimeAgo = (dateString: string): string => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	// Generate recent activity from real data (using reports page logic)
	const recentActivity = useMemo(() => {
		// Recent orders (safe .sort with spread - from reports page)
		const recentOrders = [...orders]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 8)
			.map((order) => ({
				id: order.id,
				action: `Order ${order.status}`,
				user: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
				details: `${order.orderNumber} • ${formatPrice(order.total)}`,
				time: getTimeAgo(order.createdAt),
				type: "order",
			}));

		// Top products by sales (from reports page logic)
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		
		const currentMonthOrders = orders.filter((order) => {
			const orderDate = new Date(order.createdAt);
			return (
				orderDate >= monthStart &&
				order.status !== "cancelled" &&
				order.paymentStatus === "paid"
			);
		});

		const productSales = new Map<string, { name: string; sales: number; revenue: number; image: string }>();
		currentMonthOrders.forEach((order) => {
			order.items.forEach((item) => {
				const existing = productSales.get(item.product) || {
					name: item.name,
					sales: 0,
					revenue: 0,
					image: item.image,
				};
				existing.sales += item.quantity;
				existing.revenue += item.price * item.quantity;
				productSales.set(item.product, existing);
			});
		});

		const topProducts = Array.from(productSales.entries())
			.map(([id, data]) => ({ id, ...data }))
			.sort((a, b) => b.sales - a.sales)
			.slice(0, 3)
			.map((product) => ({
				id: `product-${product.id}`,
				action: "Top selling product",
				user: product.name,
				details: `${product.sales} sold • ${formatPrice(product.revenue)}`,
				time: "This month",
				type: "inventory",
			}));

		// Recent user registrations (last 7 days)
		const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const recentUsers = users
			.filter((user) => {
				const userCreated = new Date(user.createdAt);
				return userCreated > weekAgo;
			})
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 3)
			.map((user) => ({
				id: `user-${user.id}`,
				action: "New user registration",
				user: `${user.firstName} ${user.lastName}`,
				details: user.email,
				time: getTimeAgo(user.createdAt),
				type: "user",
			}));

		// Combine all activities and sort by most recent
		const allActivities = [...recentOrders, ...topProducts, ...recentUsers];
		
		// Custom sort to prioritize actual time-based activities
		return allActivities
			.sort((a, b) => {
				// Put "This month" items at the end
				if (a.time === "This month" && b.time !== "This month") return 1;
				if (b.time === "This month" && a.time !== "This month") return -1;
				if (a.time === "This month" && b.time === "This month") return 0;
				
				// For time-based items, sort by actual time
				const parseTimeAgo = (timeString: string): number => {
					if (timeString === "Just now") return 0;
					const match = timeString.match(/(\d+)\s+(minute|hour|day)/);
					if (!match) return 999999;

					const value = parseInt(match[1]);
					const unit = match[2];

					switch (unit) {
						case "minute": return value;
						case "hour": return value * 60;
						case "day": return value * 60 * 24;
						default: return 999999;
					}
				};
				
				return parseTimeAgo(a.time) - parseTimeAgo(b.time);
			})
			.slice(0, 10);
	}, [users, orders, products]);

	const handleRefresh = () => {
		dispatch(fetchProducts());
		dispatch(fetchOrders());
		fetchUsers();
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "user":
				return <Users className="w-4 h-4 text-blue-600" />;
			case "order":
				return <ShoppingCart className="w-4 h-4 text-green-600" />;
			case "inventory":
				return <Package className="w-4 h-4 text-orange-600" />;
			case "alert":
				return <AlertTriangle className="w-4 h-4 text-red-600" />;
			default:
				return <Activity className="w-4 h-4 text-gray-600" />;
		}
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6 p-4 sm:p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
						<p className="text-gray-600">Monitor your platform's performance and activity</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard Data</h3>
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
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64 p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Overview</h1>
					<p className="text-gray-600 text-sm sm:text-base">Monitor your platform's performance and activity</p>
				</div>
				<button
					onClick={handleRefresh}
					disabled={isLoading}
					className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
				>
					<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
					<span>Refresh</span>
				</button>
			</div>

			{/* Data Info Banner */}
			<div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
				<div className="flex flex-col sm:flex-row sm:items-center gap-2">
					<Activity className="w-5 h-5 text-purple-600 flex-shrink-0" />
					<div className="text-xs sm:text-sm text-purple-700">
						<p>
							<strong>Live Data:</strong> {users.length} users • {orders.length} orders • {products.length}{" "}
							products
						</p>
						<p>Last updated: {new Date().toLocaleString()}</p>
					</div>
				</div>
			</div>

			{/* Stats Cards - Improved Design */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Users */}
				<div className="bg-gradient-to-br from-blue-50/50 to-blue-100/70 p-4 sm:p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-blue-400 rounded-lg shadow-sm">
							<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">Total Users</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">
							{isLoading ? "..." : stats.totalUsers.toLocaleString()}
						</p>
						<p className="text-xs text-blue-600 mt-1">{stats.activeUsers} active</p>
					</div>
				</div>

				{/* Total Orders */}
				<div className="bg-gradient-to-br from-green-50/50 to-green-100/70 p-4 sm:p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-green-400 rounded-lg shadow-sm">
							<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-green-700 mb-1">Total Orders</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">
							{isLoading ? "..." : stats.totalOrders.toLocaleString()}
						</p>
						<p className="text-xs text-green-600 mt-1">All time</p>
					</div>
				</div>

				{/* Total Products */}
				<div className="bg-gradient-to-br from-orange-50/50 to-orange-100/70 p-4 sm:p-6 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-orange-400 rounded-lg shadow-sm">
							<Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-orange-700 mb-1">Products</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">{isLoading ? "..." : stats.totalProducts}</p>
						<p className="text-xs text-orange-600 mt-1">Active products</p>
					</div>
				</div>

				{/* Total Revenue */}
				<div className="bg-gradient-to-br from-purple-50/50 to-purple-100/70 p-4 sm:p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-purple-400 rounded-lg shadow-sm">
							<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Total Revenue</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
							{isLoading ? "..." : formatPrice(stats.totalRevenue)}
						</p>
						<p className="text-xs text-purple-600 mt-1">All completed orders</p>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				{/* Quick Actions - Functional Links */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
					<h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
					<div className="grid grid-cols-2 gap-3">
						<Link 
							to="/admin/users" 
							className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-colors group"
						>
							<Users className="w-5 h-5 text-purple-600 mb-2 group-hover:text-purple-700" />
							<p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Manage Users</p>
							<p className="text-xs text-gray-500">{stats.totalUsers} total</p>
						</Link>
						
						<Link 
							to="/admin/orders" 
							className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-colors group"
						>
							<ShoppingCart className="w-5 h-5 text-green-600 mb-2 group-hover:text-green-700" />
							<p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">View Orders</p>
							<p className="text-xs text-gray-500">{stats.totalOrders} orders</p>
						</Link>
						
						<Link 
							to="/admin/inventory" 
							className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-colors group"
						>
							<Package className="w-5 h-5 text-orange-600 mb-2 group-hover:text-orange-700" />
							<p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Manage Products</p>
							<p className="text-xs text-gray-500">{stats.totalProducts} products</p>
						</Link>
						
						<Link 
							to="/admin/reports" 
							className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-colors group"
						>
							<TrendingUp className="w-5 h-5 text-blue-600 mb-2 group-hover:text-blue-700" />
							<p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">View Reports</p>
							<p className="text-xs text-gray-500">Analytics & insights</p>
						</Link>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="p-4 sm:p-6 border-b border-gray-200">
						<h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
					</div>
					<div className="p-4 sm:p-6">
						{recentActivity.length > 0 ? (
							<div className="space-y-4 max-h-96 overflow-y-auto">
								{recentActivity.map((activity: any) => (
									<div key={activity.id} className="flex items-start space-x-3">
										<div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">{getActivityIcon(activity.type)}</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900">{activity.action}</p>
											<p className="text-sm text-gray-600 truncate">{activity.user}</p>
											{activity.details && (
												<p className="text-xs text-gray-500 truncate">{activity.details}</p>
											)}
										</div>
										<span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
								<h3 className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</h3>
								<p className="text-sm text-gray-600">
									Activity will appear here as users interact with the platform
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;