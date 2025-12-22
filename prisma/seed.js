const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
    datasourceUrl: 'file:./dev.db'
})

async function main() {
    console.log('Start seeding...')

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
        { name: 'TC Pick Up', shortName: 'TC Pick Up', isInternational: false }
    ]

    const categoryMap = {} // name -> id

    for (const cat of categories) {
        const created = await prisma.category.create({ data: cat })
        categoryMap[cat.name] = created.id
    }

    // 2. Create Pilots
    const pilotsData = [
        { name: 'Franco Colapinto', slug: 'franco-colapinto', category: 'Formula 1' },
        { name: 'Agustín Canapino', slug: 'agustin-canapino', category: 'IndyCar' },
        { name: 'José María López', slug: 'pechito-lopez', category: 'World Endurance Championship' },
        { name: 'Gino Trappa', slug: 'gino-trappa', category: 'F4 Española' },
        { name: 'Nicolás Varrone', slug: 'nicolas-varrone', category: 'IMSA' },
        { name: 'Sacha Fenestraz', slug: 'sacha-fenestraz', category: 'World Endurance Championship' },
        { name: 'Teo Schropp', slug: 'teo-schropp', category: 'F4 Española' },
        { name: 'Mattia Colnaghi', slug: 'mattia-colnaghi', category: 'F4 Española' },
        { name: 'Nicolás Fuca', slug: 'nicolas-fuca', category: 'F4 Española' },
        { name: 'Simón Bulbarella', slug: 'simon-bulbarella', category: 'F4 Española' },
        { name: 'Esteban Guerrieri', slug: 'esteban-guerrieri', category: 'TCR World Tour' },
        { name: 'Néstor Girolami', slug: 'bebu-girolami', category: 'TCR World Tour' },
        { name: 'Franco Girolami', slug: 'franco-girolami', category: 'TCR World Tour' },
        { name: 'Ignacio Montenegro', slug: 'ignacio-montenegro', category: 'TCR World Tour' },
        { name: 'Luis Perez Companc', slug: 'luis-perez-companc', category: 'World Endurance Championship' },
        { name: 'Patricio Perez Companc', slug: 'patricio-perez-companc', category: 'Turismo Carretera' },
        { name: 'Sebastián Caram', slug: 'sebastian-caram', category: 'F4 Española' },
        { name: 'Franco Paolini', slug: 'franco-paolini', category: 'TC2000' },
        { name: 'Fabián Yannantuoni', slug: 'fabian-yannantuoni', category: 'Turismo Nacional' },
        { name: 'Julián Santero', slug: 'julian-santero', category: 'Turismo Carretera' },
        { name: 'Mariano Werner', slug: 'mariano-werner', category: 'Turismo Carretera' },
        { name: 'Leonel Pernía', slug: 'leonel-pernia', category: 'TC2000' },
        { name: 'Tiago Pernía', slug: 'tiago-pernia', category: 'TC2000' },
    ]

    for (const p of pilotsData) {
        if (!categoryMap[p.category]) continue;

        await prisma.pilot.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                fullName: p.name,
                slug: p.slug,
                categoryId: categoryMap[p.category],
                profileImageUrl: "/placeholder.svg"
            },
        })
    }

    console.log('Seeding finished.')
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
