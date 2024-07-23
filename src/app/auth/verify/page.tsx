import { CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Mail } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EmailVerify() {
	const session = await auth();
	if (session) {
		redirect("/dash");
	}
	return (
		<>
			<CardTitle className="mx-auto mb-2 flex flex-col items-center justify-center">
				<Mail className="mb-10 h-12 w-12" />
				Verify your email
			</CardTitle>
			<CardContent>
				<p className="text-center">
					We have sent a verification email to your email address. Please check your inbox and click on the link to
					verify your email.
				</p>
			</CardContent>
			<CardFooter>
				<p className="text-center text-sm text-muted-foreground">
					If you haven&apos;t received the email, please check your spam folder.
				</p>
			</CardFooter>
		</>
	);
}
