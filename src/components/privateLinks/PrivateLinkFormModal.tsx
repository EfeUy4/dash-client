import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppSelector } from "@/redux/hooks";
import { selectAllProducts } from "@/redux/selectors/productsSelectors";
import { useToastUtils } from "@/services/toast";
import {
	privateLinkService,
	PrivateLink,
	PrivateLinkItemInput,
	PrivateLinkPayload,
} from "@/services/privateLinkService";
import type { Product } from "@/data/types";

interface PrivateLinkFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	link?: PrivateLink | null; // editing when provided
	onSaved: (link: PrivateLink) => void;
}

type Unit = "seconds" | "minutes" | "hours" | "days";
const UNIT_SECONDS: Record<Unit, number> = { seconds: 1, minutes: 60, hours: 3600, days: 86400 };
const MAX_TTL_SECONDS = 90 * 86400; // server limit

const productIdOf = (product: PrivateLink["items"][number]["product"]) =>
	typeof product === "string" ? product : product.id || product._id || "";

const formatDate = (date: Date) => date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "medium" });

const defaultItemFor = (p: Product): PrivateLinkItemInput => ({
	product: p.id,
	size: p.sizes?.[0] || "",
	color: p.colors?.[0] || "",
	quantity: 1,
	specMode: "locked",
	allowedSizes: [],
	allowedColors: [],
});

const digitsOnly = (value: string) => value.replace(/\D/g, "");

// Text input that only takes digits and can be fully cleared while typing (no stuck "0")
const DigitsInput = ({
	value,
	onChange,
	onBlur,
	placeholder,
	className = "",
	ariaLabel,
}: {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
	ariaLabel?: string;
}) => (
	<input
		type="text"
		inputMode="numeric"
		pattern="[0-9]*"
		value={value}
		placeholder={placeholder}
		aria-label={ariaLabel}
		onChange={(e) => onChange(digitsOnly(e.target.value))}
		onBlur={onBlur}
		className={`px-3 py-2 border border-neutral-300 rounded-md text-sm min-w-0 focus:outline-none focus:ring-2 focus:ring-neutral-400 ${className}`}
	/>
);

