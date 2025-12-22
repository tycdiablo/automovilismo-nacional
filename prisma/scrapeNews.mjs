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
    { name: 'Clarín Autos', url: 'https://www.clarin.com/deportes/polideportivo/automovilismo/' },
    { name: 'TC La Revista', url: 'https://tclarevista.com.ar/' },
    { name: 'La Cuadriculada', url: 'https://lacuadriculada.com.ar/' },
    { name: 'Revista Solo Auto', url: 'https://solomoto.es/automovilismo/' },
    { name: 'Pueblo de Pilotos', url: 'https://pueblodepilotos.com/' },
    { name: 'Vértigo Motor', url: 'https://vertigomotor.com.ar/' }
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
    'Jonatan Castellano', 'Mauricio Lambiris', 'Nicolás Trosset', 'Andrés Jakos',
    'Marcos Quijada', 'Otto Fritzler', 'Santiago Mangoni', 'Valentín Aguirre',
    'Juan Bautista De Benedictis', 'Gastón Mazzacane', 'Santiago Álvarez', 'Marcos Landa',
    'Ricardo Risatti', 'Gabriel Ponce de León', 'Nicolás Bonelli', 'Juan José Ebarlín',
    'Ignacio Montenegro', 'Bernardo Llaver', 'Fabricio Persia', 'Jorge Barrio',
    'Damián Fineschi', 'Marcelo Ciarrocchi', 'Kevin Felippo'
];

const KEYWORDS = [
    'Turismo Carretera', 'TC2000', 'Top Race', 'Turismo Nacional', 'ACTC',
    'Fórmula 1', 'IndyCar', 'WEC', 'TCR World Tour', 'TCR South America',
    'Fórmula Nacional', 'TC Pick Up', 'TC Pista', 'TN Clase 3', 'TN Clase 2',
    'Automovilismo Argentino'
];

function decodeHtml(html) {
    if (!html) return '';
    return html
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&iacute;/g, 'í')
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&oacute;/g, 'ó')
        .replace(/&uacute;/g, 'ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Iacute;/g, 'Í')
        .replace(/&Aacute;/g, 'Á')
        .replace(/&Eacute;/g, 'É')
        .replace(/&Oacute;/g, 'Ó')
        .replace(/&Uacute;/g, 'Ú')
        .replace(/&Ntilde;/g, 'Ñ')
        .replace(/<[^>]*>/g, '') // Remove any leftover tags
        .trim();
}

async function scrapeSource(source) {
    console.log(`🔍 Scraping ${source.name}...`);
    try {
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();

        const news = [];
        const blockRegex = /<(h[123]|a)[^>]*(?:href=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/\1>/gi;

        let match;
        while ((match = blockRegex.exec(html)) !== null) {
            let potentialLink = match[2];
            let rawContent = match[3];

            const innerLink = /href=["']([^"']+)["']/i.exec(rawContent);
            if (innerLink) potentialLink = innerLink[1];

            const cleanTitle = decodeHtml(rawContent);

            if (cleanTitle.length > 25 && cleanTitle.length < 200) {
                const mentionedPilots = PILOTS.filter(p => cleanTitle.toLowerCase().includes(p.toLowerCase()));
                const mentionedKeywords = KEYWORDS.filter(k => cleanTitle.toLowerCase().includes(k.toLowerCase()));

                if (mentionedPilots.length > 0 || mentionedKeywords.length > 0) {
                    let newsUrl = potentialLink || source.url;
                    if (newsUrl.startsWith('/')) {
                        const base = new URL(source.url);
                        newsUrl = `${base.protocol}//${base.host}${newsUrl}`;
                    } else if (!newsUrl.startsWith('http')) {
                        const base = new URL(source.url);
                        // Ensure there's a slash between host and path
                        const host = base.host.endsWith('/') ? base.host : base.host + '/';
                        newsUrl = `${base.protocol}//${host}${newsUrl}`;
                    }

                    if (newsUrl === source.url || newsUrl.endsWith('/category/noticias/') || newsUrl.length < source.url.length + 5) {
                        continue;
                    }

                    news.push({
                        title: cleanTitle,
                        summary: `Últimas novedades sobre ${mentionedPilots.concat(mentionedKeywords).join(', ')} en ${source.name}.`,
                        url: newsUrl,
                        source: source.name,
                        pilotNames: mentionedPilots,
                        categoryName: mentionedKeywords[0] || null,
                        publishedAt: new Date().toISOString()
                    });
                }
            }
        }

        const uniqueNews = [];
        const seenTitles = new Set();
        const seenUrls = new Set();
        for (const n of news) {
            if (!seenTitles.has(n.title.toLowerCase()) && !seenUrls.has(n.url)) {
                uniqueNews.push(n);
                seenTitles.add(n.title.toLowerCase());
                seenUrls.add(n.url);
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

    const shuffledNews = allNews.sort(() => 0.5 - Math.random());
    const limitedNews = shuffledNews.slice(0, 100);

    console.log(`📊 Found ${allNews.length} candidate articles. Sending ${limitedNews.length} to database.`);

    let successCount = 0;
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
                successCount++;
                console.log(`✅ Posted: ${item.title}`);
            }
        } catch (error) { }
    }

    console.log(`🚀 Finalizado. Se procesaron ${successCount} noticias nuevas.`);
}

run();
