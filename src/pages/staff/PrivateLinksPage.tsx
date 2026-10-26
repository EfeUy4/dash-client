import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Plus, Pencil, Ban, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PrivateLinkFormModal from "@/components/privateLinks/PrivateLinkFormModal";
import { useToastUtils } from "@/services/toast";
import { privateLinkService, PrivateLink, PrivateLinkStatus } from "@/services/privateLinkService";

const STATUS_STYLES: Record<PrivateLinkStatus, string> = {
	active: "bg-green-100 text-green-800",
	expired: "bg-gray-100 text-gray-700",
	revoked: "bg-red-100 text-red-800",
	exhausted: "bg-yellow-100 text-yellow-800",
};

const formatDate = (iso: string) =>
	new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

const creatorName = (link: PrivateLink) =>
	typeof link.createdBy === "object" && link.createdBy ? `${link.createdBy.firstName} ${link.createdBy.lastName}` : "—";

const itemLabel = (item: PrivateLink["items"][number]) =>
	[
		`${typeof item.product === "object" ? item.product.name : "Product"} ×${item.quantity}`,
		item.specMode === "choosable" ? "buyer chooses" : null,
		item.size,
		item.color,
	]
		.filter(Boolean)
		.join(" · ");

const usesLabel = (link: PrivateLink) => `${link.uses}${link.maxUses ? ` / ${link.maxUses}` : ""}`;

// Hidden columns (lg+) are still visible in the card/detail views
const COLUMNS = [
	{ label: "Title", className: "w-[22%]" },
	{ label: "Items", className: "w-[34%]" },
	{ label: "Status", className: "w-[96px]" },
	{ label: "Expires", className: "w-[17%]" },
	{ label: "Uses", className: "hidden lg:table-cell w-[64px]" },
	{ label: "Created by", className: "hidden xl:table-cell w-[14%]" },
	{ label: "", className: "w-[120px]" },
];

