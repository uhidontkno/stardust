"use server";

import { consola } from "consola";

/**
 * Promise that resolves when the container is running
 * @param ip The port of the container to check
 */
async function sessionRunning(ip: string) {
	let containerRunning = await fetch(`http://${ip}:6080/healthcheck`).catch(() =>
		consola.warn(`✨ Catway: Container on ${ip} not running, retrying...`),
	);
	while (!containerRunning) {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		containerRunning = await fetch(`http://${ip}:6080/healthcheck`).catch(() =>
			consola.warn(`✨ Catway: Container on ${ip} not running, retrying...`),
		);
	}
}
export { sessionRunning };
