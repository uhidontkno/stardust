import { Button } from "@/components/ui/button";
import Image from 'next/image'
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex h-screen flex-col items-center justify-center">
			<div className="flex h-[32rem] w-96 flex-col items-center justify-center gap-4">
				<div className="mb-4 flex items-center justify-center text-left text-2xl font-bold">
					<div className="logoImg">    
<Image
      src="/icon.png"
      width={48}
      height={48}
      alt="Catway"
    />
</div>
					<span className="ml-2 text-2xl font-bold">Catway</span>
				</div>
				<p className="text-center text-6xl font-bold text-primary">404</p>
				<div className="flex flex-col items-center justify-center">
					<p className="text-center">The page you are looking for does not exist.</p>
					<Button className="text-center" variant="link" asChild>
						<Link href="/dash">Go home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
