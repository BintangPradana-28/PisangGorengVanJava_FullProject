import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/features/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json({ success: false, data: [] }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
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
      return NextResponse.json({ success: true, data: [] }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    // Transform to match frontend CartItem interface
    const isReseller = (session?.user as any)?.role === 'RESELLER';

    const formattedItems = cart.items.map(item => {
      let basePrice = 0;
      if (item.baseType === 'Kembung') {
        basePrice = isReseller && item.variant.wholesaleKembung > 0 ? item.variant.wholesaleKembung : item.variant.priceKembung;
      } else if (item.baseType === 'Lumpia') {
        basePrice = isReseller && item.variant.wholesaleLumpia > 0 ? item.variant.wholesaleLumpia : item.variant.priceLumpia;
      } else if (item.baseType === 'Krispy') {
        basePrice = isReseller && item.variant.wholesaleKrispy > 0 ? item.variant.wholesaleKrispy : item.variant.priceKrispy;
      }

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

    return NextResponse.json({ success: true, data: formattedItems }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error("GET /api/cart Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const fs = require('fs');
  const logFile = 'cart-log.txt';
  const log = (msg: string) => {
    fs.appendFileSync(logFile, new Date().toISOString() + ' ' + msg + '\n');
    console.log(msg);
  };
  
  try {
    log('--- POST /api/cart CALLED ---');
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      log('Unauthorized: No session or userId');
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    log(`User ID: ${userId}`);

    const body = await req.json();
    
    const CartItemSchema = z.object({
      productId: z.string().min(1),
      toppingId: z.string().optional().nullable(),
      name: z.string(),
      quantity: z.number().int().min(1),
      notes: z.string().optional()
    })

    const parsedItems = z.array(CartItemSchema).safeParse(body.items)

    if (!parsedItems.success) {
      log('Invalid payload');
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const items = parsedItems.data
    log(`Payload items length: ${items.length}`);

    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      log('Cart not found, creating new one');
      cart = await prisma.cart.create({ data: { userId } });
    }
    log(`Cart ID: ${cart.id}`);

    // Completely replace items (simplest sync mechanism for small arrays)
    // 1. Delete old items
    const deleted = await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    log(`Deleted ${deleted.count} old items`);

    // 2. Insert new items
    if (items.length > 0) {
      log(`Inserting new items...`);
      const dataToInsert = items.map((item) => ({
          cartId: cart?.id ?? '', // Safe fallback instead of non-null assertion
          variantId: item.productId,
          toppingId: item.toppingId || null,
          baseType: item.name.includes('Kembung') ? 'Kembung' : item.name.includes('Lumpia') ? 'Lumpia' : 'Krispy',
          quantity: item.quantity,
          notes: item.notes || '',
        }));
      log('Data to insert: ' + JSON.stringify(dataToInsert));
      
      const created = await prisma.cartItem.createMany({
        data: dataToInsert
      });
      log(`Created ${created.count} items`);
    }

    log('SUCCESS');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(`ERROR: ${error.message} ${error.stack}`);
    }
    console.error("POST /api/cart Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
