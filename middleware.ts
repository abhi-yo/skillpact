import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Public routes that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/api/auth/*',
  '/api/trpc/*', // tRPC routes are protected internally
];

const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    // Static Path
    if (!publicPath.includes('*')) {
      return path === publicPath;
    }
    // Wildcard Path
    return path.startsWith(publicPath.replace('*', ''));
  });
};

// Use NextAuth middleware
export default withAuth(
  function middleware(req) {
    // Pass through to nextauth if the path is public
    const { pathname } = req.nextUrl;
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = { 
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] 
}; 