import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const pilotId = params.id
        const { following } = await request.json()

        // Since we don't have real Auth yet, we use a constant "guest" user ID
        // In a real app, this would come from the session
        const GUEST_USER_ID = 'guest-user-123'

        // Ensure guest user exists
        await prisma.user.upsert({
            where: { email: 'guest@example.com' },
            update: {},
            create: {
                id: GUEST_USER_ID,
                email: 'guest@example.com'
            }
        })

        if (following) {
            await prisma.follow.upsert({
                where: {
                    userId_pilotId: {
                        userId: GUEST_USER_ID,
                        pilotId: pilotId
                    }
                },
                update: {},
                create: {
                    userId: GUEST_USER_ID,
                    pilotId: pilotId
                }
            })
        } else {
            await prisma.follow.deleteMany({
                where: {
                    userId: GUEST_USER_ID,
                    pilotId: pilotId
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
