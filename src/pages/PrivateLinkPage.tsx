import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Clock, Lock } from "lucide-react";
import Paystack from "@paystack/inline-js";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToastUtils } from "@/services/toast";
import { privateLinkService, ResolvedPrivateLink } from "@/services/privateLinkService";
import { paymentService, OrderQuote } from "@/services/paymentService";
import { orderService } from "@/services/orderService";

const formatPrice = (price: number) =>
	new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);

const formatRemaining = (ms: number) => {
	if (ms <= 0) return "Expired";
	const totalSeconds = Math.floor(ms / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`;
};

// Keep private links out of search engines
const useNoIndex = () => {
	useEffect(() => {
		const meta = document.createElement("meta");
		meta.name = "robots";
		meta.content = "noindex, nofollow";
		document.head.appendChild(meta);
		return () => {
			document.head.removeChild(meta);
		};
	}, []);
};

// Unlisted page for a private sale link: /p/:token (guest checkout, no login)
const PrivateLinkPage = () => {
	useNoIndex();
	const { token = "" } = useParams();
	const { showSuccessToast, showErrorToast } = useToastUtils();

	const [link, setLink] = useState<ResolvedPrivateLink | null>(null);
	const [quote, setQuote] = useState<OrderQuote | null>(null);
	const [invalid, setInvalid] = useState(false);
	const [loading, setLoading] = useState(true);
	const [now, setNow] = useState(Date.now());
	const [isProcessing, setIsProcessing] = useState(false);
	const [order, setOrder] = useState<any>(null);
	const [formData, setFormData] = useState({
		email: "",
		firstName: "",
		lastName: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Nigeria",
	});

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const resolved = await privateLinkService.resolve(token);
				const linkQuote = await paymentService.getQuote({ privateLinkToken: token });
				if (!cancelled) {
					setLink(resolved);
					setQuote(linkQuote);
				}
			} catch {
				if (!cancelled) setInvalid(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token]);

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	const remaining = link ? new Date(link.expiresAt).getTime() - now : 0;
	const allAvailable = !!link && link.items.every((item) => item.available);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const isFormValid = () =>
		formData.email &&
		formData.firstName &&
		formData.lastName &&
		formData.phone &&
		formData.address &&
		formData.city &&
		formData.state &&
		formData.zipCode;

	const handlePay = async () => {
		if (!isFormValid()) {
			showErrorToast("Please fill in all required fields");
			return;
		}

		setIsProcessing(true);
		let freshQuote: OrderQuote;
		try {
			// Re-quote right before paying; also re-checks that the link is still valid
			freshQuote = await paymentService.getQuote({ privateLinkToken: token });
			setQuote(freshQuote);
		} catch {
			setIsProcessing(false);
			setInvalid(true);
			return;
		}

		try {
			const popup = new Paystack();
			popup.checkout({
				key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
				email: formData.email,
				amount: freshQuote.amountKobo,
				currency: "NGN",
				phone: formData.phone,
				channels: ["card", "ussd", "qr", "eft", "mobile_money", "bank_transfer"],

				onSuccess: async (response: any) => {
					try {
						const verificationData = await paymentService.verifyPayment(response.reference, freshQuote.amountKobo);
						if (!verificationData.verified) {
							throw new Error("Payment verification failed");
						}

						const shippingAddress = {
							firstName: formData.firstName,
							lastName: formData.lastName,
							email: formData.email,
							phone: formData.phone,
							street: formData.address,
							city: formData.city,
							state: formData.state,
							zipCode: formData.zipCode,
							country: formData.country,
						};

						// Items come from the link on the server; none are sent from here
						const created = await orderService.createOrder({
							privateLinkToken: token,
							shippingAddress,
							paymentMethod: "paystack",
							paymentDetails: {
								reference: response.reference,
								status: response.status,
								trans: response.trans,
								transaction: response.transaction,
								trxref: response.trxref,
								verificationData: verificationData.data,
							},
						});
						setOrder(created);
						showSuccessToast("Payment received. Thank you!");
					} catch (error: any) {
						console.error("Private order failed:", error);
						showErrorToast(
							`Failed to process order: ${error.message}. If you were charged, contact support with payment reference ${response.reference}.`,
						);
					} finally {
						setIsProcessing(false);
					}
				},
				onCancel: () => {
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

	if (loading) {
		return <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-neutral-600">Loading…</div>;
	}

	if (invalid || !link || !quote) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
				<div className="text-center max-w-md">
					<Clock className="w-10 h-10 text-neutral-400 mx-auto mb-4" />
					<h1 className="text-2xl font-serif font-bold text-neutral-900 mb-3">This link is no longer available</h1>
					<p className="text-neutral-600 mb-6">
						The private link may have expired, been used, or been withdrawn. Please contact the person who
						sent it to you for a new one.
					</p>
					<Link to="/" className="btn-primary">
						Visit the store
					</Link>
				</div>
			</div>
		);
	}

	if (order) {
		const needsReview = order.status === "pending";
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<Check className="w-8 h-8 text-green-600" />
					</div>
					<h1 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
						{needsReview ? "Order received" : "Order confirmed!"}
					</h1>
					<p className="text-neutral-600 mb-2">
						{needsReview
							? "Your payment was received. Our team will review and confirm your order shortly."
							: `Thank you, ${formData.firstName}! Your order has been placed.`}
					</p>
					<p className="text-neutral-600 mb-6">Order number: {order.orderNumber}</p>
					<Link to="/track-order" className="btn-primary">
						Track your order
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			<div className="container py-10">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
					<div>
						<p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Private sale</p>
						<h1 className="text-3xl font-serif font-bold text-neutral-900">{link.title}</h1>
						{link.note && <p className="text-neutral-600 mt-2">{link.note}</p>}
					</div>
					<div className="inline-flex items-center text-sm text-neutral-700 bg-white border border-neutral-200 rounded-md px-3 py-2">
						<Clock className="w-4 h-4 mr-2" />
						Expires in {formatRemaining(remaining)}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-4">
							{link.items.map((item, index) => (
								<div key={index} className="flex items-center gap-4">
									<div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden shrink-0">
										{item.product?.images?.[0] && (
											<img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-neutral-900">{item.product?.name || "Unavailable item"}</p>
										<p className="text-sm text-neutral-600">
											{[item.size, item.color, `Qty ${item.quantity}`].filter(Boolean).join(" • ")}
										</p>
										{!item.available && <p className="text-sm text-red-600">Currently unavailable</p>}
									</div>
									{item.lineTotalNGN !== undefined && (
										<p className="font-medium text-neutral-900">{formatPrice(item.lineTotalNGN)}</p>
									)}
								</div>
							))}
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
							<h2 className="text-lg font-serif font-semibold text-neutral-900 mb-4">Your details</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Input label="First name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
								<Input label="Last name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
								<Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
								<Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
								<div className="sm:col-span-2">
									<Input label="Address" name="address" value={formData.address} onChange={handleInputChange} required />
								</div>
								<Input label="City" name="city" value={formData.city} onChange={handleInputChange} required />
								<Input label="State" name="state" value={formData.state} onChange={handleInputChange} required />
								<Input label="ZIP code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
								<Input label="Country" name="country" value={formData.country} onChange={handleInputChange} required />
							</div>
						</div>
					</div>

					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-24">
							<h3 className="text-lg font-serif font-semibold text-neutral-900 mb-4">Order Summary</h3>
							<div className="space-y-2 py-4 border-t border-neutral-200 text-sm">
								<div className="flex justify-between">
									<span className="text-neutral-600">Subtotal</span>
									<span className="font-medium">{formatPrice(quote.subtotal)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-neutral-600">Shipping</span>
									<span className="font-medium">
										{quote.shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(quote.shipping)}
									</span>
								</div>
								<div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-200">
									<span>Total</span>
									<span>{formatPrice(quote.total)}</span>
								</div>
							</div>
							<Button
								className="w-full"
								size="lg"
								onClick={handlePay}
								isLoading={isProcessing}
								disabled={isProcessing || remaining <= 0 || !allAvailable}
							>
								{remaining <= 0 ? "Link expired" : `Pay ${formatPrice(quote.total)}`}
							</Button>
							<div className="mt-4 text-center">
								<div className="inline-flex items-center text-xs text-neutral-500">
									<Lock className="w-3 h-3 mr-1" />
									Secure payment via Paystack
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PrivateLinkPage;
