import { StyledSubmit } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { signOut } from "@/lib/auth";
import { ChevronLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignOut() {
	return (
		<CardContent>
			<p className="text-center">Are you sure you want to log out?</p>
			<form
				action={async () => {
					"use server";
					await signOut({ redirect: false });
					redirect("/auth/login");
				}}
			>
				<StyledSubmit className="mt-6 w-full">
					<LogOut className="mr-2 size-4" />
					Log out
				</StyledSubmit>
			</form>
			<Button
				asChild
				variant="outline"
				className="mt-4 w-full bg-background/50 transition-all duration-200 hover:bg-background/65"
			>
				<Link href="/dash">
					<ChevronLeft className="mr-2 size-4" />
					Go Home
				</Link>
			</Button>
		</CardContent>
	);
}
