import { updateSource } from "@/src/service/sourceService"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()

    const { id } = await params

    const data = await updateSource(id, body)

    if (!data) {
      return NextResponse.json(
        { success: false, message: "id tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Source berhasil diupdate", data },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      {
        status: 500,
      }
    )
  }
}
