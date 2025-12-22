// Native fetch is available in Node 18+

const WEBHOOK_URL = process.env.WEBHOOK_URL + '/api/news/webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const SOURCES = [
    { name: 'Campeones', url: 'https://campeones.com.ar/category/noticias/' },
    { name: 'SoloTC', url: 'https://solotc.com.ar/' },
    { name: 'Carburando', url: 'https://carburando.com/' },
    { name: 'Motorsport ar', url: 'https://ar.motorsport.com/f1/news/' },
    { name: 'Corazón F1', url: 'https://www.corazonf1.com/noticias/' },
    { name: 'ACTC', url: 'https://www.actc.org.ar/tc/noticias.html' },
    { name: 'Mundo Sport', url: 'https://mundosport.com/' },
    { name: 'Pole Position', url: 'https://polepositionweb.net/' },
    { name: 'Infobae Deportes', url: 'https://www.infobae.com/deportes/automovilismo/' },
    { name: 'Clarín Autos', url: 'https://www.clarin.com/deportes/polideportivo/automovilismo/' }
];

const PILOTS = [
    'Franco Colapinto', 'Agustín Canapino', 'José María López', 'Pechito López',
    'Sacha Fenestraz', 'Gino Trappa', 'Nicolás Varrone', 'Esteban Guerrieri',
    'Néstor Girolami', 'Bebu Girolami', 'Franco Girolami', 'Julián Santero',
    'Mariano Werner', 'Leonel Pernía', 'Facundo Ardusso', 'Matías Rossi',
    'Sebastián Caram', 'Valentino Mini', 'Teo Schropp', 'Mattia Colnaghi',
    'Nicolás Fuca', 'Simón Bulbarella', 'Luis Perez Companc', 'Patricio Perez Companc',
    'Germán Todino', 'Diego Ciantini', 'Patricio Di Palma', 'Josito Di Palma',
    'Emiliano Spataro', 'Christian Ledesma', 'Juan Cruz Benvenuti', 'Manu Urcera',
    'Jonatan Castellano', 'Mauricio Lambiris', 'Nicolás Trosset'
];

function decodeHtml(html) {
    return html
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&rsquo;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/<[^>]*>/g, ''); // Remove any leftover tags
}

async function scrapeSource(source) {
    console.log(`🔍 Scraping ${source.name}...`);
    try {
        const response = await fetch(source.url);
        const html = await response.text();

        const news = [];
        // Improved regex to find titles and potential links
        // We look for patterns like <h2 class="..."> <a href="..."> TITLE </a> </h2>
        const blockRegex = /<(h[23]|a)[^>]*(?:href=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/\1>/gi;

        let match;
        while ((match = blockRegex.exec(html)) !== null) {
            let potentialLink = match[2];
            let rawContent = match[3];

            // If the content itself has a link, try to extract it
            const innerLink = /href=["']([^"']+)["']/i.exec(rawContent);
            if (innerLink) potentialLink = innerLink[1];

            const cleanTitle = decodeHtml(rawContent).trim();

            if (cleanTitle.length > 20) { // Filter out short fragments
                const mentionedPilots = PILOTS.filter(p => cleanTitle.toLowerCase().includes(p.toLowerCase()));

                if (mentionedPilots.length > 0) {
                    // Normalize link
                    let newsUrl = potentialLink || source.url;
                    if (newsUrl.startsWith('/')) {
                        const base = new URL(source.url);
                        newsUrl = `${base.protocol}//${base.host}${newsUrl}`;
                    }

                    news.push({
                        title: cleanTitle,
                        summary: `Últimas novedades sobre ${mentionedPilots.join(', ')} en ${source.name}.`,
                        url: newsUrl,
                        source: source.name,
                        pilotNames: mentionedPilots,
                        publishedAt: new Date().toISOString()
                    });
                }
            }
        }

        // Remove duplicates within the same source
        const uniqueNews = [];
        const seenTitles = new Set();
        for (const n of news) {
            if (!seenTitles.has(n.title)) {
                uniqueNews.push(n);
                seenTitles.add(n.title);
            }
        }

        return uniqueNews;
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
        const newsItems = await scrapeSource(source);
        allNews.push(...newsItems);
    }

    // Limit to avoid spamming the webhook in one go, but ensure we have enough
    const limitedNews = allNews.slice(0, 50);

    console.log(`📊 Found ${allNews.length} candidate articles. Sending ${limitedNews.length} to database.`);

    for (const item of limitedNews) {
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
                // Silently skip duplicates/exists
            }
        } catch (error) {
            console.error(`❌ Error posting ${item.title}:`, error.message);
        }
    }

    console.log('🚀 Finalizado.');
}

run();
