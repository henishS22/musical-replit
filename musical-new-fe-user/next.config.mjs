/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false, // Enable React strict mode for improved error handling
	swcMinify: true, // Enable SWC minification for improved performance
	productionBrowserSourceMaps: false, // Disable source maps in development
	optimizeFonts: false, // Disable font optimization
	compiler: {
		// eslint-disable-next-line no-undef
		removeConsole: process.env.NODE_ENV !== "development" // Remove console.log in production
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.googleapis.com"
			},
			{
				protocol: "https",
				hostname: "placehold.co"
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "3000" // Specify the port for localhost
			}
		],
		unoptimized: true
	}
}

export default nextConfig
