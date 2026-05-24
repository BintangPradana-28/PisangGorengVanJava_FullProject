const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findFirst()
    if (!user) return console.log("No user")
    
    let cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } })
    
    const variant = await prisma.menuVariant.findFirst()
    
    await prisma.cartItem.createMany({
      data: [
        {
          cartId: cart.id,
          variantId: variant.id,
          toppingId: null,
          baseType: 'Kembung',
          quantity: 1,
          notes: ''
        }
      ]
    })
    console.log("Success")
  } catch(e) {
    console.error("Error:", e)
  }
  await prisma.$disconnect()
}

main()
