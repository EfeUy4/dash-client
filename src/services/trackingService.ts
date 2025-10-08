import { api } from '../utils/api';

export interface TrackingInfo {
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  total: number;
  totalUSD: number;
  itemCount: number;
  shippingLocation: {
    city: string;
    state: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    priceUSD: number;
    image: string;
  }>;
}

export interface TrackingResponse {
  success: boolean;
  data: TrackingInfo;
}

class TrackingService {
  /**
   * Track an order by order number (public - no auth required)
   */
  async trackOrder(orderNumber: string): Promise<TrackingInfo> {
    const response = await api.get<TrackingResponse>(`/orders/track/${orderNumber.trim()}`);
    return response.data.data;
  }

  /**
   * Get status display info for UI
   */
  getStatusInfo(status: TrackingInfo['status']) {
    const statusMap = {
      pending: {
        label: 'Order Pending',
        description: 'Your order has been received and is being reviewed',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: '🕐'
      },
      confirmed: {
        label: 'Order Confirmed',
        description: 'Your order has been confirmed and payment verified',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '✅'
      },
      processing: {
        label: 'Processing',
        description: 'Your order is being prepared for shipment',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        icon: '📦'
      },
      shipped: {
        label: 'Shipped',
        description: 'Your order is on its way to you',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        icon: '🚚'
      },
      delivered: {
        label: 'Delivered',
        description: 'Your order has been successfully delivered',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🎉'
      },
      cancelled: {
        label: 'Cancelled',
        description: 'This order has been cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '❌'
      },
      refunded: {
        label: 'Refunded',
        description: 'This order has been refunded',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: '💰'
      }
    };

    return statusMap[status] || statusMap.pending;
  }

  /**
   * Get payment status display info
   */
  getPaymentStatusInfo(paymentStatus: TrackingInfo['paymentStatus']) {
    const statusMap = {
      pending: {
        label: 'Payment Pending',
        description: 'Payment is being processed',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      },
      paid: {
        label: 'Payment Confirmed',
        description: 'Payment has been successfully processed',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      failed: {
        label: 'Payment Failed',
        description: 'Payment could not be processed',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      refunded: {
        label: 'Payment Refunded',
        description: 'Payment has been refunded',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    };

    return statusMap[paymentStatus] || statusMap.pending;
  }

  /**
   * Get progress percentage based on status
   */
  getProgressPercentage(status: TrackingInfo['status']): number {
    const progressMap = {
      pending: 10,
      confirmed: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0,
      refunded: 0
    };

    return progressMap[status] || 0;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Validate order number format
   */
  validateOrderNumber(orderNumber: string): { isValid: boolean; error?: string } {
    if (!orderNumber || orderNumber.trim() === '') {
      return { isValid: false, error: 'Order number is required' };
    }

    const trimmed = orderNumber.trim();
    
    if (trimmed.length < 5) {
      return { isValid: false, error: 'Order number is too short' };
    }

    // Basic format validation (adjust based on your order number format)
    if (!/^ORD-/.test(trimmed.toUpperCase())) {
      return { isValid: false, error: 'Invalid order number format. Order numbers start with "ORD-"' };
    }

    return { isValid: true };
  }
}

export const trackingService = new TrackingService();
export default trackingService;