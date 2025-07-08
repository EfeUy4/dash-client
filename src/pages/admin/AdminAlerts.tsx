import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Package, RefreshCw, Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts } from "@/redux/thunks/products";

const AdminAlerts = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	const [thresholdFilter, setThresholdFilter] = useState<number>(10);
	const [categoryFilter, setCategoryFilter] = useState<string>("all");


	// Fetch products on mount if not already fetched
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Calculate low stock products with memoization
	const lowStockProducts = useMemo(() => {
		return products.filter((product) => product.stockCount <= thresholdFilter && product.isActive);
	}, [products, thresholdFilter]);

	// Filter products by category
	const filteredProducts = useMemo(() => {
		return lowStockProducts.filter(
			(product) => categoryFilter === "all" || product.category === categoryFilter,
		);
	}, [lowStockProducts, categoryFilter]);

	// Get unique categories from low stock products
	const categories = useMemo(() => {
		return Array.from(new Set(lowStockProducts.map((p) => p.category))).filter(Boolean);
	}, [lowStockProducts]);

	// Calculate alert statistics
	const alertStats = useMemo(() => {
		return {
			outOfStock: filteredProducts.filter((p) => p.stockCount === 0).length,
			criticalLow: filteredProducts.filter((p) => p.stockCount > 0 && p.stockCount <= 5).length,
			lowStock: filteredProducts.filter((p) => p.stockCount > 5 && p.stockCount <= thresholdFilter).length,
			total: filteredProducts.length,
		};
	}, [filteredProducts, thresholdFilter]);

	const handleRefresh = () => {
		dispatch(fetchProducts());
	};

	const getAlertLevel = (stock: number) => {
		if (stock === 0) return { level: "critical", class: "bg-red-50 border-red-200", icon: "text-red-600" };
		if (stock <= 5)
			return { level: "high", class: "bg-purple-50 border-purple-200", icon: "text-purple-600" };
		return { level: "medium", class: "bg-yellow-50 border-yellow-200", icon: "text-yellow-600" };
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(price);
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 flex items-center">
							<AlertTriangle className="w-7 h-7 text-purple-600 mr-2" />
							Low Stock Alerts
						</h1>
						<p className="text-gray-600">Monitor and manage products with low inventory levels</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Alert Data</h3>
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading alerts...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 flex items-center">
						<AlertTriangle className="w-7 h-7 text-purple-600 mr-2" />
						Low Stock Alerts
					</h1>
					<p className="text-gray-600">Monitor and manage products with low inventory levels</p>
				</div>
				<button
					onClick={handleRefresh}
					disabled={isLoading}
					className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
				>
					<RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
					<span>{isLoading ? "Refreshing..." : "Refresh"}</span>
				</button>
			</div>

			{/* Alert Summary */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-red-50 border border-red-200 p-4 rounded-lg">
					<div className="flex items-center">
						<AlertTriangle className="w-8 h-8 text-red-600" />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-red-900">
								{isLoading ? "..." : alertStats.outOfStock}
							</h3>
							<p className="text-sm text-red-600">Out of Stock</p>
						</div>
					</div>
				</div>

				<div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
					<div className="flex items-center">
						<AlertTriangle className="w-8 h-8 text-purple-600" />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-purple-900">
								{isLoading ? "..." : alertStats.criticalLow}
							</h3>
							<p className="text-sm text-purple-600">Critical Low (≤5)</p>
						</div>
					</div>
				</div>

				<div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
					<div className="flex items-center">
						<AlertTriangle className="w-8 h-8 text-yellow-600" />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-yellow-900">
								{isLoading ? "..." : alertStats.lowStock}
							</h3>
							<p className="text-sm text-yellow-600">Low Stock</p>
						</div>
					</div>
				</div>

				<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
					<div className="flex items-center">
						<Package className="w-8 h-8 text-blue-600" />
						<div className="ml-3">
							<h3 className="text-lg font-semibold text-blue-900">{isLoading ? "..." : alertStats.total}</h3>
							<p className="text-sm text-blue-600">Total Items</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Stock Threshold</label>
						<select
							value={thresholdFilter}
							onChange={(e) => setThresholdFilter(Number(e.target.value))}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value={5}>5 or less</option>
							<option value={10}>10 or less</option>
							<option value={20}>20 or less</option>
							<option value={50}>50 or less</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value="all">All Categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-end">
						<div className="text-sm text-gray-600">
							<p>Showing {filteredProducts.length} products</p>
							<p className="text-xs">
								{lowStockProducts.length} total alerts from {products.length} products
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Action Items Banner */}
			{alertStats.total > 0 && (
				<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
					<div className="flex items-start">
						<AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
						<div>
							<h3 className="text-sm font-medium text-amber-800">Attention Required</h3>
							<div className="mt-1 text-sm text-amber-700">
								{alertStats.outOfStock > 0 && (
									<p>• {alertStats.outOfStock} products are completely out of stock</p>
								)}
								{alertStats.criticalLow > 0 && (
									<p>• {alertStats.criticalLow} products have critically low stock (≤5 units)</p>
								)}
								{alertStats.lowStock > 0 && <p>• {alertStats.lowStock} products need restocking soon</p>}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Products Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
							<div className="flex items-center mb-3">
								<div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
								<div className="w-20 h-4 bg-gray-300 rounded"></div>
							</div>
							<div className="flex items-center mb-3">
								<div className="w-12 h-12 bg-gray-300 rounded-lg mr-3"></div>
								<div className="flex-1">
									<div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
									<div className="w-1/2 h-3 bg-gray-300 rounded"></div>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex justify-between">
									<div className="w-20 h-3 bg-gray-300 rounded"></div>
									<div className="w-8 h-3 bg-gray-300 rounded"></div>
								</div>
								<div className="flex justify-between">
									<div className="w-16 h-3 bg-gray-300 rounded"></div>
									<div className="w-12 h-3 bg-gray-300 rounded"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : filteredProducts.length === 0 ? (
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
					<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{lowStockProducts.length === 0 ? "No Low Stock Items" : "No Items in Selected Category"}
					</h3>
					<p className="text-gray-500">
						{lowStockProducts.length === 0
							? "All products are adequately stocked!"
							: "Try selecting a different category or adjusting the threshold."}
					</p>
					{lowStockProducts.length === 0 && (
						<div className="mt-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
							✓ Inventory levels are healthy across all {products.length} products
						</div>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredProducts.map((product) => {
						const alertLevel = getAlertLevel(product.stockCount);
						return (
							<div
								key={product.id}
								className={`bg-white rounded-lg shadow-sm border p-4 ${alertLevel.class} hover:shadow-md transition-shadow`}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center">
										<AlertTriangle className={`w-5 h-5 ${alertLevel.icon} mr-2`} />
										<span className={`text-xs font-medium uppercase tracking-wide ${alertLevel.icon}`}>
											{alertLevel.level} Priority
										</span>
									</div>
									<Bell className={`w-4 h-4 ${alertLevel.icon}`} />
								</div>

								<div className="flex items-center mb-3">
									<div className="flex-shrink-0 h-12 w-12 mr-3">
										{product.images && product.images[0] ? (
											<img
												className="h-12 w-12 rounded-lg object-cover"
												src={product.images[0]}
												alt={product.name}
											/>
										) : (
											<div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
												<Package className="h-6 w-6 text-gray-400" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-sm font-medium text-gray-900 truncate" title={product.name}>
											{product.name}
										</h3>
										<p className="text-xs text-gray-500">SKU: {product.sku}</p>
										<p className="text-xs text-gray-500">{product.category}</p>
										{product.subcategory && <p className="text-xs text-gray-400">{product.subcategory}</p>}
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Current Stock:</span>
										<span className={`text-lg font-bold ${alertLevel.icon}`}>
											{product.stockCount}
											{product.stockCount === 0 && <span className="text-xs ml-1 font-normal">(OUT)</span>}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Price:</span>
										<span className="text-sm font-medium">{formatPrice(product.price)}</span>
									</div>
									{product.originalPrice && product.originalPrice > product.price && (
										<div className="flex justify-between items-center">
											<span className="text-xs text-gray-500">Original:</span>
											<span className="text-xs text-gray-500 line-through">
												{formatPrice(product.originalPrice)}
											</span>
										</div>
									)}
								</div>

								{/* Quick Action Hint */}
								<div className="mt-3 pt-3 border-t border-gray-200">
									<p className="text-xs text-gray-500 text-center">
										{product.stockCount === 0
											? "⚠️ Immediate restocking required"
											: `📦 Consider restocking soon`}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default AdminAlerts;
