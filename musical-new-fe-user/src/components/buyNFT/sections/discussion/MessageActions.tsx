"use client"

export function MessageActions() {
	return (
		<div
			className="absolute right-0 mt-2 z-50 bg-[#F4F4F4] rounded-[24px] py-3 px-4 flex items-center gap-4"
			style={{
				boxShadow: "0px 4px 4px 0px #0000004D, 0px 8px 12px 6px #00000026"
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<button className="hover:scale-110 transition-transform">👍</button>
			<button className="hover:scale-110 transition-transform">👏</button>
			<button className="hover:scale-110 transition-transform">😊</button>
			<button className="hover:scale-110 transition-transform">🔄</button>
			<button className="hover:scale-110 transition-transform">↩️</button>
			<button className="hover:scale-110 transition-transform">⋮</button>
		</div>
	)
}
