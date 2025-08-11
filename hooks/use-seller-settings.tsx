"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { 
  SellerSettings, 
  ShippingSettings, 
  ReturnPolicy, 
  PaymentSettings,
  DEFAULT_SELLER_SETTINGS 
} from "@/types/seller"

export function useSellerSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SellerSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch seller settings
  const fetchSettings = useCallback(async () => {
    if (!user || !supabase) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('seller_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // No settings found, create default ones
        await createDefaultSettings()
      } else if (error) {
        console.error('Error fetching seller settings:', error)
        toast.error('Failed to load store settings')
      } else if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load store settings')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Create default seller settings
  const createDefaultSettings = async () => {
    if (!user || !supabase) return

    try {
      const defaultSettings = {
        user_id: user.id,
        ...DEFAULT_SELLER_SETTINGS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('seller_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        console.error('Error creating default settings:', error)
        toast.error('Failed to create store settings')
      } else {
        setSettings(data)
        toast.success('Store settings initialized')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create store settings')
    }
  }

  // Update store information
  const updateStoreInfo = async (storeInfo: {
    store_name: string
    store_description: string
    store_banner_url: string
    store_logo_url: string
  }) => {
    if (!user || !supabase || !settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('seller_settings')
        .update({
          ...storeInfo,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating store info:', error)
        toast.error('Failed to update store information')
        return false
      }

      setSettings(prev => prev ? { ...prev, ...storeInfo } : null)
      toast.success('Store information updated successfully!')
      return true
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update store information')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Update shipping settings
  const updateShippingSettings = async (shippingSettings: ShippingSettings) => {
    if (!user || !supabase || !settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('seller_settings')
        .update({
          shipping_settings: shippingSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating shipping settings:', error)
        toast.error('Failed to update shipping settings')
        return false
      }

      setSettings(prev => prev ? { 
        ...prev, 
        shipping_settings: shippingSettings 
      } : null)
      toast.success('Shipping settings updated successfully!')
      return true
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update shipping settings')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Update return policy
  const updateReturnPolicy = async (returnPolicy: ReturnPolicy) => {
    if (!user || !supabase || !settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('seller_settings')
        .update({
          return_policy: returnPolicy,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating return policy:', error)
        toast.error('Failed to update return policy')
        return false
      }

      setSettings(prev => prev ? { 
        ...prev, 
        return_policy: returnPolicy 
      } : null)
      toast.success('Return policy updated successfully!')
      return true
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update return policy')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Update payment settings
  const updatePaymentSettings = async (paymentSettings: PaymentSettings) => {
    if (!user || !supabase || !settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('seller_settings')
        .update({
          payment_settings: paymentSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating payment settings:', error)
        toast.error('Failed to update payment settings')
        return false
      }

      setSettings(prev => prev ? { 
        ...prev, 
        payment_settings: paymentSettings 
      } : null)
      toast.success('Payment settings updated successfully!')
      return true
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update payment settings')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Update store status
  const updateStoreStatus = async (status: 'draft' | 'active' | 'suspended' | 'closed') => {
    if (!user || !supabase || !settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('seller_settings')
        .update({
          store_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating store status:', error)
        toast.error('Failed to update store status')
        return false
      }

      setSettings(prev => prev ? { 
        ...prev, 
        store_status: status 
      } : null)
      toast.success(`Store status updated to ${status}`)
      return true
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update store status')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Refresh settings
  const refreshSettings = useCallback(() => {
    fetchSettings()
  }, [fetchSettings])

  // Initialize settings when user changes
  useEffect(() => {
    if (user) {
      fetchSettings()
    } else {
      setSettings(null)
      setLoading(false)
    }
  }, [user, fetchSettings])

  return {
    settings,
    loading,
    saving,
    updateStoreInfo,
    updateShippingSettings,
    updateReturnPolicy,
    updatePaymentSettings,
    updateStoreStatus,
    refreshSettings
  }
}
