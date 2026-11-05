import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { isDeleted: false, activated: true },
    select: { id: true, username: true, role: true },
    take: 10,
  });

  const categories = await prisma.itemCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const foundCount = await prisma.foundItem.count();
  const lostCount = await prisma.lostItem.count();

  console.log("\nACTIVE USERS:");
  console.table(users);

  console.log("\nEXISTING CATEGORIES:");
  console.table(categories);

  console.log("\nEXISTING ITEM COUNTS:");
  console.log({ foundCount, lostCount });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
