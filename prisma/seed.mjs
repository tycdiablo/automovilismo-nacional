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
        { name: 'Franco Colapinto', slug: 'franco-colapinto', categoryShort: 'F1' },
        { name: 'Agustín Canapino', slug: 'agustin-canapino', categoryShort: 'Indy' },
        { name: 'José María López', slug: 'pechito-lopez', categoryShort: 'WEC' },
        { name: 'Sacha Fenestraz', slug: 'sacha-fenestraz', categoryShort: 'WEC' },
        { name: 'Luis Perez Companc', slug: 'luis-perez-companc', categoryShort: 'WEC' },

        // F4 Española
        { name: 'Gino Trappa', slug: 'gino-trappa', categoryShort: 'F4 ESP' },
        { name: 'Teo Schropp', slug: 'teo-schropp', categoryShort: 'F4 ESP' },
        { name: 'Mattia Colnaghi', slug: 'mattia-colnaghi', categoryShort: 'F4 ESP' },
        { name: 'Nicolás Fuca', slug: 'nicolas-fuca', categoryShort: 'F4 ESP' },
        { name: 'Simón Bulbarella', slug: 'simon-bulbarella', categoryShort: 'F4 ESP' },
        { name: 'Sebastián Caram', slug: 'sebastian-caram', categoryShort: 'F4 ESP' },
        { name: 'Tomás Cabrera', slug: 'tomas-cabrera', categoryShort: 'F4 ESP' },

        // FRECA / Formula Regional
        { name: 'Valentino Mini', slug: 'valentino-mini', categoryShort: 'FRECA' },
        { name: 'Franco Etcheverry', slug: 'franco-etcheverry', categoryShort: 'FRECA' },

        // TCR World Tour
        { name: 'Esteban Guerrieri', slug: 'esteban-guerrieri', categoryShort: 'TCR World' },
        { name: 'Néstor Girolami', slug: 'bebu-girolami', categoryShort: 'TCR World' },
        { name: 'Franco Girolami', slug: 'franco-girolami', categoryShort: 'TCR World' },
        { name: 'Ignacio Montenegro', slug: 'ignacio-montenegro', categoryShort: 'TCR World' },

        // IMSA
        { name: 'Nicolás Varrone', slug: 'nicolas-varrone', categoryShort: 'IMSA' },

        // Turismo Carretera
        { name: 'Julián Santero', slug: 'julian-santero', categoryShort: 'TC' },
        { name: 'Mariano Werner', slug: 'mariano-werner', categoryShort: 'TC' },
        { name: 'Patricio Perez Companc', slug: 'patricio-perez-companc', categoryShort: 'TC' },
        { name: 'José Savino', slug: 'jose-savino', categoryShort: 'TC' },
        { name: 'Germán Todino', slug: 'german-todino', categoryShort: 'TC' },
        { name: 'Diego Ciantini', slug: 'diego-ciantini', categoryShort: 'TC' },
        { name: 'Emiliano Spataro', slug: 'emiliano-spataro', categoryShort: 'TC' },
        { name: 'Emmanuel Moriatis', slug: 'emmanuel-moriatis', categoryShort: 'TC' },
        { name: 'Nicolás Trosset', slug: 'nicolas-trosset', categoryShort: 'TC' },
        { name: 'Juan Cruz Benvenuti', slug: 'juan-cruz-benvenuti', categoryShort: 'TC' },
        { name: 'Matías Rossi', slug: 'matias-rossi', categoryShort: 'TC' },
        { name: 'Juan Pablo Gianini', slug: 'juan-pablo-gianini', categoryShort: 'TC' },
        { name: 'Valentín Aguirre', slug: 'valentin-aguirre', categoryShort: 'TC' },

        // TC2000
        { name: 'Franco Paolini', slug: 'franco-paolini', categoryShort: 'TC2000' },
        { name: 'Leonel Pernía', slug: 'leonel-pernia', categoryShort: 'TC2000' },
        { name: 'Tiago Pernía', slug: 'tiago-pernia', categoryShort: 'TC2000' },
        { name: 'Facundo Ardusso', slug: 'facundo-ardusso', categoryShort: 'TC2000' },
        { name: 'Agustín Calamari', slug: 'agustin-calamari', categoryShort: 'TC2000' },
        { name: 'Bernardo Llaver', slug: 'bernardo-llaver', categoryShort: 'TC2000' },
        { name: 'Rodrigo Baptista', slug: 'rodrigo-baptista', categoryShort: 'TC2000' },
        { name: 'Matías Milla', slug: 'matias-milla', categoryShort: 'TC2000' },
        { name: 'Fabricio Pezzini', slug: 'fabricio-pezzini', categoryShort: 'TC2000' },
        { name: 'Julián Santero (TC2000)', slug: 'julian-santero-tc2000', categoryShort: 'TC2000' },

        // Turismo Nacional
        { name: 'Fabián Yannantuoni', slug: 'fabian-yannantuoni', categoryShort: 'TN' },
        { name: 'Lionel Ugalde', slug: 'lionel-ugalde', categoryShort: 'TN' },
        { name: 'Santiago Mangoni', slug: 'santiago-mangoni', categoryShort: 'TN' },
        { name: 'Rodrigo Pflueger', slug: 'rodrigo-pflueger', categoryShort: 'TN' },

        // TC Pick Up
        { name: 'Christian Ledesma', slug: 'christian-ledesma', categoryShort: 'TC Pick Up' },
        { name: 'Martín Serrano', slug: 'martin-serrano', categoryShort: 'TC Pick Up' },
        { name: 'Juan José Ebarlín', slug: 'juan-jose-ebarlin', categoryShort: 'TC Pick Up' },
    ]

    console.log('🏎️ Creating pilots...')
    for (const p of pilotsData) {
        const category = await prisma.category.findUnique({
            where: { shortName: p.categoryShort },
        })

        if (category) {
            await prisma.pilot.upsert({
                where: { slug: p.slug },
                update: {},
                create: {
                    fullName: p.name,
                    slug: p.slug,
                    categoryId: category.id,
                    nationality: 'Argentina',
                    isActive: true,
                },
            })
        }
    }
    console.log('✅ Pilots created')

    // 3. Create sample Results
    console.log('🏁 Creating sample results...')
    const colapinto = await prisma.pilot.findUnique({ where: { slug: 'franco-colapinto' } })
    const canapino = await prisma.pilot.findUnique({ where: { slug: 'agustin-canapino' } })
    const f1 = await prisma.category.findUnique({ where: { shortName: 'F1' } })
    const indy = await prisma.category.findUnique({ where: { shortName: 'Indy' } })

    if (colapinto && f1) {
        await prisma.result.create({
            data: {
                pilotId: colapinto.id,
                categoryId: f1.id,
                eventName: 'GP de Italia - Monza',
                sessionType: 'Carrera',
                position: 12,
                timeGap: '+1 vuelta',
                eventDate: new Date('2024-09-01'),
            },
        })
    }

    if (canapino && indy) {
        await prisma.result.create({
            data: {
                pilotId: canapino.id,
                categoryId: indy.id,
                eventName: 'Indy 500',
                sessionType: 'Carrera',
                position: 16,
                timeGap: '+2 vueltas',
                eventDate: new Date('2024-05-26'),
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
