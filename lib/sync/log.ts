import { prisma } from "@/lib/prisma";

/** Ejecuta una tarea de sincronización y deja registro en sync_logs */
export async function runLogged<T>(source: string, task: () => Promise<T>) {
  try {
    const result = await task();
    await prisma.syncLog.create({ data: { source, ok: true, message: JSON.stringify(result).slice(0, 2000) } });
    return { ok: true as const, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.syncLog.create({ data: { source, ok: false, message: message.slice(0, 2000) } }).catch(() => {});
    return { ok: false as const, error: message };
  }
}
