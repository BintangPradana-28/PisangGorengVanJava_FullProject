const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findFirst()
    if (!user) return console.log("No user")
    
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            variant: true,
            topping: true,
          }
        }
      }
    });
    
    if (!cart) {
      console.log("No cart")
      return;
    }
    
    const formattedItems = cart.items.map(item => {
      let basePrice = 0;
      if (item.baseType === 'Kembung') basePrice = item.variant.priceKembung;
      else if (item.baseType === 'Lumpia') basePrice = item.variant.priceLumpia;
      else if (item.baseType === 'Krispy') basePrice = item.variant.priceKrispy;

      const toppingPrice = item.topping?.price || 0;
      
      return {
        productId: item.variantId,
        name: `${item.variant.flavorName} (${item.baseType})`,
        basePrice,
        toppingName: item.topping?.name || null,
        toppingPrice,
        quantity: item.quantity,
        notes: item.notes || '',
        totalPrice: (basePrice + toppingPrice) * item.quantity,
        toppingId: item.toppingId,
        baseType: item.baseType,
      };
    });
    
    console.log(JSON.stringify({ success: true, data: formattedItems }, null, 2))
  } catch(e) {
    console.error("Error:", e)
  }
  await prisma.$disconnect()
}

main()
