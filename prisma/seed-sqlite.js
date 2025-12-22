const Database = require('better-sqlite3');
// const { v4: uuidv4 } = require('uuid'); // Removed dependency

// Simple UUID generator fallback if uuid package not available
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const db = new Database('dev.db');

console.log('Start seeding with better-sqlite3...');

// 1. Create Categories
const categories = [
    { name: 'Formula 1', shortName: 'F1', isInternational: 1 },
    { name: 'IndyCar', shortName: 'Indy', isInternational: 1 },
    { name: 'World Endurance Championship', shortName: 'WEC', isInternational: 1 },
    { name: 'Formula 2', shortName: 'F2', isInternational: 1 },
    { name: 'Formula 3', shortName: 'F3', isInternational: 1 },
    { name: 'F4 Española', shortName: 'F4 ESP', isInternational: 1 },
    { name: 'Formula Regional European', shortName: 'FRECA', isInternational: 1 },
    { name: 'TCR World Tour', shortName: 'TCR World', isInternational: 1 },
    { name: 'IMSA', shortName: 'IMSA', isInternational: 1 },
    { name: 'Turismo Carretera', shortName: 'TC', isInternational: 0 },
    { name: 'TC2000', shortName: 'TC2000', isInternational: 0 },
    { name: 'Turismo Nacional', shortName: 'TN', isInternational: 0 },
    { name: 'TC Pick Up', shortName: 'TC Pick Up', isInternational: 0 }
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, shortName, isInternational) 
  VALUES (?, ?, ?, ?)
`);

const categoryMap = {}; // name -> id

for (const cat of categories) {
    const id = uuid();
    try {
        // Check if exists (simple simulation of upsert/dedup is harder in raw sql without unique constraints on name, 
        // but schema doesn't strictly enforce unique name, so we just deleting all first is safer or ignore)
        // Let's just Try Insert, if fails ignore (assuming fresh db mostly)
        insertCategory.run(id, cat.name, cat.shortName, cat.isInternational ? 1 : 0);
        categoryMap[cat.name] = id;
    } catch (e) {
        // If we run this multiple times, it might fail on constraints if we had any. 
        // But since we persist ID in map, we should try to find it if we want robustness.
        // For now, let's assume empty DB or just fetching ID.
        const row = db.prepare('SELECT id FROM categories WHERE name = ?').get(cat.name);
        if (row) categoryMap[cat.name] = row.id;
    }
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
];

const insertPilot = db.prepare(`
  INSERT INTO pilots (id, fullName, slug, categoryId, nationality, profileImageUrl, isActive)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const checkPilot = db.prepare('SELECT id FROM pilots WHERE slug = ?');

for (const p of pilotsData) {
    if (!categoryMap[p.category]) continue;

    const existing = checkPilot.get(p.slug);
    if (!existing) {
        insertPilot.run(
            uuid(),
            p.name,
            p.slug,
            categoryMap[p.category],
            'Argentina',
            '/placeholder.svg',
            1
        );
    }
}

// 3. Create Results
console.log('Seeding results...');
const resultsData = [
    { pilotSlug: 'franco-colapinto', categoryShort: 'F1', event: 'GP de Monza', session: 'Race', pos: 12, gap: '+1 lap', date: '2025-09-01T14:00:00Z' },
    { pilotSlug: 'franco-colapinto', categoryShort: 'F1', event: 'GP de Baku', session: 'Qualifying', pos: 9, gap: '+0.8s', date: '2025-09-14T10:00:00Z' },
    { pilotSlug: 'agustin-canapino', categoryShort: 'Indy', event: 'Indy 500', session: 'Race', pos: 15, gap: '+12.4s', date: '2025-05-26T16:00:00Z' },
    { pilotSlug: 'pechito-lopez', categoryShort: 'WEC', event: '6 Hours of Fuji', session: 'Race', pos: 2, gap: '+45s', date: '2025-09-10T04:00:00Z' },
    { pilotSlug: 'julian-santero', categoryShort: 'TC', event: 'San Luis', session: 'Final', pos: 1, gap: '-', date: '2025-09-15T13:30:00Z' },
    { pilotSlug: 'gino-trappa', categoryShort: 'F4 ESP', event: 'Valencia Race 1', session: 'Race', pos: 5, gap: '+3.2s', date: '2025-09-20T11:00:00Z' }
];

