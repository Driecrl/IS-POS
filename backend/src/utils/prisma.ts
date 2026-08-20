import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "YES" : "NO");
console.log("DATABASE_URL value:", process.env.DATABASE_URL);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const prisma = new PrismaClient({ adapter });