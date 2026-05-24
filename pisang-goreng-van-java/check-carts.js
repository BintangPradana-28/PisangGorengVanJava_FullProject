const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  const carts = await prisma.cart.findMany({ include: { items: true } })
  console.log(JSON.stringify(carts, null, 2))
  await prisma.$disconnect()
}

main()
