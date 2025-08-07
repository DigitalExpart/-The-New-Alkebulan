import { createClient } from "@supabase/supabase-js"

// Fallback values for development/preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key"

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
