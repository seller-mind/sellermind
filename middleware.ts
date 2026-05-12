import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/tools/listing(.*)',
  '/tools/batch(.*)',
  '/tools/holiday(.*)',
  '/tools/reply(.*)',
  '/tools/review(.*)',
  '/api/listing(.*)',
  '/api/batch(.*)',
  '/api/holiday(.*)',
  '/api/reply(.*)',
  '/api/review(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
