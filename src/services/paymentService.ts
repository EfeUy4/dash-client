import axios from "axios";

// services/paymentService.ts
interface PaymentData {
	amount: number;
	email: string;
	currency?: string;
	callback_url?: string;
	metadata?: any;
}

interface PaymentResponse {
	success: boolean;
	data: {
		authorization_url: string;
		access_code: string;
		reference: string;
	};
}

class PaymentService {
	async initializePayment(paymentData: PaymentData): Promise<PaymentResponse> {
		try {
			// In a real implementation, this would call your backend
			// which would then call Paystack's API with your secret key
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/payments/initialize`, paymentData);
			return response.data;
		} catch (error) {
			console.error("Error initializing payment:", error);
			throw error;
		}
	}

	async verifyPayment(reference: string): Promise<any> {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments/verify/${reference}`);
			return response.data;
		} catch (error) {
			console.error("Error verifying payment:", error);
			throw error;
		}
	}

	// Demo payment simulation
	simulatePayment(amount: number, email: string): Promise<{ success: boolean; reference: string }> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(amount, email);
				resolve({
					success: true,
					reference: `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
				});
			}, 2000); // Simulate 2 second processing time
		});
	}
}

export const paymentService = new PaymentService();
