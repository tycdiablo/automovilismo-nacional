// Datos base del proyecto. Se usan desde `npm run db:seed` y desde POST /api/db/seed.
// Los resultados, el calendario y las noticias NO se cargan acá: F1 y noticias se
// sincronizan automáticamente y el resto se carga desde el panel /admin.

export const categories = [
  { shortName: "F1", slug: "f1", name: "Fórmula 1", isInternational: true, color: "#E10600", sortOrder: 1, website: "https://www.formula1.com", description: "El Campeonato Mundial de Fórmula 1 de la FIA, la máxima categoría del automovilismo." },
  { shortName: "TC", slug: "tc", name: "Turismo Carretera", isInternational: false, color: "#3B82F6", sortOrder: 2, website: "https://www.actc.org.ar", description: "La categoría más popular y antigua del automovilismo argentino, fiscalizada por la ACTC." },
  { shortName: "TC2000", slug: "tc2000", name: "TC2000", isInternational: false, color: "#0891B2", sortOrder: 3, website: "https://www.tc2000.com.ar", description: "Campeonato de autos de turismo con participación oficial de las automotrices." },
  { shortName: "TN", slug: "tn", name: "Turismo Nacional", isInternational: false, color: "#16A34A", sortOrder: 4, description: "Categoría de autos de calle preparados, con las divisiones Clase 2 y Clase 3." },
  { shortName: "Top Race", slug: "top-race", name: "Top Race", isInternational: false, color: "#7C3AED", sortOrder: 5, description: "Categoría de autos silueta con carrocerías de modelos de alta gama." },
  { shortName: "TC Pista", slug: "tc-pista", name: "TC Pista", isInternational: false, color: "#2563EB", sortOrder: 6, website: "https://www.actc.org.ar", description: "Categoría escuela de la ACTC, antesala del Turismo Carretera." },
  { shortName: "TC Pick Up", slug: "tc-pick-up", name: "TC Pick Up", isInternational: false, color: "#EA580C", sortOrder: 7, website: "https://www.actc.org.ar", description: "Campeonato de camionetas pick up fiscalizado por la ACTC." },
  { shortName: "Indy", slug: "indycar", name: "IndyCar", isInternational: true, color: "#DC2626", sortOrder: 10, website: "https://www.indycar.com", description: "La principal categoría de monoplazas de Estados Unidos, que incluye las 500 Millas de Indianápolis." },
  { shortName: "WEC", slug: "wec", name: "Mundial de Resistencia (WEC)", isInternational: true, color: "#0F766E", sortOrder: 11, website: "https://www.fiawec.com", description: "Campeonato Mundial de Resistencia de la FIA, con las 24 Horas de Le Mans como carrera principal." },
  { shortName: "IMSA", slug: "imsa", name: "IMSA SportsCar", isInternational: true, color: "#B91C1C", sortOrder: 12, description: "Campeonato de resistencia de Norteamérica, con las 24 Horas de Daytona." },
  { shortName: "F2", slug: "f2", name: "Fórmula 2", isInternational: true, color: "#6366F1", sortOrder: 13, description: "Antesala de la Fórmula 1 dentro del camino de formación de la FIA." },
  { shortName: "F3", slug: "f3", name: "Fórmula 3", isInternational: true, color: "#4B5563", sortOrder: 14, description: "Campeonato de la FIA para pilotos jóvenes que buscan llegar a la F1." },
  { shortName: "Dakar", slug: "dakar", name: "Rally Dakar", isInternational: true, color: "#CA8A04", sortOrder: 16, website: "https://www.dakar.com", description: "El rally raid más exigente del mundo, con fuerte presencia de pilotos argentinos en autos, motos, quads y UTV." },
  { shortName: "TCR World", slug: "tcr-world", name: "TCR World Tour", isInternational: true, color: "#BE123C", sortOrder: 15, description: "Serie internacional de autos de turismo bajo reglamento TCR." },
];

