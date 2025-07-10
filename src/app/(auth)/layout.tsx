"use client"

import { ReactNode } from "react"

import GuestLayout from "@/components/layout/GuestLayout"

interface LayoutProps {
	children: ReactNode
}

export default function AuthLayout({ children }: LayoutProps) {
	return <GuestLayout>{children}</GuestLayout>
}
