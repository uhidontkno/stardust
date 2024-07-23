import { StyledSubmit } from "@/components/submit-button";
import Turnstile from "@/components/turnstile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signIn } from "@/lib/auth";
import { providers } from "@/lib/auth.config";
import { getConfig } from "@/lib/config";
import turnstileCheck from "@/lib/turnstile";
import { AlertCircle, Info } from "lucide-react";
import type { CredentialsSignin } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Login({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const session = await auth();
	if (session) redirect("/dash");
	const { error, message } = searchParams;
	const config = getConfig();
	return (
		<CardContent className="m-1 w-full flex-col flex justify-center items-center">
			<CardDescription>Login to your account</CardDescription>
			{error ? (
				<Alert variant="destructive" className="w-full text-destructive my-4">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error logging in:</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}
			{message ? (
				<Alert className="w-full my-4">
					<Info className="h-4 w-4" />
					<AlertTitle>{message}</AlertTitle>
				</Alert>
			) : null}
			{config.auth.credentials ? (
				<form
					className="mx-auto mb-4 flex w-full flex-col items-start justify-center gap-2"
					action={async (data) => {
						"use server";
						try {
							if (await turnstileCheck(data)) {
								await signIn("credentials", data);
							} else {
								throw new Error("Failed captcha");
							}
						} catch (error) {
							redirect(
								`/auth/login?error=${(error as CredentialsSignin).cause?.err?.message || (error as Error).message}`,
							);
						}
					}}
				>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						name="email"
						placeholder="Email"
						autoComplete="email"
						required
						className="w-full"
					/>
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						name="password"
						placeholder="Password"
						autoComplete="current-password"
						required
						className="w-full"
					/>
					<Turnstile />
					<StyledSubmit className="w-full">Log in</StyledSubmit>
				</form>
			) : null}
			{config.auth.credentials?.signups ? (
				<Button asChild variant="link">
					<Link href="/auth/signup">Don't have an account? Sign up</Link>
				</Button>
			) : null}
			{config.auth.credentials && config.auth.oauth ? (
				<span className="text-center text-sm text-muted-foreground">Or log in/sign up with:</span>
			) : null}
			{config.auth.oauth ? (
				<div className="mx-auto mt-4 flex w-full flex-row items-center justify-center gap-2 flex-wrap">
					{Object.keys(config.auth.oauth.providers).map((provider) => {
						const { Icon } = providers[provider as keyof typeof providers];
						return (
							<form
								key={provider}
								action={async () => {
									"use server";
									await signIn(provider);
								}}
							>
								<StyledSubmit variant={config.auth.credentials ? "secondary" : "default"} size="lg" className="w-32">
									<Icon className="size-4 mr-2 flex-shrink-0" />
									{provider.charAt(0).toLocaleUpperCase() + provider.slice(1)}
								</StyledSubmit>
							</form>
						);
					})}
				</div>
			) : null}
		</CardContent>
	);
}
