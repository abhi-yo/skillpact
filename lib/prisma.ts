import { PrismaClient } from '../prisma/generated/client';

// Declare a global variable to hold the Prisma client instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Instantiate PrismaClient. Use the global instance in development to avoid creating too many connections.
const prisma = global.prisma || new PrismaClient();

// In development, assign the new client instance to the global variable.
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma; 