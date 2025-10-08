import { api } from '../utils/api';

export interface CurrencyRate {
  rate: number;
  lastUpdated: Date;
  updatedBy?: string;
}

export interface CurrencyRateHistory {
  rate: number;
  updatedAt: Date;
  updatedBy: {
    firstName: string;
    lastName: string;
  };
  notes?: string;
}

export interface UpdateRateRequest {
  rate: number;
  notes?: string;
}

export interface CurrencyServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class CurrencyService {
  /**
   * Get current currency rate information
   */
  async getCurrentRate(): Promise<CurrencyRate> {
    const response = await api.get<CurrencyServiceResponse<CurrencyRate>>('/settings/currency-rate');
    return response.data.data;
  }

  /**
   * Update the USD to NGN currency rate
   * @param data - Rate update data
   */
  async updateRate(data: UpdateRateRequest): Promise<CurrencyRate> {
    const response = await api.put<CurrencyServiceResponse<CurrencyRate>>('/settings/currency-rate', data);
    return response.data.data;
  }

  /**
   * Get currency rate history
   */
  async getRateHistory(): Promise<CurrencyRateHistory[]> {
    const response = await api.get<CurrencyServiceResponse<CurrencyRateHistory[]>>('/settings/currency-rate/history');
    return response.data.data;
  }

  /**
   * Format currency amount for display
   * @param amount - Amount to format
   * @param currency - Currency code ('NGN' or 'USD')
   */
  formatCurrency(amount: number, currency: 'NGN' | 'USD' = 'NGN'): string {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  }

  /**
   * Validate rate input
   * @param rate - Rate to validate
   */
  validateRate(rate: number): { isValid: boolean; error?: string } {
    if (!rate || rate <= 0) {
      return { isValid: false, error: 'Rate must be a positive number' };
    }

    if (rate < 100) {
      return { isValid: false, error: 'Rate seems too low, please check the value' };
    }

    if (rate > 10000) {
      return { isValid: false, error: 'Rate seems too high, please check the value' };
    }

    return { isValid: true };
  }

  /**
   * Calculate percentage change between two rates
   * @param oldRate - Previous rate
   * @param newRate - New rate
   */
  calculateRateChange(oldRate: number, newRate: number): {
    percentage: number;
    direction: 'up' | 'down' | 'same';
    formatted: string;
  } {
    if (oldRate === newRate) {
      return { percentage: 0, direction: 'same', formatted: '0.00%' };
    }

    const percentage = ((newRate - oldRate) / oldRate) * 100;
    const direction = percentage > 0 ? 'up' : 'down';
    const formatted = `${Math.abs(percentage).toFixed(2)}%`;

    return { percentage, direction, formatted };
  }

  /**
   * Convert USD to NGN using current rate
   * @param usdAmount - Amount in USD
   * @param rate - Current exchange rate
   */
  convertUSDToNGN(usdAmount: number, rate: number): number {
    return Math.round(usdAmount * rate);
  }

  /**
   * Convert NGN to USD using current rate
   * @param ngnAmount - Amount in NGN
   * @param rate - Current exchange rate
   */
  convertNGNToUSD(ngnAmount: number, rate: number): number {
    return Math.round((ngnAmount / rate) * 100) / 100; // Round to 2 decimal places
  }
}

export const currencyService = new CurrencyService();
export default currencyService;