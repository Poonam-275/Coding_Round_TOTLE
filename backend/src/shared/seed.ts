import { PrismaClient, Role } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await prisma.user.upsert({
    where: { id: 'admin' },
    update: { role: Role.ADMIN, email: 'admin@example.com', displayName: 'Admin' },
    create: { id: 'admin', role: Role.ADMIN, email: 'admin@example.com', displayName: 'Admin' },
  });
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error(e);
  process.exit(1);
});
