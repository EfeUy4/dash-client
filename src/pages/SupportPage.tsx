import { useState } from "react";
import { motion } from "framer-motion";
import {
	Mail,
	Phone,
	MapPin,
	Clock,
	Send,
	MessageCircle,
	HelpCircle,
	Truck,
	RotateCcw,
	CreditCard,
	Users,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const SupportPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
		orderNumber: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate form submission
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsSubmitting(false);
		// Reset form
		setFormData({
			name: "",
			email: "",
			subject: "",
			message: "",
			orderNumber: "",
		});
	};

	const contactMethods = [
		{
			icon: Mail,
			title: "Email Support",
			description: "Send us an email and we'll respond within 24 hours",
			contact: "support@dashngshop.com",
			available: "24/7",
		},
		{
			icon: Phone,
			title: "Phone Support",
			description: "Speak directly with our customer service team",
			contact: "+234 800 DASH NGS",
			available: "Mon-Fri, 9AM-6PM WAT",
		},
		{
			icon: MessageCircle,
			title: "Live Chat",
			description: "Get instant help through our live chat system",
			contact: "Available on website",
			available: "Mon-Fri, 9AM-6PM WAT",
		},
	];

	const faqCategories = [
		{
			icon: Truck,
			title: "Shipping & Delivery",
			description: "Track orders, delivery times, and shipping costs",
			faqs: [
				"How long does shipping take?",
				"What are the shipping costs?",
				"How can I track my order?",
				"Do you offer international shipping?",
			],
		},
		{
			icon: RotateCcw,
			title: "Returns & Exchanges",
			description: "Return policy, exchange process, and refunds",
			faqs: [
				"What is your return policy?",
				"How do I return an item?",
				"When will I receive my refund?",
				"Can I exchange for a different size?",
			],
		},
		{
			icon: CreditCard,
			title: "Payment & Billing",
			description: "Payment methods, billing issues, and invoices",
			faqs: [
				"What payment methods do you accept?",
				"Is my payment information secure?",
				"Can I pay in installments?",
				"How do I update my billing address?",
			],
		},
		{
			icon: Users,
			title: "Account & Orders",
			description: "Account management, order history, and profile settings",
			faqs: [
				"How do I create an account?",
				"How can I view my order history?",
				"Can I cancel my order?",
				"How do I update my profile?",
			],
		},
	];

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<section className="bg-gradient-to-br from-primary-50 to-accent-50 py-16">
				<div className="container">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center"
					>
						<h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 mb-6">
							We're Here to Help
						</h1>
						<p className="text-xl text-neutral-600 max-w-2xl mx-auto">
							Have a question or need assistance? Our dedicated support team is ready to help you with
							anything you need for the best shopping experience.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="section-padding">
				<div className="container">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12"
					>
						<h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">Get in Touch</h2>
						<p className="text-neutral-600 max-w-2xl mx-auto">
							Choose the method that works best for you. We're committed to providing exceptional customer
							service across all channels.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						{contactMethods.map((method, index) => (
							<motion.div
								key={method.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
								className="bg-neutral-50 rounded-lg p-6 text-center"
							>
								<div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<method.icon className="w-6 h-6 text-primary-600" />
								</div>
								<h3 className="text-xl font-serif font-semibold text-neutral-900 mb-2">{method.title}</h3>
								<p className="text-neutral-600 text-sm mb-4">{method.description}</p>
								<p className="font-medium text-neutral-900">{method.contact}</p>
								<p className="text-sm text-neutral-500">{method.available}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Contact Form */}
			<section className="section-padding bg-neutral-50">
				<div className="container">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Form */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							viewport={{ once: true }}
						>
							<h2 className="text-3xl font-serif font-bold text-neutral-900 mb-6">Send us a Message</h2>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Full Name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
									/>
									<Input
										label="Email Address"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-neutral-700 mb-2">Subject</label>
										<select
											name="subject"
											value={formData.subject}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
										>
											<option value="">Select a subject</option>
											<option value="order">Order Inquiry</option>
											<option value="shipping">Shipping Question</option>
											<option value="return">Return/Exchange</option>
											<option value="product">Product Information</option>
											<option value="billing">Billing Issue</option>
											<option value="other">Other</option>
										</select>
									</div>
									<Input
										label="Order Number (Optional)"
										name="orderNumber"
										value={formData.orderNumber}
										onChange={handleInputChange}
										placeholder="ORD-123456"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">Message</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleInputChange}
										required
										rows={6}
										className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
										placeholder="Please describe your question or concern in detail..."
									/>
								</div>

								<Button type="submit" isLoading={isSubmitting} className="w-full">
									<Send className="w-4 h-4 mr-2" />
									Send Message
								</Button>
							</form>
						</motion.div>

						{/* Contact Info */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
							className="space-y-8"
						>
							<div>
								<h3 className="text-2xl font-serif font-semibold text-neutral-900 mb-4">Visit Our Store</h3>
								<div className="space-y-4">
									<div className="flex items-start space-x-3">
										<MapPin className="w-5 h-5 text-neutral-400 mt-1" />
										<div>
											<p className="font-medium text-neutral-900">Dash Flagship Store</p>
											<p className="text-neutral-600">123 Luxury Avenue, Victoria Island</p>
											<p className="text-neutral-600">Lagos, Nigeria</p>
										</div>
									</div>

									<div className="flex items-start space-x-3">
										<Clock className="w-5 h-5 text-neutral-400 mt-1" />
										<div>
											<p className="font-medium text-neutral-900">Store Hours</p>
											<p className="text-neutral-600">Monday - Friday: 10AM - 8PM</p>
											<p className="text-neutral-600">Saturday: 10AM - 6PM</p>
											<p className="text-neutral-600">Sunday: 12PM - 5PM</p>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-primary-50 rounded-lg p-6">
								<h4 className="font-semibold text-neutral-900 mb-2">Response Time</h4>
								<p className="text-sm text-neutral-600 mb-4">
									We aim to respond to all inquiries within 24 hours during business days. For urgent matters,
									please call our support line.
								</p>
								<div className="text-sm text-neutral-600">
									<p>
										<strong>Email:</strong> Within 24 hours
									</p>
									<p>
										<strong>Phone:</strong> Immediate assistance
									</p>
									<p>
										<strong>Live Chat:</strong> Within minutes
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="section-padding">
				<div className="container">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12"
					>
						<h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-neutral-600 max-w-2xl mx-auto">
							Find quick answers to common questions. Can't find what you're looking for? Don't hesitate to
							contact us directly.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{faqCategories.map((category, index) => (
							<motion.div
								key={category.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
								className="bg-white rounded-lg border border-neutral-200 p-6"
							>
								<div className="flex items-center space-x-3 mb-4">
									<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
										<category.icon className="w-5 h-5 text-primary-600" />
									</div>
									<div>
										<h3 className="font-semibold text-neutral-900">{category.title}</h3>
										<p className="text-sm text-neutral-600">{category.description}</p>
									</div>
								</div>
								<ul className="space-y-2">
									{category.faqs.map((faq, faqIndex) => (
										<li key={faqIndex} className="flex items-center space-x-2 text-sm text-neutral-600">
											<HelpCircle className="w-3 h-3 text-neutral-400 flex-shrink-0" />
											<span>{faq}</span>
										</li>
									))}
								</ul>
							</motion.div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

export default SupportPage;
