import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')
        const expectedSecret = process.env.WEBHOOK_SECRET || 'your-secret-token-here'

        if (secret !== expectedSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🌱 Starting database seed from API...')

        // 1. Create Categories
        const categories = [
            { name: 'Formula 1', shortName: 'F1', isInternational: true },
            { name: 'IndyCar', shortName: 'Indy', isInternational: true },
            { name: 'World Endurance Championship', shortName: 'WEC', isInternational: true },
            { name: 'Turismo Carretera', shortName: 'TC', isInternational: false },
            { name: 'TC2000', shortName: 'TC2000', isInternational: false },
            { name: 'Turismo Nacional', shortName: 'TN', isInternational: false },
        ]

        for (const cat of categories) {
            const existing = await prisma.category.findFirst({ where: { shortName: cat.shortName } });
            if (existing) {
                await prisma.category.update({
                    where: { id: existing.id },
                    data: { name: cat.name, isInternational: cat.isInternational }
                });
            } else {
                await prisma.category.create({ data: cat });
            }
        }

        // 2. Load Pilots from JSON
        const pilotsPath = path.join(process.cwd(), 'data', 'pilotsData.json');
        if (fs.existsSync(pilotsPath)) {
            const pilotsDataJSON = JSON.parse(fs.readFileSync(pilotsPath, 'utf8'));

            for (const p of pilotsDataJSON) {
                const category = await prisma.category.findFirst({ where: { shortName: p.category } })
                if (category) {
                    await prisma.pilot.upsert({
                        where: { slug: p.slug },
                        update: {
                            profileImageUrl: p.imageUrl || null,
                            categoryId: category.id,
                            nationality: p.nationality || 'Argentina'
                        },
                        create: {
                            fullName: p.fullName,
                            slug: p.slug,
                            categoryId: category.id,
                            nationality: p.nationality || 'Argentina',
                            isActive: true,
                            profileImageUrl: p.imageUrl || null,
                        },
                    })
                }
            }
            console.log(`✅ Seeded ${pilotsDataJSON.length} pilots from JSON.`);
        } else {
            console.warn('⚠️ pilotsData.json not found in /data');
        }

        return NextResponse.json({
            success: true,
            message: 'Database structure and pilots seeded successfully. Use scrapeResults.mjs for racing data.'
        })

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to process webhook:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
