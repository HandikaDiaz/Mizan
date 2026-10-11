import { db } from "@/src/prisma/db"
import { getAllSchedulers } from "@/src/service/schedulerService"
import { createSource } from "@/src/service/sourceService"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const data = await createSource(body)

    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
  }
}

export async function GET() {
  try {
    const schedulers = await getAllSchedulers()

    return Response.json({
      success: true,
      data: schedulers,
    })
  } catch (error) {
    console.error("[GET /api/scheduler]", error)

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengambil scheduler",
      },
      {
        status: 500,
      }
    )
  }
}
