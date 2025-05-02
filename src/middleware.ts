import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware replaces Clerk authentication
// It allows all routes to be public
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
