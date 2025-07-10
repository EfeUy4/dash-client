import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Heart,
	Share2,
	Truck,
	Shield,
	RotateCcw,
	Star,
	ChevronLeft,
	ChevronRight,
	Minus,
	Plus,
	ShoppingBag,
	Loader2,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProducts,
	selectProductLoading,
	selectProductError,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { selectIsInWishlist } from "@/redux/selectors/wishlistSelectors";
import { fetchProducts } from "@/redux/thunks/products";
import { toggleWishlistAndSync } from "@/redux/thunks/wishlist";
import { useToastUtils } from "@/services/toast";

const ProductDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const { addItem } = useCart();
	const { user } = useAuth();
	const { showSuccessToast } = useToastUtils();

	// Redux selectors
	const products = useAppSelector(selectProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	// Find product from Redux store
	const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

	// Get wishlist status from Redux
	const isWishlisted = useAppSelector((state) => (product ? selectIsInWishlist(state, product.id) : false));

	// Related products from same category
	const relatedProducts = useMemo(() => {
		if (!product) return [];
		return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
	}, [products, product]);

	// Local state
	const [selectedImage, setSelectedImage] = useState(0);
	const [selectedSize, setSelectedSize] = useState("");
	const [selectedColor, setSelectedColor] = useState("");
	const [quantity, setQuantity] = useState(1);

	// Check if product has required options
	const hasRequiredSelections = () => {
		const needsSize = product?.sizes && product.sizes.length > 0;
		const needsColor = product?.colors && product.colors.length > 0;
		
		return (!needsSize || selectedSize) && (!needsColor || selectedColor);
	};

	// Fetch products if not already fetched
	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Set default selections when product loads
	useEffect(() => {
		if (product) {
			// Set default size if product has sizes
			if (product.sizes && product.sizes.length > 0) {
				setSelectedSize(product.sizes[0]);
			} else {
				setSelectedSize("default"); // Set default for products without sizes
			}
			
			// Set default color if product has colors
			if (product.colors && product.colors.length > 0) {
				setSelectedColor(product.colors[0]);
			} else {
				setSelectedColor("default"); // Set default for products without colors
			}
			
			setSelectedImage(0);
			setQuantity(1);
		}
	}, [product]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const handleAddToCart = () => {
		if (!product) return;

		// Simulate API delay
			addItem({
				productId: product.id,
				name: product.name,
				price: product.price,
				image: product.images[selectedImage] || product.images[0],
				size: selectedSize === "default" ? "N/A" : selectedSize,
				color: selectedColor === "default" ? "N/A" : selectedColor,
				maxStock: product.stockCount,
				quantity,
			});

			showSuccessToast(`${product.name} added to cart`);
	};

	const handleWishlist = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!product) return;
		
		if (!user) {
			dispatch(toggleWishlistAndSync(product.id));
		} else {
			dispatch(toggleWishlistAndSync(product.id, user));
		}

		// Show appropriate toast message
		if (isWishlisted) {
			showSuccessToast(`${product.name} removed from wishlist`);
		} else {
			showSuccessToast(`${product.name} added to wishlist`);
		}
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: product?.name,
					text: product?.description,
					url: window.location.href,
				});
			} catch (error) {
				console.log("Error sharing:", error);
			}
		} else {
			// Fallback: copy URL to clipboard
			navigator.clipboard.writeText(window.location.href);
			showSuccessToast("Link copied to clipboard");
		}
	};

	// Loading state
	if (isLoading || !hasBeenFetched) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-neutral-600 mx-auto mb-4" />
					<p className="text-neutral-600">Loading product...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-serif font-bold text-neutral-900 mb-4">Error Loading Products</h1>
					<p className="text-neutral-600 mb-6">{error}</p>
					<div className="space-x-4">
						<button
							onClick={() => dispatch(fetchProducts())}
							className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
						>
							Try Again
						</button>
						<Link
							to="/products"
							className="px-6 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300 transition-colors"
						>
							Back to Products
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Product not found
	if (!product) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-serif font-bold text-neutral-900 mb-4">Product Not Found</h1>
					<p className="text-neutral-600 mb-6">The product you're looking for doesn't exist.</p>
					<Link
						to="/products"
						className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
					>
						Back to Products
					</Link>
				</div>
			</div>
		);
	}

	// Use original images
	const displayImages = product.images;

	return (
		<div className="min-h-screen bg-white">
			{/* Breadcrumb */}
			<div className="container py-4">
				<nav className="flex items-center space-x-2 text-sm text-neutral-600">
					<Link to="/" className="hover:text-neutral-900 transition-colors">
						Home
					</Link>
					<span>/</span>
					<Link to="/products" className="hover:text-neutral-900 transition-colors">
						Products
					</Link>
					<span>/</span>
					<Link
						to={`/products?category=${encodeURIComponent(product.category)}`}
						className="hover:text-neutral-900 transition-colors"
					>
						{product.category}
					</Link>
					<span>/</span>
					<span className="text-neutral-900">{product.name}</span>
				</nav>
			</div>

			<div className="container pb-16">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Product Images */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
					>
						{/* Main Image */}
						<div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-neutral-100">
							<img
								src={displayImages[selectedImage]}
								alt={product.name}
								className="w-full h-full object-cover"
							/>

							{/* Image Navigation */}
							{displayImages.length > 1 && (
								<>
									<button
										onClick={() =>
											setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
										}
										className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors"
									>
										<ChevronLeft className="w-5 h-5" />
									</button>
									<button
										onClick={() =>
											setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
										}
										className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors"
									>
										<ChevronRight className="w-5 h-5" />
									</button>
								</>
							)}

							{/* Badges */}
							<div className="absolute top-4 left-4 flex flex-col gap-2">
								{product.isNewProduct && (
									<span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
										New
									</span>
								)}
								{product.originalPrice && (
									<span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
										Sale
									</span>
								)}
							</div>
						</div>

						{/* Thumbnail Images */}
						{displayImages.length > 1 && (
							<div className="grid grid-cols-4 gap-2">
								{displayImages.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
											selectedImage === index
												? "border-neutral-900"
												: "border-neutral-200 hover:border-neutral-300"
										}`}
									>
										<img
											src={image}
											alt={`${product.name} ${index + 1}`}
											className="w-full h-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</motion.div>

					{/* Product Info */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="space-y-6"
					>
						{/* Header */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-primary-600 font-medium">{product.category}</span>
								<div className="flex items-center space-x-2">
									<motion.button
										onClick={handleWishlist}
										className={`p-2 rounded-full transition-colors ${
											isWishlisted
												? "bg-red-100 text-red-600"
												: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
										}`}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
									</motion.button>
									<motion.button
										onClick={handleShare}
										className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-full transition-colors"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Share2 className="w-5 h-5" />
									</motion.button>
								</div>
							</div>

							<h1 className="text-3xl font-serif font-bold text-neutral-900 mb-2">{product.name}</h1>

							<div className="flex items-center space-x-4 mb-4">
								<div className="flex items-center">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star
											key={i}
											className={`w-4 h-4 ${
												i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-neutral-300"
											}`}
										/>
									))}
									<span className="ml-2 text-sm text-neutral-600">
										{product.rating} ({product.reviewCount} reviews)
									</span>
								</div>
							</div>

							<div className="flex items-center space-x-3">
								<span className="text-2xl font-bold text-neutral-900">{formatPrice(product.price)}</span>
								{product.originalPrice && (
									<span className="text-lg text-neutral-500 line-through">
										{formatPrice(product.originalPrice)}
									</span>
								)}
								{product.originalPrice && (
									<span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
										Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
									</span>
								)}
							</div>
						</div>

						{/* Description */}
						<div className="prose prose-neutral max-w-none">
							<p className="text-neutral-600 leading-relaxed">{product.description}</p>
						</div>

						{/* Features */}
						{product.features && product.features.length > 0 && (
							<div>
								<h3 className="font-medium text-neutral-900 mb-3">Key Features</h3>
								<ul className="space-y-1">
									{product.features.map((feature, index) => (
										<li key={index} className="text-sm text-neutral-600 flex items-center">
											<span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2" />
											{feature}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Size Selection */}
						{product.sizes && product.sizes.length > 0 && (
							<div>
								<h3 className="font-medium text-neutral-900 mb-3">Size</h3>
								<div className="flex flex-wrap gap-2">
									{product.sizes.map((size) => (
										<motion.button
											key={size}
											onClick={() => setSelectedSize(size)}
											className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
												selectedSize === size
													? "border-neutral-900 bg-neutral-900 text-white"
													: "border-neutral-300 hover:border-neutral-400"
											}`}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											{size}
										</motion.button>
									))}
								</div>
							</div>
						)}

						{/* Color Selection */}
						{product.colors && product.colors.length > 0 && (
							<div>
								<h3 className="font-medium text-neutral-900 mb-3">Color: {selectedColor}</h3>
								<div className="flex flex-wrap gap-2">
									{product.colors.map((color) => (
										<motion.button
											key={color}
											onClick={() => setSelectedColor(color)}
											className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
												selectedColor === color
													? "border-neutral-900 bg-neutral-900 text-white"
													: "border-neutral-300 hover:border-neutral-400"
											}`}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											{color}
										</motion.button>
									))}
								</div>
							</div>
						)}

						{/* Quantity */}
						<div>
							<h3 className="font-medium text-neutral-900 mb-3">Quantity</h3>
							<div className="flex items-center space-x-3">
								<div className="flex items-center border border-neutral-300 rounded-md">
									<button
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										className="p-2 hover:bg-neutral-50 transition-colors"
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="px-4 py-2 font-medium">{quantity}</span>
									<button
										onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
										className="p-2 hover:bg-neutral-50 transition-colors"
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>
								<span className="text-sm text-neutral-600">{product.stockCount} items available</span>
							</div>
						</div>

						{/* Add to Cart */}
						<div className="space-y-3">
							<Button
								onClick={handleAddToCart}
								disabled={!product.inStock || !hasRequiredSelections()}
								className="w-full"
								size="lg"
							>
								<ShoppingBag className="w-5 h-5 mr-2" />
								{!product.inStock ? "Out of Stock" : "Add to Cart"}
							</Button>

							{product.stockCount <= 5 && product.inStock && (
								<p className="text-sm text-orange-600 text-center">
									Only {product.stockCount} left in stock!
								</p>
							)}

							{!hasRequiredSelections() && (
								<p className="text-sm text-neutral-500 text-center">
									Please select{" "}
									{product.sizes && product.sizes.length > 0 && !selectedSize ? "size" : ""}
									{product.sizes && product.sizes.length > 0 && !selectedSize && 
									 product.colors && product.colors.length > 0 && !selectedColor ? " and " : ""}
									{product.colors && product.colors.length > 0 && !selectedColor ? "color" : ""}
									{" "}to add to cart
								</p>
							)}
						</div>

						{/* Features */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
							<div className="flex items-center space-x-3">
								<Truck className="w-5 h-5 text-neutral-400" />
								<div>
									<p className="text-sm font-medium text-neutral-900">Free Shipping</p>
									<p className="text-xs text-neutral-600">On orders over ₦50,000</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<RotateCcw className="w-5 h-5 text-neutral-400" />
								<div>
									<p className="text-sm font-medium text-neutral-900">Easy Returns</p>
									<p className="text-xs text-neutral-600">30-day return policy</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Shield className="w-5 h-5 text-neutral-400" />
								<div>
									<p className="text-sm font-medium text-neutral-900">Secure Payment</p>
									<p className="text-xs text-neutral-600">256-bit SSL encryption</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mt-20"
					>
						<h2 className="text-2xl font-serif font-bold text-neutral-900 mb-8">You Might Also Like</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{relatedProducts.map((relatedProduct) => (
								<Link key={relatedProduct.id} to={`/products/${relatedProduct.id}`} className="group">
									<div className="aspect-square mb-3 overflow-hidden rounded-lg bg-neutral-100">
										<img
											src={relatedProduct.images[0]}
											alt={relatedProduct.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									</div>
									<h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
										{relatedProduct.name}
									</h3>
									<p className="text-neutral-600 font-medium">{formatPrice(relatedProduct.price)}</p>
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default ProductDetailPage;