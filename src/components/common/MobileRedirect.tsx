"use client"

import Image from "next/image"
import Link from "next/link"

import { LOGO } from "@/assets"
import { Smartphone } from "lucide-react"

const MobileRedirect = () => {
	return (
		<div className="min-h-screen w-full flex flex-col justify-between bg-white px-4 py-6">
			{/* Top Section: Logo and Text */}
			<div className="flex flex-col items-center pt-8">
				<Image
					src={LOGO as unknown as string}
					height={LOGO.height}
					width={160}
					alt="logo"
					className="mx-auto mb-6"
					priority
				/>
				<h1 className="text-[#1DB653] text-2xl font-extrabold text-center mb-2 leading-tight">
					Get Our Mobile App
				</h1>
				<p className="text-gray-500 text-base text-center mb-4 max-w-xs mx-auto">
					Experience our platform optimized for mobile with enhanced features
					and better performance.
				</p>
			</div>

			<div className="mb-12">
				<div className="relative max-w-fit justify-self-center flex">
					<div className="w-48 h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl">
						<div className="w-full h-full bg-gradient-to-br from-teal-400 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
							<Smartphone className="w-16 h-16 text-white opacity-80 relative" />
						</div>
					</div>
					{/* Floating Elements */}
					<div className="absolute -top-5 right-[-20px] w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
					<div className="absolute bottom-[-12px] left-[-21px] w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
				</div>
			</div>

			{/* Bottom Section: Buttons */}
			<div className="flex flex-col gap-4 w-full max-w-md mx-auto mb-8">
				<Link
					href={"/"}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 justify-center border-2 border-[#1DB653] text-[#1DB653] font-semibold rounded-xl py-3 bg-white hover:bg-[#e6f9ef] transition text-base"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
						<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
					</svg>
					Download for iOS
				</Link>
				<Link
					href={"/"}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 justify-center bg-[#1DB653] text-white font-semibold rounded-xl py-3 shadow hover:bg-[#169c45] transition text-base"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
						<path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
					</svg>
					Download for Android
				</Link>

				{/* Footer */}
				<div className="text-center">
					<p className="text-[#1DB653] text-xs">
						Optimized mobile experience • Available on iOS 12.0+ and Android
						6.0+
					</p>
				</div>
			</div>
		</div>
	)
}

export default MobileRedirect
