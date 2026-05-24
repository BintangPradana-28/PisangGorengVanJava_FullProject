import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Pisang Goreng Van Java',
  description: 'Kebijakan privasi dan perlindungan data pelanggan Pisang Goreng Van Java.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-cream-50 py-24 sm:py-32">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-cream-200">
          <div className="mb-12 border-b border-cream-200 pb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brown-700 mb-4">Kebijakan Privasi</h1>
            <p className="text-brown-400">Terakhir diperbarui: 24 Mei 2026</p>
          </div>

          <div className="prose prose-brown max-w-none text-brown-600 space-y-6">
            <p>
              Kami di <strong>Pisang Goreng Van Java</strong> sangat menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi pribadi Anda saat Anda menggunakan layanan dan situs web kami (pisanggorengvanjava.com).
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h3>
            <p>
              Kami hanya mengumpulkan informasi yang diperlukan untuk memberikan layanan terbaik kepada Anda:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Informasi Kontak:</strong> Nama, alamat email, dan nomor telepon WhatsApp saat Anda mendaftar atau memesan.</li>
              <li><strong>Informasi Pengiriman:</strong> Alamat lengkap untuk keperluan pengantaran pesanan.</li>
              <li><strong>Informasi Teknis:</strong> Data interaksi dengan situs kami, alamat IP, dan preferensi peramban (melalui cookies fungsional).</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h3>
            <p>
              Informasi yang dikumpulkan digunakan semata-mata untuk:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses dan mengantarkan pesanan Anda secara akurat.</li>
              <li>Berkomunikasi dengan Anda mengenai status pesanan via WhatsApp.</li>
              <li>Meningkatkan kualitas layanan dan antarmuka situs web kami.</li>
              <li>Mengirimkan informasi penawaran khusus (hanya jika Anda telah menyetujui).</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">3. Perlindungan dan Keamanan Data</h3>
            <p>
              Kami menggunakan langkah-langkah keamanan teknis standar industri (seperti enkripsi database dan otentikasi aman via Google OAuth) untuk melindungi data Anda dari akses yang tidak sah. Kami <strong>tidak pernah</strong> menjual data pribadi pelanggan kepada pihak ketiga manapun.
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">4. Penggunaan Pihak Ketiga (Third-Party)</h3>
            <p>
              Layanan kami mungkin menggunakan layanan pihak ketiga yang aman (seperti penyedia layanan hosting dan analitik). Saat Anda memesan dengan metode pengiriman GoFood atau GrabFood, beberapa informasi pengiriman mungkin dibagikan dengan layanan kurir tersebut untuk keperluan logistik.
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">5. Hak Anda</h3>
            <p>
              Anda berhak untuk mengakses, mengubah, atau menghapus data pribadi Anda yang ada di sistem kami. Anda dapat melakukan perubahan ini melalui panel profil Anda atau menghubungi layanan pelanggan kami.
            </p>

            <h3 className="font-serif text-xl font-bold text-brown-700 mt-8 mb-4">6. Hubungi Kami</h3>
            <p>
              Jika Anda memiliki pertanyaan terkait Kebijakan Privasi ini atau pengelolaan data Anda, silakan hubungi kami di:
            </p>
            <div className="bg-cream-100 p-6 rounded-xl mt-4">
              <p className="font-bold">Pisang Goreng Van Java</p>
              <p>Jl. Raya Cilangkap l Rt.2/Rw.5, Cilangkap, Kec. Cipayung, Kota Jakarta Timur 13870</p>
              <p>Email: legal@pisanggorengvanjava.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
