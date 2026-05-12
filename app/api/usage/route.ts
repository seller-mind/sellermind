import { NextResponse } from 'next/server'
import { getUsageInfo } from '@/lib/usage'

export async function GET() {
  try {
    const info = await getUsageInfo()
    return NextResponse.json(info)
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ remaining: 0, totalUsed: 0, isSubscribed: false, freeLimit: 3 }, { status: 200 })
  }
}
