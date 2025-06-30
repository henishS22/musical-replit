"use client"

import { useTheme } from "next-themes"

import { Icons } from "@/icons"
import {
	Button,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"

export function Theme() {
	const { setTheme } = useTheme()

	return (
		//TODO : Need to make working
		<DropdownMenu>
			<DropdownTrigger className="border-none" asChild>
				<Button variant="flat">
					<Icons.sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Icons.moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownTrigger>
			<DropdownItem key="light" onClick={() => setTheme("light")}>
				Light
			</DropdownItem>
			<DropdownItem key="dark" onClick={() => setTheme("dark")}>
				Dark
			</DropdownItem>
			<DropdownItem key="system" onClick={() => setTheme("system")}>
				System
			</DropdownItem>
		</DropdownMenu>
	)
}
