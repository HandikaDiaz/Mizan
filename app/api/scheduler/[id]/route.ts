import { deleteScheduler, updateScheduler } from "@/src/service/schedulerService"
import { NextResponse } from "next/server"

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const body = await request.json()

        const { id } = await params

        const data = await updateScheduler(id, body)

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
    }
}

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params

        const data = await deleteScheduler(id)

        return NextResponse.json({
            success: true,
            message: "Scheduler berhasil dihapus",
        })
    } catch (error) {
        console.log(error)
    }
}
