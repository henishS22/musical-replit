import { NextRequest, NextResponse } from "next/server"

const guestroutes = [
	"/login",
	"/signup",
	"/marketplace",
	"/buy-nft",
	"/profile"
]
const hybridroutes = ["/"]

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname
	const token = request.cookies.get("accessToken")
	// if (hybridroutes.filter((el) => path.includes(el)).length > 0) {
	// 	return callnext(request)
	// }

	if (!guestroutes.includes(path) && !token?.value?.length) {
		return NextResponse.redirect(new URL("/login", request.url))
	}
	if (
		(hybridroutes.includes(path) || guestroutes.includes(path)) &&
		token?.value?.length
	) {
		return NextResponse.redirect(new URL("/dashboard", request.url))
	}
	const url = new URL(request.url)
	const origin = url.origin
	const pathname = url.pathname
	const requestHeaders = new Headers(request.headers)
	requestHeaders.set("x-url", request.url)
	requestHeaders.set("x-origin", origin)
	requestHeaders.set("x-pathname", pathname)

	return NextResponse.next({
		request: {
			headers: requestHeaders
		}
	})
}

// const callnext = (request: NextRequest) => {
// 	const url = new URL(request.url)
// 	const origin = url.origin
// 	const pathname = url.pathname
// 	const requestHeaders = new Headers(request.headers)
// 	requestHeaders.set("x-url", request.url)
// 	requestHeaders.set("x-origin", origin)
// 	requestHeaders.set("x-pathname", pathname)

// 	return NextResponse.next({
// 		request: {
// 			headers: requestHeaders
// 		}
// 	})
// }

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		"/",
		"/login",
		"/signup",
		"/dashboard",
		"/library",
		"/auth",
		"/create-project",
		"/project"
	]
}
