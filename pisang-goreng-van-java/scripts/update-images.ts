import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating images for specific variants...');

  const updates = [
    { name: 'Matcha Milky', url: '/images/flavors/matcha_milky.png' },
    { name: 'Strawberry Milky', url: '/images/flavors/strawberry_milky.png' },
    { name: 'Blueberry Milky', url: '/images/flavors/blueberry_milky.png' },
  ];

  for (const update of updates) {
    const existing = await prisma.menuVariant.findFirst({
      where: { flavorName: update.name }
    });

    if (existing) {
      await prisma.menuVariant.update({
        where: { id: existing.id },
        data: { imageUrl: update.url }
      });
      console.log(`Updated ${update.name} with image URL ${update.url}`);
    } else {
      console.log(`Warning: Variant ${update.name} not found!`);
    }
  }

  console.log('Update complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
