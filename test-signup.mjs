import { createClient } from '@supabase/supabase-js'

try {
  process.loadEnvFile?.('.env.local')
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://akkvwcwhbiswwjvzpxfu.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'Password123!',
    options: {
      data: {
        role: 'customer',
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        street: '123 Main St',
        apartment: 'Apt 4B',
        city: 'Manila',
        state: 'Metro Manila',
        zip: '1000',
        country: 'Philippines'
      }
    }
  })

  console.log("Error:", error)
  console.log("Data:", data)
}

testSignup()
