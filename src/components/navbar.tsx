"use client";
import packageJson from "@/../package.json";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from 'next/image'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SelectUser } from "@/lib/drizzle/schema";
import { Book, ComputerIcon, Globe, Info, Key, LogOut, Settings, Sparkles, SwatchBook, Trash } from "lucide-react";
import type { Route } from "next";
import type { Session } from "next-auth";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Fragment, useState } from "react";
import { GitHubIcon } from "./icons";

export default function Navigation({
	dbUser,
	session,
}: {
	dbUser: SelectUser;
	session: Session | null;
}) {
	const { name, email, image } = session?.user || {};
	const [open, setDialogOpen] = useState(false);
	const { themes, setTheme } = useTheme();
	const navigationItems: {
		icon: React.ReactNode;
		label: string;
		href: Route;
		adminOnly: boolean;
	}[] = [
		{
			icon: <ComputerIcon />,
			label: "Dashboard",
			href: "/dash",
			adminOnly: false,
		},
		{
			label: "Admin",
			href: "/admin",
			icon: <Settings />,
			adminOnly: true,
		},
	];
	const projectsUsed = [
		{
			name: "Next.js",
			url: "https://nextjs.org/",
		},
		{
			name: "noVNC",
			url: "https://github.com/noVNC/noVNC",
		},
		{
			name: "shadcn/ui",
			url: "https://ui.shadcn.com/",
		},
		{
			name: "Auth.js",
			url: "https://authjs.dev/",
		},
	];
	const developers = ["incognitotgt", "1yusof", "genericness", "uhidontkno"];
	return (
		<nav className="flex h-16 min-w-full items-center justify-between px-4">
			<div className="flex items-center justify-start gap-2">
			    <div className="logoImg">    
<Image
      src="/icon.png"
      width={48}
      height={48}
      alt="Catway"
    />
</div>
				<span className="text-2xl font-bold md:block hidden mr-2">Catway</span>
				<NavigationMenu className="flex items-center justify-start">
					<NavigationMenuList>
						{navigationItems.map((item) => (
							<Fragment key={item.href}>
								{!item.adminOnly || (item.adminOnly && dbUser.isAdmin) ? (
									<NavigationMenuItem key={item.href}>
										<Link href={item.href} legacyBehavior passHref>
											<NavigationMenuLink className={navigationMenuTriggerStyle()}>
												<span className="mr-2 flex size-4 items-center justify-center">{item.icon}</span> {item.label}
											</NavigationMenuLink>
										</Link>
									</NavigationMenuItem>
								) : null}
							</Fragment>
						))}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
			<Dialog open={open} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="m-2 flex items-center justify-center text-center text-2xl text-foreground">
							<Sparkles className="mr-2 flex size-6 flex-row" />
							Stardust {packageJson.version}-catway
						</DialogTitle>
					</DialogHeader>
					<DialogDescription className="flex flex-col items-start justify-start gap-2 text-foreground">
						Stardust is the platform for streaming isolated desktop containers.
						<br />
						Stardust uses the following things in an important way:
						<br />
						<ul className="list-inside list-disc">
							{projectsUsed.map((project) => (
								<li key={project.name}>
									<a
										href={project.url}
										className="inline font-medium text-primary underline-offset-4 hover:underline"
										target="_blank"
										rel="noreferrer nopener"
									>
										{project.name}
									</a>
								</li>
							))}
						</ul>
						Stardust Developers:
						<br />
						<ul className="list-inside list-disc">
							{developers.map((developer) => (
								<li key={developer}>
									<a
										href={`https://github.com/${developer}`}
										className="inline font-medium text-primary underline-offset-4 hover:underline"
										target="_blank"
										rel="noreferrer nopener"
									>
										{developer}
									</a>
								</li>
							))}
						</ul>
						Copyleft 2024 Spaceness.
						<section>
							This version of Stardust is from commit{" "}
							<a
								href={`https://github.com/spaceness/stardust/commit/${process.env.GIT_COMMIT}`}
								className="inline font-medium text-primary underline-offset-4 hover:underline"
								target="_blank"
								rel="noreferrer nopener"
							>
								{process.env.GIT_COMMIT?.slice(0, 7)}
							</a>
							, built on {new Date(Number(process.env.BUILD_DATE)).toLocaleString()}
						</section>
						<DialogFooter>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button asChild variant="outline" size="icon">
										<a href="https://github.com/spaceness/stardust" target="_blank" rel="noreferrer nopener">
											<GitHubIcon className="size-5" />
										</a>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Github</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="outline" size="icon" asChild>
										<a href="https://stardust.spaceness.one/docs" target="_blank" rel="noreferrer nopener">
											<Book className="size-5" />
										</a>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Documentation</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="outline" size="icon" asChild>
										<a href="https://spaceness.one/" target="_blank" rel="noreferrer nopener">
											<Globe className="size-5" />
										</a>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Spaceness</TooltipContent>
							</Tooltip>
						</DialogFooter>
					</DialogDescription>
				</DialogContent>
			</Dialog>
			<div className="flex justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Avatar>
							<AvatarImage src={image || ""} alt={name || email || "Profile Picture"} />
							<AvatarFallback>{name ? name?.charAt(0) + name?.charAt(1) : email?.charAt(0)}</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="mr-4 mt-4 w-48">
						<DropdownMenuLabel className="flex flex-col">
							<span className="flex flex-row items-center justify-between gap-1">
								<p className="text-lg">{name || email}</p>
								{dbUser.isAdmin ? (
									<span className="flex items-center justify-center rounded-lg bg-primary px-2 py-[1px] text-xs font-bold text-primary-foreground">
										Admin
									</span>
								) : null}
							</span>
							<p className="text-xs font-light text-muted-foreground">{name ? email : name}</p>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<SwatchBook className="size-4 mr-2" />
								<span>Theme</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									{themes.map((theme) => (
										<DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
											{theme.charAt(0).toUpperCase() + theme.slice(1)}
										</DropdownMenuItem>
									))}
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuItem onClick={() => setDialogOpen((prev) => !prev)}>
							<Info className="size-4 mr-2" />
							<span>About Catway</span>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/auth/reset-password">
								<Key className="size-4 mr-2" />
								<span>Reset Password</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/auth/delete">
								<Trash className="size-4 mr-2" />
								<span>Delete Account</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/auth/logout">
								<LogOut className="size-4 mr-2" />
								<span>Log Out</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
}
