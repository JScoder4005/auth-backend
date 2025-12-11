import { PrismaConfig } from "@prisma/client";

export const config: PrismaConfig = {
  adapter: {
    url: process.env.DATABASE_URL, // this reads from your .env
  },
};
