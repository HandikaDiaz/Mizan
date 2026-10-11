import { createScheduler, getAllSchedulers } from "@/src/service/schedulerService"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const sources = await getAllSchedulers()

        return NextResponse.json({
            data: sources,
        })
    } catch (error) {
        console.log(error)
    }
}

export const POST = async (request: Request) => {
    try {
        const body = await request.json()

        const data = await createScheduler(body)

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
    }
}