"use server";
import crypto from "node:crypto";
import docker from "@/lib/docker";
import { db, session, user } from "@/lib/drizzle/db";
import { consola } from "consola";
import type Dockerode from "dockerode";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { getConfig } from "../config";
import { getSession } from "./get-session";
/**
 * Creates a new Catway session
 * @param image Docker image to use for making the session
 */
async function createSession(image: string) {
	consola.info(`✨ Catway: Creating session with image ${image}`);
	try {
		const config = getConfig();
		const userSession = await auth();
		if (!userSession?.user) throw new Error("User not found");
		const id = `catway-${crypto.randomUUID()}-${image.split("/dash")[2]}`;
		const container = await docker.createContainer({
			name: id,
			Image: image,
			HostConfig: {
				ShmSize: 1024,
				NetworkMode: config.docker.network,
			},
		});
		await container.start().catch((e) => {
			container.remove({ force: true });
			throw new Error(`Container not started ${e.message}`);
		});
		const date = new Date();
		date.setHours(date.getHours() + (config.session?.keepaliveDuration || 1440));
		return db
			.insert(session)
			.values({
				id: container.id,
				dockerImage: image,
				createdAt: Date.now(),
				expiresAt: date.getTime(),
				userId: userSession.user.id,
			})
			.returning()
			.catch(async (e) => {
				await container.remove({ force: true });
				throw e;
			});
	} catch (error) {
		console.error(error);
		throw error;
	}
}
/**
 * Allows you to manage a Catway session with dockerode
 * @param containerId The id of the container to manage
 * @param action The action to do on the container
 * @param admin If this is triggered by an admin
 */
async function manageSession(containerId: string, action: keyof Dockerode.Container, admin?: boolean) {
	const userSession = await auth();
	const [{ isAdmin }] = await db
		.select({ isAdmin: user.isAdmin })
		.from(user)
		.where(eq(user.id, userSession?.user?.id as string));
	const { id } = (await getSession(containerId, userSession)) || {};
	if ((admin && isAdmin) || id) {
		const container = docker.getContainer(id || containerId);
		await container[action]();
	}
}
/**
 * Deletes a Catway session
 * @param containerId The id of the container to delete
 * @param admin If this is triggered by an admin
 */
async function deleteSession(containerId: string, admin?: boolean) {
	const userSession = await auth();
	const [{ isAdmin }] = await db
		.select({ isAdmin: user.isAdmin })
		.from(user)
		.where(eq(user.id, userSession?.user?.id as string));
	const { id } = (await getSession(containerId, userSession)) || {};
	if ((admin && isAdmin) || id) {
		const container = docker.getContainer(id || containerId);
		await container.remove({ force: true });
		await db.delete(session).where(eq(session.id, id || containerId));
		revalidatePath("/dash");
	}
}
export { createSession, deleteSession, manageSession };
