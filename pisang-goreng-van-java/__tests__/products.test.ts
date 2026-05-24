import { MENU_VARIANTS, TOPPINGS, formatPriceShort } from '@/data/products'
describe('MENU_VARIANTS', () => {
  it('has exactly 12 variants', () => { expect(MENU_VARIANTS).toHaveLength(12) })
  it('all variants have 3 price points', () => {
    MENU_VARIANTS.forEach(v => {
      expect(v.prices.kembung).toBeGreaterThan(0)
      expect(v.prices.lumpia).toBeGreaterThan(0)
      expect(v.prices.krispy).toBeGreaterThan(0)
    })
  })
  it('Matcha Milky is the most expensive', () => {
    const matcha = MENU_VARIANTS.find(v => v.flavorName === 'Matcha Milky')
    expect(matcha?.prices.kembung).toBe(13000)
  })
})
describe('TOPPINGS', () => {
  it('has exactly 5 toppings', () => { expect(TOPPINGS).toHaveLength(5) })
  it('all toppings cost 2000', () => { TOPPINGS.forEach(t => expect(t.price).toBe(2000)) })
})
