import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Grid, List, ChevronDown, X, Sparkles } from "lucide-react";
import ProductGrid from "../components/products/ProductGrid";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
	selectProductError,
	selectProductLoading,
	selectNewProducts,
	selectHasBeenFetched,
} from "@/redux/selectors/productsSelectors";
import { fetchProducts } from "@/redux/thunks/products";

const NewArrivalsPage = () => {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectNewProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);
	const hasBeenFetched = useAppSelector(selectHasBeenFetched);

	const [searchParams, setSearchParams] = useSearchParams();
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState({
		category: searchParams.get("category") || "",
		priceRange: [0, 500000],
		sizes: [] as string[],
		colors: [] as string[],
		sortBy: searchParams.get("sort") || "newest",
	});

	useEffect(() => {
		if (!hasBeenFetched && !isLoading) {
			dispatch(fetchProducts());
		}
	}, [dispatch, hasBeenFetched, isLoading]);

	// Update max price when products change
	useEffect(() => {
		if (products.length > 0) {
			const maxPrice = Math.max(...products.map((p) => p.price));
			setFilters((prev) => ({
				...prev,
				priceRange: [prev.priceRange[0], maxPrice],
			}));
		}
	}, [products]);

	// Extract categories from new products
	const categories = useMemo(() => {
		const categorySet = new Set(products.map((p) => p.category).filter(Boolean));
		return Array.from(categorySet).map((name) => ({ id: name.toLowerCase(), name }));
	}, [products]);

	// Available filter options (computed from Redux new products)
	const allSizes = useMemo(() => Array.from(new Set(products.flatMap((p) => p.sizes || []))), [products]);

	const allColors = useMemo(() => Array.from(new Set(products.flatMap((p) => p.colors || []))), [products]);

	const maxPrice = useMemo(
		() => (products.length > 0 ? Math.max(...products.map((p) => p.price)) : 500000),
		[products],
	);

	// Filter and sort new products (internal logic)
	const filteredProducts = useMemo(() => {
		let filtered = [...products];

		// Category filter
		if (filters.category) {
			filtered = filtered.filter((p) => p.category.toLowerCase() === filters.category.toLowerCase());
		}

		// Price filter
		filtered = filtered.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

		// Size filter
		if (filters.sizes.length > 0) {
			filtered = filtered.filter((p) => filters.sizes.some((size) => (p.sizes || []).includes(size)));
		}

		// Color filter
		if (filters.colors.length > 0) {
			filtered = filtered.filter((p) => filters.colors.some((color) => (p.colors || []).includes(color)));
		}

		// Sort products
		switch (filters.sortBy) {
			case "price-low":
				filtered.sort((a, b) => a.price - b.price);
				break;
			case "price-high":
				filtered.sort((a, b) => b.price - a.price);
				break;
			case "rating":
				filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
				break;
			case "popular":
				filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
				break;
			case "newest":
			default:
				filtered.sort((a, b) => (b.isNewProduct ? 1 : 0) - (a.isNewProduct ? 1 : 0));
				break;
		}

		return filtered;
	}, [filters, products]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const handleFilterChange = (key: string, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }));

		// Update URL params for category and sort
		if (key === "category" || key === "sortBy") {
			const newParams = new URLSearchParams(searchParams);
			if (value) {
				newParams.set(key === "category" ? "category" : "sort", value);
			} else {
				newParams.delete(key === "category" ? "category" : "sort");
			}
			setSearchParams(newParams);
		}
	};

	const toggleArrayFilter = (key: "sizes" | "colors", value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
		}));
	};

	const clearFilters = () => {
		setFilters({
			category: "",
			priceRange: [0, maxPrice],
			sizes: [],
			colors: [],
			sortBy: "newest",
		});
		setSearchParams({});
	};

	// Error handling
	if (error) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading New Arrivals</h2>
					<p className="text-neutral-600 mb-4">{error}</p>
					<button
						onClick={() => dispatch(fetchProducts())}
						className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			{/* Header */}
			<div className="relative bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 overflow-hidden">
				{/* Creative Background Elements */}
				<div className="absolute inset-0">
					<div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
					<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/5 rounded-full blur-2xl"></div>

					{/* Floating sparkles */}
					<div className="absolute inset-0">
						{Array.from({ length: 8 }).map((_, i) => (
							<motion.div
								key={i}
								className="absolute"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
								}}
								animate={{
									y: [-10, 10, -10],
									opacity: [0.3, 1, 0.3],
									scale: [0.8, 1.2, 0.8],
								}}
								transition={{
									duration: 3 + Math.random() * 2,
									repeat: Infinity,
									delay: Math.random() * 2,
								}}
							>
								<Sparkles className="w-4 h-4 text-emerald-300/50" />
							</motion.div>
						))}
					</div>
				</div>

				<div className="relative container py-16 md:py-20">
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
							<Sparkles className="w-5 h-5 text-emerald-300" />
							<p className="text-emerald-200/80 text-sm md:text-base font-medium tracking-wider uppercase">
								Fresh & New
							</p>
							<Sparkles className="w-5 h-5 text-emerald-300" />
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
						>
							<span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent">
								New
							</span>
							<br />
							<span className="bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
								Arrivals
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							className="text-emerald-100/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
						>
							Be the first to discover our latest collection of premium pieces
						</motion.p>

						{/* Results count */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="text-emerald-100/60 text-sm mt-4"
						>
							{isLoading ? "Loading new arrivals..." : `${filteredProducts.length} new arrivals found`}
						</motion.p>
					</motion.div>
				</div>
			</div>

			<div className="container py-8">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Filters Sidebar */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
					>
						<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-24">
							<div className="flex items-center justify-between mb-6">
								<h3 className="font-serif font-semibold text-lg">Filters</h3>
								<button
									onClick={clearFilters}
									className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
								>
									Clear All
								</button>
							</div>

							{/* Categories */}
							<div className="mb-6">
								<h4 className="font-medium text-neutral-900 mb-3">Categories</h4>
								<div className="space-y-2">
									<button
										onClick={() => handleFilterChange("category", "")}
										className={`block w-full text-left text-sm py-1 transition-colors ${
											!filters.category
												? "text-neutral-900 font-medium"
												: "text-neutral-600 hover:text-neutral-900"
										}`}
									>
										All New Items ({products.length})
									</button>
									{categories.map((category) => {
										const categoryCount = products.filter(
											(p) => p.category.toLowerCase() === category.name.toLowerCase(),
										).length;

										return (
											<button
												key={category.id}
												onClick={() => handleFilterChange("category", category.name)}
												className={`block w-full text-left text-sm py-1 transition-colors ${
													filters.category === category.name
														? "text-neutral-900 font-medium"
														: "text-neutral-600 hover:text-neutral-900"
												}`}
											>
												{category.name} ({categoryCount})
											</button>
										);
									})}
								</div>
							</div>

							{/* Price Range */}
							<div className="mb-6">
								<h4 className="font-medium text-neutral-900 mb-3">Price Range</h4>
								<div className="space-y-3">
									<input
										type="range"
										min="0"
										max={maxPrice}
										step="5000"
										value={filters.priceRange[1]}
										onChange={(e) => handleFilterChange("priceRange", [0, parseInt(e.target.value)])}
										className="w-full"
									/>
									<div className="flex justify-between text-sm text-neutral-600">
										<span>{formatPrice(0)}</span>
										<span>{formatPrice(filters.priceRange[1])}</span>
									</div>
								</div>
							</div>

							{/* Sizes */}
							{allSizes.length > 0 && (
								<div className="mb-6">
									<h4 className="font-medium text-neutral-900 mb-3">Sizes</h4>
									<div className="grid grid-cols-3 gap-2">
										{allSizes.map((size) => (
											<button
												key={size}
												onClick={() => toggleArrayFilter("sizes", size)}
												className={`py-2 px-3 text-sm border rounded-md transition-colors ${
													filters.sizes.includes(size)
														? "bg-neutral-900 text-white border-neutral-900"
														: "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"
												}`}
											>
												{size}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Colors */}
							{allColors.length > 0 && (
								<div className="mb-6">
									<h4 className="font-medium text-neutral-900 mb-3">Colors</h4>
									<div className="grid grid-cols-2 gap-2">
										{allColors.slice(0, 6).map((color) => (
											<button
												key={color}
												onClick={() => toggleArrayFilter("colors", color)}
												className={`py-2 px-3 text-xs border rounded-md transition-colors text-left ${
													filters.colors.includes(color)
														? "bg-neutral-900 text-white border-neutral-900"
														: "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"
												}`}
											>
												{color}
											</button>
										))}
									</div>
									{allColors.length > 6 && (
										<p className="text-xs text-neutral-500 mt-2">+{allColors.length - 6} more colors</p>
									)}
								</div>
							)}
						</div>
					</motion.div>

					{/* Products Grid */}
					<div className="flex-1">
						{/* Controls */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center space-x-4">
								<button
									onClick={() => setShowFilters(!showFilters)}
									className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
								>
									<Filter className="w-4 h-4" />
									<span>Filters</span>
								</button>

								<p className="text-neutral-600">
									{filteredProducts.length} new {filteredProducts.length === 1 ? "item" : "items"} found
								</p>
							</div>

							<div className="flex items-center space-x-4">
								{/* Sort */}
								<div className="relative">
									<select
										value={filters.sortBy}
										onChange={(e) => handleFilterChange("sortBy", e.target.value)}
										className="appearance-none bg-white border border-neutral-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
									>
										<option value="newest">Newest First</option>
										<option value="price-low">Price: Low to High</option>
										<option value="price-high">Price: High to Low</option>
										<option value="rating">Highest Rated</option>
										<option value="popular">Most Popular</option>
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

						{/* Active Filters */}
						{(filters.category || filters.sizes.length > 0 || filters.colors.length > 0) && (
							<div className="flex flex-wrap gap-2 mb-6">
								{filters.category && (
									<span className="inline-flex items-center px-3 py-1 bg-emerald-600 text-white text-sm rounded-full">
										{filters.category}
										<button
											onClick={() => handleFilterChange("category", "")}
											className="ml-2 hover:text-emerald-200"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								)}
								{filters.sizes.map((size) => (
									<span
										key={size}
										className="inline-flex items-center px-3 py-1 bg-neutral-200 text-neutral-900 text-sm rounded-full"
									>
										Size {size}
										<button
											onClick={() => toggleArrayFilter("sizes", size)}
											className="ml-2 hover:text-neutral-600"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								))}
								{filters.colors.map((color) => (
									<span
										key={color}
										className="inline-flex items-center px-3 py-1 bg-neutral-200 text-neutral-900 text-sm rounded-full"
									>
										{color}
										<button
											onClick={() => toggleArrayFilter("colors", color)}
											className="ml-2 hover:text-neutral-600"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								))}
							</div>
						)}

						{/* Products using ProductGrid Component */}
						<ProductGrid products={filteredProducts} loading={isLoading} viewMode={viewMode} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default NewArrivalsPage;
