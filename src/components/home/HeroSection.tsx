import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "../../assets/hero-assets/Elegant-Woman-in-Black-Hat.jpeg";
import heroImage2 from "../../assets/hero-assets/Minimalist-Fashion-Pose.jpeg";
import heroImage3 from "../../assets/hero-assets/Ornate-Jewelry-Close-Up.jpeg";

const HeroSection = () => {
	const [currentSlide, setCurrentSlide] = useState(0);

	// Placeholder images - replace with your actual images
	const heroImages = [heroImage1, heroImage2, heroImage3];

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % heroImages.length);
		}, 4000);
		return () => clearInterval(timer);
	}, [heroImages.length]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % heroImages.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
	};

	return (
		<section className="relative min-h-screen w-full flex items-center bg-rose-200/5 overflow-hidden">
			{/* Background decorative elements matching About page */}
			<div className="absolute inset-0 bg-gradient-to-t from-orange-200/10 to-transparent"></div>
			<div className="absolute top-10 md:top-20 left-2 md:left-10 w-32 md:w-96 h-32 md:h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-5 md:bottom-10 right-2 md:right-10 w-28 md:w-80 h-28 md:h-80 bg-rose-600/10 rounded-full blur-3xl"></div>
			<div className="absolute top-1/3 right-1/4 w-24 md:w-72 h-24 md:h-72 bg-primary-200/5 rounded-full blur-3xl"></div>

			{/* Floating decorative dots - responsive */}
			<div className="absolute top-1/4 left-1/3 w-3 md:w-6 h-3 md:h-6 bg-primary-400 rounded-full opacity-20"></div>
			<div className="absolute top-2/3 right-1/3 w-2 md:w-4 h-2 md:h-4 bg-rose-400 rounded-full opacity-30"></div>
			<div className="absolute bottom-1/3 right-1/6 w-4 md:w-7 h-4 md:h-7 bg-rose-300 rounded-full opacity-20"></div>

			<div className="w-full max-w-7xl mx-auto px-4 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center min-h-screen py-8 lg:py-10">
					{/* Left Content */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-5 order-2 lg:order-1"
					>
						<motion.p
							className="text-sm md:text-base text-neutral-600 leading-relaxed max-w-lg"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							Discover our curated collection—
							<br />
							luxury and sophistication in every thread.
						</motion.p>

						<motion.h1
							className="text-6xl xl:text-[6.5rem] font-serif font-semibold leading-tight text-primary-950"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							Next Level
							<span className="block mt-1 md:mt-2 text-black">Style Reveal</span>
						</motion.h1>

						<motion.div
							className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							<a
								href="/products"
								className="bg-primary-200 hover:bg-primary-900 text-primary-700 hover:text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center group text-sm md:text-base"
							>
								Explore Collection
								<ArrowRight className="ml-2 w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
							</a>
							<a
								href="/new-arrivals"
								className="border border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center text-sm md:text-base"
							>
								New Arrivals
							</a>
						</motion.div>

						{/* Social Proof - responsive */}
						<motion.div
							className="flex items-center gap-4 md:gap-6 pt-6 md:pt-8"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.8 }}
						>
							<div className="text-center">
								<div className="text-lg md:text-2xl font-bold text-primary-600">50K+</div>
								<div className="text-xs md:text-sm text-neutral-500">Customers</div>
							</div>
							<div className="w-px h-8 md:h-12 bg-neutral-300"></div>
							<div className="text-center">
								<div className="text-lg md:text-2xl font-bold text-primary-600">4.9★</div>
								<div className="text-xs md:text-sm text-neutral-500">Rating</div>
							</div>
							<div className="w-px h-8 md:h-12 bg-neutral-300"></div>
							<div className="text-center">
								<div className="text-lg md:text-2xl font-bold text-primary-600">200+</div>
								<div className="text-xs md:text-sm text-neutral-500">Products</div>
							</div>
						</motion.div>
					</motion.div>

					{/* Right Image Carousel */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="relative flex items-center justify-center order-1 lg:order-2"
					>
						<div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto">
							{/* Main Carousel Container */}
							<div className="relative h-[450px] lg:h-[500px] xl:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
								<AnimatePresence mode="wait">
									<motion.img
										key={currentSlide}
										src={heroImages[currentSlide]}
										alt={`Fashion showcase ${currentSlide + 1}`}
										className="absolute inset-0 w-full h-full object-cover"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.4 }}
									/>
								</AnimatePresence>

								{/* Overlay Gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

								{/* Navigation Arrows */}
								<button
									onClick={prevSlide}
									className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors p-2 md:p-3"
								>
									<ChevronLeft className="w-4 md:w-5 h-4 md:h-5 text-white" />
								</button>
								<button
									onClick={nextSlide}
									className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors p-2 md:p-3"
								>
									<ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-white" />
								</button>
							</div>

							{/* Slide Indicators */}
							<div className="flex justify-center gap-2 mt-4 md:mt-6">
								{heroImages.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentSlide(index)}
										className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
											index === currentSlide
												? "bg-primary-600 w-6 md:w-8"
												: "bg-neutral-300 hover:bg-neutral-400 w-2 md:w-3"
										}`}
									/>
								))}
							</div>

							{/* Floating Accent Elements - responsive */}
							<motion.div
								className="absolute -top-3 md:-top-7 -right-3 md:-right-7 w-12 md:w-24 h-12 md:h-24 bg-gradient-to-br from-primary-200/60 to-rose-200/40 rounded-full opacity-70 backdrop-blur-sm"
								animate={{
									rotate: [0, 360],
									scale: [1, 1.1, 1],
								}}
								transition={{
									duration: 8,
									repeat: Infinity,
									ease: "linear",
								}}
							/>
							<motion.div
								className="absolute -bottom-2 md:-bottom-5 -left-2 md:-left-5 w-8 md:w-16 h-8 md:h-16 bg-gradient-to-br from-orange-200/60 to-primary-200/40 rounded-full opacity-60 backdrop-blur-sm"
								animate={{
									rotate: [360, 0],
									scale: [1, 1.2, 1],
								}}
								transition={{
									duration: 6,
									repeat: Infinity,
									ease: "linear",
								}}
							/>
							<motion.div
								className="hidden md:block absolute top-1/3 -left-6 md:-left-8 w-8 md:w-12 h-8 md:h-12 bg-gradient-to-br from-rose-300/50 to-orange-300/50 rounded-full opacity-50"
								animate={{
									y: [0, -20, 0],
									rotate: [0, 180, 360],
								}}
								transition={{
									duration: 7,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Additional Background Floating Elements - responsive */}
			<motion.div
				className="absolute top-16 md:top-20 left-1/5 w-12 md:w-32 h-12 md:h-32 bg-primary-200/20 rounded-full opacity-30"
				animate={{
					y: [0, -20, 0],
					rotate: [0, 180, 360],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="absolute bottom-16 md:bottom-20 right-1/4 w-10 md:w-24 h-10 md:h-24 bg-rose-300/25 rounded-full opacity-40"
				animate={{
					y: [0, 15, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="hidden lg:block absolute top-1/2 right-8 w-16 h-16 bg-orange-300/20 rounded-full opacity-35"
				animate={{
					x: [0, 10, 0],
					rotate: [0, -180, -360],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
		</section>
	);
};

export default HeroSection;