import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Clock, Lock, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Paystack from "@paystack/inline-js";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { useToastUtils } from "@/services/toast";
import { privateLinkService, ResolvedPrivateLink, CollectionProduct } from "@/services/privateLinkService";
import { paymentService, OrderQuote, QuoteItemInput } from "@/services/paymentService";
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

type CartLine = QuoteItemInput;

const lineKey = (line: CartLine) => `${line.productId}|${line.size || ""}|${line.color || ""}`;
// Private cart is scoped to this link so it never mixes with the public cart
const cartStorageKey = (token: string) => `dashng-private-cart:${token.slice(0, 16)}`;

// Unlisted private collection: /p/:token (browse, add to a private cart, guest checkout)
const PrivateLinkPage = () => {
	useNoIndex();
	const { token = "" } = useParams();
	const { showSuccessToast, showErrorToast } = useToastUtils();

	const [link, setLink] = useState<ResolvedPrivateLink | null>(null);
	const [invalid, setInvalid] = useState(false);
	const [loading, setLoading] = useState(true);
	const [now, setNow] = useState(Date.now());
	const [cart, setCart] = useState<CartLine[]>(() => {
		try {
			return JSON.parse(localStorage.getItem(cartStorageKey(token)) || "[]");
		} catch {
			return [];
		}
	});
	const [quote, setQuote] = useState<OrderQuote | null>(null);
	const [quoteError, setQuoteError] = useState("");
	const [view, setView] = useState<"shop" | "checkout">("shop");
	const [cartOpen, setCartOpen] = useState(false);
	const [viewing, setViewing] = useState<CollectionProduct | null>(null);
	const [activeImage, setActiveImage] = useState(0);
	const [choice, setChoice] = useState<{ size?: string; color?: string; qty: number }>({ qty: 1 });
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
				if (!cancelled) setLink(resolved);
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

	const products = useMemo(() => link?.products || [], [link]);
	const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

	// Drop cart lines for products no longer in the collection
	useEffect(() => {
		if (!link) return;
		setCart((prev) => prev.filter((line) => productById.has(line.productId)));
	}, [link, productById]);

	useEffect(() => {
		localStorage.setItem(cartStorageKey(token), JSON.stringify(cart));
	}, [cart, token]);

	// Server quote is the source of truth for totals, options and stock
	useEffect(() => {
		if (!link || cart.length === 0) {
			setQuote(null);
			setQuoteError("");
			return;
		}
		let cancelled = false;
		paymentService
			.getQuote({ privateLinkToken: token, items: cart })
			.then((q) => {
				if (!cancelled) {
					setQuote(q);
					setQuoteError("");
				}
			})
			.catch((error: any) => {
				if (!cancelled) {
					setQuote(null);
					setQuoteError(error.message || "Some items in your cart are no longer available");
				}
			});
		return () => {
			cancelled = true;
		};
	}, [cart, link, token]);

	const remaining = link ? new Date(link.expiresAt).getTime() - now : 0;
	const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
	const qtyInCart = (productId: string) =>
		cart.filter((line) => line.productId === productId).reduce((sum, line) => sum + line.quantity, 0);

	const openProduct = (product: CollectionProduct) => {
		setActiveImage(0);
		setChoice({ size: product.sizes[0], color: product.colors[0], qty: 1 });
		setViewing(product);
	};

	const addToCart = () => {
		if (!viewing) return;
		if (viewing.sizes.length && !choice.size) return showErrorToast("Please choose a size");
		if (viewing.colors.length && !choice.color) return showErrorToast("Please choose a colour");
		const available = viewing.maxQuantity - qtyInCart(viewing.id);
		if (choice.qty > available) {
			return showErrorToast(available > 0 ? `Only ${available} more available` : "No more stock available");
		}
		const line: CartLine = {
			productId: viewing.id,
			size: viewing.sizes.length ? choice.size : undefined,
			color: viewing.colors.length ? choice.color : undefined,
			quantity: choice.qty,
		};
		setCart((prev) => {
			const existing = prev.find((l) => lineKey(l) === lineKey(line));
			return existing
				? prev.map((l) => (lineKey(l) === lineKey(line) ? { ...l, quantity: l.quantity + line.quantity } : l))
				: [...prev, line];
		});
		setViewing(null);
		showSuccessToast("Added to cart");
	};

	const changeQty = (key: string, delta: number) =>
		setCart((prev) =>
			prev
				.map((line) => {
					if (lineKey(line) !== key) return line;
					const max = productById.get(line.productId)?.maxQuantity ?? line.quantity;
					const others = qtyInCart(line.productId) - line.quantity;
					return { ...line, quantity: Math.min(Math.max(0, line.quantity + delta), Math.max(0, max - others)) };
				})
				.filter((line) => line.quantity > 0),
		);

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

		if (cart.length === 0) return;

		setIsProcessing(true);
		let freshQuote: OrderQuote;
		const items = cart;
		try {
			// Re-quote right before paying; also re-checks that the link is still valid
			freshQuote = await paymentService.getQuote({ privateLinkToken: token, items });
			setQuote(freshQuote);
		} catch (error: any) {
			setIsProcessing(false);
			showErrorToast(error.message || "Your cart needs attention before paying");
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
							items,
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
						setCart([]);
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

	if (invalid || !link || remaining <= 0) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
				<div className="text-center max-w-md">
					<Clock className="w-10 h-10 text-neutral-400 mx-auto mb-4" />
					<h1 className="text-2xl font-serif font-bold text-neutral-900 mb-3">This link is no longer available</h1>
					<p className="text-neutral-600 mb-6">
						The private collection may have expired, been used, or been withdrawn. Please contact the person who
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

	const cartLines = cart.map((line) => ({ line, product: productById.get(line.productId) }));
	const summary = (
		<div className="space-y-2 text-sm">
			<div className="flex justify-between">
				<span className="text-neutral-600">Subtotal</span>
				<span className="font-medium">{quote ? formatPrice(quote.subtotal) : "—"}</span>
			</div>
			<div className="flex justify-between">
				<span className="text-neutral-600">Shipping</span>
				<span className="font-medium">
					{!quote ? "—" : quote.shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(quote.shipping)}
				</span>
			</div>
			<div className="flex justify-between text-base font-semibold pt-2 border-t border-neutral-200">
				<span>Total</span>
				<span>{quote ? formatPrice(quote.total) : "—"}</span>
			</div>
			{quoteError && <p className="text-sm text-red-600">{quoteError}</p>}
		</div>
	);

	const cartList = (
		<div className="divide-y divide-neutral-100">
			{cartLines.map(({ line, product }) => (
				<div key={lineKey(line)} className="flex items-center gap-3 py-3 min-w-0">
					<div className="w-14 h-14 bg-neutral-100 rounded-md overflow-hidden shrink-0">
						{product?.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-neutral-900 truncate">{product?.name}</p>
						<p className="text-xs text-neutral-500 truncate">{[line.size, line.color].filter(Boolean).join(" · ")}</p>
						<p className="text-xs text-neutral-700">{product ? formatPrice(product.priceNGN * line.quantity) : ""}</p>
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<button type="button" onClick={() => changeQty(lineKey(line), -1)} className="p-1.5 border border-neutral-300 rounded-md" aria-label="Decrease">
							{line.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
						</button>
						<span className="w-7 text-center text-sm">{line.quantity}</span>
						<button type="button" onClick={() => changeQty(lineKey(line), 1)} className="p-1.5 border border-neutral-300 rounded-md" aria-label="Increase">
							<Plus className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<div className="min-h-screen bg-neutral-50">
			<div className="sticky top-0 z-30 bg-neutral-900 text-white">
				<div className="container py-2 flex items-center justify-between gap-3 text-sm">
					<span className="flex items-center gap-2 min-w-0">
						<Lock className="w-4 h-4 shrink-0" />
						<span className="truncate">Private collection · expires in {formatRemaining(remaining)}</span>
					</span>
					<button type="button" onClick={() => setCartOpen(true)} className="relative flex items-center gap-1.5 shrink-0" aria-label="Open cart">
						<ShoppingBag className="w-5 h-5" />
						<span className="hidden sm:inline">Cart</span>
						{cartCount > 0 && (
							<span className="min-w-5 h-5 px-1 rounded-full bg-white text-neutral-900 text-xs font-semibold flex items-center justify-center">
								{cartCount}
							</span>
						)}
					</button>
				</div>
			</div>

			<div className="container py-8">
				<div className="mb-6">
					<p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Private sale</p>
					<h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">{link.title}</h1>
					{link.note && <p className="text-neutral-600 mt-2">{link.note}</p>}
				</div>

				{view === "shop" ? (
					products.length === 0 ? (
						<p className="text-neutral-600">No items are available in this collection right now.</p>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
							{products.map((product) => (
								<button type="button" key={product.id} onClick={() => openProduct(product)} className="text-left group min-w-0">
									<div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-2 relative">
										{product.images[0] && (
											<img
												src={product.images[0]}
												alt={product.name}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										)}
										{!product.inStock && (
											<span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-xs text-neutral-700">Sold out</span>
										)}
									</div>
									{product.brand && <p className="text-xs uppercase tracking-wider text-neutral-500 truncate">{product.brand}</p>}
									<p className="text-sm font-medium text-neutral-900 line-clamp-2">{product.name}</p>
									<p className="text-sm text-neutral-700 mt-0.5">
										{formatPrice(product.priceNGN)}
										{product.originalPriceNGN && product.originalPriceNGN > product.priceNGN ? (
											<span className="ml-2 text-xs text-neutral-400 line-through">{formatPrice(product.originalPriceNGN)}</span>
										) : null}
									</p>
								</button>
							))}
						</div>
					)
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
							<div className="flex items-center justify-between gap-3 mb-4">
								<h2 className="text-lg font-serif font-semibold text-neutral-900">Your details</h2>
								<button type="button" onClick={() => setView("shop")} className="text-sm text-neutral-600 hover:text-neutral-900">
									← Continue shopping
								</button>
							</div>
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
						<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6 h-fit lg:sticky lg:top-16">
							<h3 className="text-lg font-serif font-semibold text-neutral-900 mb-2">Order Summary</h3>
							<div className="max-h-72 overflow-y-auto mb-4">{cartList}</div>
							{summary}
							<Button
								className="w-full mt-4"
								size="lg"
								onClick={handlePay}
								isLoading={isProcessing}
								disabled={isProcessing || !quote || cart.length === 0}
							>
								{quote ? `Pay ${formatPrice(quote.total)}` : "Pay"}
							</Button>
							<div className="mt-3 text-xs text-neutral-500 flex items-center justify-center">
								<Lock className="w-3 h-3 mr-1" /> Secure payment via Paystack
							</div>
						</div>
					</div>
				)}
			</div>

			<Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.name} size="lg">
				{viewing && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3 min-w-0">
							<div className="aspect-square bg-neutral-100 rounded-md overflow-hidden">
								{viewing.images[activeImage] && (
									<img src={viewing.images[activeImage]} alt={viewing.name} className="w-full h-full object-cover" />
								)}
							</div>
							{viewing.images.length > 1 && (
								<div className="flex gap-2 overflow-x-auto">
									{viewing.images.map((image, i) => (
										<button
											type="button"
											key={image + i}
											onClick={() => setActiveImage(i)}
											className={`w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 ${i === activeImage ? "border-neutral-900" : "border-transparent"}`}
										>
											<img src={image} alt="" className="w-full h-full object-cover" />
										</button>
									))}
								</div>
							)}
						</div>
						<div className="space-y-4 text-sm min-w-0">
							<div>
								<p className="text-xs uppercase tracking-wider text-neutral-500">
									{[viewing.brand, viewing.category, viewing.subcategory].filter(Boolean).join(" · ")}
								</p>
								<p className="text-xl font-semibold text-neutral-900 mt-1">{formatPrice(viewing.priceNGN)}</p>
							</div>
							{viewing.description && <p className="text-neutral-700 whitespace-pre-line">{viewing.description}</p>}
							{viewing.features?.length ? (
								<ul className="list-disc pl-5 space-y-1 text-neutral-700">
									{viewing.features.map((feature) => (
										<li key={feature}>{feature}</li>
									))}
								</ul>
							) : null}
							{(
								[
									["size", "Size", viewing.sizes],
									["color", "Colour", viewing.colors],
								] as const
							).map(([key, label, options]) =>
								options.length ? (
									<div key={key}>
										<p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">{label}</p>
										<div className="flex flex-wrap gap-2">
											{options.map((option) => (
												<button
													type="button"
													key={option}
													onClick={() => setChoice((c) => ({ ...c, [key]: option }))}
													className={`px-3 py-1.5 rounded-md border text-sm ${
														choice[key] === option
															? "bg-neutral-900 text-white border-neutral-900"
															: "bg-white border-neutral-300 text-neutral-800 hover:border-neutral-500"
													}`}
												>
													{option}
												</button>
											))}
										</div>
									</div>
								) : null,
							)}
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">Quantity</p>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setChoice((c) => ({ ...c, qty: Math.max(1, c.qty - 1) }))}
										className="p-2 border border-neutral-300 rounded-md"
										aria-label="Decrease quantity"
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="w-10 text-center">{choice.qty}</span>
									<button
										type="button"
										onClick={() =>
											setChoice((c) => ({ ...c, qty: Math.min(Math.max(1, viewing.maxQuantity - qtyInCart(viewing.id)), c.qty + 1) }))
										}
										className="p-2 border border-neutral-300 rounded-md"
										aria-label="Increase quantity"
									>
										<Plus className="w-4 h-4" />
									</button>
									<span className="text-xs text-neutral-500">{viewing.inStock ? `${viewing.maxQuantity} available` : "Sold out"}</span>
								</div>
							</div>
							<Button className="w-full" onClick={addToCart} disabled={!viewing.inStock}>
								{viewing.inStock ? "Add to cart" : "Sold out"}
							</Button>
						</div>
					</div>
				)}
			</Modal>

			<Modal
				isOpen={cartOpen}
				onClose={() => setCartOpen(false)}
				title={`Your cart (${cartCount})`}
				size="md"
				footer={
					cart.length > 0 ? (
						<div className="space-y-3">
							{summary}
							<Button
								className="w-full"
								disabled={!quote}
								onClick={() => {
									setCartOpen(false);
									setView("checkout");
									window.scrollTo({ top: 0 });
								}}
							>
								Checkout
							</Button>
						</div>
					) : undefined
				}
			>
				{cart.length === 0 ? <p className="text-sm text-neutral-600">Your cart is empty.</p> : cartList}
			</Modal>
		</div>
	);
};

export default PrivateLinkPage;
