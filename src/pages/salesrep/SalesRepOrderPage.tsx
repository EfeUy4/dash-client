import { useState, useEffect, useMemo } from "react";
import {
	Search,
	Plus,
	Minus,
	Package,
	ShoppingCart,
	User,
	CreditCard,
	Check,
	X,
	RefreshCw,
	AlertTriangle,
	Trash2
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts } from "@/redux/thunks/products";
import { createOrder } from "@/redux/thunks/orders";
import { useToastUtils } from "@/services/toast";
import { Product } from "@/data/types";

interface CartItem {
	id: string;
	product: Product;
	quantity: number;
	size: string;
	color: string;
}

interface CustomerInfo {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

const SalesRepOrderPage = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	// Product search and filtering
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showProductModal, setShowProductModal] = useState(false);

	// Cart state
	const [cart, setCart] = useState<CartItem[]>([]);
	const [selectedSize, setSelectedSize] = useState("");
	const [selectedColor, setSelectedColor] = useState("");

	// Customer information
	const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		street: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Nigeria",
	});

	// Payment information
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [paymentNotes, setPaymentNotes] = useState("");

	// Order state
	const [isCreatingOrder, setIsCreatingOrder] = useState(false);
	const [orderCreated, setOrderCreated] = useState(false);

	const { showSuccessToast, showErrorToast } = useToastUtils();

	// Fetch products on mount
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Filtered products
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			if (!product.isActive || !product.inStock) return false;
			
			const matchesSearch = `${product.name || ""} ${product.sku || ""}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

			return matchesSearch && matchesCategory;
		});
	}, [products, searchTerm, categoryFilter]);

	// Categories from products
	const categories = useMemo(() => {
		return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
	}, [products]);

	// Calculate totals
	const { subtotal, shipping, tax, total } = useMemo(() => {
		const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
		const shipping = subtotal > 50000 ? 0 : 2500;
		const tax = subtotal * 0.075; // 7.5% VAT
		const total = subtotal + shipping + tax;
		
		return { subtotal, shipping, tax, total };
	}, [cart]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const handleAddToCart = (product: Product) => {
		if (product.sizes?.length && !selectedSize) {
			showErrorToast("Please select a size");
			return;
		}
		if (product.colors?.length && !selectedColor) {
			showErrorToast("Please select a color");
			return;
		}

		const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
		const existingItem = cart.find(item => item.id === cartItemId);

		if (existingItem) {
			setCart(cart.map(item => 
				item.id === cartItemId 
					? { ...item, quantity: item.quantity + 1 }
					: item
			));
		} else {
			setCart([...cart, {
				id: cartItemId,
				product,
				quantity: 1,
				size: selectedSize || "N/A",
				color: selectedColor || "N/A"
			}]);
		}

		setSelectedProduct(null);
		setShowProductModal(false);
		setSelectedSize("");
		setSelectedColor("");
		showSuccessToast(`${product.name} added to cart`);
	};

	const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
		if (newQuantity <= 0) {
			setCart(cart.filter(item => item.id !== itemId));
			return;
		}

		setCart(cart.map(item => 
			item.id === itemId 
				? { ...item, quantity: newQuantity }
				: item
		));
	};

	const handleRemoveFromCart = (itemId: string) => {
		setCart(cart.filter(item => item.id !== itemId));
	};

	const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
		setCustomerInfo(prev => ({ ...prev, [field]: value }));
	};

	const validateForm = () => {
		if (cart.length === 0) {
			showErrorToast("Please add items to cart");
			return false;
		}

		if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone || 
			!customerInfo.street || !customerInfo.city || !customerInfo.state || !customerInfo.zipCode) {
			showErrorToast("Please fill in all required customer information");
			return false;
		}

		return true;
	};

	const handleCreateOrder = async () => {
		if (!validateForm()) return;

		setIsCreatingOrder(true);

		try {
			const orderData = {
				items: cart.map(item => ({
					productId: item.product.id,
					quantity: item.quantity,
					size: item.size,
					color: item.color
				})),
				shippingAddress: customerInfo,
				paymentMethod,
				paymentDetails: {
					method: paymentMethod,
					notes: paymentNotes,
					processedBy: "sales_rep", // Identify this as a sales rep order
					processedAt: new Date().toISOString()
				}
			};

			await dispatch(createOrder(orderData)).unwrap();
			
			// Reset form
			setCart([]);
			setCustomerInfo({
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "Nigeria",
			});
			setPaymentNotes("");
			setOrderCreated(true);
			
			showSuccessToast("Order created successfully!");
			
			// Reset success state after 3 seconds
			setTimeout(() => setOrderCreated(false), 3000);

		} catch (error: any) {
			showErrorToast(error.message || "Failed to create order");
		} finally {
			setIsCreatingOrder(false);
		}
	};

	const handleRefresh = () => {
		dispatch(fetchProducts());
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
						<p className="text-gray-600">Create orders for in-store customers</p>
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading products...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
					<p className="text-gray-600">Create orders for in-store customers</p>
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
				</div>
			</div>

			{/* Success Banner */}
			{orderCreated && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<div className="flex items-center">
						<Check className="w-5 h-5 text-green-600 mr-3" />
						<div className="text-sm text-green-700">
							<p><strong>Order Created Successfully!</strong> The order has been processed and confirmed.</p>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Products Section */}
				<div className="lg:col-span-2 space-y-6">
					{/* Product Search */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Select Products</h2>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="text"
									placeholder="Search products..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="all">All Categories</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						{/* Products Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
							{filteredProducts.map((product) => (
								<div
									key={product.id}
									className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
									onClick={() => {
										setSelectedProduct(product);
										setShowProductModal(true);
									}}
								>
									<div className="flex items-center space-x-3">
										<div className="flex-shrink-0">
											{product.images[0] ? (
												<img
													src={product.images[0]}
													alt={product.name}
													className="w-12 h-12 rounded-lg object-cover"
												/>
											) : (
												<div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
													<Package className="w-6 h-6 text-gray-400" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
											<p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
											<p className="text-xs text-gray-400">Stock: {product.stockCount}</p>
										</div>
									</div>
								</div>
							))}
						</div>

						{filteredProducts.length === 0 && (
							<div className="text-center py-8">
								<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-500">No products found matching your criteria.</p>
							</div>
						)}
					</div>

					{/* Customer Information */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<User className="w-5 h-5 mr-2" />
							Customer Information
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									First Name *
								</label>
								<input
									type="text"
									value={customerInfo.firstName}
									onChange={(e) => handleCustomerInfoChange("firstName", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Name *
								</label>
								<input
									type="text"
									value={customerInfo.lastName}
									onChange={(e) => handleCustomerInfoChange("lastName", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									value={customerInfo.email}
									onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number *
								</label>
								<input
									type="tel"
									value={customerInfo.phone}
									onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Street Address *
								</label>
								<input
									type="text"
									value={customerInfo.street}
									onChange={(e) => handleCustomerInfoChange("street", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									City *
								</label>
								<input
									type="text"
									value={customerInfo.city}
									onChange={(e) => handleCustomerInfoChange("city", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									State *
								</label>
								<input
									type="text"
									value={customerInfo.state}
									onChange={(e) => handleCustomerInfoChange("state", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									ZIP Code *
								</label>
								<input
									type="text"
									value={customerInfo.zipCode}
									onChange={(e) => handleCustomerInfoChange("zipCode", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Country
								</label>
								<input
									type="text"
									value={customerInfo.country}
									onChange={(e) => handleCustomerInfoChange("country", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
									disabled
								/>
							</div>
						</div>
					</div>

					{/* Payment Information */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<CreditCard className="w-5 h-5 mr-2" />
							Payment Information
						</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Payment Method *
								</label>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{[
										{ value: "cash", label: "Cash" },
										{ value: "bank_transfer", label: "Bank Transfer" },
										{ value: "card_terminal", label: "Card (Terminal)" }
									].map((method) => (
										<label
											key={method.value}
											className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
												paymentMethod === method.value
													? "border-green-500 bg-green-50"
													: "border-gray-300 hover:border-gray-400"
											}`}
										>
											<input
												type="radio"
												value={method.value}
												checked={paymentMethod === method.value}
												onChange={(e) => setPaymentMethod(e.target.value)}
												className="sr-only"
											/>
											<div className={`w-4 h-4 rounded-full border-2 mr-3 ${
												paymentMethod === method.value
													? "border-green-500 bg-green-500"
													: "border-gray-300"
											}`}>
												{paymentMethod === method.value && (
													<div className="w-full h-full rounded-full bg-white scale-50"></div>
												)}
											</div>
											<span className="text-sm font-medium">{method.label}</span>
										</label>
									))}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Payment Notes
								</label>
								<textarea
									value={paymentNotes}
									onChange={(e) => setPaymentNotes(e.target.value)}
									placeholder="Any additional payment information..."
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Cart and Order Summary */}
				<div className="lg:col-span-1">
					<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							<ShoppingCart className="w-5 h-5 mr-2" />
							Cart ({cart.length})
						</h2>

						{/* Cart Items */}
						<div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
							{cart.map((item) => (
								<div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
									<div className="flex-shrink-0">
										{item.product.images[0] ? (
											<img
												src={item.product.images[0]}
												alt={item.product.name}
												className="w-10 h-10 rounded-lg object-cover"
											/>
										) : (
											<div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
												<Package className="w-4 h-4 text-gray-400" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
										<p className="text-xs text-gray-500">{item.size} • {item.color}</p>
										<p className="text-sm text-gray-600">{formatPrice(item.product.price)}</p>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
											className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
										>
											<Minus className="w-3 h-3" />
										</button>
										<span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
										<button
											onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
											className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
										>
											<Plus className="w-3 h-3" />
										</button>
									</div>
									<button
										onClick={() => handleRemoveFromCart(item.id)}
										className="text-red-500 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>

						{cart.length === 0 && (
							<div className="text-center py-8">
								<ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
								<p className="text-gray-500 text-sm">Cart is empty</p>
							</div>
						)}

						{/* Order Summary */}
						{cart.length > 0 && (
							<>
								<div className="border-t border-gray-200 pt-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span>Subtotal:</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Shipping:</span>
										<span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Tax (7.5%):</span>
										<span>{formatPrice(tax)}</span>
									</div>
									<div className="border-t border-gray-200 pt-2">
										<div className="flex justify-between font-semibold">
											<span>Total:</span>
											<span>{formatPrice(total)}</span>
										</div>
									</div>
								</div>

								<button
									onClick={handleCreateOrder}
									disabled={isCreatingOrder || cart.length === 0}
									className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
								>
									{isCreatingOrder ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Creating Order...
										</>
									) : (
										<>
											<Check className="w-4 h-4 mr-2" />
											Create Order
										</>
									)}
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Product Selection Modal */}
			{showProductModal && selectedProduct && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-md w-full">
						<div className="p-6 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold text-gray-900">Add to Cart</h2>
								<button
									onClick={() => setShowProductModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
						</div>

						<div className="p-6 space-y-4">
							<div className="flex items-center space-x-4">
								{selectedProduct.images[0] ? (
									<img
										src={selectedProduct.images[0]}
										alt={selectedProduct.name}
										className="w-16 h-16 rounded-lg object-cover"
									/>
								) : (
									<div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
										<Package className="w-8 h-8 text-gray-400" />
									</div>
								)}
								<div>
									<h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
									<p className="text-lg font-semibold text-green-600">{formatPrice(selectedProduct.price)}</p>
									<p className="text-sm text-gray-500">Stock: {selectedProduct.stockCount}</p>
								</div>
							</div>

							{/* Size Selection */}
							{selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
									<div className="grid grid-cols-4 gap-2">
										{selectedProduct.sizes.map((size) => (
											<button
												key={size}
												onClick={() => setSelectedSize(size)}
												className={`p-2 text-sm border rounded-lg transition-colors ${
													selectedSize === size
														? "border-green-500 bg-green-50 text-green-700"
														: "border-gray-300 hover:border-gray-400"
												}`}
											>
												{size}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Color Selection */}
							{selectedProduct.colors && selectedProduct.colors.length > 0 && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
									<div className="grid grid-cols-3 gap-2">
										{selectedProduct.colors.map((color) => (
											<button
												key={color}
												onClick={() => setSelectedColor(color)}
												className={`p-2 text-sm border rounded-lg transition-colors ${
													selectedColor === color
														? "border-green-500 bg-green-50 text-green-700"
														: "border-gray-300 hover:border-gray-400"
												}`}
											>
												{color}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Product Description */}
							{selectedProduct.description && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
									<p className="text-sm text-gray-600">{selectedProduct.description}</p>
								</div>
							)}
						</div>

						<div className="p-6 border-t border-gray-200">
							<div className="flex space-x-3">
								<button
									onClick={() => setShowProductModal(false)}
									className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={() => handleAddToCart(selectedProduct)}
									className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
								>
									Add to Cart
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SalesRepOrderPage;