import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// Prisma 7 Custom Output Guide: Target the exact nested /client bundle
import { PrismaClient } from "../app/generated/prisma/client";

const prismaClientSingleton = () => {
  // Setup the native PostgreSQL connection pool optimized for Prisma 7 serverless/edge layers
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Crucial parameter to prevent SSL verification handshakes on Neon
    max: 10, // High-performance boundary for concurrently active database connections
    idleTimeoutMillis: 30000, // Clear idle connections out of the event loop after 30 seconds
  });

  // Inject the native driver engine into the Prisma adapter interface
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