// Shared by the admin, salesrep and storekeeper layouts
const PrivateLinksPage = () => {
	const { showSuccessToast, showErrorToast } = useToastUtils();
	const [links, setLinks] = useState<PrivateLink[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<PrivateLinkStatus | "">("");
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<PrivateLink | null>(null);
	const [createdLink, setCreatedLink] = useState<PrivateLink | null>(null);
	const [detail, setDetail] = useState<PrivateLink | null>(null);

	const loadLinks = useCallback(async () => {
		setLoading(true);
		try {
			setLinks(await privateLinkService.list(statusFilter || undefined));
		} catch (error: any) {
			showErrorToast(error.message || "Failed to load private links");
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusFilter]);

	useEffect(() => {
		loadLinks();
	}, [loadLinks]);

	const copyUrl = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			showSuccessToast("Link copied");
		} catch {
			showErrorToast("Could not copy; please copy it manually");
		}
	};

	const LEGACY_TOOLTIP = "Created before re-copy was available";

	const copyExistingLink = async (link: PrivateLink) => {
		try {
			const result = await privateLinkService.getUrl(link.id);
			if (!result.url) {
				showErrorToast(result.legacy ? LEGACY_TOOLTIP : "This link can't be re-shown; revoke it and create a new one");
				return;
			}
			await copyUrl(result.url);
		} catch (error: any) {
			showErrorToast(error.message || "Failed to get link");
		}
	};

	const handleRevoke = async (link: PrivateLink) => {
		if (!window.confirm(`Revoke "${link.title}"? Anyone with the link will lose access immediately.`)) return;
		try {
			await privateLinkService.revoke(link.id);
			showSuccessToast("Link revoked");
			loadLinks();
		} catch (error: any) {
			showErrorToast(error.message || "Failed to revoke link");
		}
	};

	const openDetail = async (link: PrivateLink) => {
		try {
			setDetail(await privateLinkService.get(link.id));
		} catch (error: any) {
			showErrorToast(error.message || "Failed to load link");
		}
	};

	const renderActions = (link: PrivateLink) => (
		<>
			<button
				onClick={() => copyExistingLink(link)}
				disabled={link.recopyable === false}
				className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
				title={link.recopyable === false ? LEGACY_TOOLTIP : "Copy link"}
				aria-label="Copy link"
			>
				<Copy className="w-4 h-4" />
			</button>
			<button onClick={() => openDetail(link)} className="p-1 text-gray-500 hover:text-gray-900" title="Details" aria-label="Details">
				<Eye className="w-4 h-4" />
			</button>
			{link.status !== "revoked" && (
				<>
					<button
						onClick={() => {
							setEditing(link);
							setFormOpen(true);
						}}
						className="p-1 text-gray-500 hover:text-gray-900"
						title="Edit"
						aria-label="Edit"
					>
						<Pencil className="w-4 h-4" />
					</button>
					<button
						onClick={() => handleRevoke(link)}
						className="p-1 text-gray-500 hover:text-red-600"
						title="Revoke"
						aria-label="Revoke"
					>
						<Ban className="w-4 h-4" />
					</button>
				</>
			)}
		</>
	);

	return (
		<div className="space-y-6 min-w-0">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Private Sale Links</h1>
					<p className="text-sm text-gray-600">
						Unlisted, expiring links for custom or by-request items. Copy a link again any time from this list.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as PrivateLinkStatus | "")}
						className="px-3 py-2 border border-gray-300 rounded-md text-sm"
					>
						<option value="">All statuses</option>
						<option value="active">Active</option>
						<option value="expired">Expired</option>
						<option value="exhausted">Used up</option>
						<option value="revoked">Revoked</option>
					</select>
					<Button
						onClick={() => {
							setEditing(null);
							setFormOpen(true);
						}}
					>
						<Plus className="w-4 h-4 mr-1" /> New link
					</Button>
				</div>
			</div>

			{/* Cards below md, table from md up; long text truncates with the full value in a tooltip */}
			<div className="md:hidden space-y-3">
				{loading ? (
					<div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">Loading…</div>
				) : links.length === 0 ? (
					<div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
						No private links yet
					</div>
				) : (
					links.map((link) => (
						<div key={link.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
							<div className="flex items-start justify-between gap-3">
								<p className="text-sm font-medium text-gray-900 truncate min-w-0" title={link.title}>
									{link.title}
								</p>
								<span
									className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[link.status]}`}
								>
									{link.status}
								</span>
							</div>
							<div className="mt-2 space-y-0.5 text-sm text-gray-600 min-w-0">
								{link.items.map((item, i) => (
									<p key={i} className="truncate" title={itemLabel(item)}>
										{itemLabel(item)}
									</p>
								))}
							</div>
							<div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
								<span className="truncate min-w-0" title={creatorName(link)}>
									{formatDate(link.expiresAt)} · {usesLabel(link)} uses · {creatorName(link)}
								</span>
								<div className="shrink-0">{renderActions(link)}</div>
							</div>
						</div>
					))
				)}
			</div>

			<div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<table className="w-full table-fixed">
					<thead className="bg-gray-50">
						<tr>
							{COLUMNS.map((column) => (
								<th
									key={column.label}
									className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className}`}
								>
									{column.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{loading ? (
							<tr>
								<td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-sm text-gray-500">
									Loading…
								</td>
							</tr>
						) : links.length === 0 ? (
							<tr>
								<td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-sm text-gray-500">
									No private links yet
								</td>
							</tr>
						) : (
							links.map((link) => (
								<tr key={link.id} className="hover:bg-gray-50">
									<td className="px-4 py-4 text-sm font-medium text-gray-900 truncate" title={link.title}>
										{link.title}
									</td>
									<td className="px-4 py-4 text-sm text-gray-600">
										{link.items.map((item, i) => (
											<div key={i} className="truncate" title={itemLabel(item)}>
												{itemLabel(item)}
											</div>
										))}
									</td>
									<td className="px-4 py-4">
										<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[link.status]}`}>
											{link.status}
										</span>
									</td>
									<td className="px-4 py-4 text-sm text-gray-600">
										{formatDate(link.expiresAt)}
									</td>
									<td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{usesLabel(link)}</td>
									<td className="hidden xl:table-cell px-4 py-4 text-sm text-gray-600 truncate" title={creatorName(link)}>
										{creatorName(link)}
									</td>
									<td className="px-4 py-4 text-right whitespace-nowrap">{renderActions(link)}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{formOpen && (
				<PrivateLinkFormModal
					isOpen={formOpen}
					link={editing}
					onClose={() => setFormOpen(false)}
					onSaved={(saved) => {
						setFormOpen(false);
						if (!editing && saved.url) setCreatedLink(saved);
						loadLinks();
					}}
				/>
			)}

			{/* The URL is only returned at creation time */}
			<Modal isOpen={!!createdLink} onClose={() => setCreatedLink(null)} title="Private link created">
				{createdLink?.url && (
					<div className="space-y-4">
						<p className="text-sm text-gray-600">
							Copy this link and send it to the customer. You can copy it again later from the Private Links list.
						</p>
						<div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
							<Link2 className="w-4 h-4 text-gray-500 shrink-0" />
							<span className="text-sm break-all flex-1">{createdLink.url}</span>
						</div>
						<div className="flex justify-end gap-3">
							<Button variant="secondary" onClick={() => setCreatedLink(null)}>
								Done
							</Button>
							<Button onClick={() => copyUrl(createdLink.url!)}>
								<Copy className="w-4 h-4 mr-1" /> Copy link
							</Button>
						</div>
					</div>
				)}
			</Modal>

			<Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail?.title} size="lg">
				{detail && (
					<div className="space-y-5 text-sm">
						<div className="grid grid-cols-2 gap-2 text-gray-700">
							<div>Status: {detail.status}</div>
							<div>Expires: {formatDate(detail.expiresAt)}</div>
							<div>
								Uses: {detail.uses}
								{detail.maxUses ? ` / ${detail.maxUses}` : " (unlimited)"}
							</div>
							<div>Created: {formatDate(detail.createdAt)}</div>
						</div>
						{detail.note && <p className="text-gray-600">{detail.note}</p>}
						<div>
							<span title={detail.recopyable === false ? LEGACY_TOOLTIP : undefined}>
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyExistingLink(detail)}
									disabled={detail.recopyable === false}
								>
									<Copy className="w-4 h-4 mr-1" /> Copy link
								</Button>
							</span>
							{detail.recopyable === false && <p className="text-xs text-gray-500 mt-1">{LEGACY_TOOLTIP}</p>}
						</div>
						<div>
							<h4 className="font-medium text-gray-900 mb-2">Orders</h4>
							{detail.orders?.length ? (
								detail.orders.map((order) => (
									<div key={order._id} className="py-1 border-b border-gray-100">
										{order.orderNumber} · {order.status} / {order.paymentStatus}
										{order.notes?.startsWith("NEEDS REVIEW") && (
											<span className="ml-2 text-yellow-700">needs review</span>
										)}
									</div>
								))
							) : (
								<p className="text-gray-500">No orders yet</p>
							)}
						</div>
						<div>
							<h4 className="font-medium text-gray-900 mb-2">Activity</h4>
							<div className="max-h-48 overflow-y-auto">
								{detail.events?.map((event) => (
									<div key={event._id} className="py-1 text-gray-600">
										{formatDate(event.createdAt)} · {event.action.replace(/_/g, " ")}
										{event.actor ? ` by ${event.actor.firstName} ${event.actor.lastName}` : ""}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default PrivateLinksPage;
