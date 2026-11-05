import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedAutomation } from "@/lib/security";
import { notifyFollowers } from "@/lib/push";
import { decodeEntities } from "@/lib/utils";

interface NewsWebhookPayload {
  title: string;
  summary?: string;
  url: string;
  source: string;
  imageUrl?: string;
  publishedAt?: string;
  pilotNames?: string[];
  categoryName?: string;
}

/** Alta de noticias desde integraciones externas (scripts, n8n, etc.) */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAutomation(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload: NewsWebhookPayload = await request.json();
    if (!payload.title || !payload.url || !payload.source || !/^https?:\/\//.test(payload.url)) {
      return NextResponse.json({ error: "Faltan campos obligatorios (title, url, source)" }, { status: 400 });
    }

    const existing = await prisma.news.findUnique({ where: { originalUrl: payload.url } });
    if (existing) {
      return NextResponse.json({ message: "La noticia ya existe", newsId: existing.id });
    }

    const pilot = payload.pilotNames?.length
      ? await prisma.pilot.findFirst({
          where: { OR: payload.pilotNames.map((name) => ({ fullName: { contains: name, mode: "insensitive" as const } })) },
        })
      : null;

    const category = payload.categoryName
      ? await prisma.category.findFirst({
          where: {
            OR: [
              { shortName: { equals: payload.categoryName, mode: "insensitive" } },
              { name: { contains: payload.categoryName, mode: "insensitive" } },
            ],
          },
        })
      : null;

    const title = decodeEntities(payload.title);
    const news = await prisma.news.create({
      data: {
        title,
        summary: payload.summary ? decodeEntities(payload.summary) : null,
        originalUrl: payload.url,
        sourceName: payload.source,
        imageUrl: payload.imageUrl || null,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
        pilotId: pilot?.id ?? null,
        categoryId: category?.id ?? pilot?.categoryId ?? null,
      },
    });

    if (pilot) {
      await notifyFollowers([pilot.id], { title: `📰 Novedades de ${pilot.fullName}`, body: title, url: payload.url });
    }

    return NextResponse.json({ success: true, newsId: news.id }, { status: 201 });
  } catch (error) {
    console.error("News webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
