import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface NewsWebhookPayload {
    title: string
    summary?: string
    url: string
    source: string
    imageUrl?: string
    publishedAt?: string
    pilotNames?: string[]
    categoryName?: string
}

function decodeHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&iacute;/g, 'í')
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&oacute;/g, 'ó')
        .replace(/&uacute;/g, 'ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Iacute;/g, 'Í')
        .replace(/&Aacute;/g, 'Á')
        .replace(/&Eacute;/g, 'É')
        .replace(/&Oacute;/g, 'Ó')
        .replace(/&Uacute;/g, 'Ú')
        .replace(/&Ntilde;/g, 'Ñ')
        .replace(/<[^>]*>/g, '')
        .trim();
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        const expectedToken = process.env.WEBHOOK_SECRET || 'your-secret-token-here'

        if (authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload: NewsWebhookPayload = await request.json()

        if (!payload.title || !payload.url || !payload.source) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Clean title and summary from entities
        const cleanTitle = decodeHtml(payload.title)
        const cleanSummary = payload.summary ? decodeHtml(payload.summary) : `Noticia de ${payload.source}`

        // Check if news already exists by URL
        const existing = await prisma.news.findUnique({
            where: { originalUrl: payload.url }
        })

        if (existing) {
            return NextResponse.json({ message: 'News already exists', newsId: existing.id }, { status: 200 })
        }

        // Better Pilot Matching: Use more names and stricter logic
        let pilotId: string | null = null
        if (payload.pilotNames && payload.pilotNames.length > 0) {
            const pilot = await prisma.pilot.findFirst({
                where: {
                    OR: payload.pilotNames.map(name => ({
                        fullName: { contains: name, mode: 'insensitive' }
                    }))
                }
            })
            pilotId = pilot?.id || null
        }

        // Better Category Matching
        let categoryId: string | null = null
        if (payload.categoryName) {
            const category = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { contains: payload.categoryName, mode: 'insensitive' } },
                        { shortName: { contains: payload.categoryName, mode: 'insensitive' } }
                    ]
                }
            })
            categoryId = category?.id || null
        }

        const news = await prisma.news.create({
            data: {
                title: cleanTitle,
                summary: cleanSummary,
                originalUrl: payload.url,
                sourceName: payload.source,
                imageUrl: payload.imageUrl || '/placeholder.svg',
                publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
                pilotId,
                categoryId
            }
        })

        // --- PUSH NOTIFICATIONS ---
        if (pilotId) {
            const followers = await prisma.follow.findMany({
                where: { pilotId: pilotId },
                include: {
                    user: {
                        include: { pushSubscriptions: true }
                    }
                }
            })

            const { sendPushNotification } = await import('@/lib/push')

            for (const follow of followers) {
                if (follow.user?.pushSubscriptions) {
                    for (const sub of follow.user.pushSubscriptions) {
                        await sendPushNotification(sub, {
                            title: `¡Novedades de ${payload.pilotNames?.[0] || 'tu piloto'}!`,
                            body: cleanTitle,
                            url: payload.url
                        })
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'News article created successfully',
            newsId: news.id
        }, { status: 201 })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
