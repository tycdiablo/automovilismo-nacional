import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const secret = process.env.WEBHOOK_SECRET;

        if (!authHeader || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { eventName, date, categoryShortName, results } = data;

        if (!eventName || !categoryShortName || !results) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const category = await prisma.category.findUnique({
            where: { shortName: categoryShortName }
        });

        if (!category) {
            return NextResponse.json({ error: `Category ${categoryShortName} not found` }, { status: 404 });
        }

        // Create or find the RaceEvent
        const raceEvent = await prisma.raceEvent.upsert({
            where: {
                // We'll use a combination of name and date for a more unique check if we had a slug, 
                // but let's just find by name and category for now
                id: (await prisma.raceEvent.findFirst({
                    where: { name: eventName, categoryId: category.id }
                }))?.id || 'new-uuid'
            },
            update: {
                date: new Date(date),
                location: data.location || null
            },
            create: {
                name: eventName,
                date: new Date(date),
                categoryId: category.id,
                location: data.location || null
            }
        });

        // Delete old results for this event to refresh
        await prisma.result.deleteMany({
            where: { raceEventId: raceEvent.id }
        });

        // Create new results
        for (const res of results) {
            // Check if it matches a tracked pilot
            const pilot = await prisma.pilot.findFirst({
                where: {
                    fullName: { contains: res.pilotName, mode: 'insensitive' }
                }
            });

            await prisma.result.create({
                data: {
                    position: res.position,
                    pilotName: res.pilotName,
                    pilotFlag: res.pilotFlag || '🏁',
                    pilotId: pilot?.id || null,
                    raceEventId: raceEvent.id,
                    categoryId: category.id,
                    timeGap: res.timeGap || null,
                    points: res.points || null
                }
            });
        }

        return NextResponse.json({ success: true, eventId: raceEvent.id });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to process webhook:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
