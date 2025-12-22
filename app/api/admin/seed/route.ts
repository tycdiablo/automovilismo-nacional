import { NextRequest, NextResponse } from 'next/server'
import { main as seedDatabase } from '@/prisma/seed.mjs'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')
        const expectedSecret = process.env.WEBHOOK_SECRET || 'your-secret-token-here'

        if (secret !== expectedSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🚀 API Triggered: Starting Database Seed...')
        await seedDatabase()

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully in production environment.'
        })

    } catch (error: any) {
        console.error('Seed API error:', error)
        return NextResponse.json({
            error: 'Internal server error during seeding',
            details: error.message
        }, { status: 500 })
    }
}
