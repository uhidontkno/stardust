import "dotenv/config";

import { createServer } from "node:http";
import { Socket } from "node:net";
import type { Config } from "@/types/config";
import { consola } from "consola";
import next from "next";
import { WebSocketServer } from "ws";
const port = Number.parseInt(process.env.PORT as string) || 3000;
const dev = process.env.NODE_ENV !== "production";
const config: Config = await import("./.config/config.json");
process.env.CONFIG = JSON.stringify(config);
const docker = (await import("@/lib/docker")).default;
if (process.argv.includes("--turbo")) {
	process.env.TURBOPACK = "1";
}
const server = createServer();
const app = next({ dev, port, httpServer: server, hostname: process.env.HOSTNAME });
consola.start(`✨ Catway: Starting ${dev ? "development" : "production"} server...`);
await app.prepare();
const nextRequest = app.getRequestHandler();
const nextUpgrade = app.getUpgradeHandler();
const websockify = new WebSocketServer({ noServer: true });
websockify.on("connection", async (ws, req) => {
	try {
		const id = req.url?.split("/dash")[2];
		if (!id) {
			ws.close(1008, "Missing ID");
			return;
		}
		const ip = (await docker.getContainer(id).inspect()).NetworkSettings.Networks[config.docker.network].IPAddress;
		const socket = new Socket();
		socket.connect(5901, ip);
		ws.on("message", (message: Uint8Array) => {
			socket.write(message);
		});
		ws.on("close", (code, reason) => {
			consola.info(
				`✨ Catway: Connection closed with code ${code} and ${
					reason.toString() ? `reason ${reason.toString()}` : "no reason"
				}`,
			);
			socket.end();
		});

		socket.on("data", (data) => {
			ws.send(data);
		});

		socket.on("error", (err) => {
			consola.warn(`✨ Catway: ${err.message}`);
			ws.close();
		});

		socket.on("close", () => {
			ws.close();
		});
	} catch (error) {
		ws.close(1008, "Server error");
		consola.error(`✨ Catway: ${(error as Error).message}`);
	}
});
server.on("request", nextRequest);
server.on("upgrade", async (req, socket, head) => {
	if (req.url?.includes("websockify")) {
		websockify.handleUpgrade(req, socket, head, (ws) => {
			websockify.emit("connection", ws, req, websockify);
		});
	} else {
		nextUpgrade(req, socket, head);
	}
});
server.listen(port, () => {
	consola.success(`✨ Catway: Server listening on ${port}`);
});
