import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Menjalankan seeder untuk skema baru...')

  // 1. Seed Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@admin.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ User admin berhasil dibuat/diupdate (Username: admin, Password: admin123)')

  // 2. Seed Produk (Berdasarkan menu dari gambar)
  const flavors = [
    { name: 'Original + susu', kembung: 10000, lumpia: 10000, krispy: 10000, desc: 'Pisang goreng original gurih berpadu dengan kental manis susu.' },
    { name: 'Coklat', kembung: 10000, lumpia: 10000, krispy: 10000, desc: 'Pisang goreng dengan lumuran saus coklat premium manis dan lezat.' },
    { name: 'Tiramisu', kembung: 10000, lumpia: 10000, krispy: 10000, desc: 'Pisang goreng dengan lumuran glaze tiramisu khas yang aromatik.' },
    { name: 'Strawberry', kembung: 10000, lumpia: 10000, krispy: 10000, desc: 'Pisang goreng dengan topping strawberry manis segar.' },
    { name: 'Blueberry', kembung: 10000, lumpia: 10000, krispy: 10000, desc: 'Pisang goreng dengan topping blueberry manis segar.' },
    { name: 'Milky', kembung: 11000, lumpia: 11000, krispy: 10000, desc: 'Pisang goreng dengan cita rasa susu yang gurih dan nikmat.' },
    { name: 'Taro', kembung: 11000, lumpia: 11000, krispy: 11000, desc: 'Pisang goreng berselimut glaze taro dengan rasa manis unik.' },
    { name: 'Matcha', kembung: 12000, lumpia: 12000, krispy: 12000, desc: 'Pisang goreng berbalut glaze matcha khas Jepang dengan aroma teh hijau.' },
    { name: 'Coklat milky', kembung: 12000, lumpia: 12000, krispy: 11000, desc: 'Pisang goreng berbalut paduan lezat cokelat premium dengan cita rasa susu.' },
    { name: 'Blueberry Milky', kembung: 12000, lumpia: 12000, krispy: 12000, desc: 'Pisang goreng berbalut paduan lezat glaze blueberry segar dan susu.' },
    { name: 'Strawberry Milky', kembung: 12000, lumpia: 12000, krispy: 12000, desc: 'Pisang goreng berbalut paduan lezat glaze strawberry manis dan susu.' },
    { name: 'Matcha Milky', kembung: 13000, lumpia: 13000, krispy: 13000, desc: 'Pisang goreng berbalut paduan lezat glaze matcha premium dan susu.' },
  ]

  const productsToSeed: { flavorName: string; priceKembung: number; priceLumpia: number; priceKrispy: number; deskripsi_topping: string; imageUrl: string | null }[] = []

  for (const f of flavors) {
    productsToSeed.push({
      flavorName: f.name,
      priceKembung: f.kembung,
      priceLumpia: f.lumpia,
      priceKrispy: f.krispy,
      deskripsi_topping: f.desc,
      imageUrl: null,
    })
  }

  // Soft-delete existing products not in seeder to keep it clean, but preserve database integrity
  await prisma.menuVariant.updateMany({
    data: { isDeleted: true }
  })

  for (const p of productsToSeed) {
    const existing = await prisma.menuVariant.findFirst({
      where: { flavorName: p.flavorName }
    })
    if (existing) {
      await prisma.menuVariant.update({
        where: { id: existing.id },
        data: {
          ...p,
          isDeleted: false
        }
      })
    } else {
      await prisma.menuVariant.create({
        data: {
          ...p,
          isDeleted: false
        }
      })
    }
  }
  console.log('✅ Produk dari gambar berhasil di-seed')

  // 3. Seed Topping (Berdasarkan topping dari gambar: +2K)
  await prisma.topping.updateMany({
    data: { isActive: false }
  })

  const toppingsToSeed = [
    { name: 'Keju', price: 2000, emoji: '🧀', isActive: true },
    { name: 'Sprinkles', price: 2000, emoji: '✨', isActive: true },
    { name: 'Oreo', price: 2000, emoji: '🍪', isActive: true },
    { name: 'Redvelvet', price: 2000, emoji: '🍰', isActive: true },
    { name: 'Milo', price: 2000, emoji: '🍫', isActive: true },
  ]

  for (const t of toppingsToSeed) {
    await prisma.topping.upsert({
      where: { name: t.name },
      update: { price: t.price, emoji: t.emoji, isActive: true },
      create: t
    })
  }
  console.log('✅ Toppings dari gambar berhasil di-seed')

  // 4. Seed Settings
  const defaultSettings = {
    nomor_wa: '6281312167554',
    alamat: 'Jl. Raya Cilangkap l Rt.2/Rw.5, Cilangkap, Kec. Cipayung, Kota Jakarta Timur',
    jam_operasional: 'Senin–Minggu: 09.00–21.00 WIB'
  }

  await prisma.settings.upsert({
    where: { id: 'default-settings' },
    update: defaultSettings,
    create: {
      id: 'default-settings',
      ...defaultSettings
    },
  })
  console.log('✅ Konfigurasi warung (Settings) berhasil di-seed')

  // 5. Seed SiteSettings
  const siteSettings = [
    { key: 'site_name', value: 'Pisang Goreng Van Java', label: 'Nama Website', group: 'general' },
    { key: 'site_description', value: 'Pisang goreng renyah dengan lelehan topping premium terlezat se-Jawa.', label: 'Deskripsi Website', group: 'general' },
    { key: 'nomor_wa', value: '6281312167554', label: 'Nomor WhatsApp (Format: 628...)', group: 'contact' },
    { key: 'alamat', value: 'Jl. Raya Cilangkap l Rt.2/Rw.5, Cilangkap, Kec. Cipayung, Kota Jakarta Timur', label: 'Alamat Toko', group: 'contact' },
    { key: 'jam_operasional', value: 'Senin–Minggu: 09.00–21.00 WIB', label: 'Jam Operasional', group: 'contact' },
    { key: 'instagram', value: 'https://instagram.com/pisanggorengvanjava', label: 'Link Instagram', group: 'social' },
    { key: 'tiktok', value: 'https://tiktok.com/@pisanggorengvanjava', label: 'Link TikTok', group: 'social' },
    { key: 'store_open', value: 'true', label: 'Status Toko (true = Buka, false = Tutup)', group: 'general' },
    { key: 'promo_marquee_active', value: 'false', label: 'Status Promo Berjalan (true = Aktif, false = Nonaktif)', group: 'general' },
    { key: 'promo_marquee_text', value: 'PROMO SPESIAL: Diskon 20% untuk semua varian Matcha hari ini!', label: 'Teks Promo Berjalan', group: 'general' },
  ]

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, label: s.label, group: s.group },
      create: s
    })
  }
  console.log('✅ Konfigurasi detail website (SiteSetting) berhasil di-seed')

  console.log('🎉 Selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
