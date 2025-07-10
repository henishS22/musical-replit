import { ReactNode, Suspense } from "react"
import { ToastContainer } from "react-toastify"
import { Metadata } from "next"
import { Manrope } from "next/font/google"

import { ThirdwebProviderWrapper } from "@/providers/thirdwebProvider"
import { NextUIProvider } from "@nextui-org/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { siteConfig } from "@/config"

import "./globals.css"
import "@stream-io/video-react-sdk/dist/css/styles.css"

import ScreenGuard from "@/components/common/ScreenGuard"
import Fallback from "@/components/fallbackLoader/Fallback"
import ModalWrapper from "@/components/modal/ModalWrapper"

const inter = Manrope({ subsets: ["latin"] })
interface LayoutProps {
	children: ReactNode
}

export const metadata: Metadata = {
	title: siteConfig.title,
	description: siteConfig.description
}

export default function RootLayout({ children }: LayoutProps) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThirdwebProviderWrapper>
					<NextUIProvider>
						<Suspense fallback={<Fallback />}>
							<ScreenGuard>{children}</ScreenGuard>
							<SpeedInsights />
							<ModalWrapper />
							<ToastContainer
								position="top-right"
								autoClose={5000}
								hideProgressBar={false}
								newestOnTop={false}
								closeOnClick
								rtl={false}
								pauseOnFocusLoss
								draggable
								pauseOnHover
								theme="light"
							/>
						</Suspense>
					</NextUIProvider>
				</ThirdwebProviderWrapper>
			</body>
		</html>
	)
}
