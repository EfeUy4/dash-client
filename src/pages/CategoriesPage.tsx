import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shirt, Watch, Gem, ShoppingBag, Footprints, Glasses, ArrowRight, Tag, Package } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts } from "@/redux/thunks/products";
import { Product } from "@/data/types";
import { getCategoryIcon, getCategoryGradient, getCategoryDescription } from "@/components/ui/categoryIcons";

interface CategoryData {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	gradient: string;
	itemCount: number;
	newItemsCount: number;
	priceRange: { min: number; max: number };
	featuredImage?: string;
}

const CategoriesPage = () => {
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

	// Build categories from Redux products
	const categories = useMemo(() => {
		if (products.length === 0) return [];

		const categoryMap = new Map<string, Product[]>();

		// Group products by category
		products.forEach((product:Product) => {
			if (product.category) {
				const categoryName = product.category.toLowerCase();
				if (!categoryMap.has(categoryName)) {
					categoryMap.set(categoryName, []);
				}
				categoryMap.get(categoryName)?.push(product);
			}
		});

		// Build category data with stats
		const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(
			([categoryName, categoryProducts]) => {
				const prices = categoryProducts.map((p) => p.price);
				const minPrice = Math.min(...prices);
				const maxPrice = Math.max(...prices);
				const newItemsCount = categoryProducts.filter((p) => p.isNewProduct).length;

				return {
					id: categoryName,
					name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
					description: getCategoryDescription(categoryName),
					icon: getCategoryIcon(categoryName),
					gradient: getCategoryGradient(categoryName),
					itemCount: categoryProducts.length,
					newItemsCount,
					priceRange: { min: minPrice, max: maxPrice },
					featuredImage: categoryProducts[0]?.images?.[0],
				};
			},
		);

		return categoryData;
	}, [products]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	// Error handling
	if (error) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Categories</h2>
					<p className="text-neutral-600 mb-4">{error}</p>
					<button
						onClick={() => dispatch(fetchProducts())}
						className="px-6 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-neutral-600">Loading categories...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			{/* Header */}
			<div className="relative bg-gradient-to-br from-neutral-900 via-gray-800 to-slate-900 overflow-hidden">
				{/* Creative Background Elements */}
				<div className="absolute inset-0">
					<div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
					<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>

					{/* Floating category icons */}
					<div className="absolute inset-0">
						{[Shirt, Watch, Gem, ShoppingBag, Footprints, Glasses].map((Icon, i) => (
							<motion.div
								key={i}
								className="absolute"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
								}}
								animate={{
									x: [-10, 10, -10],
									y: [-10, 10, -10],
									opacity: [0.1, 0.3, 0.1],
									rotate: [0, 180, 360],
								}}
								transition={{
									duration: 6 + Math.random() * 3,
									repeat: Infinity,
									delay: Math.random() * 3,
								}}
							>
								<Icon className="w-6 h-6 text-white/20" />
							</motion.div>
						))}
					</div>
				</div>

				<div className="relative container py-16 md:py-24">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center max-w-4xl mx-auto"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="flex items-center justify-center gap-2 mb-4"
						>
							<Tag className="w-5 h-5 text-neutral-300" />
							<p className="text-neutral-400 text-sm md:text-base font-medium tracking-wider uppercase">
								Shop by Category
							</p>
							<Tag className="w-5 h-5 text-neutral-300" />
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
						>
							<span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-300 bg-clip-text text-transparent">
								Categories
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
						>
							Browse our carefully curated collections
						</motion.p>

						{/* Categories count */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="text-neutral-400 text-sm mt-4"
						>
							{categories.length} categories available
						</motion.p>
					</motion.div>
				</div>
			</div>

			{/* Categories Grid */}
			<div className="container py-16">
				{categories.length > 0 ? (
					<>
						{/* Categories Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{categories.map((category, index) => (
								<motion.div
									key={category.id}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
								>
									<Link
										to={`/products?category=${encodeURIComponent(category.name)}`}
										className="group block h-full"
									>
										<div className="relative h-80 bg-white shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:rotate-1">
											{/* Background Image */}
											<div className="absolute inset-0">
												{category.featuredImage ? (
													<img
														src={category.featuredImage}
														alt={category.name}
														className="w-full h-full object-cover transition-transform duration-700"
													/>
												) : (
													<div
														className={`w-full h-full bg-gradient-to-br ${category.gradient} opacity-90`}
													/>
												)}
												{/* Overlay */}
												<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
											</div>

											{/* Floating Elements */}
											<div className="absolute top-6 left-6">
												<div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
													<div className="text-white">{category.icon}</div>
												</div>
											</div>

											{/* New Items Badge */}
											{category.newItemsCount > 0 && (
												<motion.div
													className="absolute top-6 right-6"
													animate={{ scale: [1, 1.1, 1] }}
													transition={{ duration: 2, repeat: Infinity }}
												>
													<div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-white/20">
														{category.newItemsCount} NEW
													</div>
												</motion.div>
											)}

											{/* Content */}
											<div className="absolute bottom-0 left-0 right-0 p-6">
												<div className="text-white">
													{/* Stats Pills */}
													<div className="flex items-center gap-3 mb-4">
														<div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
															<span className="text-xs font-medium text-white">
																{category.itemCount} items
															</span>
														</div>
														<div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
															<span className="text-xs font-medium text-white">
																From {formatPrice(category.priceRange.min)}
															</span>
														</div>
													</div>

													{/* CTA Button */}
													<div className="flex items-center justify-between">
														<span className="text-sm font-semibold text-white/90">Explore Collection</span>
														<div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
															<ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
														</div>
													</div>

													<h3 className="text-xl font-sans font-semibold text-primary-200">
														{category.name}
													</h3>
												</div>
											</div>

											{/* Hover Effect Overlay */}
											<div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					</>
				) : (
					/* Empty State */
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-16"
					>
						<div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
							<Package className="w-10 h-10 text-neutral-400" />
						</div>
						<h3 className="text-2xl font-semibold text-neutral-900 mb-3">No Categories Found</h3>
						<p className="text-neutral-600 leading-relaxed mb-6">
							Categories will appear here once products are available.
						</p>
						<Link
							to="/products"
							className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
						>
							<Package className="w-4 h-4" />
							Browse All Products
						</Link>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default CategoriesPage;
