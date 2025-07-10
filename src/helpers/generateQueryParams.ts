export default function generateQueryParams(
	params: Record<string, string | number | boolean>
): string {
	const filteredParams = Object.entries(params)
		.filter(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			([key, value]) => value !== null && value !== undefined && value !== ""
		)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		)
		.join("&")

	return filteredParams ? `?${filteredParams}` : ""
}
