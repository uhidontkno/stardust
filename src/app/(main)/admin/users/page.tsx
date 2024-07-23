import { StyledSubmit } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, user } from "@/lib/drizzle/db";
import { createId } from "@paralleldrive/cuid2";
import { hash } from "argon2";
import type { Metadata } from "next";
import { columns } from "./columns";
export const metadata: Metadata = {
	title: "Users",
};
export default async function AdminPage() {
	const data = await db.query.user.findMany({
		with: {
			session: true,
		},
	});
	return (
		<div className="flex h-full flex-col">
			<h1 className="py-6 text-3xl font-bold">Users</h1>
			<section className="-ml-8">
				<DataTable data={data} columns={columns} />
			</section>
			<div className="flex justify-start items-center">
				<Dialog>
					<DialogTrigger asChild>
						<Button className="ml-2">Add User</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add User</DialogTitle>
							<DialogDescription>The user will automatically be added after you click Save.</DialogDescription>
						</DialogHeader>
						<form
							action={async (data) => {
								"use server";
								const userCheck = await db.query.user.findFirst({
									where: (user, { eq }) => eq(user.email, data.get("email")?.toString() || ""),
								});
								if (userCheck) return;
								await db.insert(user).values({
									name: data.get("name")?.toString(),
									email: data.get("email")?.toString() as string,
									password: await hash(data.get("password")?.toString() as string),
									id: createId(),
								});
							}}
							className="flex flex-col gap-2 w-full"
						>
							<Label htmlFor="name">Name</Label>
							<Input id="name" type="text" name="name" placeholder="Name" />
							<Input id="email" type="email" name="email" placeholder="Email" required />
							<Label htmlFor="password">Password</Label>
							<Input minLength={8} id="password" type="password" name="password" placeholder="Password" required />
							<StyledSubmit>Save</StyledSubmit>
						</form>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
