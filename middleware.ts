import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow access to public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  const token = await getToken({ req });
  
  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] 
}; 