export interface SellerSettings {
  id?: string
  user_id: string
  
  // Store Information
  store_name?: string
  store_description?: string
  store_banner_url?: string
  store_logo_url?: string
  
  // Shipping Settings
  shipping_settings: ShippingSettings
  
  // Return Policy
  return_policy: ReturnPolicy
  
  // Payment & Payout Settings
  payment_settings: PaymentSettings
  
  // Store Status
  store_status: 'draft' | 'active' | 'suspended' | 'closed'
  store_verified: boolean
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

export interface ShippingSettings {
  free_shipping_threshold: number
  flat_rate_shipping: number
  shipping_zones: ShippingZone[]
}

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  shipping_rate: number
  delivery_days: number
}

export interface ReturnPolicy {
  accepts_returns: boolean
  return_window_days: number
  return_shipping_paid_by: 'seller' | 'buyer'
  return_conditions: string[]
}

export interface PaymentSettings {
  stripe_connected: boolean
  stripe_account_id: string
  payout_schedule: 'daily' | 'weekly' | 'monthly'
  minimum_payout: number
}

export interface StoreStats {
  total_sales: number
  total_orders: number
  total_products: number
  total_customers: number
  monthly_growth: number
}

export interface StoreAnalytics {
  sales_by_month: { month: string; amount: number }[]
  top_products: { name: string; sales: number }[]
  customer_demographics: { age_group: string; count: number }[]
  shipping_preferences: { method: string; count: number }[]
}

// Default values for new seller settings
export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  free_shipping_threshold: 0,
  flat_rate_shipping: 0,
  shipping_zones: []
}

export const DEFAULT_RETURN_POLICY: ReturnPolicy = {
  accepts_returns: true,
  return_window_days: 30,
  return_shipping_paid_by: 'seller',
  return_conditions: ['Unused', 'Original packaging']
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  stripe_connected: false,
  stripe_account_id: '',
  payout_schedule: 'weekly',
  minimum_payout: 50
}

export const DEFAULT_SELLER_SETTINGS: Omit<SellerSettings, 'user_id'> = {
  store_name: '',
  store_description: '',
  store_banner_url: '',
  store_logo_url: '',
  shipping_settings: DEFAULT_SHIPPING_SETTINGS,
  return_policy: DEFAULT_RETURN_POLICY,
  payment_settings: DEFAULT_PAYMENT_SETTINGS,
  store_status: 'draft',
  store_verified: false
}

// Shipping zone templates
export const SHIPPING_ZONE_TEMPLATES = [
  {
    name: 'Local Delivery',
    countries: ['US'],
    shipping_rate: 5.99,
    delivery_days: 1
  },
  {
    name: 'Standard Shipping',
    countries: ['US', 'CA'],
    shipping_rate: 9.99,
    delivery_days: 3
  },
  {
    name: 'International',
    countries: ['*'],
    shipping_rate: 19.99,
    delivery_days: 7
  }
]

// Return condition suggestions
export const RETURN_CONDITION_SUGGESTIONS = [
  'Unused',
  'Original packaging',
  'Tags attached',
  'No signs of wear',
  'Complete with accessories',
  'Within return window',
  'Valid receipt required',
  'No damage or defects'
]

// Payout schedule options
export const PAYOUT_SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Receive payouts every business day' },
  { value: 'weekly', label: 'Weekly', description: 'Receive payouts every Tuesday' },
  { value: 'monthly', label: 'Monthly', description: 'Receive payouts on the 1st of each month' }
]
