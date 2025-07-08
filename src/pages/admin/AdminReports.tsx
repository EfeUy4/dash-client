import { useState, useEffect, useMemo } from "react";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	Download,
	BarChart3,
	Activity,
	RefreshCw,
	AlertTriangle,
} from "lucide-react";
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
import { useToastUtils } from "@/services/toast";
import { Product } from "@/data/types";

interface OrderItem {
	product: string;
	name: string;
	price: number;
	quantity: number;
	size: string;
	color: string;
	image: string;
}

interface Order {
	id: string;
	orderNumber: string;
	user: string;
	items: OrderItem[];
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
	paymentStatus: "pending" | "paid" | "failed" | "refunded";
	paymentMethod: string;
	shippingAddress: {
		firstName: string;
		lastName: string;
		email: string;
		city: string;
		state: string;
	};
	createdAt: string;
	updatedAt: string;
}

interface ProcessedReportData {
	revenue: {
		current: number;
		previous: number;
		growth: number;
	};
	orders: {
		current: number;
		previous: number;
		growth: number;
	};
	products: {
		total: number;
		lowStock: number;
		outOfStock: number;
	};
	customers: {
		total: number;
		new: number;
		returning: number;
	};
	topProducts: Array<{
		id: string;
		name: string;
		sales: number;
		revenue: number;
		image: string;
	}>;
	topCategories: Array<{
		category: string;
		sales: number;
		revenue: number;
	}>;
	salesByMonth: Array<{
		month: string;
		revenue: number;
		orders: number;
	}>;
	recentOrders: Array<{
		id: string;
		orderNumber: string;
		customer: string;
		total: number;
		status: string;
		date: string;
	}>;
}

