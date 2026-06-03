/**
 * Edge Middleware — Security Perimeter
 *
 * Runs on Vercel Edge Runtime before any origin request.
 * JWT check only — no DB call. Adds ~1ms latency.
 *
 * Layer 1 of two-layer role enforcement.
 * Layer 2 is the session check inside each Route Handler.
 */
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;

  // Public routes — always accessible
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = token.user?.role ?? (token as unknown as { role?: string }).role;

  // Role-based routing
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(role === 'seller' ? '/seller/catalogue' : '/login', req.url));
  }
  if (pathname.startsWith('/seller') && role !== 'seller') {
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/login', req.url));
  }

  // Default route based on role
  if (pathname === '/') {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
    if (role === 'seller') return NextResponse.redirect(new URL('/seller/catalogue', req.url));
  }

  // Redirect /seller base to /seller/catalogue
  if (pathname === '/seller') {
    return NextResponse.redirect(new URL('/seller/catalogue', req.url));
  }

  // API routes that need auth but aren't role-specific
  if (pathname.startsWith('/api/products') || pathname.startsWith('/api/orders')) {
    if (!token) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
