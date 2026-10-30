// services/paymentService.ts
import api from "@/utils/api";

export interface QuoteItemInput {
	productId: string;
	quantity: number;
	size?: string;
	color?: string;
}

export interface OrderQuote {
	currency: "NGN";
	items: Array<{
		productId: string;
		name: string;
		image: string;
		size?: string;
		color?: string;
		quantity: number;
		unitPriceNGN: number;
		available: boolean;
	}>;
	subtotal: number; // NGN
	shipping: number; // NGN
	total: number; // NGN
	amountKobo: number; // exact amount Paystack must charge
	shippingRule: {
		freeShippingThresholdUSD: number;
		feeUSD: number;
		freeShippingThresholdNGN: number;
		feeNGN: number;
	};
	privateLink?: { title: string; expiresAt: string };
}

class PaymentService {
	// The server is the source of truth for totals and shipping; never compute the charge client-side
	async getQuote(payload:
			| { items: QuoteItemInput[] }
			| { privateLinkToken: string; items?: QuoteItemInput[]; selections?: Array<{ size?: string; color?: string }> },
	): Promise<OrderQuote> {
		const response = await api.post("/orders/quote", payload);
		return response.data;
	}

	async verifyPayment(reference: string, expectedAmount?: number): Promise<any> {
		const response = await api.post("/orders/verify-payment", { reference, expectedAmount });
		return response.data;
	}
}

export const paymentService = new PaymentService();
