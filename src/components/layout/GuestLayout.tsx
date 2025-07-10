import { ReactNode } from "react"

interface LayoutProps {
	children: ReactNode
}

export default function GuestLayout({ children }: LayoutProps) {
	return (
		<div className="flex flex-col h-screen">
			<main className="bg-[white] h-screen w-full">{children}</main>
		</div>
	)
}
