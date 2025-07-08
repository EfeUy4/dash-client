import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialsSection = () => {
	const testimonials = [
		{
			id: 1,
			name: "Adebayo Johnson",
			position: "Fashion Enthusiast",
			rating: 5,
			image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2787&auto=format&fit=crop",
			text: "The quality of fabrics and attention to detail is unmatched. Every piece I've purchased has exceeded my expectations.",
		},
		{
			id: 2,
			name: "Chioma Okonkwo",
			position: "Marketing Executive",
			rating: 5,
			image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=2889&auto=format&fit=crop",
			text: "I constantly receive compliments on my outfits. The clothing is not only stylish but also incredibly comfortable.",
		},
		{
			id: 3,
			name: "Emeka Nwosu",
			position: "Business Consultant",
			rating: 4,
			image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop",
			text: "Their attention to current trends while maintaining timeless appeal sets them apart from the competition.",
		},
		{
			id: 4,
			name: "Folake Ademola",
			position: "Lifestyle Blogger",
			rating: 5,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop",
			text: "I've featured their items on my blog multiple times. The compliments I receive when wearing their pieces are endless!",
		},
	];

	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % testimonials.length);
		}, 7000);
		return () => clearInterval(interval);
	}, [testimonials.length]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % testimonials.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	return (
		<section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
			{/* Floating Elements */}
			<div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-40"></div>
			<div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full blur-3xl opacity-40"></div>

			<div className="container mx-auto px-6 relative z-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="mb-5 sm:10"
				>
					<h2 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary-950 via-primary-800 to-primary-950 bg-clip-text text-transparent leading-tight">
						We're Loved
					</h2>
				</motion.div>

				{/* Main Testimonial Display */}
				<div className="max-w-5xl mx-auto relative">
					<div className="relative h-[500px] md:h-[400px]">
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={testimonial.id}
								className="absolute inset-0 flex items-center justify-center"
								initial={false}
								animate={{
									opacity: currentSlide === index ? 1 : 0,
									scale: currentSlide === index ? 1 : 0.95,
									filter: currentSlide === index ? "blur(0px)" : "blur(10px)",
								}}
								transition={{ duration: 0.6, ease: "easeInOut" }}
							>
								<div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 max-w-4xl w-full mx-4">
									{/* Quote */}
									<motion.p
										className="text-2xl md:text-3xl font-light text-primary-700 mb-10 leading-relaxed italic"
										initial={{ opacity: 0 }}
										animate={{ opacity: currentSlide === index ? 1 : 0 }}
										transition={{ delay: 0.2, duration: 0.6 }}
									>
										"{testimonial.text}"
									</motion.p>

									{/* Profile Section */}
									<motion.div
										className="flex items-center gap-6"
										initial={{ opacity: 0, y: 20 }}
										animate={{
											opacity: currentSlide === index ? 1 : 0,
											y: currentSlide === index ? 0 : 20,
										}}
										transition={{ delay: 0.4, duration: 0.6 }}
									>
										<div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
											<img
												src={testimonial.image}
												alt={testimonial.name}
												className="w-full h-full object-cover"
											/>
										</div>

										<div>
											<h4 className="text-lg font-semibold text-gray-800">{testimonial.name}</h4>
											<p className="text-sm font-medium text-gray-500 mb-0.5">{testimonial.position}</p>

											{/* Stars */}
											<div className="flex gap-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														size={12}
														className={
															i < testimonial.rating
																? "text-amber-400 fill-amber-400"
																: "text-slate-300 fill-slate-300"
														}
													/>
												))}
											</div>
										</div>
									</motion.div>
								</div>
							</motion.div>
						))}
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-between mt-12">
						{/* Previous Button */}
						<button
							onClick={prevSlide}
							className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white transition-all duration-300 hover:scale-110"
							aria-label="Previous testimonial"
						>
							<ChevronLeft
								size={20}
								className="text-slate-600 group-hover:text-slate-800 transition-colors"
							/>
						</button>

						{/* Dots Indicator */}
						<div className="flex gap-3">
							{testimonials.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentSlide(index)}
									className={`transition-all duration-300 rounded-full ${
										currentSlide === index
											? "w-12 h-3 bg-gradient-to-r from-slate-600 to-slate-800"
											: "w-3 h-3 bg-slate-300 hover:bg-slate-400"
									}`}
									aria-label={`Go to testimonial ${index + 1}`}
								/>
							))}
						</div>

						{/* Next Button */}
						<button
							onClick={nextSlide}
							className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white transition-all duration-300 hover:scale-110"
							aria-label="Next testimonial"
						>
							<ChevronRight
								size={20}
								className="text-slate-600 group-hover:text-slate-800 transition-colors"
							/>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialsSection;
