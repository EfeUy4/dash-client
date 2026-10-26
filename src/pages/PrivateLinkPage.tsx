import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronRight, Clock, Lock } from "lucide-react";
import Paystack from "@paystack/inline-js";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
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

type Selection = { size?: string; color?: string };
type LinkItem = ResolvedPrivateLink["items"][number];

// Start each choosable item on its preset (if still allowed) or its first option, so the quote is always valid
const defaultSelections = (link: ResolvedPrivateLink): Selection[] =>
	link.items.map((item) => {
		if (item.specMode !== "choosable") return {};
		const pick = (preset: string | undefined, options: string[] = []) =>
			preset && options.includes(preset) ? preset : options[0];
		return { size: pick(item.size, item.sizeOptions), color: pick(item.color, item.colorOptions) };
	});

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
	const [selections, setSelections] = useState<Selection[]>([]);
	const [viewing, setViewing] = useState<number | null>(null);
	const [activeImage, setActiveImage] = useState(0);
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
				const initialSelections = defaultSelections(resolved);
				const linkQuote = await paymentService.getQuote({ privateLinkToken: token, selections: initialSelections });
				if (!cancelled) {
					setLink(resolved);
					setSelections(initialSelections);
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

	const updateSelection = async (index: number, changes: Selection) => {
		const next = selections.map((selection, i) => (i === index ? { ...selection, ...changes } : selection));
		setSelections(next);
		try {
			setQuote(await paymentService.getQuote({ privateLinkToken: token, selections: next }));
		} catch (error: any) {
			showErrorToast(error.message || "That option isn't available");
		}
	};

	const itemSpec = (item: LinkItem, index: number) => {
		const chosen = item.specMode === "choosable" ? selections[index] || {} : item;
		return [chosen.size, chosen.color, `Qty ${item.quantity}`].filter(Boolean).join(" • ");
	};

	const renderOptions = (item: LinkItem, index: number) => {
		if (item.specMode !== "choosable") return null;
		const groups = [
			{ key: "size" as const, label: "Size", options: item.sizeOptions || [] },
			{ key: "color" as const, label: "Colour", options: item.colorOptions || [] },
		].filter((group) => group.options.length);
		return (
			<div className="space-y-3">
				{groups.map((group) => (
					<div key={group.key}>
						<p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">Choose {group.label}</p>
						<div className="flex flex-wrap gap-2">
							{group.options.map((option) => {
								const selected = selections[index]?.[group.key] === option;
								return (
									<button
										type="button"
										key={option}
										onClick={() => updateSelection(index, { [group.key]: option })}
										className={`px-3 py-1.5 rounded-md border text-sm ${
											selected
												? "bg-neutral-900 text-white border-neutral-900"
												: "bg-white border-neutral-300 text-neutral-800 hover:border-neutral-500"
										}`}
									>
										{option}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		);
	};

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
			freshQuote = await paymentService.getQuote({ privateLinkToken: token, selections });
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
							selections,
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
						<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6 space-y-4">
							{link.items.map((item, index) => (
								<div key={index} className="space-y-3">
									<button
										type="button"
										onClick={() => {
											setActiveImage(0);
											setViewing(index);
										}}
										disabled={!item.product}
										className="w-full flex items-center gap-3 sm:gap-4 text-left group"
									>
										<div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-md overflow-hidden shrink-0">
											{item.product?.images?.[0] && (
												<img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-neutral-900 line-clamp-2 group-hover:underline">
												{item.product?.name || "Unavailable item"}
											</p>
											<p className="text-sm text-neutral-600 line-clamp-2">{itemSpec(item, index)}</p>
											{item.product && <p className="text-xs text-neutral-500">View details</p>}
											{!item.available && <p className="text-sm text-red-600">Currently unavailable</p>}
										</div>
										{item.lineTotalNGN !== undefined && (
											<p className="font-medium text-neutral-900 shrink-0">{formatPrice(item.lineTotalNGN)}</p>
										)}
										{item.product && <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />}
									</button>
									{item.specMode === "choosable" && <div className="sm:pl-24">{renderOptions(item, index)}</div>}
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

			<Modal
				isOpen={viewing !== null}
				onClose={() => setViewing(null)}
				title={viewing !== null ? link.items[viewing]?.product?.name : undefined}
				size="lg"
			>
				{viewing !== null && link.items[viewing]?.product && (() => {
					const item = link.items[viewing];
					const product = item.product!;
					const images = product.images || [];
					return (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-3">
								<div className="aspect-square bg-neutral-100 rounded-md overflow-hidden">
									{images[activeImage] && (
										<img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
									)}
								</div>
								{images.length > 1 && (
									<div className="flex gap-2 overflow-x-auto">
										{images.map((image, i) => (
											<button
												type="button"
												key={image + i}
												onClick={() => setActiveImage(i)}
												className={`w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 ${
													i === activeImage ? "border-neutral-900" : "border-transparent"
												}`}
											>
												<img src={image} alt="" className="w-full h-full object-cover" />
											</button>
										))}
									</div>
								)}
							</div>
							<div className="space-y-4 text-sm">
								<div>
									<p className="text-xs uppercase tracking-wider text-neutral-500">
										{[product.category, product.subcategory].filter(Boolean).join(" · ")}
									</p>
									{item.lineTotalNGN !== undefined && (
										<p className="text-xl font-semibold text-neutral-900 mt-1">{formatPrice(item.lineTotalNGN)}</p>
									)}
									<p className="text-neutral-600 mt-1">{itemSpec(item, viewing)}</p>
								</div>
								{product.description && <p className="text-neutral-700 whitespace-pre-line">{product.description}</p>}
								{product.features?.length ? (
									<ul className="list-disc pl-5 space-y-1 text-neutral-700">
										{product.features.map((feature) => (
											<li key={feature}>{feature}</li>
										))}
									</ul>
								) : null}
								{renderOptions(item, viewing)}
								<Button className="w-full" onClick={() => setViewing(null)}>
									Done
								</Button>
							</div>
						</div>
					);
				})()}
			</Modal>
		</div>
	);
};

export default PrivateLinkPage;
