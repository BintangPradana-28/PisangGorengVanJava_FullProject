import { formatPrice, formatPriceShort, buildOrderMessage } from '@/lib/utils'
describe('formatPrice', () => {
  it('formats IDR correctly', () => { expect(formatPrice(10000)).toBe('Rp\u00A010.000') })
  it('formats zero', () => { expect(formatPrice(0)).toBe('Rp\u00A00') })
})
describe('formatPriceShort', () => {
  it('converts 10000 to 10K', () => { expect(formatPriceShort(10000)).toBe('10K') })
  it('converts 13000 to 13K', () => { expect(formatPriceShort(13000)).toBe('13K') })
})
describe('buildOrderMessage', () => {
  it('includes flavor and type', () => {
    const msg = buildOrderMessage('Matcha Milky', 'Kembung (Isi 15)')
    expect(msg).toContain('Matcha Milky')
    expect(msg).toContain('Kembung (Isi 15)')
  })
  it('includes topping when provided', () => {
    const msg = buildOrderMessage('Coklat', 'Krispy (Isi 5)', 'Keju', 12000)
    expect(msg).toContain('Keju')
    expect(msg).toContain('Rp')
  })
})
