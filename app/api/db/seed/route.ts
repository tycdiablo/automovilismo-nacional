import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
            { name: 'Formula 2', shortName: 'F2', isInternational: true },
            { name: 'Formula 3', shortName: 'F3', isInternational: true },
            { name: 'F4 Española', shortName: 'F4 ESP', isInternational: true },
            { name: 'Formula Regional European', shortName: 'FRECA', isInternational: true },
            { name: 'TCR World Tour', shortName: 'TCR World', isInternational: true },
            { name: 'IMSA', shortName: 'IMSA', isInternational: true },
            { name: 'Turismo Carretera', shortName: 'TC', isInternational: false },
            { name: 'TC2000', shortName: 'TC2000', isInternational: false },
            { name: 'Turismo Nacional', shortName: 'TN', isInternational: false },
            { name: 'TC Pick Up', shortName: 'TC Pick Up', isInternational: false },
            { name: 'Formula 4 Sudamericana', shortName: 'F4 SUD', isInternational: true },
        ]

        console.log('📁 Creating categories...')
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

        // 2. Create Pilots
        const pilotsData = [
            { name: 'Franco Colapinto', slug: 'franco-colapinto', categoryShort: 'F1', img: 'https://images.wsj.net/im-945785?width=1280&size=1.33333333' },
            { name: 'Agustín Canapino', slug: 'agustin-canapino', categoryShort: 'Indy', img: 'https://juncoshollinger.com/wp-content/uploads/2024/01/Agustin-Canapino-Portrait.jpg' },
            { name: 'José María López', slug: 'pechito-lopez', categoryShort: 'WEC', img: 'https://scuderia.ferrari.com/content/dam/ferrari-scuderia/drivers/jose-maria-lopez/headshot-jose-maria-lopez.png' },
            { name: 'Sacha Fenestraz', slug: 'sacha-fenestraz', categoryShort: 'WEC', img: 'https://media.nissan-cdn.net/content/dam/Nissan/nissan_racing/drivers/sacha-fenestraz/2024/sacha_fenestraz_portrait.jpg' },
            { name: 'Esteban Guerrieri', slug: 'esteban-guerrieri', categoryShort: 'TCR World', img: 'https://www.tcr-series.com/images/drivers/esteban-guerrieri.jpg' },
            { name: 'Néstor Girolami', slug: 'bebu-girolami', categoryShort: 'TCR World', img: 'https://www.tcr-series.com/images/drivers/nestor-girolami.jpg' },
            { name: 'Julián Santero', slug: 'julian-santero', categoryShort: 'TC', img: 'https://actc.org.ar/img/pilotos/santero_julian.jpg' },
            { name: 'Mariano Werner', slug: 'mariano-werner', categoryShort: 'TC', img: 'https://actc.org.ar/img/pilotos/werner_mariano.jpg' },
            { name: 'Leonel Pernía', slug: 'leonel-pernia', categoryShort: 'TC2000', img: 'https://tc2000.com.ar/img/pilotos/leonel-pernia.jpg' },
            { name: 'Facundo Ardusso', slug: 'facundo-ardusso', categoryShort: 'TC', img: 'https://actc.org.ar/img/pilotos/ardusso_facundo.jpg' },
            { name: 'Gino Trappa', slug: 'gino-trappa', categoryShort: 'F4 ESP' },
            { name: 'Teo Schropp', slug: 'teo-schropp', categoryShort: 'F4 ESP' },
            { name: 'Mattia Colnaghi', slug: 'mattia-colnaghi', categoryShort: 'F4 ESP' },
            { name: 'Nicolás Varrone', slug: 'nicolas-varrone', categoryShort: 'IMSA' },
            { name: 'Franco Girolami', slug: 'franco-girolami', categoryShort: 'TCR World' },
            { name: 'Matías Rossi', slug: 'matias-rossi', categoryShort: 'TC' },
        ]

        console.log('🏎️ Creating pilots...')
        for (const p of pilotsData) {
            const category = await prisma.category.findFirst({ where: { shortName: p.categoryShort } })
            if (category) {
                const existing = await prisma.pilot.findFirst({ where: { slug: p.slug } });
                if (existing) {
                    await prisma.pilot.update({
                        where: { id: existing.id },
                        data: { profileImageUrl: p.img || null, categoryId: category.id }
                    });
                } else {
                    await prisma.pilot.create({
                        data: {
                            fullName: p.name,
                            slug: p.slug,
                            categoryId: category.id,
                            nationality: 'Argentina',
                            isActive: true,
                            profileImageUrl: p.img || null,
                        }
                    });
                }
            }
        }

        // 3. Create current Results (Dec 2025)
        console.log('🏁 Creating results (Dec 2025)...')
        await prisma.result.deleteMany({});

        const resultsData = [
            { slug: 'franco-colapinto', cat: 'F1', event: 'GP de Abu Dhabi', session: 'Carrera Final', pos: 7, gap: '+45.2s', date: '2025-12-14' },
            { slug: 'franco-colapinto', cat: 'F1', event: 'GP de Abu Dhabi', session: 'Clasificación', pos: 9, gap: '+0.850s', date: '2025-12-13' },
            { slug: 'julian-santero', cat: 'TC', event: 'GP Coronación - La Plata', session: 'Carrera Final', pos: 1, gap: '25:12.450', date: '2025-12-21' },
            { slug: 'mariano-werner', cat: 'TC', event: 'GP Coronación - La Plata', session: 'Carrera Final', pos: 2, gap: '+1.250s', date: '2025-12-21' },
            { slug: 'agustin-canapino', cat: 'Indy', event: 'Tests Post-Temporada', session: 'Sesión Tarde', pos: 4, gap: '+0.320s', date: '2025-12-18' },
            { slug: 'pechito-lopez', cat: 'WEC', event: '8 Horas de Bahrein', session: 'Carrera Final', pos: 3, gap: '+1 lap', date: '2025-12-05' },
            { slug: 'leonel-pernia', cat: 'TC2000', event: 'Gran Premio Coronación', session: 'Carrera Final', pos: 1, gap: '30:45.100', date: '2025-12-14' },
        ]

        for (const r of resultsData) {
            const pilot = await prisma.pilot.findFirst({ where: { slug: r.slug } })
            const category = await prisma.category.findFirst({ where: { shortName: r.cat } })
            if (pilot && category) {
                await prisma.result.create({
                    data: {
                        pilotId: pilot.id,
                        categoryId: category.id,
                        eventName: r.event,
                        sessionType: r.session,
                        position: r.pos,
                        timeGap: r.gap,
                        eventDate: new Date(r.date),
                    },
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully in production environment.'
        })

    } catch (error: unknown) {
        console.error('Seed API error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({
            error: 'Internal server error during seeding',
            details: errorMessage
        }, { status: 500 })
    }
}
