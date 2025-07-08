import { motion } from "framer-motion";
import { Truck, Shield, Headphones, Award } from "lucide-react";

const FeaturesSection = () => {
	const features = [
		{
			icon: <Truck strokeWidth={1.5} className="w-8 h-8 text-primary-600" />,
			title: "Free Shipping",
			description:
				"Complimentary shipping on orders over ₦150,000. We deliver to all major cities across Nigeria.",
		},
		{
			icon: <Shield strokeWidth={1.5} className="w-8 h-8 text-primary-600" />,
			title: "Secure Payment",
			description:
				"Your transactions are protected, bank-level security. We support multiple payment methods.",
		},
		{
			icon: <Headphones strokeWidth={1.5} className="w-8 h-8 text-primary-600" />,
			title: "24/7 Support",
			description:
				"Our dedicated customer service team is available around the clock to assist with any queries.",
		},
		{
			icon: <Award strokeWidth={1.5} className="w-8 h-8 text-primary-600" />,
			title: "Quality Guarantee",
			description: "Every product undergoes rigorous quality checks ensuring we ship the finest merchandise.",
		},
	];

	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-12 text-center"
				>
					<p className="text-neutral-500">
						We're committed to <br /> providing exceptional experience
					</p>
					<h2 className="text-4xl md:text-9xl font-serif font-bold mb-4">Why Us</h2>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-neutral-100"
						>
							<div className="w-16 h-16 bg-primary-100/50 rounded-full flex items-center justify-center mb-6">
								{feature.icon}
							</div>
							<div className="text-left">
								<h3 className="text-2xl font-serif font-semibold mb-3">{feature.title}</h3>
								<p className="text-neutral-500/90 text-sm text-medium leading-relaxed">
									{feature.description}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturesSection;
