import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Type for incoming news from n8n
interface NewsWebhookPayload {
    title: string
    summary?: string
    url: string
    source: string
    imageUrl?: string
    publishedAt?: string
    pilotNames?: string[] // Names of pilots mentioned
    categoryName?: string
}

export async function POST(request: NextRequest) {
    try {
        // Security: Check for webhook secret
        const authHeader = request.headers.get('authorization')
        const expectedToken = process.env.WEBHOOK_SECRET || 'your-secret-token-here'

        if (authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const payload: NewsWebhookPayload = await request.json()

        // Validate required fields
        if (!payload.title || !payload.url || !payload.source) {
            return NextResponse.json(
                { error: 'Missing required fields: title, url, source' },
                { status: 400 }
            )
        }

        // Check if news already exists (prevent duplicates)
        const existing = await prisma.news.findUnique({
            where: { originalUrl: payload.url }
        })

        if (existing) {
            return NextResponse.json(
                { message: 'News already exists', newsId: existing.id },
                { status: 200 }
            )
        }

        // Try to find related pilot by name
        let pilotId: string | null = null
        if (payload.pilotNames && payload.pilotNames.length > 0) {
            const pilot = await prisma.pilot.findFirst({
                where: {
                    OR: payload.pilotNames.map(name => ({
                        fullName: { contains: name }
                    }))
                }
            })
            pilotId = pilot?.id || null
        }

        // Try to find category by name
        let categoryId: string | null = null
        if (payload.categoryName) {
            const category = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { contains: payload.categoryName } },
                        { shortName: { contains: payload.categoryName } }
                    ]
                }
            })
            categoryId = category?.id || null
        }

        // Create news article
        const news = await prisma.news.create({
            data: {
                title: payload.title,
                summary: payload.summary || null,
                originalUrl: payload.url,
                sourceName: payload.source,
                imageUrl: payload.imageUrl || '/placeholder.svg',
                publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
                pilotId,
                categoryId
            }
        })

        return NextResponse.json(
            {
                success: true,
                message: 'News article created successfully',
                newsId: news.id
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
