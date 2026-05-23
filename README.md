# 🍽️ Catering Management System

Sistem manajemen katering berbasis web dengan multi-role (Admin, Kurir, Pelanggan) yang dibangun menggunakan **Next.js 16 (App Router)**, **Prisma ORM + SQLite**, **shadcn/ui**, **TypeScript**, dan **NextAuth.js v5**.

---

## 🚀 Fitur Utama

### 👨‍💼 Admin / Owner

- ✅ Kelola data pelanggan (CRUD)
- ✅ Kelola paket katering (CRUD + upload foto BLOB)
- ✅ Kelola pesanan & update status
- ✅ Assign kurir ke pesanan + input No. Resi, estimasi tiba, alamat tujuan
- ✅ Approve pembayaran setelah verifikasi bukti transfer
- ✅ Dashboard laporan & statistik

### 🚚 Kurir

- ✅ Dashboard tugas pengiriman real-time
- ✅ Update status: "Mulai Kirim" → "Tiba di Tujuan"
- ✅ Upload bukti foto pengiriman (BLOB) saat paket tiba
- ✅ Hubungi pelanggan via tel: link
- ✅ Hanya bisa akses route `/kurir` & `/profil`

### 👤 Pelanggan

- ✅ Browse menu paket katering (`/menu`)
- ✅ Pesan paket + atur jumlah + tanggal acara
- ✅ Pembayaran via Transfer Bank / E-Wallet / COD
- ✅ Upload bukti transfer (Base64/BLOB)
- ✅ Lacak status pesanan & no. resi (`/tracking`)
- ✅ Kelola profil + upload foto profil (BLOB)

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
| --- | --- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | SQLite + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **UI** | shadcn/ui + Tailwind CSS |
| **Form** | React Hook Form + Zod |
| **State** | Server Actions + `useTransition` |
| **Storage** | BLOB (Buffer) untuk foto di SQLite |
| **Deployment** | Vercel-ready |

---

## 📦 Prerequisites

Pastikan device lo sudah terinstall:

```bash
# Node.js (minimal v18, rekomendasi v20+)
node -v  # v20.x.x

# npm / yarn / pnpm
npm -v   # 10.x.x

# Git
git --version

```

---

## ⚙️ Setup Project di Device Baru

### 1. Clone Repository

```bash
git clone [https://github.com/username/catering-app.git](https://github.com/username/catering-app.git)
cd catering-app

```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install

```

### 3. Setup Environment Variables

Buat file `.env` di root project:

```env
# .env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=fb3de887aeab6e3620258f73031441facd1f59ec9a4ead30f70987b7ef809dd8
NEXTAUTH_URL="http://localhost:3000"

```

> 🔐 **Penting**: Ganti `NEXTAUTH_SECRET` dengan value baru yang lebih aman:
>
> ```bash
> openssl rand -base64 32
> 
> ```

### 4. Setup Database (Prisma + SQLite)

```bash
# Push schema ke SQLite (buat file dev.db)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Opsional) Seed data awal jika ada
# npx prisma db seed

```

### 5. Jalankan Development Server

```bash
# Clear cache Next.js (disarankan saat pertama kali)
rm -rf .next

# Start dev server
npm run dev
# atau
yarn dev
# atau
pnpm dev