const insertResult = db.prepare(`
  INSERT INTO results (id, pilotId, categoryId, eventName, sessionType, position, timeGap, eventDate)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// Helper to find category ID by shortName manually since we didn't store map by shortName
const getCatIdByShort = db.prepare('SELECT id FROM categories WHERE shortName = ?');
const getPilotIdBySlug = db.prepare('SELECT id FROM pilots WHERE slug = ?');

for (const res of resultsData) {
    const pilot = getPilotIdBySlug.get(res.pilotSlug);
    const category = getCatIdByShort.get(res.categoryShort);

    if (pilot && category) {
        // Check duplication simplified (allows multiple results per event, just creates new ones for now)
        insertResult.run(
            uuid(),
            pilot.id,
            category.id,
            res.event,
            res.session,
            res.pos,
            res.gap,
            new Date(res.date).getTime() // Store as timestamp or ISO string depending on prisma? SQLite stores dates as numeric or text. Prisma usually handles ISO strings well if mapped to DateTime. Let's try ISO string first as better-sqlite might prefer that or big int. 
            // Prisma DateTime maps to numeric ms in SQLite usually? Let's check docs or standard. safely: unix integer.
        );
    }
}


// 3. Create Results (finished)

// 4. Create News
console.log('Seeding news...');
const newsData = [
    {
        title: "Colapinto brilla en los tests de Abu Dhabi",
        summary: "El argentino completó más de 100 vueltas con el Williams y se perfila como candidato firme para el asiento titular.",
        source: "CorazonF1",
        url: "https://example.com/news/1",
        image: "/placeholder.svg",
        pilotSlug: 'franco-colapinto',
        categoryShort: 'F1'
    },
    {
        title: "Canapino confirma su continuidad en Juncos",
        summary: "Agustín Canapino renovó su contrato por un año más en la IndyCar tras una sólida temporada debut.",
        source: "Carburando",
        url: "https://example.com/news/2",
        image: "/placeholder.svg",
        pilotSlug: 'agustin-canapino',
        categoryShort: 'Indy'
    },
    {
        title: "Gino Trappa sorprende en Valencia",
        summary: "El joven piloto argentino se llevó la victoria en la primera carrera de la F4 Española.",
        source: "Campeones",
        url: "https://example.com/news/3",
        image: "/placeholder.svg",
        pilotSlug: 'gino-trappa',
        categoryShort: 'F4 ESP'
    },
    {
        title: "Pechito López vuelve a hacer historia en Le Mans",
        summary: "Junto a su equipo, lograron el podio en una carrera accidentada.",
        source: "CorazonF1",
        url: "https://example.com/news/4",
        image: "/placeholder.svg",
        pilotSlug: 'pechito-lopez',
        categoryShort: 'WEC'
    },
    {
        title: "Confirmado: La F1 vuelve a Argentina en 2027",
        summary: "Stefano Domenicali anunció negociaciones avanzadas para el regreso del GP al autódromo Oscar y Juan Gálvez.",
        source: "Motorsport",
        url: "https://example.com/news/5",
        image: "/placeholder.svg",
        pilotSlug: null,
        categoryShort: 'F1'
    }
];

const insertNews = db.prepare(`
  INSERT INTO news (id, title, summary, originalUrl, sourceName, imageUrl, pilotId, categoryId, publishedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const n of newsData) {
    const pilot = n.pilotSlug ? getPilotIdBySlug.get(n.pilotSlug) : null;
    const category = n.categoryShort ? getCatIdByShort.get(n.categoryShort) : null;

    // Use current time minus random hours for "recent" feel
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 48));

    try {
        insertNews.run(
            uuid(),
            n.title,
            n.summary,
            n.url,
            n.source,
            n.image,
            pilot ? pilot.id : null,
            category ? category.id : null,
            date.getTime()
        );
    } catch (e) {
        console.log("Skipping duplicate news or error: " + n.title);
    }
}

// End of file
