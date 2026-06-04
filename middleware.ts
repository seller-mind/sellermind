import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check country from Vercel or Cloudflare headers
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('cf-ipcountry') || ''
  
  // Block China (CN) access
  if (country === 'CN') {
    // Allow legal pages (essential for legal compliance)
    if (request.nextUrl.pathname === '/privacy' || 
        request.nextUrl.pathname === '/terms' ||
        request.nextUrl.pathname === '/dmca') {
      return NextResponse.next()
    }
    
    // Allow webhook endpoints (need to receive webhook calls)
    if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
      return NextResponse.next()
    }
    
    // Block all other routes with 451 (Unavailable For Legal Reasons)
    return new NextResponse(null, {
      status: 451,
      statusText: 'Unavailable For Legal Reasons',
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
