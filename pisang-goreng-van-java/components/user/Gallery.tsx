'use client'
// components/user/Gallery.tsx
import { motion } from 'framer-motion'

const GALLERY = [
  { emoji: '🍌', label: 'Kembung Original', bg: 'from-amber-600 to-brown-400' },
  { emoji: '🌿', label: 'Matcha Milky',     bg: 'from-green-700 to-green-400' },
  { emoji: '🍓', label: 'Strawberry Milky', bg: 'from-pink-700 to-pink-400'   },
  { emoji: '🫐', label: 'Blueberry Lumpia', bg: 'from-blue-700 to-blue-400'   },
  { emoji: '💜', label: 'Taro Krispy',      bg: 'from-purple-700 to-purple-400'},
  { emoji: '🍫', label: 'Coklat Milky',     bg: 'from-orange-900 to-orange-600'},
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="text-amber-brand text-xs font-semibold tracking-[0.2em] uppercase mb-2">Galeri</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-700">
            Foto <span className="text-amber-brand">Produk</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {GALLERY.map(({ emoji, label, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className={`w-full h-full bg-gradient-to-br ${bg} flex items-center justify-center
                               transition-transform duration-300 group-hover:scale-105`}>
                <span className="text-7xl sm:text-8xl filter drop-shadow-lg">{emoji}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white font-semibold text-sm drop-shadow">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
