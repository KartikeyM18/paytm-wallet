import {prisma} from "@repo/db/prisma"
import { NextResponse } from "next/server"

export async function GET(){
    await prisma.user.create({
        data: {
            email: "hello@world"
        }
    })

    return NextResponse.json({
        message: "user created with email hello@world"
    })
}