const PrivateLinkFormModal = ({ isOpen, onClose, link, onSaved }: PrivateLinkFormModalProps) => {
	const products = useAppSelector(selectAllProducts);
	const { showSuccessToast, showErrorToast } = useToastUtils();
	const isEdit = !!link;

	const [title, setTitle] = useState(link?.title || "");
	const [note, setNote] = useState(link?.note || "");
	// Quantities are kept as strings so the field can be cleared while editing
	const [items, setItems] = useState<Array<PrivateLinkItemInput & { qty: string }>>(
		link
			? link.items.map((item) => ({
					product: productIdOf(item.product),
					size: item.size || "",
					color: item.color || "",
					quantity: item.quantity,
					qty: String(item.quantity),
					specMode: item.specMode || "locked",
					allowedSizes: item.allowedSizes || [],
					allowedColors: item.allowedColors || [],
			  }))
			: [],
	);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [expiryAmount, setExpiryAmount] = useState(isEdit ? "" : "48");
	const [expiryUnit, setExpiryUnit] = useState<Unit>("hours");
	const [maxUses, setMaxUses] = useState<string>(link?.maxUses ? String(link.maxUses) : "");
	const [saving, setSaving] = useState(false);
	const [now, setNow] = useState(Date.now());
	const prefilled = useRef(isEdit);

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	const activeProducts = useMemo(
		() => [...products].filter((p) => p.isActive).sort((a, b) => a.name.localeCompare(b.name)),
		[products],
	);
	const productById = useMemo(() => new Map(activeProducts.map((p) => [p.id, p])), [activeProducts]);
	const privateProducts = useMemo(() => activeProducts.filter((p) => p.visibility === "private"), [activeProducts]);
	// Out-of-stock private products can't be bought, so they are not offered
	const pickablePrivate = useMemo(() => privateProducts.filter((p) => (p.stockCount ?? 0) > 0), [privateProducts]);
	const skippedCount = privateProducts.length - pickablePrivate.length;
	const otherProducts = useMemo(() => activeProducts.filter((p) => p.visibility !== "private"), [activeProducts]);

	// Create form: all private products checked by default (once products have loaded)
	useEffect(() => {
		if (prefilled.current || pickablePrivate.length === 0) return;
		prefilled.current = true;
		setItems((prev) => (prev.length ? prev : pickablePrivate.map((p) => ({ ...defaultItemFor(p), qty: "1" }))));
	}, [pickablePrivate]);

	const selectedIds = useMemo(() => new Set(items.map((item) => item.product)), [items]);
	const selectedPrivateCount = pickablePrivate.filter((p) => selectedIds.has(p.id)).length;
	const filteredPrivate = pickablePrivate.filter((p) =>
		`${p.name} ${p.sku}`.toLowerCase().includes(search.trim().toLowerCase()),
	);

	const addProduct = (p: Product) =>
		setItems((prev) => (prev.some((i) => i.product === p.id) ? prev : [...prev, { ...defaultItemFor(p), qty: "1" }]));
	const removeProduct = (id: string) => {
		setItems((prev) => prev.filter((item) => item.product !== id));
		if (editingId === id) setEditingId(null);
	};
	const toggleProduct = (p: Product) => (selectedIds.has(p.id) ? removeProduct(p.id) : addProduct(p));
	const selectAllPrivate = (list: Product[]) => list.forEach(addProduct);
	const clearPrivate = (list: Product[]) => {
		const ids = new Set(list.map((p) => p.id));
		setItems((prev) => prev.filter((item) => !ids.has(item.product)));
		if (editingId && ids.has(editingId)) setEditingId(null);
	};

	const updateItem = (id: string, changes: Partial<PrivateLinkItemInput & { qty: string }>) =>
		setItems((prev) => prev.map((item) => (item.product === id ? { ...item, ...changes } : item)));

	const toggleOption = (id: string, key: "allowedSizes" | "allowedColors", value: string) =>
		setItems((prev) =>
			prev.map((item) => {
				if (item.product !== id) return item;
				const current = item[key] || [];
				return { ...item, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
			}),
		);

	const expirySeconds = expiryAmount ? Number(expiryAmount) * UNIT_SECONDS[expiryUnit] : 0;
	const computedExpiry = expirySeconds > 0 ? new Date(now + expirySeconds * 1000) : null;
	const expiryTooLong = expirySeconds > MAX_TTL_SECONDS;

	const handleSave = async () => {
		if (!title.trim()) return showErrorToast("Please enter a title");
		if (items.length === 0) return showErrorToast("Select at least one product");
		if (!isEdit && expirySeconds <= 0) return showErrorToast("Set how long the link should last");
		if (expiryTooLong) return showErrorToast("Links can last at most 90 days");

		const payload: PrivateLinkPayload = {
			title: title.trim(),
			note: note.trim() || undefined,
			items: items.map((item) => ({
				product: item.product,
				size: item.size || undefined,
				color: item.color || undefined,
				quantity: Math.max(1, Number(item.qty) || 1),
				specMode: item.specMode || "locked",
				allowedSizes: item.specMode === "choosable" ? item.allowedSizes || [] : [],
				allowedColors: item.specMode === "choosable" ? item.allowedColors || [] : [],
			})),
			maxUses: maxUses && Number(maxUses) > 0 ? Number(maxUses) : null,
		};
		// Server accepts fractional hours, so any number of seconds works (edit: empty = unchanged)
		if (expirySeconds > 0) payload.expiresInHours = expirySeconds / 3600;

		setSaving(true);
		try {
			const saved = isEdit ? await privateLinkService.update(link!.id, payload) : await privateLinkService.create(payload);
			showSuccessToast(isEdit ? "Private link updated" : "Private link created");
			onSaved(saved);
		} catch (error: any) {
			showErrorToast(error.message || "Failed to save private link");
		} finally {
			setSaving(false);
		}
	};

	const editingItem = items.find((item) => item.product === editingId);
	const editingProduct = editingId ? productById.get(editingId) : undefined;

	const footer = (
		<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
			<Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
				Cancel
			</Button>
			<Button onClick={handleSave} isLoading={saving} className="w-full sm:w-auto">
				{isEdit ? "Save changes" : "Create link"}
			</Button>
		</div>
	);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit private link" : "New private sale link"} size="xl" footer={footer}>
			<div className="space-y-5 min-w-0">
				<Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Custom gown for Mrs. A" />

				<div>
					<label className="block text-sm font-medium text-neutral-700 mb-2">Note (shown to the customer)</label>
					<textarea
						value={note}
						onChange={(e) => setNote(e.target.value)}
						rows={2}
						className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
					/>
				</div>

				{/* Products: dropdown checklist of private products + compact selected chips */}
				<div className="min-w-0">
					<label className="block text-sm font-medium text-neutral-700 mb-2">Products</label>
					<button
						type="button"
						onClick={() => setPickerOpen((open) => !open)}
						className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-neutral-300 rounded-md text-sm text-left bg-white"
						aria-expanded={pickerOpen}
					>
						<span className="truncate">
							{pickablePrivate.length === 0
								? "No private products in stock"
								: `${selectedPrivateCount} of ${pickablePrivate.length} private products selected`}
						</span>
						<ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
					</button>
					{skippedCount > 0 && (
						<p className="text-xs text-neutral-500 mt-1">
							{skippedCount} out-of-stock private product{skippedCount === 1 ? "" : "s"} not listed
						</p>
					)}
					{privateProducts.length === 0 && (
						<p className="text-xs text-neutral-500 mt-1">Mark products as private to list them here.</p>
					)}

					{pickerOpen && pickablePrivate.length > 0 && (
						<div className="mt-2 border border-neutral-200 rounded-md bg-white shadow-sm">
							<div className="p-2 border-b border-neutral-200 space-y-2">
								<div className="relative">
									<Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
									<input
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search private products"
										className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded-md text-sm"
									/>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-neutral-500">{filteredPrivate.length} shown</span>
									<span className="flex gap-3">
										<button type="button" onClick={() => selectAllPrivate(filteredPrivate)} className="font-medium text-neutral-700 hover:text-neutral-900">
											Select all
										</button>
										<button type="button" onClick={() => clearPrivate(filteredPrivate)} className="font-medium text-neutral-700 hover:text-red-600">
											Clear
										</button>
									</span>
								</div>
							</div>
							<ul className="max-h-56 overflow-y-auto py-1">
								{filteredPrivate.map((p) => (
									<li key={p.id}>
										<label className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-50 cursor-pointer min-w-0">
											<input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleProduct(p)} className="shrink-0" />
											<span className="truncate" title={p.name}>
												{p.name}
											</span>
											<span className="ml-auto text-xs text-neutral-400 shrink-0">{p.stockCount} in stock</span>
										</label>
									</li>
								))}
								{filteredPrivate.length === 0 && <li className="px-3 py-2 text-sm text-neutral-500">No matches</li>}
							</ul>
						</div>
					)}

					{otherProducts.length > 0 && (
						<select
							value=""
							onChange={(e) => {
								const p = productById.get(e.target.value);
								if (p) addProduct(p);
							}}
							className="mt-2 w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-600"
						>
							<option value="">+ Add a public product…</option>
							{otherProducts
								.filter((p) => !selectedIds.has(p.id))
								.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name} ({p.sku})
									</option>
								))}
						</select>
					)}

					{/* Selected items: fixed-height area, tap a chip to edit its specs */}
					<div className="mt-3">
						<p className="text-xs text-neutral-500 mb-1.5">
							{items.length} item{items.length === 1 ? "" : "s"} in this link · tap one to set size, colour, quantity or buyer choice
						</p>
						<div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5">
							{items.map((item) => {
								const p = productById.get(item.product);
								const name = p?.name || "Unavailable product";
								const spec = [
									`×${item.qty || 1}`,
									item.specMode === "choosable" ? "buyer chooses" : [item.size, item.color].filter(Boolean).join(" · "),
								]
									.filter(Boolean)
									.join(" · ");
								const active = editingId === item.product;
								return (
									<span
										key={item.product}
										className={`inline-flex items-center max-w-full rounded-full border text-xs ${
											active ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-50 border-neutral-300 text-neutral-800"
										}`}
									>
										<button
											type="button"
											onClick={() => setEditingId(active ? null : item.product)}
											className="pl-2.5 pr-1 py-1 truncate min-w-0 text-left"
											title={`${name} ${spec}`}
										>
											<span className="font-medium">{name}</span> <span className="opacity-70">{spec}</span>
										</button>
										<button type="button" onClick={() => removeProduct(item.product)} className="pr-2 pl-0.5 py-1 shrink-0" aria-label={`Remove ${name}`}>
											<X className="w-3 h-3" />
										</button>
									</span>
								);
							})}
						</div>
					</div>

					{editingItem && editingProduct && (
						<div className="mt-3 rounded-md border border-neutral-200 p-3 space-y-3 bg-neutral-50">
							<div className="flex items-center justify-between gap-2">
								<p className="text-sm font-medium text-neutral-900 truncate" title={editingProduct.name}>
									{editingProduct.name}
								</p>
								<button type="button" onClick={() => setEditingId(null)} className="text-xs font-medium text-neutral-600 shrink-0">
									Done
								</button>
							</div>
							<div className="grid grid-cols-3 gap-2">
								<select
									value={editingItem.size || ""}
									onChange={(e) => updateItem(editingItem.product, { size: e.target.value })}
									disabled={!editingProduct.sizes?.length}
									className="px-2 py-2 border border-neutral-300 rounded-md text-sm min-w-0 bg-white"
									aria-label="Size"
								>
									<option value="">Size</option>
									{editingProduct.sizes?.map((size) => (
										<option key={size} value={size}>
											{size}
										</option>
									))}
								</select>
								<select
									value={editingItem.color || ""}
									onChange={(e) => updateItem(editingItem.product, { color: e.target.value })}
									disabled={!editingProduct.colors?.length}
									className="px-2 py-2 border border-neutral-300 rounded-md text-sm min-w-0 bg-white"
									aria-label="Colour"
								>
									<option value="">Colour</option>
									{editingProduct.colors?.map((color) => (
										<option key={color} value={color}>
											{color}
										</option>
									))}
								</select>
								<DigitsInput
									value={editingItem.qty}
									ariaLabel="Quantity"
									placeholder="Qty"
									onChange={(qty) => updateItem(editingItem.product, { qty })}
									onBlur={() => {
										if (!Number(editingItem.qty)) updateItem(editingItem.product, { qty: "1" });
									}}
									className="bg-white"
								/>
							</div>
							{editingProduct.sizes?.length || editingProduct.colors?.length ? (
								<div className="space-y-2">
									<label className="flex items-center gap-2 text-sm text-neutral-700">
										<input
											type="checkbox"
											checked={editingItem.specMode === "choosable"}
											onChange={(e) => updateItem(editingItem.product, { specMode: e.target.checked ? "choosable" : "locked" })}
										/>
										Let buyer choose size/colour
									</label>
									{editingItem.specMode === "choosable" && (
										<div className="space-y-2">
											<p className="text-xs text-neutral-500">Tick allowed options (none = all). Size/colour above is the default.</p>
											{(["allowedSizes", "allowedColors"] as const).map((key) => {
												const options = key === "allowedSizes" ? editingProduct.sizes : editingProduct.colors;
												if (!options?.length) return null;
												return (
													<div key={key} className="flex flex-wrap items-center gap-1.5">
														<span className="text-xs font-medium text-neutral-600 w-14">{key === "allowedSizes" ? "Sizes" : "Colours"}</span>
														{options.map((option) => {
															const selected = editingItem[key]?.includes(option);
															return (
																<button
																	type="button"
																	key={option}
																	onClick={() => toggleOption(editingItem.product, key, option)}
																	className={`px-2 py-0.5 rounded-full border text-xs ${
																		selected ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-300 text-neutral-700"
																	}`}
																>
																	{option}
																</button>
															);
														})}
													</div>
												);
											})}
										</div>
									)}
								</div>
							) : null}
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="min-w-0">
						<label className="block text-sm font-medium text-neutral-700 mb-2">
							{isEdit ? "New expiry (from now)" : "Link lasts for"}
						</label>
						<div className="flex gap-2">
							<DigitsInput
								value={expiryAmount}
								onChange={setExpiryAmount}
								placeholder={isEdit ? "Unchanged" : "48"}
								ariaLabel="Expiry amount"
								className="flex-1"
							/>
							<select
								value={expiryUnit}
								onChange={(e) => setExpiryUnit(e.target.value as Unit)}
								className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
								aria-label="Expiry unit"
							>
								<option value="seconds">seconds</option>
								<option value="minutes">minutes</option>
								<option value="hours">hours</option>
								<option value="days">days</option>
							</select>
						</div>
						<p className={`text-xs mt-1 ${expiryTooLong ? "text-red-600" : "text-neutral-500"}`}>
							{expiryTooLong
								? "Maximum is 90 days"
								: computedExpiry
								? `Expires ${formatDate(computedExpiry)}`
								: isEdit && link
								? `Currently expires ${formatDate(new Date(link.expiresAt))}`
								: "Default 48 hours"}
						</p>
					</div>
					<div className="min-w-0">
						<label className="block text-sm font-medium text-neutral-700 mb-2">Max uses (optional)</label>
						<DigitsInput
							value={maxUses}
							onChange={setMaxUses}
							onBlur={() => {
								if (maxUses && !Number(maxUses)) setMaxUses("");
							}}
							placeholder="Unlimited"
							ariaLabel="Max uses"
							className="w-full"
						/>
						<p className="text-xs mt-1 text-neutral-500">Leave empty for unlimited until expiry</p>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default PrivateLinkFormModal;
