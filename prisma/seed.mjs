import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

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
    ]

    console.log('📁 Creating categories...')
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { shortName: cat.shortName },
            update: {},
            create: cat,
        })
    }
    console.log('✅ Categories created')

    // 2. Create Pilots - Expanded list of Argentine drivers
    const pilotsData = [
        // International - Formula Racing
        { name: 'Franco Colapinto', slug: 'franco-colapinto', categoryShort: 'F1', img: 'https://images.wsj.net/im-945785?width=1280&size=1.33333333' },
        { name: 'Agustín Canapino', slug: 'agustin-canapino', categoryShort: 'Indy', img: 'https://juncoshollinger.com/wp-content/uploads/2024/01/Agustin-Canapino-Portrait.jpg' },
        { name: 'José María López', slug: 'pechito-lopez', categoryShort: 'WEC', img: 'https://scuderia.ferrari.com/content/dam/ferrari-scuderia/drivers/jose-maria-lopez/headshot-jose-maria-lopez.png' },
        { name: 'Sacha Fenestraz', slug: 'sacha-fenestraz', categoryShort: 'WEC', img: 'https://media.nissan-cdn.net/content/dam/Nissan/nissan_racing/drivers/sacha-fenestraz/2024/sacha_fenestraz_portrait.jpg' },

        // F4 Española
        { name: 'Gino Trappa', slug: 'gino-trappa', categoryShort: 'F4 ESP' },
        { name: 'Teo Schropp', slug: 'teo-schropp', categoryShort: 'F4 ESP' },
        { name: 'Mattia Colnaghi', slug: 'mattia-colnaghi', categoryShort: 'F4 ESP' },
        { name: 'Tomás Cabrera', slug: 'tomas-cabrera', categoryShort: 'F4 ESP' },

        // TCR World Tour
        { name: 'Esteban Guerrieri', slug: 'esteban-guerrieri', categoryShort: 'TCR World', img: 'https://www.tcr-series.com/images/drivers/esteban-guerrieri.jpg' },
        { name: 'Néstor Girolami', slug: 'bebu-girolami', categoryShort: 'TCR World', img: 'https://www.tcr-series.com/images/drivers/nestor-girolami.jpg' },

        // Turismo Carretera
        { name: 'Julián Santero', slug: 'julian-santero', categoryShort: 'TC', img: 'https://actc.org.ar/img/pilotos/santero_julian.jpg' },
        { name: 'Mariano Werner', slug: 'mariano-werner', categoryShort: 'TC', img: 'https://actc.org.ar/img/pilotos/werner_mariano.jpg' },
        { name: 'Facundo Ardusso', slug: 'facundo-ardusso', categoryShort: 'TC', img: 'https://actc.org.ar/img/pilotos/ardusso_facundo.jpg' },
    ]

    console.log('🏎️ Creating pilots...')
    for (const p of pilotsData) {
        const category = await prisma.category.findUnique({
            where: { shortName: p.categoryShort },
        })

        if (category) {
            await prisma.pilot.upsert({
                where: { slug: p.slug },
                update: {
                    profileImageUrl: p.img || null,
                },
                create: {
                    fullName: p.name,
                    slug: p.slug,
                    categoryId: category.id,
                    nationality: 'Argentina',
                    isActive: true,
                    profileImageUrl: p.img || null,
                },
            })
        }
    }
    console.log('✅ Pilots created')

    // 3. Create current Results (Dec 2025)
    console.log('🏁 Creating current results...')
    const colapinto = await prisma.pilot.findUnique({ where: { slug: 'franco-colapinto' } })
    const f1 = await prisma.category.findUnique({ where: { shortName: 'F1' } })

    if (colapinto && f1) {
        // Clear all old results to avoid 2024 data
        await prisma.result.deleteMany({});

        await prisma.result.create({
            data: {
                pilotId: colapinto.id,
                categoryId: f1.id,
                eventName: 'GP de Abu Dhabi',
                sessionType: 'Carrera Final',
                position: 7,
                timeGap: '+45.2s',
                eventDate: new Date('2025-12-14'),
            },
        })
    }
    console.log('✅ Results created')

    // 4. News will be handled by the scraper
    console.log('📰 Skipping mock news (handled by scraper)...')

    console.log('🎉 Seeding completed successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
