import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ১. অ্যাডমিনের কাস্টম টোকেন রিড করুন
  const adminToken = request.cookies.get('admin_token')?.value; 
  
  // ২. NextAuth-এর ইউজার সেশন টোকেন রিড করুন (লোকালহোস্টের জন্য এবং প্রোডাকশনের জন্য দুটোই চেক রাখা ভালো)
  const nextAuthToken = 
    request.cookies.get('next-auth.session-token')?.value || 
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  const { pathname } = request.nextUrl;

  // ----------------------------------------------------
  // 🔒 অ্যাডমিন প্যানেল প্রটেকশন লজিক
  // ----------------------------------------------------
  if (pathname.startsWith('/admin')) {
    
    // অ্যাডমিন ড্যাশবোর্ডে ঢুকতে চাচ্ছে কিন্তু অ্যাডমিন টোকেন নাই (NextAuth টোকেন থাকলে লাভ নাই)
    if (!adminToken && pathname.startsWith('/admin/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // অলরেডি অ্যাডমিন লগইন আছে, তাকে আবার লগইন ফর্মে (/admin) ঢুকতে দেবে না
    if (adminToken && pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // ----------------------------------------------------
  // 👤 ইউজার ড্যাশবোর্ড / প্রোফাইল প্রটেকশন (যদি ফিউচারে লাগে)
  // ----------------------------------------------------
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    // ইউজারের NextAuth টোকেন না থাকলে তাকে মেইন ইউজার লগইন পেজে পাঠাবে
    if (!nextAuthToken) {
      return NextResponse.redirect(new URL('/login', request.url)); 
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*', 
    '/admin', 
    '/dashboard/:path*', 
    '/profile/:path*'
  ],
};