import { StyledSubmit } from "@/components/submit-button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreateSessionButton } from "@/components/create-session-button";
import { SkeletionImage } from "@/components/skeleton-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import docker from "@/lib/docker";
import { type SelectSession, db, image, user } from "@/lib/drizzle/db";
import { deleteSession, manageSession } from "@/lib/session";
import type Dockerode from "dockerode";
import { eq } from "drizzle-orm";
import { Container, Loader2, Pause, Play, Square, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SessionDate } from "./session-date";

const ManageSessionButton = ({
	session,
	action,
	redirectToView,
	icon,
}: {
	session: SelectSession;
	action: keyof Dockerode.Container;
	redirectToView?: boolean;
	icon: React.ReactNode;
}) => (
	<form
		action={async () => {
			"use server";
			await manageSession(session.id, action);

			if (redirectToView) redirect(`/view/${session.id}`);
		}}
	>
		<StyledSubmit variant="ghost" size="icon" pendingSpinner>
			{icon}
		</StyledSubmit>
	</form>
);
export default async function Dashboard() {
	const userSession = await auth();
	const { sessions, images } = await db.transaction(async (tx) => {
		const images = await db.select().from(image);
		const sessions = await tx.query.session.findMany({
			with: {
				image: true,
			},
			where: (users, { eq }) => eq(users.userId, userSession?.user.id as string),
		});

		return { sessions, images };
	});
	const containerStates = await Promise.all(sessions.map((session) => docker.getContainer(session.id).inspect()));
	return (
		<div className="flex h-full items-center justify-center">
			<div className="m-auto flex w-full max-w-5xl flex-col">
				<Tabs
					defaultValue={sessions.length !== 0 ? "sessions" : "workspaces"}
					className="flex justify-center items-center flex-col top-12"
				>
					<TabsList className="md:absolute top-16">
						<TabsTrigger value="workspaces">Workspaces</TabsTrigger>
						<TabsTrigger value="sessions">Sessions</TabsTrigger>
					</TabsList>
					<TabsContent value="workspaces">
						<section className="flex flex-wrap justify-center gap-1">
							<Suspense fallback={<Loader2 size={64} className="animate-spin" />}>
								{images.map((image) => (
									<Dialog key={image.dockerImage}>
										<DialogTrigger asChild>
											<Card
												key={image.dockerImage}
												className="m-2 flex h-24 w-24 cursor-pointer flex-col items-center justify-start gap-2 p-2 duration-150 hover:bg-muted md:w-56 md:flex-row"
											>
												<Image
													priority={true}
													src={image.icon}
													alt={image.friendlyName}
													width={72}
													height={72}
													className="h-12 w-12 md:mx-4"
												/>
												<div className=" flex-col justify-center flex">
													<p className="text-md text-ellipsis font-bold">{image.friendlyName}</p>
													<p className="text-xs text-muted-foreground md:block hidden">{image.category}</p>
												</div>
											</Card>
										</DialogTrigger>
										<DialogContent className="flex md:flex-col flex-row justify-center gap-2">
											<DialogHeader>
												<DialogTitle>Launch session</DialogTitle>
												<DialogDescription>Start a new {image.friendlyName} session?</DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<DialogClose asChild>
													<Button type="button" variant="secondary" className="hidden md:block">
														Close
													</Button>
												</DialogClose>
												<CreateSessionButton image={image.dockerImage} />
											</DialogFooter>
										</DialogContent>
									</Dialog>
								))}
							</Suspense>
						</section>
					</TabsContent>
					<TabsContent value="sessions" className="flex flex-col md:flex-row">
						<Suspense fallback={<Loader2 size={64} className="animate-spin" />}>
							{sessions.length ? (
								sessions.map((session, key) => {
									const { State } = containerStates[key];
									const expiresAt = new Date(session.expiresAt);
									return (
										<Card
											className="items-between m-2 flex h-auto w-[16rem] flex-col justify-between gap-2 p-2 md:w-56"
											key={session.id}
										>
											<section className="flex flex-row items-center justify-between gap-6">
												<Image
													src={session.image.icon}
													alt={session.image.friendlyName}
													width={48}
													height={48}
													className="ml-4 size-6"
												/>

												<div className="text-md text-ellipsis">
													<p className="font-bold">{session.image.friendlyName}</p>
													<p className="rounded-sm font-mono text-xs font-bold text-primary">
														{session.id.slice(0, 6)}
													</p>
													<SessionDate expiresAt={expiresAt} />
												</div>
											</section>
											{!State.Paused && State.Running ? (
												<AspectRatio ratio={16 / 9}>
													<SkeletionImage
														priority
														src={`/api/session/${session.id}/preview`}
														fill
														sizes="6.5rem 13rem"
														alt=""
														className="object-fill rounded-sm md:h-[6.5rem] md:w-[13rem] h-[3.25rem] w-[6.5rem]"
													/>
												</AspectRatio>
											) : (
												<div className="flex md:h-[6.5rem] md:w-[13rem] h-[6.5rem] items-center justify-center rounded-sm bg-muted-foreground/40">
													<Container size={64} className="text-muted" />
												</div>
											)}
											<div className="flex w-full flex-row items-center justify-center gap-x-2">
												{!State.Paused && State.Running ? (
													<Button variant="ghost" size="icon" asChild>
														<Link href={`/view/${session.id}`}>
															<Play />
														</Link>
													</Button>
												) : null}
												{State.Running ? (
													<ManageSessionButton
														action={State.Paused ? "unpause" : "pause"}
														redirectToView={State.Paused}
														icon={State.Paused ? <Play /> : <Pause />}
														session={session}
													/>
												) : null}
												<ManageSessionButton
													action={State.Running ? "stop" : "start"}
													redirectToView={!State.Running}
													icon={State.Running ? <Square className="text-destructive" /> : <Play />}
													session={session}
												/>
												<form
													action={async () => {
														"use server";
														await deleteSession(session.id);
													}}
												>
													<StyledSubmit variant="destructive" size="icon" pendingSpinner>
														<TrashIcon />
													</StyledSubmit>
												</form>
											</div>
										</Card>
									);
								})
							) : (
								<div className="flex items-center justify-center flex-col w-full h-full  p-24">
									<CardTitle className="text-lg text-foreground">No sessions found</CardTitle>
									<p className="text-xs text-muted-foreground">Start a new session to see it here</p>
								</div>
							)}
						</Suspense>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
