import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductGrid from "../products/ProductGrid";
import { useAppSelector } from "@/redux/hooks";
import {
	selectNewProducts,
	selectProductError,
	selectProductLoading,
} from "@/redux/selectors/productsSelectors";

interface newProductsSectionProps {
	className?: string;
}

const ProductSkeleton = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{Array.from({ length: 8 }).map((_, i) => (
			<div key={i} className="animate-pulse">
				<div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
				<div className="h-4 bg-gray-200 rounded mb-2"></div>
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
			</div>
		))}
	</div>
);

const newProductsSection = ({ className = "" }: newProductsSectionProps) => {
	const newProducts = useAppSelector(selectNewProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);

	if (error) {
		return (
			<section className={`py-20 ${className}`}>
				<div className="container">
					<div className="text-center">
						<h3 className="text-xl font-semibold text-neutral-900 mb-2">Unable to load new arrivals</h3>
						<p className="text-neutral-600">{error}</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className={`py-20 bg-white ${className}`}>
			<div className="container">
				{/* Section Header */}
				<div className="text-center mb-16">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Sparkles className="w-6 h-6 text-emerald-500" />
						<span className="text-sm font-medium text-neutral-600 tracking-wider uppercase">
							Fresh Arrivals
						</span>
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
						<span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
							New
						</span>{" "}
						<span className="text-neutral-900">Arrivals</span>
					</h2>
					<p className="text-xl text-neutral-600 max-w-2xl mx-auto">
						Be the first to discover our latest premium additions
					</p>
				</div>

				{/* Products or Skeleton */}
				<div className="mb-16">
					{isLoading ? (
						<ProductSkeleton />
					) : newProducts.length > 0 ? (
						<ProductGrid products={newProducts.slice(0, 8)} loading={false} viewMode="grid" />
					) : (
						<div className="text-center py-12">
							<h3 className="text-xl font-semibold text-neutral-900 mb-2">No new arrivals available</h3>
							<p className="text-neutral-600">Check back soon for new products!</p>
						</div>
					)}
				</div>

				{/* CTA Button */}
				{!isLoading && (
					<div className="text-center">
						<Link
							to="/products"
							className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-3 rounded-xl font-medium shadow hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 hover:scale-105"
						>
							<Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
							Shop All Products
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
						</Link>
					</div>
				)}
			</div>
		</section>
	);
};

export default newProductsSection;
