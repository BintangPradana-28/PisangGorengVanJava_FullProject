const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  // Update Settings table
  await prisma.settings.updateMany({
    where: { nomor_wa: '6281234567890' },
    data: { nomor_wa: '6281312167554' }
  })
  
  // Update SiteSetting table
  await prisma.siteSetting.updateMany({
    where: { key: 'nomor_wa' },
    data: { value: '6281312167554' }
  })
  
  console.log("Nomor WA telah berhasil diperbarui ke 6281312167554 di database.")
  
  await prisma.$disconnect()
}

main()
