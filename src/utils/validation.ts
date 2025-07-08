// utils/validation.ts
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
  message?: string
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {}

  Object.keys(rules).forEach(field => {
    const value = data[field]
    const rule = rules[field]

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rule.message || `${field} is required`
      return
    }

    // Skip other validations if field is empty and not required
    if (!value) return

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`
      return
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field} must not exceed ${rule.maxLength} characters`
      return
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`
      return
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors[field] = rule.message || `${field} is invalid`
      return
    }
  })

  return errors
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+234|0)[789][01]\d{8}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  zipCode: /^\d{6}$/,
  url: /^https?:\/\/.+/,
}

// Form validation rules
export const authValidationRules = {
  email: {
    required: true,
    pattern: patterns.email,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  },
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'First name must be 2-50 characters'
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Last name must be 2-50 characters'
  }
}

export const productValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: 'Product name must be 3-200 characters'
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    message: 'Description must be 10-2000 characters'
  },
  price: {
    required: true,
    custom: (value: any) => !isNaN(value) && value > 0,
    message: 'Price must be a positive number'
  },
  sku: {
    required: true,
    minLength: 3,
    maxLength: 20,
    message: 'SKU must be 3-20 characters'
  }
}

// utils/constants.ts
export const APP_CONFIG = {
  name: 'DashNGShop',
  description: 'Luxury Fashion & Accessories',
  version: '1.0.0',
  author: 'DashNGShop Team',
  email: 'hello@dashngshop.com',
  phone: '+234 800 DASH NGS',
  address: '123 Luxury Avenue, Victoria Island, Lagos, Nigeria',
  social: {
    facebook: 'https://facebook.com/dashngshop',
    instagram: 'https://instagram.com/dashngshop',
    twitter: 'https://twitter.com/dashngshop',
  }
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const

export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
} as const

export const PRODUCT_CATEGORIES = [
  'Outerwear',
  'Dresses',
  'Accessories',
  'Knitwear',
  'Blazers',
  'Pants',
  'Shoes',
  'Bags',
  'Jewelry'
] as const

export const PRODUCT_SIZES = {
  CLOTHING: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  SHOES: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  ACCESSORIES: ['One Size']
} as const

export const PRODUCT_COLORS = [
  'Black',
  'White',
  'Navy',
  'Grey',
  'Brown',
  'Beige',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Purple',
  'Pink',
  'Orange'
] as const

export const CURRENCY = {
  CODE: 'NGN',
  SYMBOL: '₦',
  NAME: 'Nigerian Naira'
} as const

export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 50000,
  STANDARD_SHIPPING_COST: 2500,
  EXPRESS_SHIPPING_COST: 5000,
  TAX_RATE: 0.075 // 7.5% VAT
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100
} as const

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  THUMBNAIL_SIZE: { width: 300, height: 300 },
  MEDIUM_SIZE: { width: 600, height: 600 },
  LARGE_SIZE: { width: 1200, height: 1200 }
} as const

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
} as const

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  RESIZE: 150,
  SCROLL: 100
} as const