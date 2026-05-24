// data/products.ts
// Static fallback data (mirrors the database seed)
import { MenuVariant, Topping } from './types'

export const MENU_VARIANTS: MenuVariant[] = [
  { id: '1',  flavorName: 'Original + susu',  prices: { kembung: 10000, lumpia: 10000, krispy: 10000 }, isActive: true, isAvailable: true, sortOrder: 1 },
  { id: '2',  flavorName: 'Coklat',           prices: { kembung: 10000, lumpia: 10000, krispy: 10000 }, isActive: true, isAvailable: true, sortOrder: 2 },
  { id: '3',  flavorName: 'Tiramisu',         prices: { kembung: 10000, lumpia: 10000, krispy: 10000 }, isActive: true, isAvailable: true, sortOrder: 3 },
  { id: '4',  flavorName: 'Strawberry',       prices: { kembung: 10000, lumpia: 10000, krispy: 10000 }, isActive: true, isAvailable: true, sortOrder: 4 },
  { id: '5',  flavorName: 'Blueberry',        prices: { kembung: 10000, lumpia: 10000, krispy: 10000 }, isActive: true, isAvailable: true, sortOrder: 5 },
  { id: '6',  flavorName: 'Milky',            prices: { kembung: 11000, lumpia: 11000, krispy: 10000 }, isActive: true, isAvailable: true, sortOrder: 6 },
  { id: '7',  flavorName: 'Taro',             prices: { kembung: 11000, lumpia: 11000, krispy: 11000 }, isActive: true, isAvailable: true, sortOrder: 7 },
  { id: '8',  flavorName: 'Matcha',           prices: { kembung: 12000, lumpia: 12000, krispy: 12000 }, isActive: true, isAvailable: true, sortOrder: 8 },
  { id: '9',  flavorName: 'Coklat milky',     prices: { kembung: 12000, lumpia: 12000, krispy: 11000 }, isActive: true, isAvailable: true, sortOrder: 9 },
  { id: '10', flavorName: 'Blueberry Milky',  prices: { kembung: 12000, lumpia: 12000, krispy: 12000 }, isActive: true, isAvailable: true, sortOrder: 10 },
  { id: '11', flavorName: 'Strawberry Milky', prices: { kembung: 12000, lumpia: 12000, krispy: 12000 }, isActive: true, isAvailable: true, sortOrder: 11 },
  { id: '12', flavorName: 'Matcha Milky',     prices: { kembung: 13000, lumpia: 13000, krispy: 13000 }, isActive: true, isAvailable: true, sortOrder: 12 },
]

export const TOPPINGS: Topping[] = [
  { id: '1', name: 'Keju',      price: 2000, emoji: '🧀', isActive: true },
  { id: '2', name: 'Sprinkles', price: 2000, emoji: '🎊', isActive: true },
  { id: '3', name: 'Oreo',      price: 2000, emoji: '🍪', isActive: true },
  { id: '4', name: 'Redvelvet', price: 2000, emoji: '❤️', isActive: true },
  { id: '5', name: 'Milo',      price: 2000, emoji: '☕', isActive: true },
]

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

export const formatPriceShort = (price: number): string =>
  `${price / 1000}K`

export const buildWhatsAppMessage = (
  flavorName: string,
  baseType: string,
  baseLabel: string,
  toppingName?: string,
  total?: number
): string => {
  const topping = toppingName ? `\n• Topping: ${toppingName} (+Rp 2.000)` : ''
  const totalLine = total ? `\n• Total: ${formatPrice(total)}` : ''
  return encodeURIComponent(
    `Halo Pisang Goreng Van Java! 🍌\n\nSaya ingin memesan:\n• Rasa: ${flavorName}\n• Tipe: ${baseLabel}${topping}${totalLine}\n\nMohon konfirmasi ketersediaan. Terima kasih! 🙏`
  )
}
