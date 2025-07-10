"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@nextui-org/react"
import { ChevronLeft } from "lucide-react"

import ChangePassword from "./ChangePassword"
import PersonalInfo from "./PersonalInfo"
import SideMenu from "./SideMenu"
import StyleAndSkills from "./StyleAndSkills"

interface ChildFormRef {
	submitForm: () => void
}

const EditProfile: React.FC = () => {
	const router = useRouter()

	const [activeTab, setActiveTab] = useState("personalInfo")
	const childFormRef = useRef<ChildFormRef>(null)
	const renderContent = () => {
		switch (activeTab) {
			case "personalInfo":
				return <PersonalInfo ref={childFormRef} />
			case "stylesAndSkills":
				return <StyleAndSkills ref={childFormRef} />
			case "changePassword":
				return <ChangePassword />
		}
	}
	return (
		<div className="flex flex-col justify-center max-md:px-5 ">
			<div className="flex flex-col w-full p-6">
				<div className="flex justify-start gap-2 items-center">
					<Button isIconOnly variant="light" onPress={() => router.back()}>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<div className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800">
						Profile
					</div>
				</div>
				<div className="flex overflow-hidden flex-wrap gap-8 items-start p-6 mt-6 w-full rounded-lg bg-white max-md:px-5 max-md:max-w-full min-h-[calc(100vh-305px)]">
					<SideMenu activeTab={activeTab} setActiveTab={setActiveTab} />
					<div className="flex flex-col flex-1 shrink basis-0 min-w-[240px] max-md:max-w-full">
						{renderContent()}
					</div>
				</div>
			</div>
			{activeTab !== "changePassword" && (
				<div className="flex justify-end gap-4 bg-white p-6">
					<Button variant="light" onPress={() => router.back()}>
						Back
					</Button>
					<Button
						className="bg-btnColor text-white"
						onPress={() => childFormRef.current?.submitForm()}
					>
						Save
					</Button>
				</div>
			)}
		</div>
	)
}

export default EditProfile
