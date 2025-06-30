"use client"

import { QueryProvider } from "@/providers/queryProvider"

export function Providers({ children }: { children: React.ReactNode }) {
	return <QueryProvider>{children}</QueryProvider>
}
