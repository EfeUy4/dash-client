// pages/storekeeper/StoreKeeperDashboard.tsx
import { useEffect, useMemo } from "react";
import { Package, AlertTriangle, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts } from "@/redux/thunks/products";

const StoreKeeperDashboard = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	// Fetch products on mount if not already fetched
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Calculate real stats from products
	const stats = useMemo(() => {
		const totalProducts = products.length;
		const lowStockThreshold = 10; // Define what constitutes "low stock"

		const lowStock = products.filter(
			(product) => product.stockCount > 0 && product.stockCount <= lowStockThreshold,
		).length;

		const outOfStock = products.filter((product) => product.stockCount === 0 || !product.inStock).length;

		const averageStock =
			products.length > 0
				? Math.round(products.reduce((sum, product) => sum + (product.stockCount || 0), 0) / products.length)
				: 0;

		return {
			totalProducts,
			lowStock,
			outOfStock,
			averageStock,
		};
	}, [products]);

	// Error handling
	if (error) {
		return (
			<div className="space-y-6 p-4 sm:p-6">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Overview</h1>
					<p className="text-gray-600 text-sm sm:text-base">Monitor and manage your inventory status</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 sm:p-8">
					<div className="text-center">
						<AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-base sm:text-lg font-semibold text-red-700 mb-2">
							Error Loading Inventory Data
						</h3>
						<p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
						<button
							onClick={() => dispatch(fetchProducts())}
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

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Overview</h1>
					<p className="text-gray-600 text-sm sm:text-base">Monitor and manage your inventory status</p>
				</div>

				{/* Refresh Button */}
				<button
					onClick={() => dispatch(fetchProducts())}
					disabled={isLoading}
					className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
					<span>{isLoading ? "Refreshing..." : "Refresh Data"}</span>
				</button>
			</div>

			{/* Stats Cards - Updated with Light Gradients */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
				{/* Total Products */}
				<div className="bg-gradient-to-br from-blue-50/50 to-blue-100/70 p-4 sm:p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-blue-400 rounded-lg shadow-sm">
							<Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">Total Products</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">
							{isLoading ? "..." : stats.totalProducts.toLocaleString()}
						</p>
						<p className="text-xs text-blue-600 mt-1">In inventory</p>
					</div>
				</div>

				{/* Low Stock Items */}
				<div className="bg-gradient-to-br from-yellow-50/50 to-yellow-100/70 p-4 sm:p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-yellow-400 rounded-lg shadow-sm">
							<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-yellow-700 mb-1">Low Stock Items</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">
							{isLoading ? "..." : stats.lowStock}
						</p>
						<p className="text-xs text-yellow-600 mt-1">≤ 10 items</p>
					</div>
				</div>

				{/* Out of Stock */}
				<div className="bg-gradient-to-br from-red-50/50 to-red-100/70 p-4 sm:p-6 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between mb-4">
						<div className="p-2 sm:p-3 bg-red-400 rounded-lg shadow-sm">
							<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						</div>
					</div>
					<div>
						<p className="text-xs sm:text-sm font-medium text-red-700 mb-1">Out of Stock</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900">
							{isLoading ? "..." : stats.outOfStock}
						</p>
						<p className="text-xs text-red-600 mt-1">Immediate attention needed</p>
					</div>
				</div>
			</div>

			{/* Low Stock Alerts */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="p-4 sm:p-6 border-b border-gray-200">
					<h2 className="text-base sm:text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
				</div>
				<div className="p-4 sm:p-6">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
							<span className="ml-2 text-gray-600">Loading alerts...</span>
						</div>
					) : (
						(() => {
							const lowStockProducts = products.filter((p) => p.stockCount > 0 && p.stockCount <= 10);
							const outOfStockProducts = products.filter((p) => p.stockCount === 0 || !p.inStock);

							const allAlerts = [
								...outOfStockProducts.map((product) => ({ ...product, alertType: "out-of-stock" })),
								...lowStockProducts.map((product) => ({ ...product, alertType: "low-stock" })),
							].slice(0, 8); // Limit to 8 items

							return allAlerts.length > 0 ? (
								<div className="space-y-4">
									{allAlerts.map((product: any) => (
										<div key={product.id} className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div
													className={`p-2 rounded-lg ${
														product.alertType === "out-of-stock" ? "bg-red-100" : "bg-yellow-100"
													}`}
												>
													<AlertTriangle
														className={`w-4 h-4 ${
															product.alertType === "out-of-stock" ? "text-red-600" : "text-yellow-600"
														}`}
													/>
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
													<p className="text-sm text-gray-600 truncate">{product.category}</p>
												</div>
											</div>
											<div className="text-right flex-shrink-0 ml-4">
												<p
													className={`text-sm font-medium ${
														product.alertType === "out-of-stock" ? "text-red-600" : "text-yellow-600"
													}`}
												>
													{product.stockCount} units
												</p>
												<p className="text-xs text-gray-500">
													{product.alertType === "out-of-stock" ? "Out of stock" : "Low stock"}
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Package className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-4" />
									<h3 className="text-sm font-medium text-gray-900 mb-1">All Stock Levels Good</h3>
									<p className="text-sm text-gray-600">No low stock or out of stock alerts</p>
								</div>
							);
						})()
					)}
				</div>
			</div>

			{/* Action Items */}
			{!isLoading && (stats.lowStock > 0 || stats.outOfStock > 0) && (
				<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
					<div className="flex items-start">
						<AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
						<div className="ml-3">
							<h3 className="text-sm font-medium text-amber-800">Action Required</h3>
							<div className="mt-2 text-sm text-amber-700">
								<ul className="list-disc list-inside space-y-1">
									{stats.outOfStock > 0 && <li>{stats.outOfStock} products are completely out of stock</li>}
									{stats.lowStock > 0 && <li>{stats.lowStock} products have low stock levels (≤10 units)</li>}
								</ul>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StoreKeeperDashboard;
