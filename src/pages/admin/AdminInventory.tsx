import { useState, useEffect, useMemo } from "react";
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Package,
	Eye,
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts, deleteProduct } from "@/redux/thunks/products";
import { useToastUtils } from "@/services/toast";
import ProductCreateModal from "@/components/products/ProductCreateModal";
import ProductEditModal from "@/components/products/ProductEditModal";
import ProductViewModal from "@/components/products/ProductViewModal";
import { Product } from "@/data/types";
import { addNewProduct, applyUpdatedProduct } from "@/redux/slices/productsSlice";

const AdminInventory = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [stockFilter, setStockFilter] = useState<string>("all");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const { showSuccessToast, showErrorToast } = useToastUtils();

	// Fetch products on mount if not already fetched
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, categoryFilter, statusFilter, stockFilter]);

	// Filtered products with memoization
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch = `${product.name || ""} ${product.sku || ""} ${product.description || ""}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

			const matchesStatus =
				statusFilter === "all" || (statusFilter === "active" ? product.isActive : !product.isActive);

			const matchesStock =
				stockFilter === "all" ||
				(stockFilter === "inStock" && product.inStock) ||
				(stockFilter === "lowStock" && product.stockCount > 0 && product.stockCount <= 10) ||
				(stockFilter === "outOfStock" && (!product.inStock || product.stockCount === 0));

			return matchesSearch && matchesCategory && matchesStatus && matchesStock;
		});
	}, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

	// Pagination calculations
	const totalItems = filteredProducts.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

	// Categories from products
	const categories = useMemo(() => {
		return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
	}, [products]);

	// Stats calculations
	const stats = useMemo(() => {
		return {
			total: products.filter((p) => p.isActive).length,
			inStock: products.filter((p) => p.inStock).length,
			lowStock: products.filter((p) => p.stockCount <= 10 && p.stockCount > 0).length,
			outOfStock: products.filter((p) => !p.inStock).length,
		};
	}, [products]);

	const handleEditProduct = (product: Product) => {
		setSelectedProduct(product);
		setShowEditModal(true);
	};

	const handleViewProduct = (product: Product) => {
		setSelectedProduct(product);
		setShowViewModal(true);
	};

	const handleDeleteProduct = async (productId: string, productName: string) => {
		if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
			return;
		}

		setDeleteLoading(productId);

		try {
			await dispatch(deleteProduct(productId)).unwrap();

			// Adjust current page if needed
			const remainingItems = totalItems - 1;
			const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
			if (currentPage > newTotalPages && newTotalPages > 0) {
				setCurrentPage(newTotalPages);
			}

			showSuccessToast(`"${productName}" has been deleted successfully`);
		} catch (error: any) {
			showErrorToast(error.message || "Failed to delete product");
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleRefresh = () => {
		dispatch(fetchProducts());
	};

	const getStockStatus = (product: Product) => {
		if (product.stockCount === 0) return { text: "Out of Stock", class: "bg-red-100 text-red-800" };
		if (product.stockCount <= 10) return { text: "Low Stock", class: "bg-yellow-100 text-yellow-800" };
		return { text: "In Stock", class: "bg-green-100 text-green-800" };
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(price);
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
						<h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
						<p className="text-gray-600">Manage products and stock levels</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Products</h3>
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
					<p className="text-gray-600">Loading products...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center flex-wrap gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
					<p className="text-gray-600">Manage products and stock levels</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
					>
						<Plus className="w-5 h-5" />
						<span>Add Product</span>
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 rounded-lg">
							<Package className="w-6 h-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.total}</h3>
							<p className="text-sm text-gray-600">Active Products</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 rounded-lg">
							<Package className="w-6 h-6 text-green-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.inStock}</h3>
							<p className="text-sm text-gray-600">In Stock</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-yellow-100 rounded-lg">
							<AlertTriangle className="w-6 h-6 text-yellow-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.lowStock}</h3>
							<p className="text-sm text-gray-600">Low Stock</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center">
						<div className="p-2 bg-red-100 rounded-lg">
							<Package className="w-6 h-6 text-red-600" />
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">{stats.outOfStock}</h3>
							<p className="text-sm text-gray-600">Out of Stock</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Search */}
					<div className="lg:col-span-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search products by name, SKU, or description..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Category Filter */}
					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="all">All Categories</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>

					{/* Stock Filter */}
					<select
						value={stockFilter}
						onChange={(e) => setStockFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="all">All Stock</option>
						<option value="inStock">In Stock</option>
						<option value="lowStock">Low Stock</option>
						<option value="outOfStock">Out of Stock</option>
					</select>
				</div>

				{/* Additional Filters Row */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>

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

					{/* Results info */}
					<div className="flex items-center text-sm text-gray-600">
						Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} products
					</div>
				</div>
			</div>

			{/* Products Table */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Product
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Category
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Price
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Stock
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedProducts.map((product) => {
								const stockStatus = getStockStatus(product);
								return (
									<tr key={product.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													{product.images[0] ? (
														<img
															className="h-10 w-10 rounded-lg object-cover"
															src={product.images[0]}
															alt={product.name}
														/>
													) : (
														<div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
															<Package className="h-5 w-5 text-gray-400" />
														</div>
													)}
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">{product.name}</div>
													<div className="text-sm text-gray-500">SKU: {product.sku}</div>
													{product.discountPercentage && product.discountPercentage > 0 && (
														<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
															{product.discountPercentage}% OFF
														</span>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{product.category}</div>
											<div className="text-sm text-gray-500">{product.subcategory}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
											{product.originalPrice && product.originalPrice > product.price && (
												<div className="text-sm text-gray-500 line-through">
													{formatPrice(product.originalPrice)}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<span className="text-sm text-gray-900 mr-2">{product.stockCount}</span>
												{product.stockCount <= 10 && product.stockCount > 0 && (
													<AlertTriangle className="h-4 w-4 text-yellow-500" />
												)}
											</div>
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}
											>
												{stockStatus.text}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
												}`}
											>
												{product.isActive ? "Active" : "Inactive"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center space-x-2">
												<button
													onClick={() => handleViewProduct(product)}
													className="text-blue-600 hover:text-blue-900 transition-colors"
													title="View Product"
												>
													<Eye className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleEditProduct(product)}
													className="text-purple-600 hover:text-purple-900 transition-colors"
													title="Edit Product"
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDeleteProduct(product.id, product.name)}
													disabled={deleteLoading === product.id}
													className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
													title="Delete Product"
												>
													{deleteLoading === product.id ? (
														<div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
													) : (
														<Trash2 className="w-4 h-4" />
													)}
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					{paginatedProducts.length === 0 && (
						<div className="text-center py-8">
							<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">
								{filteredProducts.length === 0
									? "No products found matching your criteria."
									: "No products to display on this page."}
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
			{showCreateModal && (
				<ProductCreateModal
					onClose={() => setShowCreateModal(false)}
					onSave={(newProduct: any) => {
						// Use Redux action to add new product
						dispatch(addNewProduct(newProduct));

						setShowCreateModal(false);
						// Go to first page to see the new product
						if (currentPage !== 1) {
							setCurrentPage(1);
						}
					}}
				/>
			)}

			{showEditModal && selectedProduct && (
				<ProductEditModal
					product={selectedProduct}
					onClose={() => {
						setShowEditModal(false);
						setSelectedProduct(null);
					}}
					onSave={(updatedProduct) => {
						dispatch(applyUpdatedProduct(updatedProduct));
						setShowEditModal(false);
						setSelectedProduct(null);
					}}
				/>
			)}

			{showViewModal && selectedProduct && (
				<ProductViewModal
					product={selectedProduct}
					onClose={() => {
						setShowViewModal(false);
						setSelectedProduct(null);
					}}
					onEdit={() => {
						setShowViewModal(false);
						setShowEditModal(true);
					}}
				/>
			)}
		</div>
	);
};

export default AdminInventory;
