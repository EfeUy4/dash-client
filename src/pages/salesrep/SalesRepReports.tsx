import { useState, useEffect, useMemo } from "react";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	DollarSign,
	Package,
	Users,
	Download,
	RefreshCw,
	AlertTriangle,
	Target,
	Award,
	ShoppingCart,
	CreditCard
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectOrderError,
	selectOrderLoading,
	selectOrders,
	selectOrderHasBeenFetched,
} from "@/redux/selectors/ordersSelectors";
import { fetchOrders } from "@/redux/thunks/orders";
import { useToastUtils } from "@/services/toast";


const SalesRepReports = () => {
	const dispatch = useAppDispatch();
	const allOrders = useAppSelector(selectOrders);
	const isLoading = useAppSelector(selectOrderLoading);
	const error = useAppSelector(selectOrderError);
	const hasBeenFetched = useAppSelector(selectOrderHasBeenFetched);

	const [dateRange, setDateRange] = useState<string>("month");

	const { showErrorToast, showSuccessToast } = useToastUtils();

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

	// Filter orders by date range
	const filteredOrders = useMemo(() => {
		const now = new Date();
		let startDate: Date;

		switch (dateRange) {
			case "today":
				startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				break;
			case "week":
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "month":
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case "quarter":
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case "year":
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
			default:
				return salesRepOrders;
		}

		return salesRepOrders.filter(order => new Date(order.createdAt) >= startDate);
	}, [salesRepOrders, dateRange]);

	// Calculate analytics
	const analytics = useMemo(() => {
		const currentPeriodOrders = filteredOrders;
		
		// Calculate previous period for comparison
		const now = new Date();
		let previousStartDate: Date;
		let previousEndDate: Date;

		switch (dateRange) {
			case "today":
				previousStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				previousEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				break;
			case "week":
				previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
				previousEndDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "month":
				previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
				previousEndDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case "quarter":
				previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
				previousEndDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			default:
				previousStartDate = new Date(0);
				previousEndDate = new Date(0);
		}

		const previousPeriodOrders = salesRepOrders.filter(order => {
			const orderDate = new Date(order.createdAt);
			return orderDate >= previousStartDate && orderDate < previousEndDate;
		});

		// Current period metrics
		const totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0);
		const totalOrders = currentPeriodOrders.length;
		const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
		const uniqueCustomers = new Set(currentPeriodOrders.map(order => 
			`${order.shippingAddress.firstName}-${order.shippingAddress.lastName}-${order.shippingAddress.phone}`
		)).size;

		// Previous period metrics
		const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
		const previousOrders = previousPeriodOrders.length;
		const previousAvgOrderValue = previousOrders > 0 ? previousRevenue / previousOrders : 0;
		const previousCustomers = new Set(previousPeriodOrders.map(order => 
			`${order.shippingAddress.firstName}-${order.shippingAddress.lastName}-${order.shippingAddress.phone}`
		)).size;

		// Calculate percentage changes
		const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
		const ordersChange = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
		const avgOrderChange = previousAvgOrderValue > 0 ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : 0;
		const customersChange = previousCustomers > 0 ? ((uniqueCustomers - previousCustomers) / previousCustomers) * 100 : 0;

		// Payment method breakdown
		const paymentMethods = currentPeriodOrders.reduce((acc, order) => {
			acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Order status breakdown
		const orderStatuses = currentPeriodOrders.reduce((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Daily/hourly breakdown for charts
		const dailyData = currentPeriodOrders.reduce((acc, order) => {
			const date = new Date(order.createdAt).toLocaleDateString();
			if (!acc[date]) {
				acc[date] = { orders: 0, revenue: 0 };
			}
			acc[date].orders += 1;
			acc[date].revenue += order.total;
			return acc;
		}, {} as Record<string, { orders: number; revenue: number }>);

		// Top selling products
		const productSales = currentPeriodOrders.reduce((acc, order) => {
			order.items.forEach(item => {
				if (!acc[item.name]) {
					acc[item.name] = { quantity: 0, revenue: 0 };
				}
				acc[item.name].quantity += item.quantity;
				acc[item.name].revenue += item.price * item.quantity;
			});
			return acc;
		}, {} as Record<string, { quantity: number; revenue: number }>);

		const topProducts = Object.entries(productSales)
			.sort((a, b) => b[1].revenue - a[1].revenue)
			.slice(0, 5);

		return {
			current: {
				totalRevenue,
				totalOrders,
				avgOrderValue,
				uniqueCustomers
			},
			changes: {
				revenueChange,
				ordersChange,
				avgOrderChange,
				customersChange
			},
			paymentMethods,
			orderStatuses,
			dailyData,
			topProducts
		};
	}, [filteredOrders, salesRepOrders, dateRange]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const formatPercentage = (value: number) => {
		const formatted = Math.abs(value).toFixed(1);
		return `${value >= 0 ? '+' : '-'}${formatted}%`;
	};

	const getChangeColor = (value: number) => {
		if (value > 0) return "text-green-600";
		if (value < 0) return "text-red-600";
		return "text-gray-600";
	};

	const getChangeIcon = (value: number) => {
		if (value > 0) return <TrendingUp className="w-4 h-4" />;
		if (value < 0) return <TrendingDown className="w-4 h-4" />;
		return <div className="w-4 h-4" />;
	};

	const handleRefresh = () => {
		dispatch(fetchOrders());
	};

	const handleExportReport = () => {
		try {
			const reportData = [
				["Sales Report", `Period: ${dateRange}`],
				[""],
				["Summary Metrics"],
				["Total Revenue", formatPrice(analytics.current.totalRevenue)],
				["Total Orders", analytics.current.totalOrders.toString()],
				["Average Order Value", formatPrice(analytics.current.avgOrderValue)],
				["Unique Customers", analytics.current.uniqueCustomers.toString()],
				[""],
				["Payment Methods"],
				...Object.entries(analytics.paymentMethods).map(([method, count]) => [
					method.replace("_", " ").toUpperCase(),
					count.toString()
				]),
				[""],
				["Order Status"],
				...Object.entries(analytics.orderStatuses).map(([status, count]) => [
					status.toUpperCase(),
					count.toString()
				]),
				[""],
				["Top Products"],
				["Product", "Quantity Sold", "Revenue"],
				...analytics.topProducts.map(([name, data]) => [
					name,
					data.quantity.toString(),
					formatPrice(data.revenue)
				])
			];

			const csvContent = reportData.map(row => row.join(",")).join("\n");
			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `sales-report-${dateRange}-${Date.now()}.csv`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			showSuccessToast("Report exported successfully");
		} catch (error) {
			showErrorToast("Failed to export report");
		}
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
						<p className="text-gray-600">Track your sales performance and insights</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Analytics</h3>
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading analytics...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
					<p className="text-gray-600">Track your sales performance and insights</p>
				</div>
				<div className="flex items-center space-x-3">
					<select
						value={dateRange}
						onChange={(e) => setDateRange(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						<option value="today">Today</option>
						<option value="week">Last 7 Days</option>
						<option value="month">Last 30 Days</option>
						<option value="quarter">Last 90 Days</option>
						<option value="year">Last Year</option>
						<option value="all">All Time</option>
					</select>
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</button>
					<button
						onClick={handleExportReport}
						className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
					>
						<Download className="w-4 h-4" />
						<span>Export Report</span>
					</button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Revenue</p>
							<p className="text-2xl font-bold text-gray-900">{formatPrice(analytics.current.totalRevenue)}</p>
							<div className={`flex items-center mt-2 ${getChangeColor(analytics.changes.revenueChange)}`}>
								{getChangeIcon(analytics.changes.revenueChange)}
								<span className="ml-1 text-sm">{formatPercentage(analytics.changes.revenueChange)}</span>
							</div>
						</div>
						<div className="p-3 bg-green-100 rounded-full">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Orders</p>
							<p className="text-2xl font-bold text-gray-900">{analytics.current.totalOrders}</p>
							<div className={`flex items-center mt-2 ${getChangeColor(analytics.changes.ordersChange)}`}>
								{getChangeIcon(analytics.changes.ordersChange)}
								<span className="ml-1 text-sm">{formatPercentage(analytics.changes.ordersChange)}</span>
							</div>
						</div>
						<div className="p-3 bg-blue-100 rounded-full">
							<ShoppingCart className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Avg Order Value</p>
							<p className="text-2xl font-bold text-gray-900">{formatPrice(analytics.current.avgOrderValue)}</p>
							<div className={`flex items-center mt-2 ${getChangeColor(analytics.changes.avgOrderChange)}`}>
								{getChangeIcon(analytics.changes.avgOrderChange)}
								<span className="ml-1 text-sm">{formatPercentage(analytics.changes.avgOrderChange)}</span>
							</div>
						</div>
						<div className="p-3 bg-purple-100 rounded-full">
							<Target className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Unique Customers</p>
							<p className="text-2xl font-bold text-gray-900">{analytics.current.uniqueCustomers}</p>
							<div className={`flex items-center mt-2 ${getChangeColor(analytics.changes.customersChange)}`}>
								{getChangeIcon(analytics.changes.customersChange)}
								<span className="ml-1 text-sm">{formatPercentage(analytics.changes.customersChange)}</span>
							</div>
						</div>
						<div className="p-3 bg-yellow-100 rounded-full">
							<Users className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Charts and Breakdowns */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Payment Methods */}
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<CreditCard className="w-5 h-5 mr-2" />
						Payment Methods
					</h3>
					<div className="space-y-3">
						{Object.entries(analytics.paymentMethods).map(([method, count]) => {
							const percentage = analytics.current.totalOrders > 0 ? (count / analytics.current.totalOrders) * 100 : 0;
							return (
								<div key={method} className="flex items-center justify-between">
									<div className="flex items-center">
										<div className={`w-3 h-3 rounded-full mr-3 ${
											method === 'cash' ? 'bg-green-500' :
											method === 'bank_transfer' ? 'bg-blue-500' :
											method === 'card_terminal' ? 'bg-purple-500' : 'bg-gray-500'
										}`}></div>
										<span className="text-sm text-gray-700 capitalize">
											{method.replace('_', ' ')}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<span className="text-sm font-medium text-gray-900">{count}</span>
										<span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Order Status */}
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Package className="w-5 h-5 mr-2" />
						Order Status
					</h3>
					<div className="space-y-3">
						{Object.entries(analytics.orderStatuses).map(([status, count]) => {
							const percentage = analytics.current.totalOrders > 0 ? (count / analytics.current.totalOrders) * 100 : 0;
							return (
								<div key={status} className="flex items-center justify-between">
									<div className="flex items-center">
										<div className={`w-3 h-3 rounded-full mr-3 ${
											status === 'confirmed' ? 'bg-green-500' :
											status === 'pending' ? 'bg-yellow-500' :
											status === 'shipped' ? 'bg-blue-500' :
											status === 'delivered' ? 'bg-green-600' :
											status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
										}`}></div>
										<span className="text-sm text-gray-700 capitalize">{status}</span>
									</div>
									<div className="flex items-center space-x-2">
										<span className="text-sm font-medium text-gray-900">{count}</span>
										<span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Top Products */}
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<Award className="w-5 h-5 mr-2" />
					Top Selling Products
				</h3>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Product
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Quantity Sold
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Revenue
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									% of Total Revenue
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{analytics.topProducts.map(([productName, data], index) => {
								const revenuePercentage = analytics.current.totalRevenue > 0 ? 
									(data.revenue / analytics.current.totalRevenue) * 100 : 0;
								return (
									<tr key={productName}>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
													index === 0 ? 'bg-yellow-500' :
													index === 1 ? 'bg-gray-400' :
													index === 2 ? 'bg-yellow-600' : 'bg-gray-300'
												}`}>
													{index + 1}
												</div>
												<span className="text-sm font-medium text-gray-900">{productName}</span>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
											{data.quantity}
										</td>
										<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatPrice(data.revenue)}
										</td>
										<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
											{revenuePercentage.toFixed(1)}%
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					{analytics.topProducts.length === 0 && (
						<div className="text-center py-8">
							<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">No product sales data available for this period.</p>
						</div>
					)}
				</div>
			</div>

			{/* Performance Summary */}
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<BarChart3 className="w-5 h-5 mr-2" />
					Performance Summary
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">{analytics.current.totalOrders}</div>
						<div className="text-sm text-gray-600">Orders Processed</div>
						<div className="text-xs text-gray-500 mt-1">
							{dateRange === 'today' ? 'Today' : `Last ${dateRange}`}
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">{formatPrice(analytics.current.totalRevenue)}</div>
						<div className="text-sm text-gray-600">Revenue Generated</div>
						<div className="text-xs text-gray-500 mt-1">
							{dateRange === 'today' ? 'Today' : `Last ${dateRange}`}
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600">{analytics.current.uniqueCustomers}</div>
						<div className="text-sm text-gray-600">Customers Served</div>
						<div className="text-xs text-gray-500 mt-1">
							{dateRange === 'today' ? 'Today' : `Last ${dateRange}`}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SalesRepReports;