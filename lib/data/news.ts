export type NewsItem = {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    source: string;
    publishedAt: string;
    category: string;
    relatedPilot?: string;
};

export const newsItems: NewsItem[] = [
    {
        id: "1",
        title: "Colapinto sorprende en Monza y acaricia los puntos",
        summary: "El piloto de Williams mostró un ritmo sólido durante todo el fin de semana y finalizó en la puesto 12, a solo unos segundos del top 10.",
        imageUrl: "/placeholder.svg",
        source: "Motorsport.com",
        publishedAt: "Hace 2 horas",
        category: "Formula 1",
        relatedPilot: "Franco Colapinto"
    },
    {
        id: "2",
        title: "Canapino renueva con Juncos Hollinger Racing para 2026",
        summary: "El titán de Arrecifes continuará su aventura en IndyCar por una temporada más, consolidándose como referente del equipo.",
        imageUrl: "/placeholder.svg",
        source: "Carburando",
        publishedAt: "Hace 5 horas",
        category: "IndyCar",
        relatedPilot: "Agustín Canapino"
    },
    {
        id: "3",
        title: "Santero domina la clasificación del TC en Paraná",
        summary: "El mendocino voló con su Ford Mustang y se quedó con la pole position, superando a Werner por 0.124s.",
        imageUrl: "/placeholder.svg",
        source: "Campeones",
        publishedAt: "Ayer",
        category: "Turismo Carretera",
        relatedPilot: "Julián Santero"
    },
    {
        id: "4",
        title: "Pechito López vuelve a hacer historia en Le Mans",
        summary: "Junto al equipo Toyota, el cordobés logró un podio épico tras una remontada nocturna inolvidable.",
        imageUrl: "/placeholder.svg",
        source: "FIA WEC",
        publishedAt: "Hace 2 días",
        category: "WEC",
        relatedPilot: "José María López"
    }
];
