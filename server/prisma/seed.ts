import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Electronics",
  "Documents & Cards",
  "Bags & Luggage",
  "Keys",
  "Jewelry & Watches",
  "Clothing",
  "Books & Stationery",
  "Pets",
  "Others",
];

async function main() {
  console.log("Seeding database...");

  // --- Categories ---
  const categories: Record<string, string> = {};
  for (const name of CATEGORIES) {
    const existing = await prisma.itemCategory.findFirst({ where: { name } });
    const category =
      existing ?? (await prisma.itemCategory.create({ data: { name } }));
    categories[name] = category.id;
  }
  console.log(`Categories: ${CATEGORIES.length}`);

  // --- Admin user ---
  const adminPassword = await bcrypt.hash("admin123", 16);
  const admin =
    (await prisma.user.findFirst({ where: { username: "admin" } })) ??
    (await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@lostfound.local",
        password: adminPassword,
        role: "ADMIN",
        userImg: "https://api.dicebear.com/9.x/initials/svg?seed=admin",
      },
    }));
  console.log(`Admin: ${admin.username} / admin123`);

  // --- Demo user ---
  const demoPassword = await bcrypt.hash("demo1234", 16);
  const demo =
    (await prisma.user.findFirst({ where: { username: "demo" } })) ??
    (await prisma.user.create({
      data: {
        username: "demo",
        email: "demo@lostfound.local",
        password: demoPassword,
        role: "USER",
        userImg: "https://api.dicebear.com/9.x/initials/svg?seed=demo",
      },
    }));
  console.log(`Demo user: ${demo.username} / demo1234`);

  // --- Sample items (only if the tables are empty) ---
  const foundCount = await prisma.foundItem.count();
  if (foundCount === 0) {
    await prisma.foundItem.createMany({
      data: [
        {
          userId: demo.id,
          categoryId: categories["Electronics"],
          foundItemName: "Black Samsung Galaxy S23",
          description:
            "Found near the central bus station. Has a cracked screen protector and a blue case.",
          location: "Central Bus Station, Platform 4",
          img: "https://picsum.photos/seed/phones/600/400",
        },
        {
          userId: admin.id,
          categoryId: categories["Keys"],
          foundItemName: "Keyring with 3 keys and a red tag",
          description:
            "A small keyring with three keys and a red plastic tag marked 'B-21'.",
          location: "City Library, 2nd floor",
          img: "https://picsum.photos/seed/keys/600/400",
        },
        {
          userId: demo.id,
          categoryId: categories["Bags & Luggage"],
          foundItemName: "Blue JanSport backpack",
          description:
            "Blue backpack with a mathematics textbook and a water bottle inside.",
          location: "University cafeteria",
          img: "https://picsum.photos/seed/backpack/600/400",
        },
      ],
    });
    console.log("Found items: 3");
  }

  const lostCount = await prisma.lostItem.count();
  if (lostCount === 0) {
    await prisma.lostItem.createMany({
      data: [
        {
          userId: demo.id,
          categoryId: categories["Documents & Cards"],
          lostItemName: "Brown leather wallet",
          description:
            "Brown leather wallet containing an ID card and two bank cards.",
          location: "Green Park, near the north gate",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          img: "https://picsum.photos/seed/wallet/600/400",
        },
        {
          userId: admin.id,
          categoryId: categories["Electronics"],
          lostItemName: "Wireless Sony WH-1000XM4 headphones",
          description: "Black over-ear headphones in a hard case.",
          location: "Route 12 bus",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          img: "https://picsum.photos/seed/headphones/600/400",
        },
      ],
    });
    console.log("Lost items: 2");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
