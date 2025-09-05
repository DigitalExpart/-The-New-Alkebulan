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
    console.error("Failed to create admin user:", createErr.message)
    process.exit(1)
  }

  const userId = created?.user?.id
  if (!userId) {
    console.error("No user id returned from createUser")
    process.exit(1)
  }

  console.log("User created:", userId)

  // Ensure profile exists and is marked as admin
  const profilePayload = {
    id: userId,
    user_id: userId,
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

  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })

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


