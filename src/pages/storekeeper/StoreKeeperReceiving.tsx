import { useState, useEffect, useMemo } from "react";
import { Package, Search, CheckCircle, Truck, AlertTriangle, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProducts,
	selectProductLoading,
	selectProductError,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts } from "@/redux/thunks/products";
import { useToastUtils } from "@/services/toast";
import api from "@/utils/api";

interface Product {
	id: string;
	name: string;
	stockCount: number;
	price: number;
	category: string;
	isActive: boolean;
	images: string[];
}

interface ReceivingRecord {
	id: string;
	product: {
		id: string;
		name: string;
		category: string;
	};
	quantity: number;
	note?: string;
	receivedBy: {
		id: string;
		firstName: string;
		lastName: string;
	};
	receivedAt: string;
}

const StoreKeeperReceiving = () => {
	const dispatch = useAppDispatch();
	const { showSuccessToast, showErrorToast } = useToastUtils();

	// Redux selectors
	const products = useAppSelector(selectProducts);
	const productsLoading = useAppSelector(selectProductLoading);
	const productsError = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	// Local state
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [quantity, setQuantity] = useState("");
	const [note, setNote] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [recentReceiving, setRecentReceiving] = useState<ReceivingRecord[]>([]);
	const [isLoadingRecent, setIsLoadingRecent] = useState(false);

	// Fetch products on mount
	useEffect(() => {
		if (!hasBeenFetched && !productsLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, productsLoading]);

	// Fetch recent receiving records
	const fetchRecentReceiving = async () => {
		try {
			setIsLoadingRecent(true);
			const response = await api.get("/products/receiving/recent");
			setRecentReceiving(response.data.receiving || []);
		} catch (error: any) {
			console.error("Error fetching recent receiving:", error);
		} finally {
			setIsLoadingRecent(false);
		}
	};

	useEffect(() => {
		fetchRecentReceiving();
	}, []);

	// Filter products based on search
	const filteredProducts = useMemo(() => {
		if (!searchTerm) return [];
		
		return products
			.filter(product => 
				product.isActive &&
				(product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				 product.category.toLowerCase().includes(searchTerm.toLowerCase()))
			)
			.slice(0, 10); // Limit results for performance
	}, [products, searchTerm]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
			showErrorToast("Please select a product and enter a valid quantity");
			return;
		}

		try {
			setIsSubmitting(true);
			
			const response = await api.post("/products/receiving", {
				productId: selectedProduct.id,
				quantity: parseInt(quantity),
				note: note.trim() || undefined,
			});

			if (response.data.success) {
				showSuccessToast(`Successfully received ${quantity} units of ${selectedProduct.name}`);
				
				// Reset form
				setSelectedProduct(null);
				setQuantity("");
				setNote("");
				setSearchTerm("");
				
				// Refresh data
				dispatch(fetchProducts());
				fetchRecentReceiving();
			}
		} catch (error: any) {
			console.error("Error recording receiving:", error);
			showErrorToast(error.response?.data?.message || "Failed to record receiving");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays}d ago`;
	};

	// Loading state
	if (productsLoading && !hasBeenFetched) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading products...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (productsError) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-900 flex items-center">
						<Truck className="w-7 h-7 text-orange-600 mr-2" />
						Receiving
					</h1>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Products</h3>
						<p className="text-red-600 mb-4">{productsError}</p>
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
		<div className="space-y-6 p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
						<Truck className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 mr-2" />
						Receiving
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">Record new stock received</p>
				</div>
				<button
					onClick={fetchRecentReceiving}
					disabled={isLoadingRecent}
					className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
				>
					<RefreshCw className={`w-4 h-4 ${isLoadingRecent ? "animate-spin" : ""}`} />
					<span>Refresh</span>
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Receiving Form */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex items-center mb-6">
						<div className="p-2 bg-orange-100 rounded-lg">
							<Package className="w-6 h-6 text-orange-600" />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 ml-3">Record New Receiving</h2>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Product Search */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Search Product
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<input
									type="text"
									placeholder="Search by product name or category..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								/>
							</div>

							{/* Search Results */}
							{searchTerm && (
								<div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
									{filteredProducts.length > 0 ? (
										filteredProducts.map((product) => (
											<div
												key={product.id}
												onClick={() => {
													setSelectedProduct(product);
													setSearchTerm(product.name);
												}}
												className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
											>
												<div className="flex justify-between items-center">
													<div>
														<p className="font-medium text-gray-900">{product.name}</p>
														<p className="text-sm text-gray-500">{product.category}</p>
													</div>
													<div className="text-right">
														<p className="text-sm font-medium">Stock: {product.stockCount}</p>
														<p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
													</div>
												</div>
											</div>
										))
									) : (
										<div className="p-3 text-center text-gray-500">
											No products found
										</div>
									)}
								</div>
							)}
						</div>

						{/* Selected Product Display */}
						{selectedProduct && (
							<div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-gray-900">{selectedProduct.name}</p>
										<p className="text-sm text-gray-600">{selectedProduct.category}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium">Current Stock: {selectedProduct.stockCount}</p>
										<p className="text-sm text-gray-600">{formatPrice(selectedProduct.price)}</p>
									</div>
								</div>
							</div>
						)}

						{/* Quantity */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Quantity Received
							</label>
							<input
								type="number"
								min="1"
								placeholder="Enter quantity"
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								required
							/>
						</div>

						{/* Note */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Note (Optional)
							</label>
							<textarea
								placeholder="Add any notes about this receiving..."
								value={note}
								onChange={(e) => setNote(e.target.value)}
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							/>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={!selectedProduct || !quantity || isSubmitting}
							className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>Recording...</span>
								</>
							) : (
								<>
									<CheckCircle className="w-5 h-5" />
									<span>Record Receiving</span>
								</>
							)}
						</button>
					</form>
				</div>

				{/* Recent Receiving */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-lg font-semibold text-gray-900">Recent Receiving</h2>
						<span className="text-sm text-gray-500">{recentReceiving.length} records</span>
					</div>

					<div className="space-y-4 max-h-96 overflow-y-auto">
						{isLoadingRecent ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
								<p className="text-sm text-gray-600">Loading recent records...</p>
							</div>
						) : recentReceiving.length > 0 ? (
							recentReceiving.map((record) => (
								<div
									key={record.id}
									className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
								>
									<div className="flex justify-between items-start mb-2">
										<div>
											<p className="font-medium text-gray-900">{record.product.name}</p>
											<p className="text-sm text-gray-600">{record.product.category}</p>
										</div>
										<div className="text-right">
											<p className="font-semibold text-orange-600">+{record.quantity}</p>
											<p className="text-xs text-gray-500">{getTimeAgo(record.receivedAt)}</p>
										</div>
									</div>
									
									{record.note && (
										<p className="text-sm text-gray-600 mb-2 italic">"{record.note}"</p>
									)}
									
									<div className="flex justify-between items-center text-xs text-gray-500">
										<span>
											by {record.receivedBy.firstName} {record.receivedBy.lastName}
										</span>
										<span>
											{new Date(record.receivedAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12">
								<Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
								<h3 className="text-sm font-medium text-gray-900 mb-1">No Recent Receiving</h3>
								<p className="text-sm text-gray-600">
									Recent receiving records will appear here
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default StoreKeeperReceiving;