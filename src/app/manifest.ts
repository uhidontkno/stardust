import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Catway",
		short_name: "Catway",
		description: "Catway is the platform for streaming isolated desktop containers.",
		start_url: "/",
		display: "standalone",
		background_color: "#1e1e2e",
		theme_color: "#cba6f7",
		icons: [
			{
				src: "/icon.png",
				sizes: "192x192",
			},
			{
				src: "/icon.png",
				sizes: "512x512",
			},
		],
	};
}
