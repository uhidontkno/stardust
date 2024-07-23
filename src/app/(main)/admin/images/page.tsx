import { addImage } from "@/actions/image";
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
import { db } from "@/lib/drizzle/db";
import type { Metadata } from "next";
import { columns } from "./columns";
export const metadata: Metadata = {
	title: "Images",
};
export default async function AdminPage() {
	const data = await db.query.image.findMany({
		with: {
			session: true,
		},
	});
	return (
		<div className="flex h-full flex-col">
			<h1 className="py-6 text-3xl font-bold">Images</h1>
			<section className="-ml-8">
				<DataTable data={data} columns={columns} />
			</section>
			<div className="flex justify-start items-center">
				<Dialog>
					<DialogTrigger asChild>
						<Button className="ml-2">Add Image</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Image</DialogTitle>
							<DialogDescription>The image will automatically save after you click the button.</DialogDescription>
						</DialogHeader>
						<form action={addImage} className="flex flex-col gap-2 w-full">
							<Label htmlFor="name">Name</Label>
							<Input id="name" placeholder="Name" name="friendlyName" minLength={2} required />
							<Label htmlFor="cat">Category (comma seperated)</Label>
							<Input id="cat" placeholder="Category" name="category" required />
							<Label htmlFor="img">Docker pull URL</Label>
							<Input id="img" placeholder="ghcr.io/spaceness/xxxx" name="dockerImage" required />
							<Label htmlFor="icon">Icon</Label>
							<Input id="icon" placeholder="Icon URL" name="icon" required />
							<StyledSubmit>Save</StyledSubmit>
						</form>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
