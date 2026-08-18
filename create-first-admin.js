// create-first-admin.js
// ─────────────────────────────────────────────────────────
// Run this ONCE to create your very first login. After that,
// sign in and use the Team page (/admin/users) to add everyone
// else — you'll never need this script again.
//
// Usage:
//   node create-first-admin.js you@coalitionspace.com yourPassword123 "Your Name"
// ─────────────────────────────────────────────────────────

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const [,, email, password, displayName] = process.argv;

if (!email || !password) {
  console.log("Usage: node create-first-admin.js you@example.com yourPassword \"Your Name\"");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName || email.split("@")[0],
      role: "admin",
    },
  });

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }

  console.log(`Created admin account: ${email}`);
  console.log(`User id: ${data.user.id}`);
  console.log(`\nGo to http://localhost:3000/login and sign in.`);
}

main();
