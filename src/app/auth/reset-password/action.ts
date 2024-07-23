"use server";

import { db, user } from "@/lib/drizzle/db";
import type { SelectUser } from "@/lib/drizzle/schema";
import { hash, verify } from "argon2";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";

export async function resetPassword(dbUser: SelectUser | undefined, data: FormData) {
	try {
		if (!dbUser) throw new Error("this ain't supposed to happen, why is there no user");
		const newPw = data.get("new-password")?.toString();
		const confirmPw = data.get("confirm-password")?.toString();
		if (newPw !== confirmPw) {
			throw new Error("Passwords do not match");
		}
		const oldPassword = data.get("old-password")?.toString();
		if (dbUser?.password && oldPassword) {
			if (await verify(dbUser.password, oldPassword)) {
				const newPasswordHash = await hash(newPw as string);
				await db.update(user).set({ password: newPasswordHash }).where(eq(user.id, dbUser.id));
				redirect("/dash");
			} else {
				throw new Error("Incorrect password");
			}
		} else if (!oldPassword && !dbUser.password) {
			const newPasswordHash = await hash(newPw as string);
			await db.update(user).set({ password: newPasswordHash }).where(eq(user.id, dbUser.id));
			redirect("/dash");
		} else {
			throw new Error("ehhh this ain't supposed to happen, why is there nothing");
		}
	} catch (error) {
		unstable_rethrow(error);
		throw error;
	}
}
