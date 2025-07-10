import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsInWishlist } from "@/redux/selectors/wishlistSelectors";
import { Product } from "@/data/types";
import { useToastUtils } from "@/services/toast";
import { useAuth } from "@/contexts/AuthContext";
import { toggleWishlistAndSync } from "@/redux/thunks/wishlist";

interface ProductCardProps {
	product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
	const dispatch = useAppDispatch();
	const [isHovered, setIsHovered] = useState(false);
	const { addItem } = useCart();
	const { showSuccessToast } = useToastUtils();
	const { user } = useAuth();

	// Get wishlist status from Redux
	const isWishlisted = useAppSelector((state) => selectIsInWishlist(state, product.id));

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	// Calculate discount percentage
	const getDiscountPercentage = () => {
		if (!product.originalPrice) return null;
		const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
		return Math.round(discount);
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		addItem({
			productId: product.id,
			name: product.name,
			price: product.price,
			image: product.images[0],
			size: product.sizes[0] || "N/A",
			color: product.colors[0] || "N/A",
      maxStock: product.stockCount,
      quantity: 1,
    });
    
    showSuccessToast(`${product.name} added to cart`);
	};

	const handleWishlist = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

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

	const discountPercentage = getDiscountPercentage();

	return (
		<motion.div
			className="group cursor-pointer"
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			whileHover={{ y: -8 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
		>
			<Link to={`/products/${product.id}`} className="block">
				<div className="relative rounded-md bg-gradient-to-br from-white/70 via-white/50 to-neutral-50 shadow overflow-hidden hover:shadow-lg transition-all duration-300">
					{/* Image Container */}
					<div className="relative aspect-[5/6] sm:aspect-[5/5] overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
						<img
							src={product.images[0]}
							alt={product.name}
							className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>

						{/* Creative Tags */}
						<div className="absolute top-3 left-3 flex flex-col gap-2">
							{product.isNewProduct && (
								<motion.div
									initial={{ scale: 0, opacity: 0, rotate: -10 }}
									animate={{ scale: 1, opacity: 1, rotate: 0 }}
									transition={{ type: "spring", stiffness: 200, damping: 10 }}
									className="relative"
								>
									<div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] px-2 py-[2px] rounded-lg font-bold shadow flex items-center gap-1.5 backdrop-blur-sm">
										<Sparkles className="w-2 h-2" />
										<span>NEW</span>
									</div>
									{/* Glow effect */}
									<div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg blur-sm opacity-30 -z-10" />
								</motion.div>
							)}
							{product.originalPrice && (
								<motion.div
									initial={{ scale: 0, opacity: 0, rotate: 10 }}
									animate={{ scale: 1, opacity: 1, rotate: 0 }}
									transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
									className="relative"
								>
									<div className="bg-gradient-to-r from-red-500/70 to-pink-500/70 text-white text-[10px] px-2 py-[2px] rounded-lg font-bold shadow flex items-center gap-1.5 backdrop-blur-sm">
										<Zap className="w-2 h-2" />
										<span>SALE</span>
									</div>
									{/* Glow effect */}
									<div className="absolute inset-0 bg-gradient-to-r from-red-500/70 to-pink-500/70 rounded-lg blur-sm opacity-30 -z-10" />
									{/* Pulsing animation for sale */}
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-red-500/70 to-pink-500/70 rounded-lg opacity-20"
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
									/>
								</motion.div>
							)}
						</div>

						{/* Out of Stock Overlay */}
						{!product.inStock && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<span className="bg-white/90 backdrop-blur-sm text-neutral-900 px-3 py-1 rounded-full text-sm font-medium">
									Out of Stock
								</span>
							</div>
						)}

						{/* Wishlist Button - Always Visible on Mobile, Hover on Desktop */}
						<div className="absolute top-3 right-3">
							<motion.button
								onClick={handleWishlist}
								className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 ${
									isWishlisted
										? "bg-red-500/90 text-white border-red-500/30"
										: "bg-white/80 text-neutral-600 hover:bg-white/90 hover:text-red-500"
								}`}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
							</motion.button>
						</div>

						{/* Mobile Add to Cart Button - Always Visible */}
						<div className="absolute bottom-3 left-3 right-3 sm:hidden">
							<motion.button
								onClick={handleAddToCart}
								className="w-full bg-neutral-900/90 backdrop-blur-md text-white py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-white/10 shadow-lg hover:bg-neutral-800/90 transition-all duration-300"
								whileTap={{ scale: 0.98 }}
							>
								<ShoppingBag className="w-4 h-4" />
								Add to Cart
							</motion.button>
						</div>

						{/* Desktop Add to Cart Button - Hover Only */}
						<motion.div
							className="absolute bottom-3 left-3 right-3 hidden sm:block"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
						>
							<motion.button
								onClick={handleAddToCart}
								className="w-full bg-neutral-900/90 backdrop-blur-md text-white py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-white/10 shadow-lg hover:bg-neutral-800/90 transition-all duration-300"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<ShoppingBag className="w-4 h-4" />
								Add to Cart
							</motion.button>
						</motion.div>
					</div>

					{/* Product Info - Glassmorphism Panel */}
					<div className="p-3 bg-gradient-to-r from-white/50 via-white/40 to-white/30 backdrop-blur-md border-t border-white/30">
						{/* Product Name */}
						<h3 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-1 truncate">
							{product.name}
						</h3>

						{/* Rating, Discount & Price - Responsive Layout */}
						<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
							{/* Left side: Rating and Discount */}
							<div className="flex items-center gap-2 text-xs flex-wrap">
								{/* Single Star + Rating */}
								<div className="flex items-center gap-1 flex-shrink-0">
									<Star className="w-3 h-3 text-amber-400 fill-current drop-shadow-sm" />
									<span className="text-neutral-700 font-medium">{product.rating}</span>
								</div>

								{/* Discount Percentage */}
								{discountPercentage && (
									<span className="bg-gradient-to-r from-green-100/90 to-emerald-100/90 backdrop-blur-sm text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200/50 flex-shrink-0">
										-{discountPercentage}%
									</span>
								)}

								{/* Low Stock Indicator */}
								{product.stockCount <= 5 && (
									<motion.span
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										className="bg-gradient-to-r from-orange-100/90 to-red-100/90 backdrop-blur-sm text-orange-700 px-2 py-0.5 rounded-full font-medium border border-orange-200/50 flex-shrink-0"
									>
										{product.stockCount} left
									</motion.span>
								)}
							</div>

							{/* Right side: Price */}
							<div className="flex items-center flex-shrink-0">
								<span className="font-bold text-neutral-900 text-sm bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text">
									{formatPrice(product.price)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</motion.div>
	);
};

export default ProductCard;
