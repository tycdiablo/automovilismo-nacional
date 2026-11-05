# Motor Nacional 🇦🇷🏁

Todo el automovilismo argentino en un solo lugar: pilotos, noticias, resultados, calendario y campeonatos, en el país y en el mundo.

Hecho con **Next.js 15 (App Router)**, **Prisma + PostgreSQL**, **NextAuth**, **Tailwind CSS 4** y notificaciones **Web Push**.

## Funcionalidades

| Sección | Qué tiene |
|---|---|
| **Inicio** | Próxima carrera con cuenta regresiva y horarios en hora argentina, agenda, último resultado, campeonato, pilotos destacados (o los que seguís) y noticias. |
| **Calendario** | Próximas y pasadas, agrupadas por mes y filtrables por categoría. Suscripción **iCal** (`/api/calendar?categoria=f1,tc`) para Google Calendar / Apple / Outlook. |
| **Resultados** | Podio de cada carrera y posición de los argentinos. Página de cada carrera con clasificación completa, horarios, fecha anterior/siguiente y noticias relacionadas. |
| **Campeonatos** | Tablas de pilotos y equipos con los argentinos destacados. |
| **Pilotos** | Listado con filtros y buscador. Perfil con estadísticas de la temporada, gráfico de posiciones, resultados, próximas fechas, noticias y redes. |
| **Categorías** | Nacionales e internacionales, cada una con su calendario, resultados, campeonato, pilotos y noticias. |
| **Noticias** | Agregador automático por RSS con detección de piloto y categoría, filtros por categoría/fuente, búsqueda y paginación. |
| **Buscador global** | Pilotos, categorías, carreras y noticias (atajo: `/` o `Ctrl+K`). |
| **Cuentas** | Registro/login, seguir pilotos, feed personal en **Mis pilotos** y alertas push cuando tus pilotos terminan una carrera o salen en las noticias. |
| **Panel /admin** | Cargar/editar carreras, pegar resultados y campeonatos desde una planilla, gestionar pilotos y noticias, forzar sincronizaciones y ver su historial. |
| **Profesional** | SEO (metadata por página, Open Graph, JSON-LD, sitemap, robots), PWA instalable, modo claro/oscuro, headers de seguridad, accesibilidad y CI. |

## Fuentes de datos

- **Fórmula 1** – calendario, resultados y campeonatos se sincronizan solos desde la API pública [Jolpica-F1](https://github.com/jolpica/jolpica-f1).
- **Noticias** – feeds RSS de Infobae, Campeones, SoloTC, Carburando, Motorsport.com y Clarín (`lib/sync/news.ts`), con filtros para quedarse sólo con lo relevante.
- **Categorías nacionales (TC, TC2000, TN, Top Race…)** – no tienen API pública: se cargan desde `/admin` pegando la tabla (`pos ; piloto ; equipo ; tiempo ; puntos`). También existe el webhook `POST /api/results/webhook` para integraciones.

## Puesta en marcha local

```bash
cp .env.example .env   # completá DATABASE_URL, NEXTAUTH_SECRET y ADMIN_EMAILS
npm install
npm run db:push        # crea/actualiza las tablas
npm run db:seed        # categorías y pilotos base
npm run dev
```

Para traer datos reales al toque:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/sync"
```

Para entrar al panel, registrate con un email incluido en `ADMIN_EMAILS` y andá a `/admin`.

## Deploy (Vercel)

1. Configurá las variables de `.env.example` en Vercel (como mínimo `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAILS`, `CRON_SECRET`).
2. Corré `npm run db:push` y `npm run db:seed` contra la base de producción (o `POST /api/db/seed` con `Authorization: Bearer $WEBHOOK_SECRET`).
3. Sincronización automática:
   - **Vercel Cron** (`vercel.json`) sincroniza F1 una vez por día.
   - **GitHub Actions** (`.github/workflows/sync.yml`) sincroniza noticias y F1 cada 2 horas. Cargá los secrets `SITE_URL` y `CRON_SECRET` en el repo.
4. Notificaciones push (opcional): `npx web-push generate-vapid-keys` y cargá `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_EMAIL`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `start` | Build y servidor de producción |
| `npm run lint` / `typecheck` | ESLint y TypeScript (también corren en CI) |
| `npm run db:push` | Sincroniza el schema de Prisma con la base |
| `npm run db:seed` | Carga categorías y pilotos base (idempotente) |
| `npm run db:studio` | Prisma Studio |

## Estructura

```
app/                 páginas (App Router) y API routes
  admin/             panel de administración + server actions
  api/cron/sync      sincronización automática (F1 + noticias)
  api/calendar       feed iCal
components/          UI (layout, noticias, pilotos, carreras, tablas, admin)
lib/sync/            integraciones: f1.ts (Jolpica), news.ts (RSS)
lib/queries.ts       consultas compartidas
data/seed-data.mjs   categorías y pilotos base
prisma/              schema y seed
```
