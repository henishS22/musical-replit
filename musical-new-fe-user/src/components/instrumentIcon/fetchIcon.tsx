import {
	AcousticGuitar,
	Bass,
	Cello,
	DrumSet,
	ElectricGuitar,
	Flute,
	FrenchHorn,
	LyricsAndSheet,
	Mic,
	MixedAudio,
	MusicalNote,
	Piano,
	Sax,
	SteelGuitar,
	Synthesizer,
	Trumpet,
	Turntable,
	Violin
} from "@/assets/icons/Instruments/icons"

const getIcon = (
	type: string,
	size: number,
	backgroundColor: string,
	color: string
) => {
	switch (type) {
		case "steel_guitarist":
			return (
				<SteelGuitar
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "acoustic_guitarist":
		case "banjo_player":
		case "dobro_player":
			return (
				<AcousticGuitar
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "producer":
			return (
				<MixedAudio
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "pianist":
			return (
				<Piano size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "saxophonist":
			return <Sax size={size} backgroundColor={backgroundColor} color={color} />
		case "synthesizer_player":
			return (
				<Synthesizer
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "trumpetist":
			return (
				<Trumpet size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "dj":
			return (
				<Turntable
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "violinist":
			return (
				<Violin size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "bassist":
			return (
				<Bass size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "cellist":
			return (
				<Cello size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "cover_designer":
			return (
				<Cello size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "drummer":
			return (
				<DrumSet size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "guitarist":
			return (
				<ElectricGuitar
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "flutist":
			return (
				<Flute size={size} backgroundColor={backgroundColor} color={color} />
			)
		case "horn_player":
			return (
				<FrenchHorn
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "lyrics_n_sheet":
			return (
				<LyricsAndSheet
					size={size}
					backgroundColor={backgroundColor}
					color={color}
				/>
			)
		case "singer":
		case "rapper":
			return <Mic size={size} backgroundColor={backgroundColor} color={color} />
		default:
			return <MusicalNote size={size} backgroundColor={backgroundColor} />
	}
}

export const FetchIcon: React.FC<{
	type: string
	typeLabel?: string
	levelLabel?: string
	size?: number
	onlyIcon?: boolean
	color?: string
	backgroundColor?: string
	LabelComponent?: React.FC<{ text: string }>
}> = ({ type, size = 24, color = "#08101C", backgroundColor = "#F6F6F6" }) => {
	return getIcon(type, size, backgroundColor, color)
}
