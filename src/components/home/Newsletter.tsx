import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, CheckCircle, Sparkles, Gift, Zap } from "lucide-react";

const Newsletter = () => {
	const [email, setEmail] = useState("");
	const [consent, setConsent] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = () => {
		if (email && consent) {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
				setSubmitted(true);
				setTimeout(() => {
					setSubmitted(false);
					setEmail("");
					setConsent(false);
				}, 3000);
			}, 1500);
		}
	};

	const benefits = [
		{ icon: Sparkles, text: "New collection launches" },
		{ icon: Gift, text: "Exclusive discounts" },
		{ icon: Zap, text: "Flash sale alerts" },
	];

	return (
		<section className="py-20 bg-neutral-50 relative overflow-hidden">
			{/* Simple decorative elements */}
			<motion.div
				className="absolute -top-20 -right-20 w-64 h-64 bg-neutral-200 rounded-full opacity-30"
				animate={{
					y: [0, -15, 0],
					scale: [1, 1.05, 1],
				}}
				transition={{ duration: 6, repeat: Infinity }}
			/>
			<motion.div
				className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-200 rounded-full opacity-20"
				animate={{
					y: [0, 15, 0],
					scale: [1, 1.05, 1],
				}}
				transition={{ duration: 8, repeat: Infinity, delay: 1 }}
			/>

			<div className="container mx-auto px-4 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
				>
					<div className="grid grid-cols-1 md:grid-cols-2">
						{/* Benefits Column */}
						<div className="bg-neutral-900 text-white p-8 flex flex-col justify-center">
							<Mail className="w-12 h-12 mb-6 text-amber-400" strokeWidth={1} />
							<h3 className="text-4xl font-bold mb-4">Stay Updated</h3>
							<p className="text-neutral-300 mb-6">Get notified on products & special offers.</p>
							<ul className="space-y-3">
								{benefits.map((benefit, index) => (
									<motion.li
										key={index}
										initial={{ opacity: 0, x: -20 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.2 + index * 0.1 }}
										className="flex items-center"
									>
										<div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center mr-3">
											<benefit.icon className="w-4 h-4 text-amber-400" />
										</div>
										<span className="text-neutral-200">{benefit.text}</span>
									</motion.li>
								))}
							</ul>
						</div>

						{/* Form Column */}
						<div className="p-8 flex flex-col justify-center">
							{submitted ? (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									className="text-center"
								>
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
										className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
									>
										<CheckCircle className="w-8 h-8 text-green-600" />
									</motion.div>
									<h3 className="text-xl font-bold text-neutral-900 mb-2">You're all set!</h3>
									<p className="text-neutral-600">Check your inbox for confirmation.</p>
								</motion.div>
							) : (
								<div className="space-y-6">
									<div>
										<h2 className="text-2xl sm:text-5xl font-bold text-neutral-900 mb-2">
											Join Our Newsletter
										</h2>
										<p className="text-neutral-600">Get swift updates on products & special offers.</p>
									</div>

									<div className="space-y-4">
										<div>
											<label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
												Email Address
											</label>
											<input
												type="email"
												id="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="your@email.com"
												className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
											/>
										</div>

										<div className="flex items-start">
											<input
												type="checkbox"
												id="consent"
												checked={consent}
												onChange={(e) => setConsent(e.target.checked)}
												className="mt-1 mr-2 text-amber-600"
											/>
											<label htmlFor="consent" className="text-sm text-neutral-600">
												I agree to receive marketing emails. Unsubscribe anytime.
											</label>
										</div>

										<motion.button
											onClick={handleSubmit}
											disabled={!email || !consent || isLoading}
											whileHover={{ scale: !email || !consent ? 1 : 1.02 }}
											whileTap={{ scale: !email || !consent ? 1 : 0.98 }}
											className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center ${
												!email || !consent
													? "bg-neutral-300 cursor-not-allowed"
													: "bg-neutral-900 hover:bg-neutral-800"
											}`}
										>
											{isLoading ? (
												<>
													<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
													Subscribing...
												</>
											) : (
												<>
													Subscribe
													<Send className="ml-2 w-4 h-4" />
												</>
											)}
										</motion.button>
									</div>
								</div>
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Newsletter;
