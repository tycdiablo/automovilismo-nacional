import { prisma } from "@/lib/prisma";
import { notifyFollowers } from "@/lib/push";
import { flagFor, normalize } from "@/lib/utils";

/**
 * Sincroniza calendario, resultados y campeonatos de Fórmula 1 usando la API
 * pública de Jolpica (sucesora de Ergast): https://github.com/jolpica/jolpica-f1
 */

const API = process.env.F1_API_URL || "https://api.jolpi.ca/ergast/f1";
const PAGE = 100;

type Location = { locality: string; country: string };
type Circuit = { circuitName: string; Location: Location };
type SessionTime = { date: string; time?: string };
type Race = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: Circuit;
  FirstPractice?: SessionTime;
  SecondPractice?: SessionTime;
  ThirdPractice?: SessionTime;
  Qualifying?: SessionTime;
  Sprint?: SessionTime;
  SprintQualifying?: SessionTime;
  Results?: RaceResult[];
};
type Driver = { driverId: string; givenName: string; familyName: string; nationality: string };
type Constructor = { name: string; nationality: string };
type RaceResult = {
  position: string;
  positionText: string;
  points: string;
  grid: string;
  status: string;
  laps: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: { time: string };
};

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json", "User-Agent": "MotorNacional/1.0" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Jolpica ${path} respondió ${res.status}`);
  const json = await res.json();
  return json.MRData as T;
}

const RACE_NAMES_ES: Record<string, string> = {
  Australian: "Australia", Chinese: "China", Japanese: "Japón", Bahrain: "Baréin",
  "Saudi Arabian": "Arabia Saudita", Miami: "Miami", "Emilia Romagna": "Emilia-Romaña",
  Monaco: "Mónaco", Spanish: "España", Barcelona: "Barcelona", Canadian: "Canadá",
  Austrian: "Austria", British: "Gran Bretaña", Belgian: "Bélgica", Hungarian: "Hungría",
  Dutch: "Países Bajos", Italian: "Italia", Azerbaijan: "Azerbaiyán", Singapore: "Singapur",
  "United States": "Estados Unidos", "Mexico City": "Ciudad de México", Mexican: "México",
  Brazilian: "Brasil", "São Paulo": "San Pablo", "Las Vegas": "Las Vegas", Qatar: "Qatar",
  "Abu Dhabi": "Abu Dabi", Madrid: "Madrid", Portuguese: "Portugal", Turkish: "Turquía",
};

export function raceNameEs(name: string) {
  const match = /^(.*) Grand Prix(.*)$/.exec(name);
  if (!match) return name;
  const key = match[1].trim();
  const rest = match[2].trim();
  const es = RACE_NAMES_ES[key] ?? key;
  if (rest.startsWith("in ")) {
    return `GP de ${es} (en ${rest.slice(3)})`;
  }
  return `GP de ${es}${rest ? ` ${rest}` : ""}`;
}

function toDate(s?: SessionTime) {
  if (!s) return null;
  return new Date(`${s.date}T${s.time ?? "12:00:00Z"}`);
}

function buildSessions(race: Race) {
  const list: { name: string; date: string }[] = [];
  const add = (name: string, s?: SessionTime) => {
    const d = toDate(s);
    if (d) list.push({ name, date: d.toISOString() });
  };
  add("Práctica 1", race.FirstPractice);
  add("Práctica 2", race.SecondPractice);
  add("Práctica 3", race.ThirdPractice);
  add("Clasificación Sprint", race.SprintQualifying);
  add("Sprint", race.Sprint);
  add("Clasificación", race.Qualifying);
  add("Carrera", { date: race.date, time: race.time });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

const STATUS_ES: Record<string, string> = {
  Retired: "Abandono", Accident: "Accidente", Collision: "Choque", Disqualified: "Descalificado",
  "Did not start": "No largó", Withdrew: "Retirado", Engine: "Motor", Gearbox: "Caja",
  Hydraulics: "Hidráulica", Brakes: "Frenos", "Power Unit": "Unidad de potencia",
};

function gapFor(r: RaceResult) {
  if (r.Time?.time) return r.Time.time;
  if (/^\+\d+ Laps?$/.test(r.status)) return r.status.replace("Laps", "vueltas").replace("Lap", "vuelta");
  if (r.status === "Lapped") return "+1 vuelta";
  return STATUS_ES[r.status] ?? r.status;
}

async function fetchAllResults(season: string) {
  const races = new Map<string, RaceResult[]>();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await api<{ total: string; RaceTable: { Races: Race[] } }>(
      `/${season}/results.json?limit=${PAGE}&offset=${offset}`
    );
    total = Number(data.total);
    for (const race of data.RaceTable.Races) {
      const list = races.get(race.round) ?? [];
      list.push(...(race.Results ?? []));
      races.set(race.round, list);
    }
    offset += PAGE;
    if (offset > 2000) break; // resguardo
  }
  return races;
}

