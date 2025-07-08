import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Eye, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import {
	selectFeaturedProducts,
	selectProductError,
	selectProductLoading,
} from "@/redux/selectors/productsSelectors";

interface FeaturedCollectionProps {
	className?: string;
}

const FeaturedCollection = ({ className = "" }: FeaturedCollectionProps) => {
	const [activeSlide, setActiveSlide] = useState(0);
	const featuredProducts = useAppSelector(selectFeaturedProducts);
	const isLoading = useAppSelector(selectProductLoading);
	const error = useAppSelector(selectProductError);

	// Auto-rotate featured products
	useEffect(() => {
		if (featuredProducts.length > 0) {
			const timer = setInterval(() => {
				setActiveSlide((prev) => (prev + 1) % Math.min(featuredProducts.length, 4));
			}, 5000);
			return () => clearInterval(timer);
		}
	}, [featuredProducts.length]);

	const nextSlide = () => {
		setActiveSlide((prev) => (prev + 1) % Math.min(featuredProducts.length, 4));
	};

	const prevSlide = () => {
		setActiveSlide(
			(prev) => (prev - 1 + Math.min(featuredProducts.length, 4)) % Math.min(featuredProducts.length, 4),
		);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	if (isLoading) {
		return (
			<section className={`py-20 ${className}`}>
				<div className="container">
					<div className="animate-pulse">
						<div className="h-8 bg-neutral-200 rounded w-64 mx-auto mb-12"></div>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="h-96 bg-neutral-200 rounded-3xl"></div>
							<div className="grid grid-cols-2 gap-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="h-44 bg-neutral-200 rounded-2xl"></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (error || featuredProducts.length === 0) {
		return null; // Don't show section if no featured products
	}

	return (
		<section className={`py-20 ${className}`}>
			<div className="container">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-center mb-16"
				>
					<div className="flex items-center justify-center gap-3 mb-4">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
						>
							<Crown className="w-6 h-6 text-amber-500" />
						</motion.div>
						<span className="text-sm font-medium text-neutral-600 tracking-wider uppercase">
							Featured Selection
						</span>
						<motion.div
							animate={{ rotate: -360 }}
							transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
						>
							<Crown className="w-6 h-6 text-amber-500" />
						</motion.div>
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-neutral-900 mb-4">
						<span className="max-sm:block">Spotlight</span>
						{" "}
						<span className="max-sm:block text-primary-700">Collection</span>
					</h2>
					<p className="text-xl text-neutral-600 max-w-2xl mx-auto">
						Our coveted pieces, for the discerning fashion geeks.
					</p>
				</motion.div>

				{/* Featured Products Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Main Featured Product */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="relative"
					>
						<div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-2xl">
							{featuredProducts[activeSlide] && (
								<>
									<motion.img
										key={activeSlide}
										src={featuredProducts[activeSlide].images?.[0]}
										alt={featuredProducts[activeSlide].name}
										className="w-full h-full object-cover"
										initial={{ opacity: 0, scale: 1.1 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.8, ease: "easeInOut" }}
										onError={(e) => {
											e.currentTarget.src = "/placeholder-image.jpg";
										}}
									/>

									{/* Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

									{/* Product Info */}
									<motion.div
										key={`info-${activeSlide}`}
										className="absolute bottom-6 left-6 right-6 text-white"
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.3 }}
									>
										<div className="flex items-center gap-2 mb-2">
											<Star className="w-4 h-4 text-yellow-400 fill-current" />
											<span className="text-sm font-medium">Featured Pick</span>
										</div>
										<h3 className="text-2xl lg:text-3xl font-serif font-bold mb-2 line-clamp-2">
											{featuredProducts[activeSlide].name}
										</h3>
										<p className="text-lg font-semibold">
											{formatPrice(featuredProducts[activeSlide].price)}
										</p>
									</motion.div>
								</>
							)}

							{/* Navigation Arrows */}
							{featuredProducts.length > 1 && (
								<>
									<button
										onClick={prevSlide}
										className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
									>
										<ChevronLeft className="w-5 h-5 text-white" />
									</button>
									<button
										onClick={nextSlide}
										className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
									>
										<ChevronRight className="w-5 h-5 text-white" />
									</button>

									{/* Dots Indicator */}
									<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
										{featuredProducts.slice(0, 4).map((_, index) => (
											<button
												key={index}
												onClick={() => setActiveSlide(index)}
												className={`w-2 h-2 rounded-full transition-all ${
													index === activeSlide ? "bg-white w-6" : "bg-white/50"
												}`}
											/>
										))}
									</div>
								</>
							)}
						</div>
					</motion.div>

					{/* Featured Products Grid */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
						className="grid grid-cols-2 gap-4"
					>
						{featuredProducts.slice(0, 4).map((product, index) => (
							<motion.div
								key={product.id}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
							>
								<Link to={`/products/${product.id}`} className="group block">
									<div className="relative h-44 lg:h-52 rounded-2xl overflow-hidden bg-neutral-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
										<img
											src={product.images?.[0]}
											alt={product.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											onError={(e) => {
												e.currentTarget.src = "/placeholder-image.jpg";
											}}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										<div className="absolute bottom-3 left-3 right-3 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
											<h4 className="text-white font-semibold text-sm line-clamp-1">{product.name}</h4>
											<p className="text-white/90 text-xs">{formatPrice(product.price)}</p>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</motion.div>
				</div>

				{/* CTA Button */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 1.2 }}
					className="text-center mt-12"
				>
					<Link
						to="/products?featured=true"
						className="inline-flex items-center gap-3 bg-primary-950 text-primary-100 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
					>
						<Eye className="w-5 h-5" />
						View All Featured
						<ArrowRight className="w-5 h-5" />
					</Link>
				</motion.div>
			</div>
		</section>
	);
};

export default FeaturedCollection;
