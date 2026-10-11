import { deleteSource } from "@/src/service/sourceService";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const source = await deleteSource(id);

    if (!source) {
      return NextResponse.json(
        {
          success: false,
          message: "id source tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Source berhasil dihapus",
        data: source,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      {
        status: 500,
      },
    );
  }
}