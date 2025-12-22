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
        { name: 'José María López', slug: 'pechito-lopez', categoryShort: 'WEC', img: 'https://media.gettyimages.com/id/1498028711/es/foto/jose-maria-lopez-of-argentina-and-toyota-gazoo-racing-poses-for-a-portrait during-the-fia-world.jpg?s=612x612&w=gi&k=20&c=L_v4Y6L2W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W=' },
        { name: 'Sacha Fenestraz', slug: 'sacha-fenestraz', categoryShort: 'WEC', img: 'https://media.gettyimages.com/id/1460394336/es/foto/sacha-fenestraz-of-argentina-and-nissan-formula-e-team-poses-for-a-portrait during-the-diriyah.jpg?s=612x612&w=gi&k=20&c=L_v4Y6L2W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W=' },

        // F4 Española
        { name: 'Gino Trappa', slug: 'gino-trappa', categoryShort: 'F4 ESP' },
        { name: 'Teo Schropp', slug: 'teo-schropp', categoryShort: 'F4 ESP' },
        { name: 'Mattia Colnaghi', slug: 'mattia-colnaghi', categoryShort: 'F4 ESP' },
        { name: 'Tomás Cabrera', slug: 'tomas-cabrera', categoryShort: 'F4 ESP' },

        // TCR World Tour
        { name: 'Esteban Guerrieri', slug: 'esteban-guerrieri', categoryShort: 'TCR World', img: 'https://www.tcr-series.com/images/drivers/esteban-guerrieri.jpg' },
        { name: 'Néstor Girolami', slug: 'bebu-girolami', categoryShort: 'TCR World', img: 'https://www.tcr-series.com/images/drivers/nestor-girolami.jpg' },
        { name: 'Franco Girolami', slug: 'franco-girolami', categoryShort: 'TCR World' },

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

    // 3. Create sample Results
    console.log('🏁 Creating sample results...')
    const colapinto = await prisma.pilot.findUnique({ where: { slug: 'franco-colapinto' } })
    const f1 = await prisma.category.findUnique({ where: { shortName: 'F1' } })

    if (colapinto && f1) {
        await prisma.result.upsert({
            where: { id: 'sample-result-1' },
            update: {},
            create: {
                id: 'sample-result-1',
                pilotId: colapinto.id,
                categoryId: f1.id,
                eventName: 'GP de Australia',
                sessionType: 'Práctica Libre 1',
                position: 10,
                timeGap: '+0.450s',
                eventDate: new Date(), // Current date
            },
        })
    }


    console.log('✅ Results created')

    // 4. Create sample News
    console.log('📰 Creating sample news...')
    const newsData = [
        {
            title: 'Colapinto brilla en los tests de Abu Dhabi',
            summary: 'El argentino completó más de 100 vueltas con el Williams y se perfila como candidato firme para el asiento titular.',
            source: 'CorazonF1',
            url: 'https://example.com/news/1',
            pilotSlug: 'franco-colapinto',
            categoryShort: 'F1',
        },
        {
            title: 'Canapino confirma su continuidad en Juncos',
            summary: 'Agustín Canapino renovó su contrato por un año más en la IndyCar tras una sólida temporada debut.',
            source: 'Carburando',
            url: 'https://example.com/news/2',
            pilotSlug: 'agustin-canapino',
            categoryShort: 'Indy',
        },
        {
            title: 'Gino Trappa sorprende en Valencia',
            summary: 'El joven piloto argentino se llevó la victoria en la primera carrera de la F4 Española.',
            source: 'Campeones',
            url: 'https://example.com/news/3',
            pilotSlug: 'gino-trappa',
            categoryShort: 'F4 ESP',
        },
    ]

    for (const n of newsData) {
        const pilot = n.pilotSlug ? await prisma.pilot.findUnique({ where: { slug: n.pilotSlug } }) : null
        const category = n.categoryShort ? await prisma.category.findUnique({ where: { shortName: n.categoryShort } }) : null

        await prisma.news.upsert({
            where: { originalUrl: n.url },
            update: {},
            create: {
                title: n.title,
                summary: n.summary,
                originalUrl: n.url,
                sourceName: n.source,
                imageUrl: '/placeholder.svg',
                pilotId: pilot?.id,
                categoryId: category?.id,
                publishedAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
            },
        })
    }
    console.log('✅ News created')

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
