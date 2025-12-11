import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Checking database...\n');

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      tokens: true,
    },
  });

  console.log(`👥 Total Users: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`User ${index + 1}:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log(`  Refresh Tokens: ${user.tokens.length}`);
    console.log('');
  });

  // Get all refresh tokens
  const tokens = await prisma.refreshToken.findMany();
  console.log(`🔑 Total Refresh Tokens: ${tokens.length}\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
