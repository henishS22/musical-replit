import { nextui } from "@nextui-org/react"
import type { Config } from "tailwindcss"

const config = {
	// darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			spacing: {
				"6.5": "26px" // Add 6.5 as a valid spacing option
			},
			zIndex: {
				"60": "60"
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				customGray: "#EFEFEF",
				videoBtnGreen: "#DDF5E5",
				videoBtnRed: "#F65160",
				textPrimary: "#1A1D1F",
				hoverGray: "#F4F4F4",
				noteRed: " #FF3939",
				textGray: "#6F767E",
				inputLabel: "#33383F",
				blueBorder: "#2A85FF59",
				waveformBlue: "#398FFF",
				darkActiveGray: "#EDEDED",
				metallicGray: "#8A8A8A",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))"
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))"
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))"
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))"
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))"
				}
			},
			backgroundImage: {
				btnColor: "linear-gradient(175.57deg, #1DB653 3.76%, #0E5828 96.59%)",
				btnColorHover:
					"linear-gradient(175.57deg, #16a34a 3.76%, #0a3d1f 96.59%)" // Adjust hover gradient
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" }
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" }
				},
				waveform: {
					"0%, 100%": { transform: "scaleY(0.5)" },
					"50%": { transform: "scaleY(1)" }
				}
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				waveform: "waveform 1s ease-in-out infinite",
				"spin-slow": "spin 1.5s linear infinite"
			},
			opacity: {
				"64": ".64"
			},
			fontFamily: {
				inter: ["Inter", "sans-serif"]
			}
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require("tailwindcss-animate"), nextui()]
} satisfies Config

export default config
