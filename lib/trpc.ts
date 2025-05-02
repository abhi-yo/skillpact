import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/root'; // Path to your AppRouter type

export const trpc = createTRPCReact<AppRouter>(); 