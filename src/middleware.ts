import { config as authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
const { auth } = NextAuth(authConfig);
const allowedPaths = ["/auth/login", "/auth/error", "/auth/verify", "/auth/signup"];
export const middleware = auth(async (req) => {
	if (req.auth || allowedPaths.includes(req.nextUrl.pathname)) {
		return NextResponse.next();
	}
	const url = new URL("/auth/login", req.url);
	url.searchParams.set("callbackUrl", req.nextUrl.pathname);
	return NextResponse.redirect(url);
});
export const config = {
	matcher: ["/((?!_next/static|_next/image|icon.png|websockify|api/auth|manifest.webmanifest).*)"],
};
