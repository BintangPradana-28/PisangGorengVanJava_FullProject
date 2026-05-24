# Arsitektur & Standar Teknis: Warung Pisang Goreng Van Java

Proyek ini dibangun dengan standar **Enterprise-Grade Engineering** untuk mencegah masalah *vibe coding* seperti *Spaghetti Code*, *God Component*, dan celah keamanan.

## 1. Feature-Sliced Design (Domain-Driven)
Kami meninggalkan struktur folder monolitik berbasis tipe (seperti memisahkan semua UI di `components/` dan semua logika di `lib/`). Kode sekarang dikelompokkan berdasarkan **Fitur/Domain**:

- `src/features/auth/`: Segala sesuatu tentang login, hashing (Bcrypt), *session*, dan *middleware* NextAuth.
- `src/features/menu/`: Komponen katalog menu, UI Kartu, logika CRUD menu, dan *upload* gambar.
- `src/features/settings/`: Konfigurasi warung, integrasi UI peta, dan WhatsApp.

Prinsip Karantina (Isolation): Komponen dalam satu fitur tidak boleh mengimpor *internal logic* fitur lain secara langsung tanpa melalui kontrak API yang jelas.

## 2. Zero Trust Security & Validasi
- **Validasi Zod:** Semua *input form* dan *URL Parameters* harus divalidasi dengan skema Zod sebelum diproses atau menyentuh *database*.
- **Otorisasi Middleware:** Setiap akses *endpoint API* mutasi data (POST, PUT, DELETE) wajib melewati pengecekan token/sesi.
- **Enkripsi:** Password selalu di-hash satu arah menggunakan `bcryptjs`. Tidak ada password *plain-text*.

## 3. Flawless Database (Prisma)
- **Soft Deletes:** Tidak menggunakan perintah `DELETE`. Rekaman ditandai dengan flag `isDeleted = true`.
- **Indexing:** Kolom yang sering di-query seperti `username` dan `nama_varian` menggunakan `@@index`.
- **Transactions (ACID):** Penyimpanan entitas bersarang atau operasi multi-tabel (seperti simpan menu + unggah gambar) wajib menggunakan `prisma.$transaction`.
- **N+1 Prevention:** Menggunakan fitur *include/select* bawaan Prisma dan Query Agregasi.

## 4. UI/UX & Observabilitas
- **Dumb UI Components:** Komponen UI murni (*stateless*) untuk menjaga modularitas.
- **Skeleton Loading & Optimistic UI:** Menghindari layar kosong saat antarmuka menunggu balasan server.
- **Global Error Handling:** Semua *error* ditangkap, dicatat di server, dan hanya mengembalikan pesan *"Terjadi kesalahan pada server"* kepada klien (tanpa *stack trace* bocor).
