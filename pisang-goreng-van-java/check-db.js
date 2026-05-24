const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany();
  products.forEach(p => console.log(p.nama_varian));
}
check();
