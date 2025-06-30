// Local Storage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setLocal = (key: string, value: any): void => {
	localStorage.setItem(key, JSON.stringify(value))
}

export const getLocal = <T>(key: string): T | null => {
	const item = localStorage.getItem(key)
	return item ? JSON.parse(item) : null
}

export const removeLocal = (key: string): void => {
	localStorage.removeItem(key)
}

// Session Storage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setSession = (key: string, value: any): void => {
	sessionStorage.setItem(key, JSON.stringify(value))
}

export const getSession = <T>(key: string): T | null => {
	const item = sessionStorage.getItem(key)
	return item ? JSON.parse(item) : null
}

export const removeSession = (key: string): void => {
	sessionStorage.removeItem(key)
}
