import { NextResponse } from "next/server"

export const revalidate = 86400

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,idr&include_last_updated_at=true",
      { next: { revalidate: 86400 } },
    )

    if (!response.ok) {
      return NextResponse.json(
        { message: "Kurs harian sedang tidak tersedia." },
        { status: 503 },
      )
    }

    const data = (await response.json()) as {
      binancecoin?: {
        usd?: number
        idr?: number
        last_updated_at?: number
      }
    }
    const bnbUsd = data.binancecoin?.usd
    const bnbIdr = data.binancecoin?.idr

    if (!bnbUsd || !bnbIdr) {
      return NextResponse.json(
        { message: "Kurs harian tidak lengkap." },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        bnbUsd,
        bnbIdr,
        usdIdr: bnbIdr / bnbUsd,
        lastUpdatedAt: data.binancecoin?.last_updated_at ?? null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { message: "Kurs harian sedang tidak tersedia." },
      { status: 503 },
    )
  }
}
