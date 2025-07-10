export const parseMarkdown = (text: string): React.ReactNode[] => {
	// Split the text into lines
	const lines = text.split("\n")

	return lines.map((line, index) => {
		// Parse bold: **text**
		const segments = line.split(/(\*\*.*?\*\*)/g)

		return (
			<p key={index}>
				{segments.map((seg, i) => {
					if (seg.startsWith("**") && seg.endsWith("**")) {
						return <strong key={i}>{seg.slice(2, -2)}</strong>
					}
					return <span key={i}>{seg}</span>
				})}
			</p>
		)
	})
}
