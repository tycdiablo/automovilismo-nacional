export type Pilot = {
    id: string;
    name: string;
    category: string;
    team: string;
    nationality: string;
    imageUrl: string;
    isInternational: boolean;
};

export const pilots: Pilot[] = [
    {
        id: "1",
        name: "Franco Colapinto",
        category: "Formula 1",
        team: "Williams Racing",
        nationality: "Argentina",
        imageUrl: "/placeholder.svg",
        isInternational: true,
    },
    {
        id: "2",
        name: "Agustín Canapino",
        category: "IndyCar",
        team: "Juncos Hollinger Racing",
        nationality: "Argentina",
        imageUrl: "/placeholder.svg",
        isInternational: true,
    },
    {
        id: "3",
        name: "José María López",
        category: "WEC",
        team: "Toyota Gazoo Racing",
        nationality: "Argentina",
        imageUrl: "/placeholder.svg",
        isInternational: true,
    },
    {
        id: "4",
        name: "Julián Santero",
        category: "Turismo Carretera",
        team: "LCA Racing",
        nationality: "Argentina",
        imageUrl: "/placeholder.svg",
        isInternational: false,
    },
    {
        id: "5",
        name: "Mariano Werner",
        category: "Turismo Carretera",
        team: "Fadel Werner Competición",
        nationality: "Argentina",
        imageUrl: "/placeholder.svg",
        isInternational: false,
    },
    {
        id: "6",
        name: "Esteban Guerrieri",
        category: "WEC",
        team: "Vanwall Racing",
        nationality: "Argentina",
        imageUrl: "/placeholder.svg",
        isInternational: true,
    },
];
