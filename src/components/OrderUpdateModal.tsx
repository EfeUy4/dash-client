import { useState } from "react";
import { X, Save, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle, Info } from "lucide-react";
import { Order } from "@/data/types";

interface OrderUpdateModalProps {
	order: Order;
	isOpen: boolean;
	onClose: () => void;
	onUpdate: (orderId: string, updates: Partial<Order>) => Promise<void>;
	isUpdating?: boolean;
}

const OrderUpdateModal = ({
	order,
	isOpen,
	onClose,
	onUpdate,
	isUpdating = false,
}: OrderUpdateModalProps) => {
	const [formData, setFormData] = useState({
		status: order.status,
		paymentStatus: order.paymentStatus,
		trackingNumber: order.trackingNumber || "",
		estimatedDelivery: order.estimatedDelivery || "",
		notes: order.notes || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		const newErrors: Record<string, string> = {};

		// Validate tracking number for shipped status
		if (formData.status === "shipped" && !formData.trackingNumber.trim()) {
			newErrors.trackingNumber = "Tracking number is required for shipped orders";
		}

		// Validate estimated delivery for shipped status
		if (formData.status === "shipped" && !formData.estimatedDelivery) {
			newErrors.estimatedDelivery = "Estimated delivery date is required for shipped orders";
		}

		// Check if estimated delivery is in the future
		if (formData.estimatedDelivery) {
			const deliveryDate = new Date(formData.estimatedDelivery);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (deliveryDate < today) {
				newErrors.estimatedDelivery = "Estimated delivery date cannot be in the past";
			}
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			return;
		}

		try {
			const updates = {
				...formData,
				updatedAt: new Date().toISOString(),
			};

			await onUpdate(order.id, updates);
			onClose();
		} catch (error) {
			console.error("Failed to update order:", error);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="w-4 h-4" />;
			case "confirmed":
			case "processing":
				return <Package className="w-4 h-4" />;
			case "shipped":
				return <Truck className="w-4 h-4" />;
			case "delivered":
				return <CheckCircle className="w-4 h-4" />;
			case "cancelled":
			case "refunded":
				return <XCircle className="w-4 h-4" />;
			default:
				return <Clock className="w-4 h-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "text-yellow-600 bg-yellow-100";
			case "confirmed":
				return "text-blue-600 bg-blue-100";
			case "processing":
				return "text-purple-600 bg-purple-100";
			case "shipped":
				return "text-indigo-600 bg-indigo-100";
			case "delivered":
				return "text-green-600 bg-green-100";
			case "cancelled":
				return "text-red-600 bg-red-100";
			case "refunded":
				return "text-gray-600 bg-gray-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Get today's date in YYYY-MM-DD format for min date
	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
				{/* Header */}
				<div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
						<div>
							<h2 className="text-lg sm:text-xl font-semibold text-gray-900">
								Update Order - {order.orderNumber}
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								Modify order status, tracking, and delivery information
							</p>
						</div>
						<button
							onClick={onClose}
							className="self-end sm:self-auto text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
					{/* Current Order Info */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
							<div className="min-w-0">
								<h3 className="font-medium text-blue-900 mb-2">Current Order Information</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
									<div>
										<span className="text-blue-700">Customer:</span>
										<p className="font-medium text-blue-900">
											{order.shippingAddress.firstName} {order.shippingAddress.lastName}
										</p>
									</div>
									<div>
										<span className="text-blue-700">Total:</span>
										<p className="font-medium text-blue-900">{formatPrice(order.total)}</p>
									</div>
									<div>
										<span className="text-blue-700">Payment:</span>
										<p className="font-medium text-blue-900">{order.paymentMethod}</p>
									</div>
									<div>
										<span className="text-blue-700">Date:</span>
										<p className="font-medium text-blue-900">{formatDate(order.createdAt)}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Update Form */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Order Status */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
							<div className="space-y-3">
								{[
									{
										value: "pending",
										label: "Pending",
										description: "Order received, awaiting confirmation",
									},
									{ value: "confirmed", label: "Confirmed", description: "Order confirmed, preparing items" },
									{
										value: "processing",
										label: "Processing",
										description: "Items being prepared for shipment",
									},
									{ value: "shipped", label: "Shipped", description: "Order has been shipped" },
									{ value: "delivered", label: "Delivered", description: "Order has been delivered" },
									{ value: "cancelled", label: "Cancelled", description: "Order has been cancelled" },
									{ value: "refunded", label: "Refunded", description: "Order has been refunded" },
								].map((status) => (
									<label
										key={status.value}
										className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
											formData.status === status.value
												? "border-orange-500 bg-orange-50"
												: "border-gray-200 hover:bg-gray-50"
										}`}
									>
										<input
											type="radio"
											name="status"
											value={status.value}
											checked={formData.status === status.value}
											onChange={(e) => handleInputChange("status", e.target.value)}
											className="mt-1 text-orange-600 focus:ring-orange-500"
										/>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span className={`p-1 rounded ${getStatusColor(status.value)}`}>
													{getStatusIcon(status.value)}
												</span>
												<span className="font-medium text-gray-900">{status.label}</span>
											</div>
											<p className="text-sm text-gray-600 mt-1">{status.description}</p>
										</div>
									</label>
								))}
							</div>
						</div>

						{/* Payment Status */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
							<div className="space-y-3">
								{[
									{ value: "pending", label: "Pending", description: "Payment is being processed" },
									{ value: "paid", label: "Paid", description: "Payment has been completed" },
									{ value: "failed", label: "Failed", description: "Payment has failed" },
									{ value: "refunded", label: "Refunded", description: "Payment has been refunded" },
								].map((status) => (
									<label
										key={status.value}
										className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
											formData.paymentStatus === status.value
												? "border-orange-500 bg-orange-50"
												: "border-gray-200 hover:bg-gray-50"
										}`}
									>
										<input
											type="radio"
											name="paymentStatus"
											value={status.value}
											checked={formData.paymentStatus === status.value}
											onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
											className="mt-1 text-orange-600 focus:ring-orange-500"
										/>
										<div className="min-w-0">
											<div className="font-medium text-gray-900">{status.label}</div>
											<p className="text-sm text-gray-600">{status.description}</p>
										</div>
									</label>
								))}
							</div>
						</div>
					</div>

					{/* Tracking Information */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Tracking Number */}
						<div>
							<label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
								Tracking Number
								{formData.status === "shipped" && <span className="text-red-500 ml-1">*</span>}
							</label>
							<input
								type="text"
								id="trackingNumber"
								value={formData.trackingNumber}
								onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
								placeholder="Enter tracking number"
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
									errors.trackingNumber ? "border-red-500" : "border-gray-300"
								}`}
							/>
							{errors.trackingNumber && (
								<p className="mt-1 text-sm text-red-600 flex items-center gap-1">
									<AlertTriangle className="w-4 h-4" />
									{errors.trackingNumber}
								</p>
							)}
							{formData.status === "shipped" && (
								<p className="mt-1 text-sm text-gray-600">Required when order status is set to "Shipped"</p>
							)}
						</div>

						{/* Estimated Delivery */}
						<div>
							<label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700 mb-2">
								Estimated Delivery Date
								{formData.status === "shipped" && <span className="text-red-500 ml-1">*</span>}
							</label>
							<input
								type="date"
								id="estimatedDelivery"
								value={formData.estimatedDelivery}
								onChange={(e) => handleInputChange("estimatedDelivery", e.target.value)}
								min={today}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
									errors.estimatedDelivery ? "border-red-500" : "border-gray-300"
								}`}
							/>
							{errors.estimatedDelivery && (
								<p className="mt-1 text-sm text-red-600 flex items-center gap-1">
									<AlertTriangle className="w-4 h-4" />
									{errors.estimatedDelivery}
								</p>
							)}
							{formData.status === "shipped" && (
								<p className="mt-1 text-sm text-gray-600">Required when order status is set to "Shipped"</p>
							)}
						</div>
					</div>

					{/* Notes */}
					<div>
						<label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
							Internal Notes
						</label>
						<textarea
							id="notes"
							rows={4}
							value={formData.notes}
							onChange={(e) => handleInputChange("notes", e.target.value)}
							placeholder="Add any internal notes about this order..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
						/>
						<p className="mt-1 text-sm text-gray-600">
							These notes are for internal use only and won't be visible to customers
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
						<button
							type="submit"
							disabled={isUpdating}
							className="flex items-center justify-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Save className="w-4 h-4" />
							{isUpdating ? "Updating..." : "Update Order"}
						</button>
						<button
							type="button"
							onClick={onClose}
							disabled={isUpdating}
							className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
						>
							Cancel
						</button>
					</div>

					{/* Warning for Status Changes */}
					{(formData.status !== order.status || formData.paymentStatus !== order.paymentStatus) && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
								<div>
									<h4 className="font-medium text-yellow-800 mb-1">Status Change Warning</h4>
									<p className="text-sm text-yellow-700">
										You are about to change the order status. This action may trigger customer notifications
										and affect order processing. Please ensure all information is accurate before updating.
									</p>
								</div>
							</div>
						</div>
					)}
				</form>
			</div>
		</div>
	);
};

export default OrderUpdateModal;
