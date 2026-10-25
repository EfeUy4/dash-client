import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

interface PrivateLinkFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	link?: PrivateLink | null; // editing when provided
	onSaved: (link: PrivateLink) => void;
}

const DEFAULT_EXPIRY_HOURS = 48;

const productIdOf = (product: PrivateLink["items"][number]["product"]) =>
	typeof product === "string" ? product : product.id || product._id || "";

const toLocalInput = (iso: string) => {
	const date = new Date(iso);
	const offset = date.getTimezoneOffset() * 60000;
	return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const PrivateLinkFormModal = ({ isOpen, onClose, link, onSaved }: PrivateLinkFormModalProps) => {
	const products = useAppSelector(selectAllProducts);
	const { showSuccessToast, showErrorToast } = useToastUtils();
	const isEdit = !!link;

	const [title, setTitle] = useState(link?.title || "");
	const [note, setNote] = useState(link?.note || "");
	const [items, setItems] = useState<PrivateLinkItemInput[]>(
		link
			? link.items.map((item) => ({
					product: productIdOf(item.product),
					size: item.size || "",
					color: item.color || "",
					quantity: item.quantity,
			  }))
			: [{ product: "", size: "", color: "", quantity: 1 }],
	);
	const [expiresInHours, setExpiresInHours] = useState<number>(DEFAULT_EXPIRY_HOURS);
	const [expiresAt, setExpiresAt] = useState(link ? toLocalInput(link.expiresAt) : "");
	const [maxUses, setMaxUses] = useState<string>(link?.maxUses ? String(link.maxUses) : "");
	const [saving, setSaving] = useState(false);

	const activeProducts = useMemo(
		() => [...products].filter((p) => p.isActive).sort((a, b) => a.name.localeCompare(b.name)),
		[products],
	);

	const updateItem = (index: number, changes: Partial<PrivateLinkItemInput>) => {
		setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)));
	};

	const handleSave = async () => {
		if (!title.trim()) {
			showErrorToast("Please enter a title");
			return;
		}
		if (items.some((item) => !item.product || item.quantity < 1)) {
			showErrorToast("Each item needs a product and a quantity of at least 1");
			return;
		}

		const payload: PrivateLinkPayload = {
			title: title.trim(),
			note: note.trim() || undefined,
			items: items.map((item) => ({
				product: item.product,
				size: item.size || undefined,
				color: item.color || undefined,
				quantity: Number(item.quantity),
			})),
			maxUses: maxUses ? Number(maxUses) : null,
		};
		if (isEdit) {
			if (expiresAt && new Date(expiresAt).toISOString() !== new Date(link!.expiresAt).toISOString()) {
				payload.expiresAt = new Date(expiresAt).toISOString();
			}
		} else {
			payload.expiresInHours = Number(expiresInHours) || DEFAULT_EXPIRY_HOURS;
		}

		setSaving(true);
		try {
			const saved = isEdit
				? await privateLinkService.update(link!.id, payload)
				: await privateLinkService.create(payload);
			showSuccessToast(isEdit ? "Private link updated" : "Private link created");
			onSaved(saved);
		} catch (error: any) {
			showErrorToast(error.message || "Failed to save private link");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit private link" : "New private sale link"} size="xl">
			<div className="space-y-5">
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

				<div>
					<div className="flex items-center justify-between mb-2">
						<label className="block text-sm font-medium text-neutral-700">Items (preset for the customer)</label>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setItems((prev) => [...prev, { product: "", size: "", color: "", quantity: 1 }])}
						>
							<Plus className="w-4 h-4 mr-1" /> Add item
						</Button>
					</div>
					<div className="space-y-3">
						{items.map((item, index) => {
							const product = activeProducts.find((p) => p.id === item.product);
							return (
								<div key={index} className="grid grid-cols-12 gap-2 items-center">
									<select
										value={item.product}
										onChange={(e) => updateItem(index, { product: e.target.value, size: "", color: "" })}
										className="col-span-12 sm:col-span-5 px-3 py-2 border border-neutral-300 rounded-md text-sm"
									>
										<option value="">Select product</option>
										{activeProducts.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name} ({p.sku}){p.visibility === "private" ? " · private" : ""}
											</option>
										))}
									</select>
									<select
										value={item.size || ""}
										onChange={(e) => updateItem(index, { size: e.target.value })}
										disabled={!product?.sizes?.length}
										className="col-span-4 sm:col-span-2 px-3 py-2 border border-neutral-300 rounded-md text-sm"
									>
										<option value="">Size</option>
										{product?.sizes?.map((size) => (
											<option key={size} value={size}>
												{size}
											</option>
										))}
									</select>
									<select
										value={item.color || ""}
										onChange={(e) => updateItem(index, { color: e.target.value })}
										disabled={!product?.colors?.length}
										className="col-span-4 sm:col-span-2 px-3 py-2 border border-neutral-300 rounded-md text-sm"
									>
										<option value="">Color</option>
										{product?.colors?.map((color) => (
											<option key={color} value={color}>
												{color}
											</option>
										))}
									</select>
									<input
										type="number"
										min={1}
										value={item.quantity}
										onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
										className="col-span-3 sm:col-span-2 px-3 py-2 border border-neutral-300 rounded-md text-sm"
									/>
									<button
										type="button"
										onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
										disabled={items.length === 1}
										className="col-span-1 text-neutral-400 hover:text-red-600 disabled:opacity-30"
										aria-label="Remove item"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							);
						})}
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{isEdit ? (
						<Input
							label="Expires at"
							type="datetime-local"
							value={expiresAt}
							onChange={(e) => setExpiresAt(e.target.value)}
						/>
					) : (
						<Input
							label="Expires in (hours)"
							type="number"
							min={1}
							value={expiresInHours}
							onChange={(e) => setExpiresInHours(Number(e.target.value))}
							helperText="Default 48 hours"
						/>
					)}
					<Input
						label="Max uses (optional)"
						type="number"
						min={1}
						value={maxUses}
						onChange={(e) => setMaxUses(e.target.value)}
						helperText="Leave empty for unlimited until expiry"
					/>
				</div>

				<div className="flex justify-end gap-3 pt-2">
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave} isLoading={saving}>
						{isEdit ? "Save changes" : "Create link"}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default PrivateLinkFormModal;
