import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: pilotId } = await params
        const { following } = await request.json()
        const session = await getServerSession(authOptions)

        // If not logged in, we return success so the frontend continues with localStorage
        // But we don't save to the database
        if (!session?.user) {
            return NextResponse.json({ success: true, mode: 'local' })
        }

        const userId = (session.user as { id: string }).id

        if (following) {
            await prisma.follow.upsert({
                where: {
                    userId_pilotId: {
                        userId: userId,
                        pilotId: pilotId
                    }
                },
                update: {},
                create: {
                    userId: userId,
                    pilotId: pilotId
                }
            })
        } else {
            await prisma.follow.deleteMany({
                where: {
                    userId: userId,
                    pilotId: pilotId
                }
            })
        }

        return NextResponse.json({ success: true, mode: 'db' })
    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
