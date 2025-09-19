import { createAuthUser } from '../src/backend/services/userService'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config() // 默认读取 .env / .env.local


async function main() {
  // 创建两个用户
  console.log('Creating users...')
  await createAuthUser('admin2', 'Admin123!', 'admin')
  await createAuthUser('customer2', 'Customer123!', 'customer')
}

// 启动
main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
