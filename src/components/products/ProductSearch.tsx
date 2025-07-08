import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { selectProducts } from "@/redux/selectors/productsSelectors";

interface ProductSearchProps {
	onSearch: (query: string) => void;
	placeholder?: string;
}

const ProductSearch = ({ onSearch, placeholder = "Search products..." }: ProductSearchProps) => {
	const products = useAppSelector(selectProducts);
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [recentSearches] = useState(["Cashmere", "Leather Bag", "Silk Dress"]);
	const [trendingSearches] = useState(["Overcoat", "Handbag", "Sweater"]);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Memoized suggestions based on search query
	const suggestions = useMemo(() => {
		if (query.length === 0) return [];

		return products
			.filter((product) => {
				const searchLower = query.toLowerCase();
				return (
					product.isActive && // Only show active products
					(product.name.toLowerCase().includes(searchLower) ||
						product.description?.toLowerCase().includes(searchLower) ||
						product.category.toLowerCase().includes(searchLower) ||
						product.subcategory?.toLowerCase().includes(searchLower))
				);
			})
			.slice(0, 5); // Limit to 5 suggestions
	}, [products, query]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			onSearch(query.trim());
			setIsOpen(false);
			inputRef.current?.blur();
		}
	};

	const handleSuggestionClick = (searchQuery: string) => {
		setQuery(searchQuery);
		onSearch(searchQuery);
		setIsOpen(false);
	};

	const clearSearch = () => {
		setQuery("");
		onSearch("");
		inputRef.current?.focus();
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	return (
		<div ref={containerRef} className="relative w-full max-w-lg">
			<form onSubmit={handleSubmit} className="relative">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsOpen(true)}
						placeholder={placeholder}
						className="w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
					/>
					{query && (
						<button
							type="button"
							onClick={clearSearch}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
			</form>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 max-h-96 overflow-y-auto"
					>
						{/* Product Suggestions */}
						{suggestions.length > 0 && (
							<div className="p-2">
								<h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-3 py-2">
									Products
								</h3>
								{suggestions.map((product) => (
									<Link
										key={product.id}
										to={`/products/${product.id}`}
										onClick={() => setIsOpen(false)}
										className="flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-md transition-colors"
									>
										<img
											src={product.images[0]}
											alt={product.name}
											className="w-10 h-10 object-cover rounded-md bg-neutral-100"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
											<div className="flex items-center space-x-2">
												<p className="text-sm text-neutral-500">{formatPrice(product.price)}</p>
												{product.originalPrice && (
													<span className="text-xs text-neutral-400 line-through">
														{formatPrice(product.originalPrice)}
													</span>
												)}
											</div>
											<p className="text-xs text-neutral-400 capitalize">{product.category}</p>
										</div>
										{!product.inStock && (
											<span className="text-xs text-red-500 font-medium">Out of Stock</span>
										)}
									</Link>
								))}
							</div>
						)}

						{/* Recent Searches */}
						{query.length === 0 && recentSearches.length > 0 && (
							<div className="p-2 border-t border-neutral-100">
								<h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-3 py-2">
									Recent Searches
								</h3>
								{recentSearches.map((search, index) => (
									<button
										key={index}
										onClick={() => handleSuggestionClick(search)}
										className="flex items-center space-x-3 w-full p-3 text-left hover:bg-neutral-50 rounded-md transition-colors"
									>
										<Clock className="w-4 h-4 text-neutral-400" />
										<span className="text-sm text-neutral-700">{search}</span>
									</button>
								))}
							</div>
						)}

						{/* Trending Searches */}
						{query.length === 0 && trendingSearches.length > 0 && (
							<div className="p-2 border-t border-neutral-100">
								<h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-3 py-2">
									Trending
								</h3>
								{trendingSearches.map((search, index) => (
									<button
										key={index}
										onClick={() => handleSuggestionClick(search)}
										className="flex items-center space-x-3 w-full p-3 text-left hover:bg-neutral-50 rounded-md transition-colors"
									>
										<TrendingUp className="w-4 h-4 text-neutral-400" />
										<span className="text-sm text-neutral-700">{search}</span>
									</button>
								))}
							</div>
						)}

						{/* No Results */}
						{query.length > 0 && suggestions.length === 0 && (
							<div className="p-6 text-center">
								<p className="text-sm text-neutral-500">No products found for "{query}"</p>
								<button
									onClick={() => handleSuggestionClick(query)}
									className="mt-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
								>
									Search anyway
								</button>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ProductSearch;
