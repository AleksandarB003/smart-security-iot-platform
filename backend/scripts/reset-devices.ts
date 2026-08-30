import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.device.deleteMany({});
  console.log(`Deleted ${count} device(s) and their associated proof logs / events.`);
}

main()
  .catch((error) => {
    console.error("Failed to reset devices:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());