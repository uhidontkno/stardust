import docker from "@/lib/docker";
import { db, session } from "@/lib/drizzle/db";
import { consola } from "consola";
import { eq, lte } from "drizzle-orm";

setInterval(async () => {
	consola.info("✨ Catway: Purging stale sessions");
	await db.transaction(async (tx) => {
		const staleSessions = await tx.select().from(session).where(lte(session.expiresAt, Date.now()));
		await Promise.all(
			staleSessions.map(async (s) => {
				await docker.getContainer(s.id).remove({ force: true });
				await tx.delete(session).where(eq(session.id, s.id));
			}),
		);
	});
}, 30000);
