import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE_NAME = "Motor Nacional";
export const SITE_DESCRIPTION =
  "Toda la actividad del automovilismo argentino en un solo lugar: pilotos, noticias, resultados, calendario y campeonatos, en el país y en el mundo.";

export function siteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path}`;
}

/** "Agustín Canapino" -> "agustin-canapino" */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Normaliza para comparar nombres sin tildes ni mayúsculas */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function categorySlug(category: { slug?: string | null; shortName: string }) {
  return category.slug || slugify(category.shortName);
}

const NATIONALITY_FLAGS: Record<string, string> = {
  argentina: "🇦🇷", argentine: "🇦🇷",
  australia: "🇦🇺", australian: "🇦🇺",
  austria: "🇦🇹", austrian: "🇦🇹",
  belgium: "🇧🇪", belgian: "🇧🇪",
  brazil: "🇧🇷", brazilian: "🇧🇷", brasil: "🇧🇷",
  canada: "🇨🇦", canadian: "🇨🇦",
  chile: "🇨🇱", chilean: "🇨🇱",
  china: "🇨🇳", chinese: "🇨🇳",
  colombia: "🇨🇴", colombian: "🇨🇴",
  denmark: "🇩🇰", danish: "🇩🇰",
  finland: "🇫🇮", finnish: "🇫🇮",
  france: "🇫🇷", french: "🇫🇷",
  germany: "🇩🇪", german: "🇩🇪",
  "great britain": "🇬🇧", uk: "🇬🇧", british: "🇬🇧",
  italy: "🇮🇹", italian: "🇮🇹",
  japan: "🇯🇵", japanese: "🇯🇵",
  mexico: "🇲🇽", mexican: "🇲🇽",
  monaco: "🇲🇨", monegasque: "🇲🇨",
  netherlands: "🇳🇱", dutch: "🇳🇱",
  "new zealand": "🇳🇿", "new zealander": "🇳🇿",
  poland: "🇵🇱", polish: "🇵🇱",
  portugal: "🇵🇹", portuguese: "🇵🇹",
  spain: "🇪🇸", spanish: "🇪🇸",
  sweden: "🇸🇪", swedish: "🇸🇪",
  switzerland: "🇨🇭", swiss: "🇨🇭",
  thailand: "🇹🇭", thai: "🇹🇭",
  uruguay: "🇺🇾", uruguayan: "🇺🇾",
  usa: "🇺🇸", "united states": "🇺🇸", american: "🇺🇸",
  estonian: "🇪🇪", israeli: "🇮🇱", indonesian: "🇮🇩", russian: "🇷🇺",
  "south african": "🇿🇦", venezuelan: "🇻🇪", paraguayan: "🇵🇾",
};

export function flagFor(nationality?: string | null) {
  if (!nationality) return "🏁";
  return NATIONALITY_FLAGS[nationality.toLowerCase()] ?? "🏁";
}

const COUNTRY_ES: Record<string, string> = {
  Australia: "Australia", China: "China", Japan: "Japón", USA: "Estados Unidos",
  "United States": "Estados Unidos", Canada: "Canadá", Monaco: "Mónaco", Spain: "España",
  Austria: "Austria", UK: "Reino Unido", "United Kingdom": "Reino Unido", Belgium: "Bélgica",
  Hungary: "Hungría", Netherlands: "Países Bajos", Italy: "Italia", Azerbaijan: "Azerbaiyán",
  Singapore: "Singapur", Mexico: "México", Brazil: "Brasil", Qatar: "Qatar", UAE: "Emiratos Árabes",
  Bahrain: "Baréin", "Saudi Arabia": "Arabia Saudita", Malaysia: "Malasia", Argentina: "Argentina",
};

export function countryEs(country?: string | null) {
  if (!country) return null;
  return COUNTRY_ES[country] ?? country;
}

export function positionBadgeClass(position: number) {
  if (position === 1) return "bg-amber-400/15 text-amber-500 ring-1 ring-amber-400/40";
  if (position === 2) return "bg-zinc-300/15 text-zinc-400 ring-1 ring-zinc-300/40";
  if (position === 3) return "bg-orange-700/15 text-orange-600 ring-1 ring-orange-700/40";
  return "bg-muted text-muted-foreground";
}

export function formatPoints(points?: number | null) {
  if (points === null || points === undefined) return "-";
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

export const EVENT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programada",
  FINISHED: "Finalizada",
  CANCELLED: "Cancelada",
};

export type EventSession = { name: string; date: string };

export function parseSessions(value: unknown): EventSession[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is EventSession =>
      typeof s === "object" && s !== null && typeof s.name === "string" && typeof s.date === "string"
  );
}

export function parseSocials(value?: string | null): Record<string, string> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export const ARG_TZ = "America/Argentina/Buenos_Aires";

/** Formatea una fecha en horario argentino */
export function formatArg(date: Date | string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-AR", { timeZone: ARG_TZ, hourCycle: "h23", ...opts }).format(new Date(date));
}

export function decodeEntities(text: string) {
  if (!text) return "";
  const named: Record<string, string> = {
    quot: '"', amp: "&", apos: "'", lt: "<", gt: ">", nbsp: " ", rsquo: "’", lsquo: "‘",
    rdquo: "”", ldquo: "“", hellip: "…", ndash: "–", mdash: "—", iacute: "í", aacute: "á",
    eacute: "é", oacute: "ó", uacute: "ú", ntilde: "ñ", Iacute: "Í", Aacute: "Á", Eacute: "É",
    Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", iexcl: "¡", iquest: "¿", deg: "°",
  };
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => named[n] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}
