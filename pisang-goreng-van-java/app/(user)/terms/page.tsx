import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Pisang Goreng Van Java',
  description: 'Syarat dan Ketentuan layanan Pisang Goreng Van Java.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-cream-50 py-24 sm:py-32">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-cream-200">
          <div className="mb-12 border-b border-cream-200 pb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-700 mb-4">Syarat & Ketentuan</h1>
            <p className="text-brown-400">Terakhir diperbarui: 24 Mei 2026</p>
          </div>

          <div className="prose prose-brown max-w-none text-brown-600 space-y-6">
            <p>
              Selamat datang di <strong>Pisang Goreng Van Java</strong>. Dengan mengakses dan menggunakan situs web ini, serta melakukan pemesanan produk kami, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang berlaku di bawah ini.
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">1. Informasi Produk dan Layanan</h3>
            <p>
              Kami berusaha menyajikan deskripsi, harga, dan ketersediaan produk (termasuk varian dan topping) seakurat mungkin. Namun, kami berhak mengubah informasi harga dan stok kapan saja tanpa pemberitahuan sebelumnya, sesuai dengan kondisi operasional di dapur pusat kami.
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">2. Kebijakan Pemesanan & Pembayaran</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pemesanan yang dilakukan di luar jam operasional (10:00 - 21:00 WIB) akan diproses pada hari kerja berikutnya.</li>
              <li>Sistem saat ini melayani pesanan yang akan diselesaikan dan dibayar melalui platform WhatsApp atau integrasi pembayaran pihak ketiga yang resmi.</li>
              <li>Jika Anda membatalkan pesanan setelah makanan mulai digoreng, pembayaran tidak dapat dikembalikan penuh.</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">3. Kebijakan Pengiriman (Delivery)</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Radius pengiriman kami dibatasi untuk memastikan produk diterima dalam keadaan segar dan hangat (khususnya untuk area Jakarta Timur dan sekitarnya).</li>
              <li>Estimasi waktu pengantaran bergantung pada kondisi cuaca, kepadatan pesanan, dan pihak ekspedisi/kurir (GoFood/GrabFood).</li>
              <li>Kerusakan yang terjadi akibat kelalaian kurir pihak ketiga berada di luar tanggung jawab langsung kami, namun kami akan berusaha membantu mediasi klaim.</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">4. Akun Pengguna</h3>
            <p>
              Jika Anda membuat akun (mendaftar) di situs ini, Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda. Kami tidak bertanggung jawab atas kerugian yang timbul akibat peretasan akun karena kelalaian pengguna.
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">5. Kebijakan Pengembalian (Refund)</h3>
            <p>
              Pengembalian dana atau penggantian produk hanya berlaku jika:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Produk yang dikirimkan salah (tidak sesuai dengan bukti pesanan awal).</li>
              <li>Produk yang diterima dalam keadaan tidak layak konsumsi akibat kesalahan fatal dari dapur produksi.</li>
              <li>Klaim wajib disertakan dengan bukti foto/video unboxing maksimal 2 jam setelah makanan diterima.</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">6. Hubungi Kami</h3>
            <p>
              Jika Anda memiliki keluhan atau pertanyaan terkait pesanan Anda, tim layanan pelanggan kami siap membantu Anda di:
            </p>
            <div className="bg-cream-100 p-6 rounded-xl mt-4">
              <p className="font-bold">Pisang Goreng Van Java</p>
              <p>WhatsApp: +62 813-1216-7554</p>
              <p>Email: support@pisanggorengvanjava.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
