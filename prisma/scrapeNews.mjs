// Native fetch is available in Node 18+

const WEBHOOK_URL = process.env.WEBHOOK_URL + '/api/news/webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const SOURCES = [
    { name: 'Corazón F1', url: 'https://www.corazonf1.com/noticias/' },
    { name: 'Motorsport', url: 'https://www.motorsport.com/f1/news/' },
    { name: 'Carburando', url: 'https://carburando.com/categoria/noticias/' }
];

const PILOTS = [
    'Franco Colapinto', 'Agustín Canapino', 'José María López', 'Pechito López',
    'Sacha Fenestraz', 'Gino Trappa', 'Nicolás Varrone', 'Esteban Guerrieri',
    'Néstor Girolami', 'Bebu Girolami', 'Franco Girolami', 'Julián Santero',
    'Mariano Werner', 'Leonel Pernía', 'Facundo Ardusso', 'Matías Rossi',
    'Sebastián Caram', 'Valentino Mini', 'Teo Schropp', 'Mattia Colnaghi',
    'Nicolás Fuca', 'Simón Bulbarella', 'Luis Perez Companc', 'Patricio Perez Companc',
    'Germán Todino', 'Diego Ciantini', 'Emmanuel Moriatis', 'Juan Cruz Benvenuti',
    'Franco Paolini', 'Tiago Pernía', 'Bernardo Llaver', 'Agustín Calamari',
    'Fabián Yannantuoni', 'Christian Ledesma', 'Martín Serrano', 'Ignacio Montenegro'
];

async function scrapeSource(source) {
    console.log(`🔍 Scraping ${source.name}...`);
    try {
        const response = await fetch(source.url);
        const html = await response.text();

        // Very basic regex-based scraping for titles and links
        // In a real scenario, cheerio would be better, but regex is lighter for simple needs
        const news = [];
        const titleRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
        const linkRegex = /href="([^"]+)"/gi;

        let match;
        while ((match = titleRegex.exec(html)) !== null) {
            const title = match[1].trim();
            // Try to find a link near this title if possible, or just use the source URL for now
            // This is a simplification since n8n was also using basic regex

            const mentionedPilots = PILOTS.filter(p => title.toLowerCase().includes(p.toLowerCase()));

            if (mentionedPilots.length > 0) {
                news.push({
                    title,
                    summary: `Noticia sobre ${mentionedPilots.join(', ')}`,
                    url: source.url, // Ideally find the specific news link
                    source: source.name,
                    pilotNames: mentionedPilots
                });
            }
        }
        return news;
    } catch (error) {
        console.error(`❌ Error scraping ${source.name}:`, error.message);
        return [];
    }
}

async function run() {
    if (!process.env.WEBHOOK_URL || !WEBHOOK_SECRET) {
        console.error('❌ Missing WEBHOOK_URL or WEBHOOK_SECRET');
        process.exit(1);
    }

    const allNews = [];
    for (const source of SOURCES) {
        const news = await scrapeSource(source);
        allNews.push(...news);
    }

    console.log(`📊 Found ${allNews.length} articles mentioning Argentine pilots.`);

    for (const item of allNews) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${WEBHOOK_SECRET}`
                },
                body: JSON.stringify(item)
            });
            const result = await response.json();
            if (result.success) {
                console.log(`✅ Posted: ${item.title}`);
            } else {
                console.log(`⚠️ Skip: ${item.title} (${result.error || 'Duplicate or Error'})`);
            }
        } catch (error) {
            console.error(`❌ Error posting ${item.title}:`, error.message);
        }
    }
}

run();
