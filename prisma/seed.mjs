import { PrismaClient } from "@prisma/client";
import { categories, pilots } from "../data/seed-data.mjs";

/**
 * Carga categorías y pilotos base. Es idempotente: se puede correr muchas veces.
 * Los datos ya existentes no se pisan (salvo campos vacíos), así lo editado desde
 * el panel de administración se mantiene.
 * @param {PrismaClient} prisma
 */
export async function seed(prisma) {
  for (const { shortName, ...data } of categories) {
    await prisma.category.upsert({
      where: { shortName },
      update: data,
      create: { shortName, ...data },
    });
  }

  let created = 0;
  for (const p of pilots) {
    const category = await prisma.category.findUnique({ where: { shortName: p.category } });
    if (!category) continue;

    const existing = await prisma.pilot.findUnique({ where: { slug: p.slug } });
    const base = {
      fullName: p.fullName,
      nationality: "Argentina",
      aliases: p.aliases ?? null,
      externalId: p.externalId ?? null,
      featured: Boolean(p.featured),
      carNumber: p.carNumber ?? null,
      birthPlace: p.birthPlace ?? null,
      bio: p.bio ?? null,
      dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
      profileImageUrl: p.imageUrl ?? null,
      socialMediaHandles: p.socials ? JSON.stringify(p.socials) : null,
    };

    if (!existing) {
      await prisma.pilot.create({ data: { ...base, slug: p.slug, categoryId: category.id } });
      created++;
    } else {
      // Sólo completa campos vacíos
      const patch = {};
      for (const [key, value] of Object.entries(base)) {
        if (value !== null && (existing[key] === null || existing[key] === undefined)) patch[key] = value;
      }
      if (p.featured && !existing.featured) patch.featured = true;
      if (Object.keys(patch).length) await prisma.pilot.update({ where: { id: existing.id }, data: patch });
    }
  }

  return { categories: categories.length, pilots: pilots.length, created };
}

if (process.argv[1] && process.argv[1].endsWith("seed.mjs")) {
  const prisma = new PrismaClient();
  seed(prisma)
    .then((r) => console.log(`🌱 Seed OK: ${r.categories} categorías, ${r.pilots} pilotos (${r.created} nuevos)`))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
