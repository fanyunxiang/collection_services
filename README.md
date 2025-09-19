# collection_services – Next.js + Supabase Admin Dashboard

A clean and extensible **Next.js + Supabase admin dashboard** template built with **TypeScript** and **Tailwind CSS**.  
This project provides a solid foundation for building your own admin panel or internal tools with integrated Supabase backend.

---

## 📂 Project Structure

```
.
├── public/images         # Static assets
└── src
    ├── app               # App router pages
    ├── assets            # Extra static assets
    ├── components        # Reusable React components
    ├── css               # Tailwind and global CSS
    ├── fonts             # Custom fonts
    ├── hooks             # Custom React hooks
    ├── js                # JS utilities or legacy scripts
    ├── lib               # Supabase client & shared config
    ├── services          # API services / data fetching
    ├── types             # TypeScript type definitions
    └── utils             # Utility functions
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 2. Set up Environment Variables  

Create a `.env.local` file at the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Next.js** (App Router + SSR/SSG)
- **Supabase** (Database, Auth, Storage)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (for custom API calls)
- **React Hooks**

---

## 📝 Notes

- The Supabase client is initialized in `src/lib` for reuse across the app.
- Authentication, database queries, and storage should go through Supabase APIs.
- Styling and global CSS are handled by Tailwind (`tailwind.config.ts` and `src/css`).
- All UI components live in `src/components`.

---

- task list
- 全局安装pnpm
- git fetch 命令
- 登录 注册 修改密码功能实现

---
