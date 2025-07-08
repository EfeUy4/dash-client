
export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	images: string[];
	category: string;
	subcategory: string;
	sizes: string[];
	colors: string[];
	inStock: boolean;
	stockCount: number;
	rating: number;
	reviewCount: number;
	features: string[];
	isNewProduct: boolean;
	isFeatured: boolean;
	isActive: boolean;
	tags: string[];
	sku: string;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	seoTitle?: string;
	seoDescription?: string;
	discountPercentage: number;
	createdAt: Date;
	updatedAt: Date;
}


export interface OrderItem {
	product: string;
	name: string;
	price: number;
	quantity: number;
	size: string;
	color: string;
	image: string;
}

export interface ShippingAddress {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface Order {
	id: string;
	orderNumber: string;
	user: string;
	items: OrderItem[];
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
	paymentStatus: "pending" | "paid" | "failed" | "refunded";
	paymentMethod: string;
	paymentDetails?: any;
	shippingAddress: ShippingAddress;
	trackingNumber?: string;
	estimatedDelivery?: string;
	deliveredAt?: string;
	cancelledAt?: string;
	cancelReason?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}


