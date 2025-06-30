"use client"

import { COMING_SOON_IMAGE } from "@/assets"
import { Image } from "@nextui-org/react"

const Influencers = () => {
	return (
		<div className="flex flex-col gap-6 p-4">
			<h1 className="text-[40px] font-semibold leading-[48px] tracking-tighter-2">
				Work with Music Influencers
			</h1>

			<div className="flex flex-col gap-8 bg-white rounded-lg p-6">
				<div className="relative w-full">
					<Image
						src={COMING_SOON_IMAGE.src}
						alt="Coming Soon"
						width={1042}
						height={474}
						className="rounded-none z-0 w-full"
						isBlurred={false}
						disableSkeleton={true}
					/>
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="text-white z-20 font-extrabold text-[79px] leading-[107.91px] tracking-tighter-2">
							COMING SOON
						</span>
					</div>
				</div>

				{/* <div className="flex flex-col gap-4">
					<CustomInput
						classname="max-w-[500px] border-2 border-[#2A85FF59] rounded-xl"
						label="Enter your Email"
						placeholder="Enter your Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div> */}
			</div>
			{/* <div className="flex gap-4 justify-end">
				<Button
					type="button"
					onPress={() => router.back()}
					className="px-5 py-3 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold "
				>
					Back
				</Button>
				<Button
					type="submit"
					className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold"
				>
					Join the Waitlist
				</Button>
			</div> */}
		</div>
	)
}

export default Influencers