export const pilots = [
  { fullName: "Franco Colapinto", slug: "franco-colapinto", category: "F1", externalId: "colapinto", aliases: "Colapinto, Franquito", featured: true, carNumber: 43, birthPlace: "Pilar, Buenos Aires", dateOfBirth: "2003-05-27", imageUrl: "https://www.formulaonehistory.com/wp-content/uploads/2024/08/Franco-Colapinto-Alpine-2025.webp", socials: { instagram: "francolapinto", x: "FranColapinto" }, bio: "Piloto de Pilar que llegó a la Fórmula 1 en 2024 con Williams y desde 2025 corre para Alpine. Es el primer argentino en la máxima categoría desde Gastón Mazzacane en 2001." },
  { fullName: "Agustín Canapino", slug: "agustin-canapino", category: "TC", aliases: "Canapino, Titán de Arrecifes", featured: true, birthPlace: "Arrecifes, Buenos Aires", dateOfBirth: "1990-04-07", imageUrl: "https://actc.org.ar/upload/autos/9642/imgs_v3/imgtorso/podio/agustin_canapino.png", socials: { instagram: "agustincanapino" }, bio: "Múltiple campeón de Turismo Carretera, TC2000 y Top Race. Corrió en IndyCar con Juncos Hollinger Racing entre 2023 y 2024 antes de volver al automovilismo argentino." },
  { fullName: "José María López", slug: "pechito-lopez", category: "WEC", aliases: "Pechito López, Pechito", featured: true, birthPlace: "Río Tercero, Córdoba", dateOfBirth: "1983-04-26", bio: "Tricampeón del Mundial de Turismos (WTCC) y campeón del Mundial de Resistencia con Toyota. Uno de los pilotos argentinos más exitosos a nivel internacional." },
  { fullName: "Julián Santero", slug: "julian-santero", category: "TC", aliases: "Santero", imageUrl: "https://actc.org.ar/upload/autos/9590/imgs_v3/imgtorso/podio/julian_santero.png", birthPlace: "Mendoza" },
  { fullName: "Mariano Werner", slug: "mariano-werner", category: "TC", aliases: "Werner", imageUrl: "https://actc.org.ar/upload/autos/9593/imgs_v3/imgtorso/podio/mariano_werner.png", birthPlace: "Paraná, Entre Ríos" },
  { fullName: "Facundo Ardusso", slug: "facundo-ardusso", category: "TC", aliases: "Ardusso", birthPlace: "Las Parejas, Santa Fe" },
  { fullName: "Matías Rossi", slug: "matias-rossi", category: "TC", aliases: "Matías Rossi, Misil Rossi", imageUrl: "https://actc.org.ar/upload/autos/9654/imgs_v3/imgtorso/podio/matias_rossi.png" },
  { fullName: "Diego Ciantini", slug: "diego-ciantini", category: "TC", aliases: "Ciantini", imageUrl: "https://actc.org.ar/upload/autos/9592/imgs_v3/imgtorso/podio/diego_ciantini.png" },
  { fullName: "Mauricio Lambiris", slug: "mauricio-lambiris", category: "TC", aliases: "Lambiris" },
  { fullName: "Germán Todino", slug: "german-todino", category: "TC", aliases: "Todino" },
  { fullName: "Leonel Pernía", slug: "leonel-pernia", category: "TC2000", aliases: "Pernía, Pernia", birthPlace: "Tandil, Buenos Aires" },
  { fullName: "Esteban Guerrieri", slug: "esteban-guerrieri", category: "TCR World", aliases: "Guerrieri" },
  { fullName: "Néstor Girolami", slug: "bebu-girolami", category: "TCR World", aliases: "Bebu Girolami, Bebu" },
  { fullName: "Franco Girolami", slug: "franco-girolami", category: "TCR World", aliases: "Franco Girolami" },
];
