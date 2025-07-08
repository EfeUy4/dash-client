import { motion } from "framer-motion";
import { Award, Globe, Users, Heart, ArrowRight, Sparkles, Target, Eye } from "lucide-react";
import formalAttire from "../assets/Formal-Attire.jpeg";

const AboutPage = () => {
	const values = [
		{
			icon: Award,
			title: "Premium Quality",
			description:
				"We source only the finest materials and work with skilled artisans to ensure every piece meets our exacting standards.",
		},
		{
			icon: Globe,
			title: "Global Reach",
			description:
				"From Lagos to London, our curated collections reflect international fashion trends while celebrating local craftsmanship.",
		},
		{
			icon: Users,
			title: "Customer First",
			description:
				"Your satisfaction is our priority. We provide personalized service and support throughout your shopping journey.",
		},
		{
			icon: Heart,
			title: "Sustainable Fashion",
			description:
				"We believe in responsible fashion that respects both people and planet, supporting ethical manufacturing practices.",
		},
	];

	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<section className="relative py-20 bg-rose-300/10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-t from-orange-200/10 to-transparent"></div>
				<div className="absolute top-20 left-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
				<div className="max-sm:hidden absolute bottom-10 right-10 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl"></div>

				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: "easeOut" }}
						className="max-w-7xl mx-auto text-center"
					>
						<motion.p
							className="text-xl text-black/70 leading-relaxed mb-4 max-w-3xl mx-auto font-light"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							Nigerian elegance <br className="hidden max-sm:block" /> meets global sophistication
						</motion.p>

						<motion.h1
							className="text-4xl md:text-[7.5rem] font-serif font-medium mb-12 leading-[1] tracking-tight"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 1.2, delay: 0.2 }}
						>
							<span className="block text-black drop-shadow-2xl max-sm:mb-4">SOPHISTICATED</span>
							<span className="block text-black drop-shadow-2xl">CONGLOMERATE</span>
						</motion.h1>
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.8 }}
							className="flex items-center justify-center gap-3 text-primary-700"
						>
							<Sparkles className="w-9 h-9" />
							<span className="text-2xl tracking-wide">~Dash~</span>
							<Sparkles className="w-9 h-9" />
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Mission & Vision Section */}
			<section className="py-24 bg-primary-950 text-white">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
						{/* Mission */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="space-y-8"
						>
							<div className="flex items-center gap-6 mb-8">
								<div className="w-20 h-20 bg-primary-400 rounded-full flex items-center justify-center">
									<Target className="w-10 h-10 text-primary-950" />
								</div>
								<h2 className="text-6xl md:text-8xl font-serif font-black text-primary-200 tracking-tight">
									MISSION
								</h2>
							</div>
							<p className="text-2xl text-primary-100/90 leading-relaxed font-light">
								To democratize luxury fashion across Nigeria and West Africa by making premium,
								ethically-sourced clothing accessible to the modern African consumer.
							</p>
							<p className="text-lg text-primary-200/70 leading-relaxed">
								We bridge the gap between international fashion trends and local aesthetic preferences,
								ensuring every piece tells a story of quality, culture, and contemporary style.
							</p>
							<div className="pt-6">
								<div className="flex items-start mb-5">
									<div className="w-4 h-4 rounded-full bg-primary-400 mt-2 mr-5"></div>
									<p className="text-primary-200/80 text-lg">
										Curate premium collections from trusted global partners
									</p>
								</div>
								<div className="flex items-start mb-5">
									<div className="w-4 h-4 rounded-full bg-primary-400 mt-2 mr-5"></div>
									<p className="text-primary-200/80 text-lg">
										Support local artisans and sustainable fashion practices
									</p>
								</div>
								<div className="flex items-start">
									<div className="w-4 h-4 rounded-full bg-primary-400 mt-2 mr-5"></div>
									<p className="text-primary-200/80 text-lg">
										Deliver exceptional customer experiences at every touchpoint
									</p>
								</div>
							</div>
						</motion.div>

						{/* Vision */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="space-y-8"
						>
							<div className="flex items-center gap-6 mb-8">
								<div className="w-20 h-20 bg-primary-400 rounded-full flex items-center justify-center">
									<Eye className="w-10 h-10 text-primary-950" />
								</div>
								<h2 className="text-6xl md:text-8xl font-serif font-black text-primary-200 tracking-tight">
									VISION
								</h2>
							</div>
							<p className="text-2xl text-primary-100/90 leading-relaxed font-light">
								To become Africa's leading luxury fashion destination, known for uncompromising quality,
								cultural authenticity, and innovative customer experiences.
							</p>
							<p className="text-lg text-primary-200/70 leading-relaxed">
								We envision a future where African fashion consumers have seamless access to world-class
								luxury goods, while local craftsmanship and cultural heritage are celebrated globally.
							</p>
							<div className="bg-primary-900/40 p-8 rounded-2xl border border-primary-800">
								<h3 className="text-3xl font-serif font-bold text-primary-200 mb-6">Our Impact Goals</h3>
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-primary-300 text-lg">Customer Satisfaction</span>
										<span className="text-white font-bold text-xl">98%+</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-primary-300 text-lg">Sustainable Partners</span>
										<span className="text-white font-bold text-xl">100%</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-primary-300 text-lg">Local Artisan Support</span>
										<span className="text-white font-bold text-xl">Growing</span>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Story Section - Redesigned */}
			<section className="py-24 bg-white relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute top-0 left-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-300/15 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/4 w-6 h-6 bg-primary-400 rounded-full opacity-20"></div>
				<div className="absolute top-1/3 right-1/3 w-4 h-4 bg-rose-400 rounded-full opacity-30"></div>
				<div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-orange-400 rounded-full opacity-15"></div>

				<div className="container mx-auto px-4 relative z-10">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="font-serif"
						>
							<h2 className="text-6xl md:text-9xl font-serif font-light text-primary-950 mb-8 leading-tight tracking-tight">
								OUR LEGACY
							</h2>
							<div className=" text-primary-900 lg:pr-14">
								<p className="text-2xl font-light leading-[1.4]">
									We craft fashion with passion, precision, and purpose—selecting only the finest pieces that
									embody style, authenticity, and cultural pride.
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="relative flex gap-3"
						>
							<div className="absolute -top-4 -left-4 w-full max-w-[500px] h-full bg-gradient-to-br from-primary-200/30 to-rose-200/30 rounded-3xl transform rotate-2"></div>
							<img
								src={formalAttire}
								alt="Fashion legacy"
								className="relative z-10 rounded-3xl object-cover h-[500px] w-full max-w-60 shadow-2xl"
							/>
							<img
								src={formalAttire}
								alt="Fashion legacy"
								className="relative z-10 rounded-3xl object-cover h-[500px] w-full max-w-60 shadow-2xl"
							/>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Values Section - Completely Redesigned */}
			<section className="py-24 bg-gradient-to-br from-primary-50 to-rose-50/30 relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute top-10 right-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl"></div>

				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<h2 className="text-6xl md:text-8xl font-serif font-medium text-primary-900 mb-6 leading-tight tracking-tight">
							CORE VALUES
						</h2>
						<p className="text-xl text-primary-800 max-w-3xl mx-auto font-light">
							The principles that define our commitment to excellence
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
						{values.map((value, index) => (
							<motion.div
								key={value.title}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.7, delay: index * 0.15 }}
								viewport={{ once: true }}
								className="group relative shadow-lg"
							>
								{/* Border effect */}
								<div className="absolute inset-0 bg-gradient-to-br from-primary-200/40 via-transparent to-rose-200/40 rounded-3xl p-0.5">
									<div className="w-full h-full bg-white/60 rounded-3xl"></div>
								</div>

								{/* Content */}
								<div className="relative z-10 p-10 group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
									<div className="flex items-start gap-6 mb-6">
										<div className="w-14 h-14 bg-primary-200/70 rounded-2xl border-3 border-primary-300 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
											<value.icon className="w-6 h-6 text-primary-600" />
										</div>
										<div className="flex-1">
											<h3 className="text-2xl font-serif font-semibold text-primary-900 mb-2 group-hover:text-primary-800 transition-colors">
												{value.title}
											</h3>
											<div className="w-20 h-[2px] bg-gradient-to-r from-primary-200 to-rose-300 rounded-full"></div>
										</div>
									</div>
									<p className="text-primary-700 leading-relaxed text-lg font-light">{value.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section - Completely Redesigned */}
			<section className="py-20 bg-primary-950 text-white relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full"></div>
				<div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary-400/30 rounded-full"></div>
				<div className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-rose-400/20 rounded-full"></div>

				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center max-w-5xl mx-auto"
					>
						<div className="mb-8">
							<Sparkles className="w-16 h-16 text-rose-400/10 mx-auto mb-6" />
							<h2 className="text-5xl text-primary-100 md:text-8xl font-serif font-black mb-8 leading-tight tracking-tight">
								Unlock Your <br className="hidden md:block" />
								Creative Persona
							</h2>
							<p className="text-xl md:text-2xl text-primary-100 mb-16 font-light leading-relaxed max-w-3xl mx-auto">
								Join thousands trusting us to deliver exceptional experiences
								<span className="hidden sm:inline-block">, elegance and sophistication</span>
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
							<motion.a
								href="/products"
								className="group relative inline-flex items-center px-12 py-4 overflow-hidden rounded-full bg-primary-100 text-primary-900 font-semibold text-lg transition-all duration-300 hover:bg-primary-50"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<span className="relative z-10 flex items-center">
									Explore Collection
									<ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
								</span>
								<div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-rose-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
							</motion.a>

							<motion.a
								href="/support"
								className="group relative inline-flex items-center px-12 py-4 overflow-hidden rounded-full border-2 border-white/30 text-primary-100 font-semibold text-lg backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<span className="relative z-10">Connect With Us</span>
								<div className="absolute inset-0 bg-gradient-to-r from-white/5 to-primary-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
							</motion.a>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
