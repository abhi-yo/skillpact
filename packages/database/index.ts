export { PrismaClient } from "./prisma/client/index.js";
export * from "./prisma/client/index.js";

import { PrismaClient } from "./prisma/client/index.js";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
