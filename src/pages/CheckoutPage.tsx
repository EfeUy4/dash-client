import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, MapPin, User, Mail, Phone, Lock } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToastUtils } from "@/services/toast";
import Paystack from "@paystack/inline-js";

// Import Paystack
declare global {
	interface Window {
		PaystackPop: any;
	}
}

const CheckoutPage = () => {
	const { items, total, clearCart } = useCart();
	const { user, isAuthenticated } = useAuth();
	const { showSuccessToast, showErrorToast } = useToastUtils();
	const navigate = useNavigate();

	const [step, setStep] = useState(1); // 1: Info, 2: Confirmation
	const [isProcessing, setIsProcessing] = useState(false);
	const [orderData, setOrderData] = useState<any>(null);
	const [formData, setFormData] = useState({
		// Customer Info
		email: user?.email || "",
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		phone: "",

		// Shipping Address
		address: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Nigeria",
	});

	const shipping = total > 50000 ? 0 : 0;
	const finalTotal = total + shipping;

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const validateStep1 = () => {
		return (
			formData.email &&
			formData.firstName &&
			formData.lastName &&
			formData.address &&
			formData.city &&
			formData.state &&
			formData.zipCode &&
			formData.phone
		);
	};

	const handlePlaceOrder = async () => {
		if (!validateStep1()) {
			showErrorToast("Please fill in all required fields");
			return;
		}

		setIsProcessing(true);

		try {
			// Initialize Paystack popup
			const popup = new Paystack();

			popup.checkout({
				key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
				email: formData.email,
				amount: Math.round(finalTotal * 100), // Convert to kobo
				currency: "NGN",
				phone: formData.phone,
				channels: ["card", "ussd", "qr", "eft", "mobile_money", "bank_transfer"],

				onSuccess: async (response: any) => {
					try {
						console.log("Payment successful:", response);

						// First, verify the payment with Paystack
						const verificationResponse = await fetch(
							`${import.meta.env.VITE_API_URL}/orders/verify-payment`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									reference: response.reference,
									expectedAmount: Math.round(finalTotal * 100), // Amount in kobo
								}),
							},
						);

						if (!verificationResponse.ok) {
							const verificationError = await verificationResponse.json();
							throw new Error(verificationError.message || "Payment verification failed");
						}

						const verificationData = await verificationResponse.json();

						// Only create order if payment is verified
						if (verificationData.verified) {
							const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
                body: JSON.stringify({
                  userId: user?.id || null,
									items: items.map((item) => ({
										productId: item.id,
										quantity: item.quantity,
										size: item.size,
										color: item.color,
									})),
									shippingAddress: {
										firstName: formData.firstName,
										lastName: formData.lastName,
										email: formData.email,
										phone: formData.phone,
										street: formData.address,
										city: formData.city,
										state: formData.state,
										zipCode: formData.zipCode,
										country: formData.country,
									},
									paymentMethod: "paystack",
									paymentDetails: {
										reference: response.reference,
										status: response.status,
										trans: response.trans,
										transaction: response.transaction,
										trxref: response.trxref,
										verificationData: verificationData.data,
									},
								}),
							});

							if (!orderResponse.ok) {
								const errorData = await orderResponse.json();
								throw new Error(errorData.message || "Failed to create order");
							}

							const order = await orderResponse.json();
							setOrderData(order);

							// Clear cart and show success
							clearCart();
							showSuccessToast("Order placed successfully! Thank you for your purchase.");
							setStep(2);
						} else {
							throw new Error("Payment verification failed");
						}
					} catch (error: any) {
						console.error("Order creation failed:", error);
						showErrorToast(
							`Failed to process order: ${error.message}. Please contact support if payment was deducted.`,
						);
					} finally {
						setIsProcessing(false);
					}
				},

				onLoad: (response: any) => {
					console.log("Paystack loaded:", response);
				},

				onCancel: () => {
					console.log("Payment cancelled");
					showErrorToast("Payment was cancelled");
					setIsProcessing(false);
				},

				onError: (error: any) => {
					console.error("Payment error:", error);
					showErrorToast("Payment failed. Please try again.");
					setIsProcessing(false);
				},
			});
		} catch (error) {
			console.error("Payment initialization failed:", error);
			showErrorToast("Failed to initialize payment. Please try again.");
			setIsProcessing(false);
		}
	};

	// Redirect if cart is empty and not on confirmation step
	if (items.length === 0 && step !== 2) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-serif font-bold text-neutral-900 mb-4">Your cart is empty</h1>
					<p className="text-neutral-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
					<Link to="/products" className="btn-primary">
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	// Confirmation Step
	if (step === 2) {
		return (
			<div className="min-h-screen bg-neutral-50">
				<div className="container py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="max-w-2xl mx-auto text-center"
					>
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Check className="w-8 h-8 text-green-600" />
						</div>

						<h1 className="text-3xl font-serif font-bold text-neutral-900 mb-4">Order Confirmed!</h1>

						<p className="text-lg text-neutral-600 mb-2">
							Thank you for your purchase, {formData.firstName}!
						</p>

						<p className="text-neutral-600 mb-8">
							Your order has been confirmed and will be shipped to {formData.address}, {formData.city}. You'll
							receive a confirmation email shortly.
						</p>

						<div className="bg-white rounded-lg p-6 mb-8 border border-neutral-200">
							<h3 className="font-medium text-neutral-900 mb-4">Order Summary</h3>
							<div className="space-y-2 text-sm">
								{orderData && (
									<div className="flex justify-between">
										<span>Order Number</span>
										<span className="font-medium">{orderData.orderNumber}</span>
									</div>
								)}
								<div className="flex justify-between">
									<span>Order Total</span>
									<span className="font-medium">{formatPrice(finalTotal)}</span>
								</div>
								<div className="flex justify-between">
									<span>Estimated Delivery</span>
									<span className="font-medium">3-5 business days</span>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<Button onClick={() => navigate("/track")} className="w-full sm:w-auto">
								Track Your Order
							</Button>
							<div>
								<Link to="/products" className="text-neutral-600 hover:text-neutral-900 transition-colors">
									Continue Shopping
								</Link>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			<div className="container py-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/cart"
						className="inline-flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-4"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Back to Cart</span>
					</Link>

					<h1 className="text-3xl font-serif font-bold text-neutral-900 mb-2">Checkout</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
						>
							<div className="space-y-6">
								<h2 className="text-xl font-serif font-semibold text-neutral-900">Contact Information</h2>

								{!isAuthenticated && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<p className="text-blue-800 text-sm">
											Already have an account?{" "}
											<Link to="/login" className="font-medium hover:underline">
												Sign in
											</Link>{" "}
											for a faster checkout experience.
										</p>
									</div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="First Name"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										leftIcon={<User className="w-4 h-4 text-neutral-400" />}
										required
									/>
									<Input
										label="Last Name"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										required
									/>
								</div>

								<Input
									label="Email Address"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
									required
								/>

								<Input
									label="Phone Number"
									name="phone"
									type="tel"
									value={formData.phone}
									onChange={handleInputChange}
									leftIcon={<Phone className="w-4 h-4 text-neutral-400" />}
									helperText="Required for order updates and delivery"
									required
								/>

								<div className="border-t border-neutral-200 pt-6">
									<h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
										<MapPin className="w-5 h-5 mr-2 text-neutral-400" />
										Shipping Address
									</h3>

									<div className="space-y-4">
										<Input
											label="Street Address"
											name="address"
											value={formData.address}
											onChange={handleInputChange}
											placeholder="123 Main Street"
											required
										/>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<Input
												label="City"
												name="city"
												value={formData.city}
												onChange={handleInputChange}
												required
											/>
											<Input
												label="State"
												name="state"
												value={formData.state}
												onChange={handleInputChange}
												required
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<Input
												label="ZIP Code"
												name="zipCode"
												value={formData.zipCode}
												onChange={handleInputChange}
												required
											/>
											<Input
												label="Country"
												name="country"
												value={formData.country}
												onChange={handleInputChange}
												disabled
											/>
										</div>
									</div>
								</div>

								{/* Payment Info */}
								<div className="border-t border-neutral-200 pt-6">
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<div className="flex items-center">
											<Lock className="w-5 h-5 text-green-600 mr-2" />
											<div>
												<h4 className="font-medium text-green-800">Secure Payment with Paystack</h4>
												<p className="text-sm text-green-700 mt-1">
													Your payment will be processed securely. We accept cards, bank transfers, and mobile
													money.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Place Order Button */}
							<div className="flex justify-end pt-6 border-t border-neutral-200">
								<Button
									onClick={handlePlaceOrder}
									disabled={!validateStep1() || isProcessing}
									isLoading={isProcessing}
									size="lg"
								>
									{isProcessing ? "Processing..." : `Pay ${formatPrice(finalTotal)}`}
								</Button>
							</div>
						</motion.div>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-24"
						>
							<h3 className="text-lg font-serif font-semibold text-neutral-900 mb-4">Order Summary</h3>

							{/* Items */}
							<div className="space-y-3 mb-4">
								{items.map((item) => (
									<div key={item.id} className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-neutral-100 rounded-md overflow-hidden">
											<img src={item.image} alt={item.name} className="w-full h-full object-cover" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
											<p className="text-xs text-neutral-600">
												{item.size} • {item.color} • Qty {item.quantity}
											</p>
										</div>
										<p className="text-sm font-medium text-neutral-900">
											{formatPrice(item.price * item.quantity)}
										</p>
									</div>
								))}
							</div>

							{/* Totals */}
							<div className="space-y-2 py-4 border-t border-neutral-200">
								<div className="flex justify-between text-sm">
									<span className="text-neutral-600">Subtotal</span>
									<span className="font-medium">{formatPrice(total)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-neutral-600">Shipping</span>
									<span className="font-medium">
										{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
									</span>
								</div>
								{/* <div className="flex justify-between text-sm">
									<span className="text-neutral-600">Tax</span>
									<span className="font-medium">{formatPrice(tax)}</span>
								</div> */}
								<div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-200">
									<span>Total</span>
									<span>{formatPrice(finalTotal)}</span>
								</div>
							</div>

							{/* Security Badge */}
							<div className="mt-4 text-center">
								<div className="inline-flex items-center text-xs text-neutral-500">
									<Lock className="w-3 h-3 mr-1" />
									Your payment information is secure and encrypted
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;
