import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Product } from "@/data/types";

interface ProductGridProps {
	products: Product[];
	loading?: boolean;
	viewMode?: "grid" | "list";
}

const ProductGrid = ({ products, loading = false, viewMode = "grid" }: ProductGridProps) => {
	if (loading) {
		return (
			<div
				className={`grid gap-6 ${
					viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto"
				}`}
			>
				{Array.from({ length: viewMode === "grid" ? 8 : 6 }).map((_, index) => (
					<div key={index} className="animate-pulse">
						<div
							className={`${
								viewMode === "grid"
									? "aspect-[5/6] bg-neutral-200 rounded-2xl mb-4"
									: "flex gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
							}`}
						>
							{viewMode === "list" && (
								<>
									<div className="w-32 h-32 bg-neutral-200 rounded-xl flex-shrink-0"></div>
									<div className="flex-1 space-y-3">
										<div className="h-4 bg-neutral-200 rounded w-3/4"></div>
										<div className="h-3 bg-neutral-200 rounded w-1/2"></div>
										<div className="h-4 bg-neutral-200 rounded w-1/3"></div>
									</div>
								</>
							)}
						</div>
						{viewMode === "grid" && (
							<>
								<div className="h-4 bg-neutral-200 rounded mb-2"></div>
								<div className="h-4 bg-neutral-200 rounded w-3/4"></div>
							</>
						)}
					</div>
				))}
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center py-16 max-w-md mx-auto"
			>
				<div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
					<svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l6-3"
						/>
					</svg>
				</div>
				<h3 className="text-2xl font-semibold text-neutral-900 mb-3">No products found</h3>
				<p className="text-neutral-600 leading-relaxed">
					Try adjusting your filters or search criteria to find what you're looking for
				</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
			className={`${
				viewMode === "grid"
					? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
					: "flex flex-col gap-4 max-w-4xl mx-auto"
			}`}
		>
			{products.map((product, index) => (
				<motion.div
					key={product.id}
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.4,
						delay: index * 0.08,
						ease: "easeOut",
					}}
					className={viewMode === "list" ? "w-full" : ""}
				>
					{viewMode === "list" ? <ListProductCard product={product} /> : <ProductCard product={product} />}
				</motion.div>
			))}
		</motion.div>
	);
};

// Separate List View Component for better UX
const ListProductCard = ({ product }: { product: Product }) => {
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	return (
		<motion.div
			whileHover={{ y: -2 }}
			transition={{ duration: 0.2 }}
			className="bg-gradient-to-r from-white/70 via-white/60 to-white/50 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
		>
			<div className="flex gap-4 p-4">
				{/* Image */}
				<div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
					<img
						src={product.images[0]}
						alt={product.name}
						className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
					/>
					{product.isNewProduct && (
						<span className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-neutral-900 text-[10px] px-2 py-0.5 rounded-full font-medium border border-white/30">
							New
						</span>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between mb-2">
						<h3 className="font-semibold text-neutral-900 text-sm leading-tight line-clamp-2 pr-2">
							{product.name}
						</h3>
						{product.stockCount <= 5 && (
							<span className="bg-orange-100/80 text-orange-700 text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap">
								{product.stockCount} left
							</span>
						)}
					</div>

					{/* Rating */}
					<div className="flex items-center gap-2 mb-2">
						<div className="flex items-center gap-0.5">
							{Array.from({ length: 5 }).map((_, i) => (
								<svg
									key={i}
									className={`w-3 h-3 ${
										i < Math.floor(product.rating) ? "text-amber-400 fill-current" : "text-neutral-300"
									}`}
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							))}
						</div>
						<span className="text-xs text-neutral-600">({product.reviewCount})</span>
					</div>

					{/* Price */}
					<div className="flex items-center gap-2">
						<span className="font-bold text-neutral-900 text-base">{formatPrice(product.price)}</span>
						{product.originalPrice && (
							<span className="text-sm text-neutral-500 line-through">
								{formatPrice(product.originalPrice)}
							</span>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default ProductGrid;
