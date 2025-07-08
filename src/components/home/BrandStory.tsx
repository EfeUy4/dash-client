import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ElegandJewelry from "../../assets/Elegant-Jewelry-Portrait.jpeg";

const BrandStory = () => {
	return (
		<section className="py-20 bg-primary-950 text-white">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
					>
						<h2 className="text-4xl text-primary-200 md:text-7xl xl:text-9xl font-serif font-bold mb-10">
							Crafting Timeless Excellence
						</h2>
						<p className="text-primary-100/70 mb-6 leading-relaxed text-lg sm:pr-10">
							At Dash, we believe that fashion is more than clothing—it's an expression of your unique
							story. Every piece in our collection is carefully curated to ensure the highest quality and
							timeless appeal.
						</p>
						<p className="text-primary-100/70 mb-8 text-lg leading-relaxed sm:pr-16">
							From luxurious fabrics to impeccable craftsmanship, we're committed to delivering pieces that
							make you feel confident and sophisticated.
						</p>

						{/* Features List */}
						<div className="mb-8">
							<div className="flex items-start mb-4">
								<div className="w-2 h-2 rounded-full bg-primary-400 mt-2 mr-3"></div>
								<p className="text-primary-200/50">Ethically sourced materials from trusted suppliers</p>
							</div>
							<div className="flex items-start mb-4">
								<div className="w-2 h-2 rounded-full bg-primary-400 mt-2 mr-3"></div>
								<p className="text-primary-200/50">
									Handcrafted by skilled artisans with decades of experience
								</p>
							</div>
							<div className="flex items-start">
								<div className="w-2 h-2 rounded-full bg-primary-400 mt-2 mr-3"></div>
								<p className="text-primary-200/50">Rigorous quality control for every single item</p>
							</div>
						</div>

						<a
							href="#about"
							className="inline-flex items-center text-white hover:text-primary-200/50 transition-colors font-medium"
						>
							Learn Our Story
							<ArrowRight className="ml-2 w-4 h-4" />
						</a>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="relative"
					>
						<div className="absolute top-0 left-0 w-80 h-80 bg-primary-900/40 rounded-lg transform -translate-x-7 -translate-y-7"></div>
						<div className="relative z-10 overflow-hidden rounded-lg">
							<img
								src={ElegandJewelry}
								alt="Fashion artisan at work"
								className="w-full h-full object-cover rounded-lg"
							/>

							<div className="absolute bottom-0 left-0 right-0 pl-14 pb-2">
								<div className="text-3xl font-serif font-bold mb-1 text-primary-100">Our Commitment</div>
								<p className="text-primary-200/50">Craftsmanship, quality, and sustainable fashion</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default BrandStory;
