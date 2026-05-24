// lib/utils.ts

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)

export const formatPriceShort = (price: number): string =>
  `${price / 1000}K`

export function buildWhatsAppUrl(message: string): string {
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6281312167554'
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export function buildOrderMessage(
  flavorName: string,
  baseLabel: string,
  toppingName?: string,
  total?: number
): string {
  const topping = toppingName ? `\n• Topping: ${toppingName} (+Rp 2.000)` : ''
  const totalLine = total ? `\n• Total: ${formatPrice(total)}` : ''
  return `Halo Pisang Goreng Van Java! 🍌\n\nSaya ingin memesan:\n• Rasa: ${flavorName}\n• Tipe: ${baseLabel}${topping}${totalLine}\n\nMohon konfirmasi ketersediaan. Terima kasih! 🙏`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}
