export { PrismaClient } from "./prisma/generated/client/index.js";
export * from "./prisma/generated/client/index.js";

import { PrismaClient } from "./prisma/generated/client/index.js";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
