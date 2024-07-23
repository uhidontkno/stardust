import Image from 'next/image'

export default function LoadSuspense() {
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="logoImg">    
<Image
      src="/icon.png"
      width={48}
      height={48}
      alt="Catway"
    />
</div>
		</div>
	);
}
