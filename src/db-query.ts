import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'users':
      const users = await prisma.user.findMany({
        include: { tokens: true },
      });
      console.table(users.map(u => ({
        id: u.id,
        email: u.email,
        createdAt: u.createdAt,
        tokenCount: u.tokens.length,
      })));
      break;

    case 'tokens':
      const tokens = await prisma.refreshToken.findMany({
        include: { user: true },
      });
      console.table(tokens.map(t => ({
        id: t.id,
        userEmail: t.user.email,
        createdAt: t.createdAt,
        token: t.token.substring(0, 20) + '...',
      })));
      break;

    case 'count':
      const userCount = await prisma.user.count();
      const tokenCount = await prisma.refreshToken.count();
      console.log(`👥 Users: ${userCount}`);
      console.log(`🔑 Tokens: ${tokenCount}`);
      break;

    case 'clear-tokens':
      const deleted = await prisma.refreshToken.deleteMany();
      console.log(`🗑️  Deleted ${deleted.count} refresh tokens`);
      break;

    case 'user':
      const email = process.argv[3];
      if (!email) {
        console.log('Usage: npx ts-node src/db-query.ts user <email>');
        break;
      }
      const user = await prisma.user.findUnique({
        where: { email },
        include: { tokens: true },
      });
      console.log(user);
      break;

    default:
      console.log('Available commands:');
      console.log('  npx ts-node src/db-query.ts users          - List all users');
      console.log('  npx ts-node src/db-query.ts tokens         - List all tokens');
      console.log('  npx ts-node src/db-query.ts count          - Count users and tokens');
      console.log('  npx ts-node src/db-query.ts user <email>   - Find user by email');
      console.log('  npx ts-node src/db-query.ts clear-tokens   - Delete all tokens');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
