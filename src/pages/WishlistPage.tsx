import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Heart,
	Share2,
	Grid,
	List,
	Filter,
	ChevronDown,
	X,
	Mail,
	Copy,
	Check,
	Trash2,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectWishlistProducts } from "@/redux/selectors/wishlistSelectors";
import { resetWishlist } from "@/redux/slices/wishlistSlice";
import ProductGrid from "../components/products/ProductGrid";
import { Product } from "@/data/types";
import { useToastUtils } from "@/services/toast";
import { Link } from "react-router-dom";

interface WishlistItem extends Product {
	addedDate: string;
	priceDropped: boolean;
}

const ShareModal = ({
	isOpen,
	onClose,
	wishlistCount,
}: {
	isOpen: boolean;
	onClose: () => void;
	wishlistCount: number;
}) => {
	const [copied, setCopied] = useState(false);

	const shareUrl = "https://dashng.com/products";

	const handleCopyLink = () => {
		navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className="bg-white rounded-lg p-6 w-full max-w-md"
			>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-serif font-semibold">Share Your Wishlist</h3>
					<button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
						<X className="w-5 h-5" />
					</button>
				</div>

				<p className="text-neutral-600 mb-6">
					Share your wishlist of {wishlistCount} items with friends and family.
				</p>

				<div className="space-y-4">
					<div className="flex space-x-3">
						<input
							type="text"
							value={shareUrl}
							readOnly
							className="flex-1 px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-sm"
						/>
						<button
							onClick={handleCopyLink}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								copied ? "bg-green-600 text-white" : "bg-neutral-900 text-white hover:bg-neutral-800"
							}`}
						>
							{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
						</button>
					</div>

					<div className="flex space-x-3">
						<button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors">
							<Mail className="w-4 h-4" />
							<span>Email</span>
						</button>
						<button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors">
							<Share2 className="w-4 h-4" />
							<span>More</span>
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

const WishlistPage = () => {
	const dispatch = useAppDispatch();
	const wishlistProducts = useAppSelector(selectWishlistProducts);
	const { showSuccessToast } = useToastUtils();

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [sortBy, setSortBy] = useState("newest");
	const [filterBy, setFilterBy] = useState("all");
	const [shareModalOpen, setShareModalOpen] = useState(false);

	// Convert wishlist products to wishlist items with additional metadata
	const wishlistItems: WishlistItem[] = useMemo(() => {
		return wishlistProducts.map((product, index) => ({
			...product,
			addedDate: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			priceDropped: !!product.originalPrice && product.originalPrice > product.price,
		}));
	}, [wishlistProducts]);

	// Internal filtering and sorting
	const filteredAndSortedItems = useMemo(() => {
		let filtered = [...wishlistItems];

		// Filter
		switch (filterBy) {
			case "inStock":
				filtered = filtered.filter((item) => item.inStock);
				break;
			case "outOfStock":
				filtered = filtered.filter((item) => !item.inStock);
				break;
			case "priceDrops":
				filtered = filtered.filter((item) => item.priceDropped);
				break;
			default:
				// all items
				break;
		}

		// Sort
		switch (sortBy) {
			case "price-low":
				filtered.sort((a, b) => a.price - b.price);
				break;
			case "price-high":
				filtered.sort((a, b) => b.price - a.price);
				break;
			case "oldest":
				filtered.sort((a, b) => new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime());
				break;
			case "newest":
			default:
				filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
				break;
		}

		return filtered;
	}, [wishlistItems, sortBy, filterBy]);

	const handleResetWishlist = () => {
		if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
			dispatch(resetWishlist());
			showSuccessToast("Wishlist cleared");
		}
	};

	// Calculate statistics
	const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
	const inStockCount = wishlistItems.filter((item) => item.inStock).length;
	const priceDropCount = wishlistItems.filter((item) => item.priceDropped).length;

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	if (wishlistItems.length === 0) {
		return (
			<div className="min-h-screen bg-neutral-50">
				<div className="bg-white border-b border-neutral-200">
					<div className="container py-8">
						<h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 text-center">
							Your Wishlist
						</h1>
					</div>
				</div>

				<div className="container py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center max-w-md mx-auto"
					>
						<div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Heart className="w-10 h-10 text-neutral-400" />
						</div>
						<h2 className="text-2xl font-serif font-semibold text-neutral-900 mb-4">
							Your wishlist is empty
						</h2>
						<p className="text-neutral-600 mb-8">
							Start adding items you love to keep track of them and get notified when they go on sale.
						</p>
						<Link to="/products" className="btn-primary">
							Continue Shopping
						</Link>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			{/* Header */}
			<div className="bg-white border-b border-neutral-200">
				<div className="container py-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col md:flex-row md:items-center md:justify-between"
					>
						<div>
							<h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-2">
								Your Wishlist
							</h1>
							<p className="text-neutral-600">
								{wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} • Total value:{" "}
								{formatPrice(totalValue)}
							</p>
						</div>

						<div className="flex items-center space-x-3 mt-4 md:mt-0">
							<button
								onClick={() => setShareModalOpen(true)}
								className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
							>
								<Share2 className="w-4 h-4" />
								<span>Share</span>
							</button>
							<button
								onClick={handleResetWishlist}
								className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors rounded-md"
							>
								<Trash2 className="w-4 h-4" />
								<span>Clear All</span>
							</button>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Stats */}
			<div className="bg-white border-b border-neutral-200">
				<div className="container py-4">
					<div className="flex flex-wrap items-center justify-center space-x-6 text-sm text-neutral-600">
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<span>{inStockCount} in stock</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-red-500 rounded-full"></div>
							<span>{wishlistItems.length - inStockCount} out of stock</span>
						</div>
						{priceDropCount > 0 && (
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
								<span>{priceDropCount} price drops</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="container py-8">
				{/* Controls */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
					<div className="flex items-center space-x-4">
						<div className="relative">
							<select
								value={filterBy}
								onChange={(e) => setFilterBy(e.target.value)}
								className="appearance-none bg-white border border-neutral-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
							>
								<option value="all">All Items</option>
								<option value="inStock">In Stock</option>
								<option value="outOfStock">Out of Stock</option>
								<option value="priceDrops">Price Drops</option>
							</select>
							<ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
						</div>

						<p className="text-neutral-600">
							{filteredAndSortedItems.length} of {wishlistItems.length} items
						</p>
					</div>

					<div className="flex items-center space-x-4">
						{/* Sort */}
						<div className="relative">
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="appearance-none bg-white border border-neutral-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
							>
								<option value="newest">Recently Added</option>
								<option value="oldest">Oldest First</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
							</select>
							<ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
						</div>

						{/* View Mode */}
						<div className="flex border border-neutral-300 rounded-md overflow-hidden">
							<button
								onClick={() => setViewMode("grid")}
								className={`p-2 ${
									viewMode === "grid"
										? "bg-neutral-900 text-white"
										: "bg-white text-neutral-600 hover:bg-neutral-50"
								} transition-colors`}
							>
								<Grid className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode("list")}
								className={`p-2 ${
									viewMode === "list"
										? "bg-neutral-900 text-white"
										: "bg-white text-neutral-600 hover:bg-neutral-50"
								} transition-colors`}
							>
								<List className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>

				{/* Products using ProductGrid Component */}
				<ProductGrid 
					products={filteredAndSortedItems} 
					loading={false} 
					viewMode={viewMode} 
				/>

				{filteredAndSortedItems.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-12"
					>
						<div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Filter className="w-8 h-8 text-neutral-400" />
						</div>
						<h3 className="text-xl font-serif font-semibold text-neutral-900 mb-2">
							No items match your filter
						</h3>
						<p className="text-neutral-600 mb-6">Try changing your filter criteria to see more items</p>
						<button onClick={() => setFilterBy("all")} className="btn-primary">
							Show All Items
						</button>
					</motion.div>
				)}
			</div>

			{/* Share Modal */}
			<AnimatePresence>
				{shareModalOpen && (
					<ShareModal
						isOpen={shareModalOpen}
						onClose={() => setShareModalOpen(false)}
						wishlistCount={wishlistItems.length}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default WishlistPage;