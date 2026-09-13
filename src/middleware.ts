import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value; 
  
  const nextAuthToken = 
    request.cookies.get('next-auth.session-token')?.value || 
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  const { pathname } = request.nextUrl;
  const SECRET_ADMIN = '/apt-start-avix-admin';

  // ----------------------------------------------------
  // 🚫 ১. কেউ সরাসরি /admin বা /admin/* এ ঢুকলে 404 পেজ দেখাবে
  // ----------------------------------------------------
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // ----------------------------------------------------
  // 🔒 ২. সিক্রেট অ্যাডমিন প্যানেল প্রটেকশন লজিক
  // ----------------------------------------------------
  if (pathname.startsWith(SECRET_ADMIN)) {
    
    // টোকেন ছাড়া ড্যাশবোর্ডে ঢুকতে চাইলে লগইন পেজে পাঠাবে
    if (!adminToken && pathname.startsWith(`${SECRET_ADMIN}/dashboard`)) {
      return NextResponse.redirect(new URL(SECRET_ADMIN, request.url));
    }

    // অলরেডি অ্যাডমিন লগইন থাকলে লগইন পেজে ঢুকতে না দিয়ে ড্যাশবোর্ডে পাঠাবে
    if (adminToken && pathname === SECRET_ADMIN) {
      return NextResponse.redirect(new URL(`${SECRET_ADMIN}/dashboard`, request.url));
    }
  }

  // ----------------------------------------------------
  // 👤 ৩. ইউজার ড্যাশবোর্ড / প্রোফাইল প্রটেকশন
  // ----------------------------------------------------
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    if (!nextAuthToken) {
      return NextResponse.redirect(new URL('/login', request.url)); 
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/apt-start-avix-admin',
    '/apt-start-avix-admin/:path*', 
    '/dashboard/:path*', 
    '/profile/:path*'
  ],
};