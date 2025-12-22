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
        { name: 'Formula 4 Sudamericana', shortName: 'F4 SUD', isInternational: true },
    ]

    console.log('📁 Creating categories...')
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { shortName: cat.shortName },
            update: {},
            create: cat,
        })
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
        const category = await prisma.category.findUnique({ where: { shortName: p.categoryShort } })
        if (category) {
            await prisma.pilot.upsert({
                where: { slug: p.slug },
                update: { profileImageUrl: p.img || null },
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

    // 3. Create current Results (Dec 2025)
    console.log('🏁 Creating results (Dec 2025)...')
    await prisma.result.deleteMany({}); // Flush old test results

    // const pilotSlugs = ['franco-colapinto', 'julian-santero', 'mariano-werner', 'agustin-canapino', 'pechito-lopez', 'leonel-pernia'];
    const results = [
        { slug: 'franco-colapinto', cat: 'F1', event: 'GP de Abu Dhabi', session: 'Carrera Final', pos: 7, gap: '+45.2s', date: '2025-12-14' },
        { slug: 'franco-colapinto', cat: 'F1', event: 'GP de Abu Dhabi', session: 'Clasificación', pos: 9, gap: '+0.850s', date: '2025-12-13' },
        { slug: 'julian-santero', cat: 'TC', event: 'GP Coronación - La Plata', session: 'Carrera Final', pos: 1, gap: '25:12.450', date: '2025-12-21' },
        { slug: 'mariano-werner', cat: 'TC', event: 'GP Coronación - La Plata', session: 'Carrera Final', pos: 2, gap: '+1.250s', date: '2025-12-21' },
        { slug: 'agustin-canapino', cat: 'Indy', event: 'Tests Post-Temporada', session: 'Sesión Tarde', pos: 4, gap: '+0.320s', date: '2025-12-18' },
        { slug: 'pechito-lopez', cat: 'WEC', event: '8 Horas de Bahrein', session: 'Carrera Final', pos: 3, gap: '+1 lap', date: '2025-12-05' },
        { slug: 'leonel-pernia', cat: 'TC2000', event: 'Gran Premio Coronación', session: 'Carrera Final', pos: 1, gap: '30:45.100', date: '2025-12-14' },
    ]

    for (const r of results) {
        const pilot = await prisma.pilot.findUnique({ where: { slug: r.slug } })
        const category = await prisma.category.findUnique({ where: { shortName: r.cat } })
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

    // 4. News - Scraper will handle this, but let's clear mock data if any
    // await prisma.news.deleteMany({ where: { originalUrl: { contains: 'example.com' } } });

    console.log('🎉 Seeding completed successfully!')
}

export { main } // Export for the API route

if (process.argv[1] && process.argv[1].endsWith('seed.mjs')) {
    main()
        .then(async () => { await prisma.$disconnect() })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
}
