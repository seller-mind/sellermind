/**
 * Clerk configuration check helper
 * Use this to check if Clerk is properly configured before using Clerk features
 */

export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!key && !key.includes('placeholder');
}
