// Database Seed Script for CampusBite
// Seeds initial canteen food items into PostgreSQL using Prisma ORM

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleMenuItems = [
  {
    name: 'Masala Dosa',
    description: 'Crispy fermented crepe filled with spiced potato masala, served with coconut chutney & sambar.',
    price: 60.00,
    isAvailable: true
  },
  {
    name: 'Veg Sandwich',
    description: 'Fresh white bread layered with sliced cucumber, tomato, capsicum, mint chutney, and butter.',
    price: 45.00,
    isAvailable: true
  },
  {
    name: 'Chicken Roll',
    description: 'Flaky paratha wrap stuffed with succulent spiced chicken chunks, chopped onions, and tang sauce.',
    price: 80.00,
    isAvailable: true
  },
  {
    name: 'Veg Fried Rice',
    description: 'Wok-tossed aromatic basmati rice with carrots, French beans, spring onions, and oriental spices.',
    price: 75.00,
    isAvailable: true
  },
  {
    name: 'Tea',
    description: 'Hot brewed Indian milk tea (chai) infused with aromatic ginger and cardamom.',
    price: 15.00,
    isAvailable: true
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Refreshing carbonated soda infused with freshly squeezed lime juice, mint, and rock salt.',
    price: 30.00,
    isAvailable: true
  },
  {
    name: 'Paneer Frankie',
    description: 'Soft flatbread wrap filled with spiced cottage cheese cubes, bell peppers, and chipotle sauce.',
    price: 70.00,
    isAvailable: true
  },
  {
    name: 'Cold Coffee',
    description: 'Thick creamy blended chilled milk with rich espresso and dark chocolate drizzle.',
    price: 50.00,
    isAvailable: false // Demonstrated as sold out for testing availability filtering
  }
];

async function main() {
  console.log('--- Starting CampusBite Database Seeding ---');

  // Clear existing items in reverse relation order for clean seed
  console.log('Checking existing database state...');
  const count = await prisma.menuItem.count();

  if (count === 0) {
    console.log('Inserting default menu items...');
    for (const item of sampleMenuItems) {
      const created = await prisma.menuItem.create({
        data: item
      });
      console.log(`+ Seeded: ${created.name} (₹${created.price}) [Available: ${created.isAvailable}]`);
    }
    console.log(`Seeding complete: Added ${sampleMenuItems.length} menu items.`);
  } else {
    console.log(`Database already contains ${count} menu items. Skipping insertion to preserve current state.`);
  }
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
