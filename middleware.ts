import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// TODO: Replace this with Clerk middleware once Clerk is configured
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isProtectedRoute = createRouteMatcher([
//   '/tools/listing(.*)',
//   '/tools/batch(.*)',
//   '/tools/holiday(.*)',
//   '/tools/reply(.*)',
//   '/tools/review(.*)',
//   '/api/listing(.*)',
//   '/api/batch(.*)',
//   '/api/holiday(.*)',
//   '/api/reply(.*)',
//   '/api/review(.*)',
// ])

// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) {
//     await auth.protect()
//   }
// })

// Temporary simple middleware - will be replaced with Clerk middleware after Clerk is configured
export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Once Clerk is configured, this will be replaced with clerkMiddleware
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
