import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
  process.exit(1)
}

const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!"
const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin"
const adminLastName = process.env.ADMIN_LAST_NAME || "User"

async function main() {
  const supabase = createClient(url, serviceKey)

  console.log("Creating admin user:", adminEmail)

  let userId = null
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      first_name: adminFirstName,
      last_name: adminLastName,
      selected_roles: ["admin"],
      account_type: "buyer",
    },
  })

  if (createErr) {
    const alreadyExists = /already been registered|User already registered/i.test(createErr.message)
    if (!alreadyExists) {
      console.error("Failed to create admin user:", createErr.message)
      process.exit(1)
    }
    console.log("User already exists, promoting profile:")
  } else {
    userId = created?.user?.id || null
    console.log("User created:", userId)
  }

  // Ensure profile exists and is marked as admin
  // Try to find existing profile by email
  const { data: existingProfile, error: findErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', adminEmail)
    .maybeSingle()

  let profilePayload
  if (existingProfile) {
    profilePayload = {
      ...existingProfile,
      is_admin: true,
      selected_roles: Array.isArray(existingProfile.selected_roles)
        ? Array.from(new Set([...(existingProfile.selected_roles || []), 'admin']))
        : ['admin'],
      updated_at: new Date().toISOString(),
    }
  } else {
    // If we don't have a profile by email, try to ensure we have a userId to seed a profile
    if (!userId) {
      try {
        // Fallback: scan first page of users to find email (small projects)
        const { data: usersPage } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
        const match = usersPage?.users?.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase())
        userId = match?.id || null
      } catch {}
    }

    profilePayload = {
      id: userId || undefined,
      user_id: userId || undefined,
      first_name: adminFirstName,
      last_name: adminLastName,
      email: adminEmail,
      is_admin: true,
      buyer_enabled: true,
      business_enabled: false,
      account_type: "buyer",
      selected_roles: ["admin"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // Upsert by email (more robust if id/user_id unknown)
  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "email" })

  if (upsertErr) {
    console.error("Failed to upsert profile:", upsertErr.message)
    process.exit(1)
  }

  console.log("✅ Admin profile ensured and elevated.")
  console.log("Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


