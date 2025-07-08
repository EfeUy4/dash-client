// services/orderService.ts
import { Order } from "@/data/types";
import axios from "axios";

interface CreateOrderData {
	items: Array<{
		productId: string;
		quantity: number;
		size: string;
		color: string;
	}>;
	shippingAddress: {
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	billingAddress?: {
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	paymentMethod: string;
	paymentDetails?: any;
}

interface UpdateOrderData {
	status?: Order["status"];
	paymentStatus?: Order["paymentStatus"];
	trackingNumber?: string;
	estimatedDelivery?: string;
	notes?: string;
	updatedAt?: string;
}

class OrderService {
	async getOrders(): Promise<Order[]> {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders`);
			return response.data;
		} catch (error) {
			console.error("Error fetching orders:", error);
			throw error;
		}
	}

	async getMyOrders(): Promise<Order[]> {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/my`);
			return response.data;
		} catch (error) {
			console.error("Error fetching my orders:", error);
			throw error;
		}
	}

	async getOrder(id: string): Promise<Order> {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${id}`);
			return response.data;
		} catch (error) {
			console.error("Error fetching order:", error);
			throw error;
		}
	}

	async createOrder(orderData: CreateOrderData): Promise<Order> {
		try {
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderData);
			return response.data;
		} catch (error) {
			console.error("Error creating order:", error);
			throw error;
		}
	}

	async updateOrder(id: string, updates: UpdateOrderData): Promise<Order> {
		try {
			const response = await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${id}`, updates);
			return response.data;
		} catch (error) {
			console.error("Error updating order:", error);
			throw error;
		}
	}

	async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order> {
		try {
			const response = await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, {
				status,
				trackingNumber,
			});
			return response.data;
		} catch (error) {
			console.error("Error updating order status:", error);
			throw error;
		}
	}

	async cancelOrder(id: string, reason?: string): Promise<Order> {
		try {
			const response = await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${id}/cancel`, { reason });
			return response.data;
		} catch (error) {
			console.error("Error cancelling order:", error);
			throw error;
		}
	}
}

export const orderService = new OrderService();