const AdminReports = () => {
	const dispatch = useAppDispatch();

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

	const [dateRange, setDateRange] = useState<string>("month");
	const [selectedReport, setSelectedReport] = useState<string>("overview");

	const { showSuccessToast } = useToastUtils();

	// Check if we're currently loading
	const isLoading = useMemo(() => {
		return (productsLoading && !productsHasBeenFetched) || (ordersLoading && !ordersHasBeenFetched);
	}, [productsLoading, productsHasBeenFetched, ordersLoading, ordersHasBeenFetched]);

	// Check if there are any errors
	const error = useMemo(() => {
		return productsError || ordersError;
	}, [productsError, ordersError]);

	// Fetch data on mount if not already fetched
	useEffect(() => {
		if (!productsHasBeenFetched && !productsLoading) {
			dispatch(fetchProducts());
		}
		if (!ordersHasBeenFetched && !ordersLoading) {
			dispatch(fetchOrders());
		}
	}, [dispatch, productsHasBeenFetched, productsLoading, ordersHasBeenFetched, ordersLoading]);

	const getPeriodStart = (date: Date, period: string): Date => {
		const result = new Date(date);
		switch (period) {
			case "week":
				result.setDate(result.getDate() - 7);
				break;
			case "month":
				result.setMonth(result.getMonth() - 1);
				break;
			case "quarter":
				result.setMonth(result.getMonth() - 3);
				break;
			case "year":
				result.setFullYear(result.getFullYear() - 1);
				break;
			default:
				result.setMonth(result.getMonth() - 1);
		}
		return result;
	};

	const processReportData = (orders: Order[], products: Product[], period: string): ProcessedReportData => {
		const now = new Date();
		const periodStart = getPeriodStart(now, period);
		const previousPeriodStart = getPeriodStart(periodStart, period);

		// Filter orders by current period
		const currentPeriodOrders = orders.filter(
			(order) =>
				new Date(order.createdAt) >= periodStart &&
				order.status !== "cancelled" &&
				order.paymentStatus === "paid",
		);

		// Filter orders by previous period
		const previousPeriodOrders = orders.filter(
			(order) =>
				new Date(order.createdAt) >= previousPeriodStart &&
				new Date(order.createdAt) < periodStart &&
				order.status !== "cancelled" &&
				order.paymentStatus === "paid",
		);

		// Calculate revenue
		const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0);
		const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
		const revenueGrowth =
			previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

		// Calculate order metrics
		const currentOrderCount = currentPeriodOrders.length;
		const previousOrderCount = previousPeriodOrders.length;
		const orderGrowth =
			previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

		// Product analytics
		const totalProducts = products.filter((p) => p.isActive).length;
		const lowStockProducts = products.filter(
			(p) => p.stockCount <= 10 && p.stockCount > 0 && p.isActive,
		).length;
		const outOfStockProducts = products.filter((p) => p.stockCount === 0 && p.isActive).length;

		// Customer analytics
		const customerEmails = new Set(currentPeriodOrders.map((order) => order.shippingAddress.email));
		const previousCustomerEmails = new Set(previousPeriodOrders.map((order) => order.shippingAddress.email));
		const newCustomers = Array.from(customerEmails).filter(
			(email) => !previousCustomerEmails.has(email),
		).length;
		const returningCustomers = Array.from(customerEmails).filter((email) =>
			previousCustomerEmails.has(email),
		).length;

		// Top products by sales
		const productSales = new Map<string, { name: string; sales: number; revenue: number; image: string }>();
		currentPeriodOrders.forEach((order) => {
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
			.slice(0, 10);

		// Top categories
		const categorySales = new Map<string, { sales: number; revenue: number }>();
		currentPeriodOrders.forEach((order) => {
			order.items.forEach((item) => {
				const product = products.find((p) => p.id === item.product);
				const category = product?.category || "Unknown";
				const existing = categorySales.get(category) || { sales: 0, revenue: 0 };
				existing.sales += item.quantity;
				existing.revenue += item.price * item.quantity;
				categorySales.set(category, existing);
			});
		});

		const topCategories = Array.from(categorySales.entries())
			.map(([category, data]) => ({ category, ...data }))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		// Sales by month (last 6 months)
		const salesByMonth: Array<{ month: string; revenue: number; orders: number }> = [];
		for (let i = 5; i >= 0; i--) {
			const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

			const monthOrders = orders.filter((order) => {
				const orderDate = new Date(order.createdAt);
				return (
					orderDate >= monthStart &&
					orderDate <= monthEnd &&
					order.status !== "cancelled" &&
					order.paymentStatus === "paid"
				);
			});

			salesByMonth.push({
				month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
				revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
				orders: monthOrders.length,
			});
		}

		// Recent orders (safe .sort with spread)
		const recentOrders = [...orders]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
			.map((order) => ({
				id: order.id,
				orderNumber: order.orderNumber,
				customer: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
				total: order.total,
				status: order.status,
				date: order.createdAt,
			}));

		return {
			revenue: {
				current: currentRevenue,
				previous: previousRevenue,
				growth: revenueGrowth,
			},
			orders: {
				current: currentOrderCount,
				previous: previousOrderCount,
				growth: orderGrowth,
			},
			products: {
				total: totalProducts,
				lowStock: lowStockProducts,
				outOfStock: outOfStockProducts,
			},
			customers: {
				total: customerEmails.size,
				new: newCustomers,
				returning: returningCustomers,
			},
			topProducts,
			topCategories,
			salesByMonth,
			recentOrders,
		};
	};

	// Process report data with memoization
	const reportData = useMemo(() => {
		if (products.length === 0 || orders.length === 0) return null;
		return processReportData(orders, products, dateRange);
	}, [orders, products, dateRange]);

	const handleRefresh = () => {
		dispatch(fetchProducts());
		dispatch(fetchOrders());
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(price);
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + "M";
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "K";
		}
		return num.toString();
	};

	const getGrowthColor = (growth: number) => {
		if (growth > 0) return "text-green-600";
		if (growth < 0) return "text-red-600";
		return "text-gray-600";
	};

	const getGrowthIcon = (growth: number) => {
		if (growth > 0) return <TrendingUp className="w-4 h-4" />;
		if (growth < 0) return <TrendingDown className="w-4 h-4" />;
		return <Activity className="w-4 h-4" />;
	};

	const exportReport = () => {
		if (!reportData) return;

		// Create CSV content
		const csvContent = [
			["Report Period", dateRange],
			["Generated On", new Date().toLocaleDateString()],
			[""],
			["REVENUE METRICS"],
			["Current Revenue", formatPrice(reportData.revenue.current)],
			["Previous Revenue", formatPrice(reportData.revenue.previous)],
			["Growth", `${reportData.revenue.growth.toFixed(1)}%`],
			[""],
			["ORDER METRICS"],
			["Current Orders", reportData.orders.current.toString()],
			["Previous Orders", reportData.orders.previous.toString()],
			["Growth", `${reportData.orders.growth.toFixed(1)}%`],
			[""],
			["PRODUCT METRICS"],
			["Total Products", reportData.products.total.toString()],
			["Low Stock", reportData.products.lowStock.toString()],
			["Out of Stock", reportData.products.outOfStock.toString()],
			[""],
			["TOP PRODUCTS"],
			["Product", "Sales", "Revenue"],
			...reportData.topProducts.map((p) => [p.name, p.sales.toString(), formatPrice(p.revenue)]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `report-${dateRange}-${Date.now()}.csv`);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);

		showSuccessToast("Report exported successfully");
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
							<BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mr-2" />
							Analytics || Reports
						</h1>
						<p className="text-gray-600 text-sm sm:text-base">
							Track performance and analyze business metrics
						</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 sm:p-8">
					<div className="text-center">
						<AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-base sm:text-lg font-semibold text-red-700 mb-2">
							Error Loading Report Data
						</h3>
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
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64 p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading reports...</p>
				</div>
			</div>
		);
	}

	// No data state
	if (!reportData) {
		return (
			<div className="space-y-6 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
							<BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mr-2" />
							Analytics || Reports
						</h1>
						<p className="text-gray-600 text-sm sm:text-base">
							Track performance and analyze business metrics
						</p>
					</div>
					<button
						onClick={handleRefresh}
						className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
					>
						<RefreshCw className="w-5 h-5" />
						<span>Refresh</span>
					</button>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
					<BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Report Data Available</h3>
					<p className="text-sm sm:text-base text-gray-500 mb-4">
						{products.length === 0 && orders.length === 0
							? "No products or orders data available to generate reports."
							: products.length === 0
							? "No products data available."
							: "No orders data available."}
					</p>
					<div className="text-xs sm:text-sm text-gray-400">
						<p>
							Products: {products.length} | Orders: {orders.length}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
						<BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mr-2" />
						Analytics || Reports
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">Track performance and analyze business metrics</p>
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
					<select
						value={dateRange}
						onChange={(e) => setDateRange(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="week">Last 7 Days</option>
						<option value="month">Last 30 Days</option>
						<option value="quarter">Last 3 Months</option>
						<option value="year">Last Year</option>
					</select>
					<button
						onClick={exportReport}
						className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
					>
						<Download className="w-5 h-5" />
						<span>Export</span>
					</button>
				</div>
			</div>

			{/* Data Info Banner */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
				<div className="flex flex-col sm:flex-row sm:items-center gap-2">
					<BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0" />
					<div className="text-xs sm:text-sm text-blue-700">
						<p>
							<strong>Report Data:</strong> {products.length} products • {orders.length} orders • Period:{" "}
							{dateRange}
						</p>
						<p>Last updated: {new Date().toLocaleString()}</p>
					</div>
				</div>
			</div>

			{/* Report Navigation */}
			<div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
				<div className="flex flex-wrap gap-2">
					{[
						{ id: "overview", label: "Overview", icon: BarChart3 },
						{ id: "sales", label: "Sales", icon: DollarSign },
						{ id: "products", label: "Products", icon: Package },
						{ id: "customers", label: "Customers", icon: Users },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setSelectedReport(tab.id)}
							className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
								selectedReport === tab.id
									? "bg-purple-100 text-purple-700 border border-purple-200"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							<tab.icon className="w-4 h-4" />
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Key Metrics - Improved Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Revenue */}
				<div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-green-500 rounded-lg shadow-md">
							<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
						<div
							className={`flex items-center text-xs sm:text-sm ${getGrowthColor(reportData.revenue.growth)}`}
						>
							{getGrowthIcon(reportData.revenue.growth)}
							<span className="ml-1 font-medium">
								{reportData.revenue.growth >= 0 ? "+" : ""}
								{reportData.revenue.growth.toFixed(1)}%
							</span>
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-green-700 mb-1">Total Revenue</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
							{formatPrice(reportData.revenue.current)}
						</p>
						<p className="text-xs text-green-600 mt-1">vs previous period</p>
					</div>
				</div>

				{/* Orders */}
				<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-blue-500 rounded-lg shadow-md">
							<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
						<div
							className={`flex items-center text-xs sm:text-sm ${getGrowthColor(reportData.orders.growth)}`}
						>
							{getGrowthIcon(reportData.orders.growth)}
							<span className="ml-1 font-medium">
								{reportData.orders.growth >= 0 ? "+" : ""}
								{reportData.orders.growth.toFixed(1)}%
							</span>
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">Total Orders</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">
							{formatNumber(reportData.orders.current)}
						</p>
						<p className="text-xs text-blue-600 mt-1">vs previous period</p>
					</div>
				</div>

				{/* Products */}
				<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-purple-500 rounded-lg shadow-md">
							<Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Total Products</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
							{formatNumber(reportData.products.total)}
						</p>
						<div className="flex flex-wrap gap-2 text-xs">
							<span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
								{reportData.products.lowStock} low stock
							</span>
							<span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
								{reportData.products.outOfStock} out
							</span>
						</div>
					</div>
				</div>

				{/* Customers */}
				<div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 sm:p-6 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-indigo-500 rounded-lg shadow-md">
							<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-indigo-700 mb-1">Total Customers</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
							{formatNumber(reportData.customers.total)}
						</p>
						<div className="flex flex-wrap gap-2 text-xs">
							<span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
								{reportData.customers.new} new
							</span>
							<span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
								{reportData.customers.returning} returning
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Charts and Tables */}
			{selectedReport === "overview" && (
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
					{/* Top Selling Products */}
					<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
						<div className="space-y-3 sm:space-y-4">
							{reportData.topProducts.slice(0, 5).map((product, index) => (
								<div key={product.id} className="flex items-center space-x-3 sm:space-x-4">
									<div className="flex-shrink-0">
										<span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 text-purple-600 text-xs sm:text-sm font-medium rounded-full">
											{index + 1}
										</span>
									</div>
									<div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
										{product.image ? (
											<img
												className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
												src={product.image}
												alt={product.name}
											/>
										) : (
											<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-200 flex items-center justify-center">
												<Package className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
										<p className="text-xs text-gray-500">{product.sales} sales</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium text-gray-900">{formatPrice(product.revenue)}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Recent Orders */}
					<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
						<div className="space-y-3">
							{reportData.recentOrders.map((order) => (
								<div
									key={order.id}
									className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 last:border-0 gap-2"
								>
									<div className="min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
										<p className="text-xs text-gray-500 truncate">{order.customer}</p>
									</div>
									<div className="flex items-center justify-between sm:flex-col sm:items-end">
										<p className="text-sm font-medium">{formatPrice(order.total)}</p>
										<span
											className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
												order.status === "delivered"
													? "bg-green-100 text-green-800"
													: order.status === "shipped"
													? "bg-blue-100 text-blue-800"
													: order.status === "processing"
													? "bg-yellow-100 text-yellow-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{order.status}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Top Categories */}
			{(selectedReport === "overview" || selectedReport === "products") && (
				<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
						{reportData.topCategories.map((category, index) => (
							<div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
								<div className="flex items-center space-x-3 min-w-0">
									<span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 text-xs sm:text-sm font-medium rounded-full flex-shrink-0">
										{index + 1}
									</span>
									<div className="min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{category.category}</p>
										<p className="text-xs text-gray-500">{category.sales} sales</p>
									</div>
								</div>
								<div className="text-right ml-2">
									<p className="text-sm font-medium text-gray-900">{formatPrice(category.revenue)}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Sales Report Details */}
			{selectedReport === "sales" && (
				<div className="space-y-4 sm:space-y-6">
					<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
							Monthly Sales Performance
						</h3>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Month
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Orders
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Revenue
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Avg Order Value
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{reportData.salesByMonth.map((month, index) => (
										<tr key={index} className="hover:bg-gray-50">
											<td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{month.month}
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(month.orders)}
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatPrice(month.revenue)}
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatPrice(month.orders > 0 ? month.revenue / month.orders : 0)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Product Performance */}
			{selectedReport === "products" && (
				<div className="space-y-4 sm:space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
							<div className="flex items-center">
								<div className="p-2 sm:p-3 bg-green-100 rounded-full">
									<Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
								</div>
								<div className="ml-3 sm:ml-4">
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										{reportData.products.total - reportData.products.outOfStock}
									</h3>
									<p className="text-xs sm:text-sm text-gray-600">Active Products</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
							<div className="flex items-center">
								<div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
									<Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
								</div>
								<div className="ml-3 sm:ml-4">
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										{reportData.products.lowStock}
									</h3>
									<p className="text-xs sm:text-sm text-gray-600">Low Stock Items</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
							<div className="flex items-center">
								<div className="p-2 sm:p-3 bg-red-100 rounded-full">
									<Package className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
								</div>
								<div className="ml-3 sm:ml-4">
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										{reportData.products.outOfStock}
									</h3>
									<p className="text-xs sm:text-sm text-gray-600">Out of Stock</p>
								</div>
							</div>
						</div>
					</div>

					{/* Product Performance Table */}
					<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Product
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Sales
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Revenue
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Performance
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{reportData.topProducts.map((product) => (
										<tr key={product.id} className="hover:bg-gray-50">
											<td className="px-3 py-4 whitespace-nowrap">
												<div className="flex items-center">
													{product.image ? (
														<img
															className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
															src={product.image}
															alt={product.name}
														/>
													) : (
														<div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-200 flex items-center justify-center">
															<Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
														</div>
													)}
													<div className="ml-3 sm:ml-4">
														<div className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">
															{product.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatNumber(product.sales)}
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatPrice(product.revenue)}
											</td>
											<td className="px-3 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2">
														<div
															className="bg-purple-600 h-2 rounded-full"
															style={{
																width: `${Math.min(
																	(product.sales / (reportData.topProducts[0]?.sales || 1)) * 100,
																	100,
																)}%`,
															}}
														></div>
													</div>
													<span className="text-xs sm:text-sm text-gray-600">
														{Math.round((product.sales / (reportData.topProducts[0]?.sales || 1)) * 100)}%
													</span>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Customer Analytics */}
			{selectedReport === "customers" && (
				<div className="space-y-4 sm:space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
							<div className="flex items-center">
								<div className="p-2 sm:p-3 bg-blue-100 rounded-full">
									<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
								</div>
								<div className="ml-3 sm:ml-4">
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										{reportData.customers.total}
									</h3>
									<p className="text-xs sm:text-sm text-gray-600">Total Customers</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
							<div className="flex items-center">
								<div className="p-2 sm:p-3 bg-green-100 rounded-full">
									<Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
								</div>
								<div className="ml-3 sm:ml-4">
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										{reportData.customers.new}
									</h3>
									<p className="text-xs sm:text-sm text-gray-600">New Customers</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
							<div className="flex items-center">
								<div className="p-2 sm:p-3 bg-purple-100 rounded-full">
									<Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
								</div>
								<div className="ml-3 sm:ml-4">
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										{reportData.customers.returning}
									</h3>
									<p className="text-xs sm:text-sm text-gray-600">Returning Customers</p>
								</div>
							</div>
						</div>
					</div>

					{/* Customer Metrics */}
					<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Customer Metrics</h3>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">Customer Acquisition</h4>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">New Customers</span>
										<span className="text-sm font-medium">{reportData.customers.new}</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-green-600 h-2 rounded-full"
											style={{
												width: `${
													reportData.customers.total > 0
														? (reportData.customers.new / reportData.customers.total) * 100
														: 0
												}%`,
											}}
										></div>
									</div>
								</div>
							</div>

							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">Customer Retention</h4>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Returning Customers</span>
										<span className="text-sm font-medium">{reportData.customers.returning}</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-purple-600 h-2 rounded-full"
											style={{
												width: `${
													reportData.customers.total > 0
														? (reportData.customers.returning / reportData.customers.total) * 100
														: 0
												}%`,
											}}
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Customer Orders Table */}
					<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Customer Activity</h3>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Customer
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Orders
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Total Spent
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Avg Order
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Last Order
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{(() => {
										// Calculate customer stats
										const customerStats = new Map();
										const now = new Date();
										const periodStart = getPeriodStart(now, dateRange);

										orders
											.filter(
												(order) =>
													new Date(order.createdAt) >= periodStart &&
													order.status !== "cancelled" &&
													order.paymentStatus === "paid",
											)
											.forEach((order) => {
												const email = order.shippingAddress.email;
												const customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

												if (!customerStats.has(email)) {
													customerStats.set(email, {
														name: customerName,
														orders: 0,
														totalSpent: 0,
														lastOrder: order.createdAt,
													});
												}

												const customer = customerStats.get(email);
												customer.orders += 1;
												customer.totalSpent += order.total;
												if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
													customer.lastOrder = order.createdAt;
												}
											});

										return Array.from(customerStats.values())
											.sort((a, b) => b.totalSpent - a.totalSpent)
											.slice(0, 10);
									})().map((customer, index) => (
										<tr key={index} className="hover:bg-gray-50">
											<td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												<div className="max-w-32 sm:max-w-none truncate">{customer.name}</div>
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{customer.orders}</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatPrice(customer.totalSpent)}
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatPrice(customer.totalSpent / customer.orders)}
											</td>
											<td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(customer.lastOrder).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Performance Summary */}
			<div className="bg-gradient-to-r from-purple-50 to-red-50 p-4 sm:p-6 rounded-lg border border-purple-200">
				<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					<div>
						<div className="text-lg sm:text-2xl font-bold text-purple-600">
							{formatPrice(reportData.revenue.current / (reportData.orders.current || 1))}
						</div>
						<div className="text-xs sm:text-sm text-gray-600">Average Order Value</div>
					</div>
					<div>
						<div className="text-lg sm:text-2xl font-bold text-blue-600">
							{(
								((reportData.products.total - reportData.products.outOfStock) / reportData.products.total) *
								100
							).toFixed(1)}
							%
						</div>
						<div className="text-xs sm:text-sm text-gray-600">Stock Availability</div>
					</div>
					<div>
						<div className="text-lg sm:text-2xl font-bold text-green-600">
							{reportData.customers.total > 0
								? ((reportData.customers.returning / reportData.customers.total) * 100).toFixed(1)
								: 0}
							%
						</div>
						<div className="text-xs sm:text-sm text-gray-600">Customer Retention</div>
					</div>
					<div>
						<div className="text-lg sm:text-2xl font-bold text-purple-600">
							{reportData.topProducts.length}
						</div>
						<div className="text-xs sm:text-sm text-gray-600">Best Sellers</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminReports;
