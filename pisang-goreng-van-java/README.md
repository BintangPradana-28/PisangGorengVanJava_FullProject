# 🍌 Pisang Goreng Van Java

> **Full-Stack SDLC Academic Project** — Next.js 14 · Tailwind CSS · Prisma · SQLite

Hybrid web application: B2C customer website + B2B admin portal for a Javanese banana fritter street-food brand.

---

## 📋 Project Overview

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Framework    | Next.js 14 (App Router)               |
| Styling      | Tailwind CSS + Framer Motion          |
| Database     | SQLite via Prisma ORM                 |
| Auth         | iron-session (cookie-based)           |
| Language     | TypeScript (strict)                   |
| Charts       | Recharts                              |
| Toaster      | react-hot-toast                       |

---

## 🚀 Quick Start (Local Demo)

### Prerequisites

- **Node.js** ≥ 18.17 ([nodejs.org](https://nodejs.org))
- **npm** ≥ 9 (bundled with Node.js)

### 1 — Clone & Install

```bash
git clone <your-repo-url>
cd pisang-goreng-van-java
npm install
```

### 2 — Setup Environment

```bash
# Copy the env file (already provided)
cp .env.example .env
```

`.env` contents:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="pisang-goreng-van-java-super-secret-key-change-in-production-2024"
NEXT_PUBLIC_WA_NUMBER="6281234567890"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> ⚠️ **Change `SESSION_SECRET`** to a long random string before any real deployment.

### 3 — Setup Database

```bash
# Create the SQLite database and all tables
npm run db:push

# Seed with sample data (menu, toppings, admin, 30 days of orders)
npm run db:seed
```

### 4 — Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗂️ Project Structure

```
pisang-goreng-van-java/
├── app/
│   ├── (user)/               # Customer-facing website
│   │   ├── page.tsx          # Homepage (Hero + About + Menu + Gallery + Location)
│   │   └── layout.tsx
│   ├── (admin)/              # Admin portal
│   │   ├── login/page.tsx    # Admin login
│   │   ├── dashboard/page.tsx
│   │   ├── manage-menu/
│   │   │   ├── page.tsx      # Menu CRUD table
│   │   │   └── edit/[id]/page.tsx  # Edit menu by ID
│   │   ├── orders/page.tsx   # Order management
│   │   ├── toppings/page.tsx # Topping CRUD
│   │   ├── reports/page.tsx  # Analytics dashboard
│   │   └── settings/page.tsx # Site config + password
│   ├── api/
│   │   ├── menu/route.ts           # GET all, POST
│   │   ├── menu/[id]/route.ts      # GET, PUT, DELETE
│   │   ├── toppings/route.ts
│   │   ├── toppings/[id]/route.ts
│   │   ├── orders/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── reports/route.ts
│   │   ├── upload/route.ts         # Image upload
│   │   ├── settings/route.ts
│   │   └── auth/login|logout/route.ts
│   └── api-docs/page.tsx     # Public API documentation
├── components/
│   ├── user/    (Navbar, Hero, About, MenuMatrix, Gallery, Location, Footer)
│   └── admin/   (AdminSidebar, AdminHeader, MenuTable, AddEditMenuModal)
├── data/
│   ├── types.ts       # Strict TypeScript interfaces
│   └── products.ts    # Static fallback data
├── lib/
│   ├── prisma.ts      # Prisma singleton
│   ├── session.ts     # iron-session config
│   └── utils.ts       # Helper functions
├── prisma/
│   ├── schema.prisma  # DB schema
│   └── seed.ts        # Data seeder
├── public/uploads/    # Uploaded menu images
└── styles/globals.css
```

---

## 🔑 Admin Access

| Field    | Value      |
|----------|------------|
| URL      | `/login`   |
| Username | `admin`    |
| Password | `admin123` |

---

## 📡 API Endpoints

Full documentation at: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| GET    | /api/menu             | —    | List menu variants    |
| POST   | /api/menu             | ✅   | Add menu variant      |
| PUT    | /api/menu/[id]        | ✅   | Update variant        |
| DELETE | /api/menu/[id]        | ✅   | Delete variant        |
| GET    | /api/toppings         | —    | List toppings         |
| GET    | /api/orders           | ✅   | List orders (paged)   |
| POST   | /api/orders           | ✅   | Create order          |
| PATCH  | /api/orders/[id]      | ✅   | Update order status   |
| GET    | /api/reports          | ✅   | Analytics data        |
| POST   | /api/upload           | ✅   | Upload image          |
| GET    | /api/settings         | ✅   | Site settings         |
| PATCH  | /api/settings         | ✅   | Save settings         |
| POST   | /api/auth/login       | —    | Admin login           |
| POST   | /api/auth/logout      | —    | Admin logout          |

---

## 🎨 Features by Phase

### Phase 1 — UI Prototype (HTML)

- [x] Customer website mockup (all sections)
- [x] Admin login, dashboard, manage menu mockup
- [x] Interactive menu matrix with order builder

### Phase 2 — Next.js Foundation

- [x] App Router project structure
- [x] Prisma + SQLite schema & seed
- [x] Full TypeScript interfaces
- [x] Customer pages (Hero, About, MenuMatrix, Gallery, Location, Footer)
- [x] Admin sidebar, dashboard, manage menu CRUD
- [x] API routes: Menu CRUD, Auth (login/logout)
- [x] iron-session authentication

### Phase 3 — Full Production Features

- [x] Image upload API (disk storage to `/public/uploads`)
- [x] Edit menu by ID page with image upload UI
- [x] Order management with status pipeline
- [x] Reports & analytics (revenue charts, top flavors, distributions)
- [x] Topping management CRUD
- [x] Settings page (site config + password change)
- [x] Public API documentation page
- [x] 30-day seeded order data for demo reports
- [x] WhatsApp order confirmation integration

---

## 🛠️ Useful Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Sync schema to database
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run lint         # Run ESLint
```

---

## 📦 Dependencies

```json
{
  "next": "14.2.0",
  "react": "^18",
  "@prisma/client": "^5",
  "prisma": "^5",
  "iron-session": "^8",
  "bcryptjs": "^2.4.3",
  "framer-motion": "^11",
  "recharts": "^2",
  "react-hot-toast": "^2.4.1",
  "tailwindcss": "^3.4"
}
```

---

## 🌐 WhatsApp Integration

Set your WhatsApp Business number in `.env`:

```env
NEXT_PUBLIC_WA_NUMBER="628xxxxxxxxxx"
```

The menu matrix automatically builds a formatted order message:

```
Halo Pisang Goreng Van Java! 🍌

Saya ingin memesan:
• Rasa: Matcha Milky
• Tipe: Kembung (Isi 15)
• Topping: Keju (+Rp 2.000)
• Total: Rp 14.000

Mohon konfirmasi ketersediaan. Terima kasih! 🙏
```

---

## 🎓 SDLC Documentation

This project follows the Software Development Life Cycle:

1. **Planning** — Brand identity, menu taxonomy, target users
2. **Analysis** — B2C + B2B requirements, menu matrix data model
3. **Design** — UI/UX based on reference images, color palette, typography
4. **Implementation** — Next.js App Router, Prisma ORM, REST API
5. **Testing** — Manual testing, API testing via `/api-docs`
6. **Deployment** — Local development server (npm run dev)

---

## 📝 License

Academic project — Informatics Student SDLC Project 2024.
Brand: **Pisang Goreng Van Java** 🍌

## 🚀 Cara Menjalankan Proyek (Local Development)

Berikut adalah langkah-langkah untuk menjalankan aplikasi Pisang Van Java di komputer lokal Anda:

### 1. Kloning Repositori

Buka terminal Anda dan jalankan perintah berikut untuk mengkloning proyek dan masuk ke dalam direktorinya:
\`\`\`bash
git clone <https://github.com/username/pisang-van-java.git>
cd pisang-van-java
\`\`\`

### 2. Instal Dependensi

Gunakan Node Package Manager (npm) untuk menginstal semua library yang dibutuhkan:
\`\`\`bash
npm install
\`\`\`

### 3. Siapkan File Environment (.env)

Proyek ini membutuhkan variabel environment untuk database dan autentikasi. Duplikat file \`.env.example\` menjadi \`.env\`:
\`\`\`bash
cp .env.example .env
\`\`\`
*Catatan: Buka file \`.env\` tersebut dan isi kredensial untuk Supabase (PostgreSQL), Upstash (Redis), dan Google OAuth Anda.*

### 4. Sinkronisasi Database Prisma

Sinkronkan skema database lokal Anda dengan Supabase dan buat Prisma Client:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 5. Jalankan Server Lokal

Mulai server Next.js dalam mode development:
\`\`\`bash
npm run dev
\`\`\`
*Aplikasi sekarang dapat diakses melalui \`<http://localhost:3000\`>.*
