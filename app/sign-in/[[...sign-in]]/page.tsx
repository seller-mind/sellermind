import { isClerkConfigured } from '@/lib/clerk-helpers'

export default function SignInPage() {
  // If Clerk is not configured, show a message
  if (!isClerkConfigured()) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground-primary mb-4">Authentication Not Configured</h1>
          <p className="text-foreground-secondary mb-6">
            Sign-in functionality will be available once the admin configures Clerk authentication.
          </p>
          <p className="text-sm text-foreground-muted">
            You can still use free SEO tools like Tag Generator and SEO Analyzer without signing in.
          </p>
        </div>
      </div>
    )
  }

  // Dynamically import Clerk SignIn to avoid build errors when Clerk is not configured
  const { SignIn } = require('@clerk/nextjs')
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <SignIn />
    </div>
  )
}
