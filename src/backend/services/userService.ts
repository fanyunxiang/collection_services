// backend/services/authService.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 加载 .env.local
dotenv.config({ path: '.env.local' })

// 用 service role key 初始化 admin client
const supabaseUrl = process.env.SUPABASE_URL || 'https://eujwvgungxolozkfbxst.supabase.co'
console.log('Supabase URL:', supabaseUrl)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1and2Z3VuZ3hvbG96a2ZieHN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI2NzUxMywiZXhwIjoyMDczODQzNTEzfQ.dcoK-DY5aPeZz2KTBeNsUROw2M6VlHFPfiVRgoxHEqQ'
// process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

/**
 * 创建 auth 用户
 * @param username 你的用户名，会拼成 email
 * @param password 明文密码，Supabase自动哈希
 * @param role 用户角色
 */
export async function createAuthUser(username: string, password: string, role: string = 'user') {
  // 拼一个假邮箱（必须要有 email 字段）
  const email = `${username}@example.com`

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 跳过确认
    user_metadata: {
      username,
      role,
    },
  })

  if (error) {
    console.error('创建失败:', error.message)
    return null
  }
  console.log('创建成功，用户ID:', data.user?.id)
  return data.user
}