export async function syncF1(season = "current") {
  const category = await prisma.category.findUnique({ where: { shortName: "F1" } });
  if (!category) throw new Error("No existe la categoría F1. Corré el seed primero.");

  // Pilotos seguidos de la categoría (para vincular resultados y campeonato)
  const trackedPilots = await prisma.pilot.findMany({ select: { id: true, fullName: true, externalId: true } });
  const pilotFor = (d: Driver) =>
    trackedPilots.find(
      (p) => p.externalId === d.driverId || normalize(p.fullName) === normalize(`${d.givenName} ${d.familyName}`)
    );

  // 1. Calendario
  const schedule = await api<{ RaceTable: { season: string; Races: Race[] } }>(`/${season}.json?limit=${PAGE}`);
  const year = schedule.RaceTable.season;
  const races = schedule.RaceTable.Races;

  const eventIds = new Map<string, { id: string; status: string; name: string }>();
  for (const race of races) {
    const externalId = `f1-${year}-${race.round}`;
    const data = {
      name: raceNameEs(race.raceName),
      circuit: race.Circuit.circuitName,
      location: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      date: toDate({ date: race.date, time: race.time })!,
      season: Number(year),
      round: Number(race.round),
      sessions: buildSessions(race),
      categoryId: category.id,
    };
    const existing = await prisma.raceEvent.findUnique({ where: { externalId } });
    const ev = existing
      ? await prisma.raceEvent.update({ where: { id: existing.id }, data })
      : await prisma.raceEvent.create({ data: { ...data, externalId } });
    eventIds.set(race.round, { id: ev.id, status: ev.status, name: ev.name });
  }

  // 2. Resultados
  const results = await fetchAllResults(year);
  let finishedNow = 0;
  for (const [round, list] of results) {
    const ev = eventIds.get(round);
    if (!ev || list.length === 0) continue;

    await prisma.$transaction([
      prisma.result.deleteMany({ where: { raceEventId: ev.id } }),
      prisma.result.createMany({
        data: list.map((r) => ({
          position: Number(r.position),
          pilotName: `${r.Driver.givenName} ${r.Driver.familyName}`,
          pilotFlag: flagFor(r.Driver.nationality),
          pilotId: pilotFor(r.Driver)?.id ?? null,
          team: r.Constructor.name,
          grid: Number(r.grid) || null,
          status: r.status,
          timeGap: gapFor(r),
          points: Number(r.points),
          raceEventId: ev.id,
          categoryId: category.id,
        })),
      }),
      prisma.raceEvent.update({ where: { id: ev.id }, data: { status: "FINISHED" } }),
    ]);

    // Notificar sólo la primera vez que se cargan los resultados
    if (ev.status !== "FINISHED") {
      finishedNow++;
      for (const r of list) {
        const pilot = pilotFor(r.Driver);
        if (pilot) {
          await notifyFollowers([pilot.id], {
            title: `🏁 ${pilot.fullName} terminó P${r.position}`,
            body: `${ev.name} · ${gapFor(r)}`,
            url: `/carreras/${ev.id}`,
          });
        }
      }
    }
  }

  // 3. Campeonatos de pilotos y constructores
  type DriverStanding = { position?: string; positionText: string; points: string; wins: string; Driver: Driver; Constructors: Constructor[] };
  type TeamStanding = { position?: string; positionText: string; points: string; wins: string; Constructor: Constructor };

  const ds = await api<{ StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] } }>(
    `/${year}/driverStandings.json?limit=${PAGE}`
  );
  const cs = await api<{ StandingsTable: { StandingsLists: { ConstructorStandings: TeamStanding[] }[] } }>(
    `/${year}/constructorStandings.json?limit=${PAGE}`
  );
  const drivers = ds.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
  const teams = cs.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];

  if (drivers.length) {
    await prisma.$transaction([
      prisma.standing.deleteMany({ where: { categoryId: category.id, season: Number(year), kind: "DRIVER" } }),
      prisma.standing.createMany({
        data: drivers.map((s, i) => ({
          season: Number(year),
          kind: "DRIVER",
          position: Number(s.position ?? i + 1),
          name: `${s.Driver.givenName} ${s.Driver.familyName}`,
          flag: flagFor(s.Driver.nationality),
          team: s.Constructors.at(-1)?.name ?? null,
          points: Number(s.points),
          wins: Number(s.wins),
          pilotId: pilotFor(s.Driver)?.id ?? null,
          categoryId: category.id,
        })),
      }),
    ]);

    // Mantener actualizado el equipo de los pilotos seguidos
    for (const s of drivers) {
      const pilot = pilotFor(s.Driver);
      const team = s.Constructors.at(-1)?.name;
      if (pilot && team) await prisma.pilot.update({ where: { id: pilot.id }, data: { team } });
    }
  }

  if (teams.length) {
    await prisma.$transaction([
      prisma.standing.deleteMany({ where: { categoryId: category.id, season: Number(year), kind: "TEAM" } }),
      prisma.standing.createMany({
        data: teams.map((s, i) => ({
          season: Number(year),
          kind: "TEAM",
          position: Number(s.position ?? i + 1),
          name: s.Constructor.name,
          flag: flagFor(s.Constructor.nationality),
          points: Number(s.points),
          wins: Number(s.wins),
          categoryId: category.id,
        })),
      }),
    ]);
  }

  return {
    season: Number(year),
    events: races.length,
    eventsWithResults: results.size,
    newlyFinished: finishedNow,
    driverStandings: drivers.length,
    teamStandings: teams.length,
  };
}
