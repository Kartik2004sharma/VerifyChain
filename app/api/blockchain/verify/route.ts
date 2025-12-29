import { NextRequest, NextResponse } from "next/server"
import { verifyProduct } from "@/lib/blockchain-verification"

// Rate limiting map: IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_PER_HOUR = 100
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime?: number } {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - 1 }
  }

  if (limit.count >= RATE_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: limit.resetTime,
    }
  }

  limit.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_HOUR - limit.count,
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  )
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: rateLimitCheck.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_PER_HOUR.toString(),
            "X-RateLimit-Remaining": rateLimitCheck.remaining.toString(),
            "Retry-After": Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Parse request body
    const body = await request.json()
    const { productId, walletAddress } = body

    // Validate input
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 }
      )
    }

    if (productId.length > 256) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID too long",
        },
        { status: 400 }
      )
    }

    // Log verification attempt
    console.log(`[API] Verification request for product: ${productId}`)

    // Perform verification
    const result = await verifyProduct(productId, walletAddress)

    // Log result
    console.log(
      `[API] Verification result: ${result.isAuthentic ? "AUTHENTIC" : "COUNTERFEIT"} (confidence: ${result.confidenceScore}%)`
    )

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_PER_HOUR.toString(),
          "X-RateLimit-Remaining": rateLimitCheck.remaining.toString(),
        },
      }
    )
  } catch (error) {
    console.error("[API] Verification error:", error)

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred"

    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler for health check
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "health") {
    return NextResponse.json({ status: "ok" })
  }

  return NextResponse.json(
    { error: "Invalid request" },
    { status: 400 }
  )
}
