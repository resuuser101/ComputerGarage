const { createClient } = require("@supabase/supabase-js");

try {
  process.loadEnvFile?.(".env.local");
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://akkvwcwhbiswwjvzpxfu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function deleteUser(email) {
  console.log(`\n🔍 Looking for user with email: ${email}...`);
  
  // 1. Find user by email
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    console.error("❌ Error fetching users:", usersError.message);
    return;
  }

  const user = usersData.users.find(u => u.email === email);
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    return;
  }
  
  console.log(`✅ Found user! ID: ${user.id}`);
  
  // 2. Delete from user_otps
  console.log(`🗑️ Deleting from user_otps...`);
  await supabaseAdmin.from("user_otps").delete().eq("user_id", user.id);
  
  // 3. Delete from profiles
  console.log(`🗑️ Deleting from profiles...`);
  await supabaseAdmin.from("profiles").delete().eq("id", user.id);
  
  // 4. Delete from auth.users
  console.log(`🗑️ Deleting main account...`);
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (deleteError) {
    console.error("❌ Failed to delete main account:", deleteError.message);
  } else {
    console.log(`🎉 Successfully deleted ${email} permanently! They can now sign up again.`);
  }
}

const emailToDelete = process.argv[2];
if (!emailToDelete) {
  console.log("⚠️ Please provide an email address. Example: node delete-user.js test@email.com");
} else {
  deleteUser(emailToDelete);
}
