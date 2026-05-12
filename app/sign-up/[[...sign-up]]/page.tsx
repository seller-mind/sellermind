import { isClerkConfigured } from '@/lib/clerk-helpers'

export default function SignUpPage() {
  // If Clerk is not configured, show a message
  if (!isClerkConfigured()) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground-primary mb-4">Registration Not Configured</h1>
          <p className="text-foreground-secondary mb-6">
            Sign-up functionality will be available once the admin configures Clerk authentication.
          </p>
          <p className="text-sm text-foreground-muted">
            You can still use free SEO tools like Tag Generator and SEO Analyzer without signing up.
          </p>
        </div>
      </div>
    )
  }

  // Dynamically import Clerk SignUp to avoid build errors when Clerk is not configured
  const { SignUp } = require('@clerk/nextjs')
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <SignUp />
    </div>
  )
}