```

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser.

---

## 🔑 Akun Test Default (Opsional)

| Role | Email | Password | Redirect |
| --- | --- | --- | --- |
| Admin | `admin@catering.com` | `admin123` | `/dashboard` |
| Kurir | `kurir@catering.com` | `admin123` | `/kurir` |
| Pelanggan | Register via `/auth/register` | - | `/menu` |

> ⚠️ Akun test hanya untuk development. Untuk production, gunakan registrasi & seeding yang aman.

---

## 🗄️ Struktur Database (Prisma Schema Highlights)

- **User**: (id, name, email, level: admin/kurir/pelanggan)
- **Pelanggan**: (relasi ke User, foto: Bytes?)
- **Paket**: (namaPaket, menuPaket, kategori, hargaPaket, foto: Bytes?)
- **Pemesanan**: (idPelanggan, totalHarga, statusPesanan, metodePembayaran)
- **DetailPemesanan**: (relasi Pemesanan ↔ Paket)
- **Pengiriman**: (idPesan, kurirId, statusKirim, buktiFoto: Bytes?, noResi, alamatTujuan, estimasiTiba)
- **Pembayaran**: (idPemesanan, idJenisPembayaran, buktiBayar: Bytes?, statusPembayaran)
- **JenisPembayaran & DetailJenisPembayaran**: (konfigurasi metode bayar dinamis)

> 💡 Field bertipe `Bytes?` menyimpan foto sebagai **BLOB** di SQLite. Di frontend, convert ke Base64 via `bufferToBase64()` helper.

---

## 📁 Struktur Project (Singkat)

```text
catering-app/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login/Register
│   │   ├── admin/           # Admin-only pages
│   │   ├── kurir/           # Kurir dashboard
│   │   ├── menu/            # Customer menu page
│   │   ├── pesan/           # Order form
│   │   ├── pembayaran/      # Payment page
│   │   ├── pesanan-saya/    # Customer order history
│   │   ├── profil/          # Profile management
│   │   ├── tracking/        # Order tracking
│   │   └── actions/         # Server Actions (CRUD logic)
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, AdminLayout, KurirLayout
│   │   ├── admin/           # Admin-specific components
│   │   ├── pembayaran/      # Payment form & utils
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── auth.ts          # NextAuth config
│   │   ├── utils.ts         # Helper functions (formatRupiah, etc.)
│   │   ├── image-utils.ts   # File ↔ Buffer ↔ Base64 conversion
│   │   └── validations/     # Zod schemas (pelanggan, pengiriman, etc.)
│   └── types/
│       └── enums.ts         # Role, Status, Menu options
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── dev.db               # SQLite database (gitignored)
├── public/                  # Static assets
├── .env                     # Environment variables (gitignored)
├── .gitignore               # Ignore rules
├── next.config.ts           # Next.js config
├── package.json             # Dependencies & scripts
└── README.md                # This file

```

---

## 🧪 Testing & Debugging

### Clear Cache & Restart

```bash
rm -rf .next node_modules/.cache
npm run dev

```

### Prisma Studio (GUI Database)

```bash

npx prisma studio
# Buka http://localhost:5555

```

### Cek Logs Server Action

  -Buka DevTools → Console tab
  -Server action logs muncul di terminal `npm run dev`

### Validasi Form Error

- Pastikan `name` attribute di `<Input>` match dengan key di `formData.get()`
- Hapus trailing spaces di string key (penyebab umum error "empty object")

---

## 🚨 Common Issues & Solutions

| Error | Solusi |
| --- | --- |
| `searchParams is a Promise` | Await `searchParams` di Next.js 15+: `const params = await searchParams` |
| `Uint8Array objects are not supported` | Convert Buffer → Base64 via `bufferToBase64()` sebelum pass ke Client Component |
| `formData.get("xxx")` return undefined | Pastikan `name="xxx"` di `<Input>` tanpa spasi |
| `prisma.pelanggan not found` | Jalankan `npx prisma db push` + `npx prisma generate` |
| `NEXTAUTH_SECRET not set` | Tambah env var atau generate baru via `openssl rand -base64 32` |
| `Port 3000 already in use` | `npx kill-port 3000` atau ganti port di `package.json` |

---

## 🌐 Deployment (Vercel)

1. Push code ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import Project
3. Set Environment Variables di Vercel Dashboard:

```text
DATABASE_URL = file:./dev.db  # Untuk SQLite (atau pakai PostgreSQL untuk production)
NEXTAUTH_SECRET = your-secret-key
NEXTAUTH_URL = [https://your-domain.vercel.app](https://your-domain.vercel.app)

```

1. Deploy → Auto-build & auto-deploy on push

> ⚠️ **Catatan**: SQLite tidak persistent di Vercel serverless. Untuk production, ganti ke **PostgreSQL** (Neon, Supabase, atau Vercel Postgres).

---

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur: `git checkout -b fitur-baru`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin fitur-baru`
5. Buka Pull Request

---

## 📄 License

MIT License — silakan gunakan, modifikasi, dan distribusikan sesuai kebutuhan.

---

## 🙏 Credits

- Dibangun dengan ❤️ menggunakan Next.js, Prisma, dan shadcn/ui
- Inspirasi: Sistem manajemen katering UMKM Indonesia

---

> 🚀 **Happy Coding!** Kalau ada pertanyaan, buka issue atau DM gua. Gua standby bantu fix! 💪✨
