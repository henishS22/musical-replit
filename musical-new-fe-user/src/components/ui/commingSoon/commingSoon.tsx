import { Clock } from "lucide-react"

export const ComingSoon = () => {
	return (
		<div className="flex w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-b-2xl">
			<div className="text-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="rounded-full bg-blue-100 p-4">
						<Clock size={48} className="text-blue-600" />
					</div>

					<h2 className="text-3xl font-bold text-gray-900">Coming Soon!</h2>
					<p className="text-gray-600">
						{`We're working hard to bring you something amazing. Stay tuned!`}
					</p>
				</div>
			</div>
		</div>
	)
}
