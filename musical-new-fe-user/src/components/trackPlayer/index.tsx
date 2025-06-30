"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { deleteTrackFromProject, initateTrackComment } from "@/app/api/mutation"
import { downloadTrack } from "@/app/api/query"
import {
	ADD_COMMENT_ICON,
	DELETE_ICON,
	DOWNLOAD_ICON_2,
	EDIT_ICON_2,
	MORE_OPTION,
	PAUSE_IMAGE,
	PLAY_IMAGE,
	TRACK_THUMBNAIL
} from "@/assets"
import MultiDropdown from "@/components/ui/dropdown/MultiDropdown"
import { CONFIRMATION_MODAL } from "@/constant/modalType"
import { getMediaType } from "@/helpers"
import { getTypeColor } from "@/lib/utils"
import type { IApiResponseData, TrackComment } from "@/types/apiResponse"
import {
	Button,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import WaveSurfer from "wavesurfer.js"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions"

import { useModalStore, useUserStore } from "@/stores"
import { useDynamicStore } from "@/stores/dynamicStates"

import CommentAvatar from "./CommentAvatar"
import CommentPopup from "./CommentPopup"

// Global audio context to manage multiple players
const globalAudioContext = {
	currentlyPlaying: null as string | null,
	pauseOthers: (id: string) => {
		if (
			globalAudioContext.currentlyPlaying &&
			globalAudioContext.currentlyPlaying !== id
		) {
			document.dispatchEvent(
				new CustomEvent("pause-other-tracks", {
					detail: { exceptId: id }
				})
			)
		}
		globalAudioContext.currentlyPlaying = id
	}
}

export interface Reply {
	id: string
	text: string
	user: {
		_id?: string
		name: string
		avatar: string
	}
	timestamp: string | number
}
export interface Comment {
	id: string
	text: string
	startTime: number
	endTime: number
	user: {
		_id?: string
		name: string
		avatar: string
	}
	timestamp: string | number
	replies?: Reply[]
}

interface TrackPlayerProps {
	track: IApiResponseData
	title: string
	artist: string
	audioUrl: string
	coverImage: string
	extension: string
	trackId: string
	trackComment?: TrackComment[]
	permission?: string
	isComment?: boolean
}

export default function AudioPlayer({
	track,
	title,
	artist,
	audioUrl,
	coverImage,
	extension,
	trackId,
	trackComment,
	permission = "DOWNLOAD_ONLY",
	isComment = true
}: TrackPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [isCommenting, setIsCommenting] = useState(false)
	const [comments, setComments] = useState<Comment[]>([])
	const [newComment, setNewComment] = useState("")
	const [expandedCommentId, setExpandedCommentId] = useState<string | null>(
		null
	)

	const waveformRef = useRef<HTMLDivElement>(null)
	const wavesurferRef = useRef<WaveSurfer | null>(null)
	const regionsRef = useRef<RegionsPlugin | null>(null)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const activeRegionRef = useRef<any>(null)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const popupRegionRef = useRef<any>(null)
	const ignoreNextRegionCreated = useRef(false)

	const { id } = useParams()
	const { userData, user } = useUserStore()
	const router = useRouter()
	const queryClient = useQueryClient()
	const { addState, removeState } = useDynamicStore()
	const { showCustomModal, hideCustomModal } = useModalStore()

	const filterOptions = [
		...(permission === "OWNER"
			? [
					{
						key: "edit",
						label: "Edit",
						onClick: () => {
							addState("updateProjectTrack", id as string)
							removeState("linkTrack")
							removeState("isReleaseTrack")
							router.push(`/upload-new-work/${trackId}`)
						},
						image: EDIT_ICON_2
					}
				]
			: []),
		...(permission === "OWNER" ||
		permission === "UPLOAD_DOWNLOAD" ||
		permission === "DOWNLOAD_ONLY"
			? [
					{
						key: "download",
						label: "Download",
						onClick: () => {
							if (isFetching) return
							refetch()
						},
						image: DOWNLOAD_ICON_2
					}
				]
			: []),
		...(permission === "OWNER"
			? [
					{
						key: "delete",
						label: "Delete",
						onClick: () => {
							showCustomModal({
								customModalType: CONFIRMATION_MODAL,
								modalFunction: () => {
									deleteTrack({ trackId, id: id as string })
									hideCustomModal()
								},
								tempCustomModalData: {
									title: "Delete Track",
									msg: "Are you sure you want to delete this track?"
								}
							})
						},
						image: DELETE_ICON
					}
				]
			: [])
	]

	const togglePlay = () => {
		if (wavesurferRef.current) {
			if (!isPlaying) {
				// Pause other tracks before playing this one
				globalAudioContext.pauseOthers(trackId)
				wavesurferRef.current.setVolume(0)

				// Get current time before adding state
				const currentTime = wavesurferRef.current.getCurrentTime()

				// Add state to mediaPlayer with current time
				addState("mediaPlayer", {
					item: track,
					audioUrl: track?.url,
					coverUrl: track?.artwork || TRACK_THUMBNAIL,
					title: track?.name || "",
					artist: track?.user?.name || "",
					duration: track?.duration || 0,
					extension: getMediaType(`sample.${track?.extension}`),
					videoUrl: track?.url,
					startTime: currentTime
				})

				// Dispatch play event
				document.dispatchEvent(
					new CustomEvent("track-player-play", {
						detail: {
							trackId,
							currentTime,
							play: true
						}
					})
				)
			} else {
				// Dispatch pause event
				document.dispatchEvent(
					new CustomEvent("track-player-pause", {
						detail: {
							trackId,
							currentTime: wavesurferRef.current.getCurrentTime(),
							pause: true
						}
					})
				)
				wavesurferRef.current.pause()
			}
			setIsPlaying(!isPlaying)
		}
	}

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, "0")}`
	}

	const toggleCommenting = () => {
		if (isCommenting && activeRegionRef.current) {
			activeRegionRef.current.remove()
			activeRegionRef.current = null
		}
		setIsCommenting(!isCommenting)
		if (regionsRef.current) {
			regionsRef.current.enableDragSelection({
				color: "rgba(255, 0, 0, 0.1)"
			})
		}
	}

	const randomColor = useCallback(() => {
		const random = (min: number, max: number) =>
			Math.random() * (max - min) + min
		return `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`
	}, [])

	const { mutate: saveCommentMutation } = useMutation({
		mutationFn: initateTrackComment,
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["projectTracks"] })
			}
		}
	})

	const toggleCommentExpansion = useCallback(
		(commentId: string) => {
			setExpandedCommentId(expandedCommentId === commentId ? null : commentId)
		},
		[expandedCommentId]
	)

	const saveComment = () => {
		if (activeRegionRef.current && newComment) {
			const { start, end } = activeRegionRef.current

			const comment: Comment = {
				id: Date.now().toString(),
				text: newComment,
				startTime: start,
				endTime: end,
				user: {
					name: "Daniel", // Replace with actual user name from your auth system
					avatar: "/placeholder-user.jpg" // Replace with actual user avatar
				},
				timestamp: "just now"
			}

			const payload = {
				track_id: trackId,
				duration: {
					from: start,
					to: end
				},
				comment: newComment
			}

			saveCommentMutation(payload)
			setComments((prevComments) => [...prevComments, comment])

			// activeRegionRef.current.clearRegions()
			activeRegionRef.current.remove()
			activeRegionRef.current = null
			setNewComment("")
			setIsCommenting(false)
			// activeRegionRef.current.clearRegions()
		}
	}

	// const cancelComment = () => {
	// 	if (activeRegionRef.current) {
	// 		activeRegionRef.current.remove()
	// 		activeRegionRef.current = null
	// 	}
	// 	setNewComment("")
	// }

	const { mutate: deleteTrack } = useMutation({
		mutationFn: (payload: { trackId: string; id: string }) =>
			deleteTrackFromProject(payload.trackId, payload.id),
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["projectTracks"] })
			}
		}
	})

	const { refetch, isFetching } = useQuery({
		queryKey: ["download", trackId],
		queryFn: () => downloadTrack(trackId, title, extension),
		enabled: false
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleRegionCreated = useCallback((region: any) => {
		if (ignoreNextRegionCreated.current) {
			ignoreNextRegionCreated.current = false
			return
		}
		activeRegionRef.current = region
		setIsCommenting(true)
	}, [])

	useEffect(() => {
		if (waveformRef.current) {
			// Only create a new wavesurfer instance if one doesn't exist
			if (!wavesurferRef.current) {
				const wavesurfer = WaveSurfer.create({
					container: waveformRef.current,
					waveColor: "#cccccc",
					progressColor: "#3b82f6",
					height: 48,
					cursorWidth: 1,
					cursorColor: "#000000",
					normalize: true,
					interact: false,
					// Add media element to handle both audio and video files
					media: document.createElement(
						getMediaType(extension) === "audio" ? "audio" : "audio"
					)
				})

				const regions = wavesurfer.registerPlugin(RegionsPlugin.create())
				regionsRef.current = regions

				wavesurfer.load(audioUrl)

				wavesurfer.on("ready", () => {
					setDuration(wavesurfer.getDuration())
				})

				wavesurfer.on("audioprocess", () => {
					setCurrentTime(wavesurfer.getCurrentTime())
				})

				wavesurfer.on("play", () => {
					setIsPlaying(true)
				})

				wavesurfer.on("pause", () => {
					setIsPlaying(false)
				})

				regions.on("region-created", handleRegionCreated)

				regions.on("region-clicked", (region, e) => {
					e.stopPropagation()
					activeRegionRef.current = region

					const commentForRegion = comments.find(
						(comment) =>
							Math.abs(comment.startTime - region.start) < 0.1 &&
							Math.abs(comment.endTime - region.end) < 0.1
					)

					if (commentForRegion) {
						toggleCommentExpansion(commentForRegion.id)
					}

					region.play()
					region.setOptions({ color: randomColor() })
				})

				wavesurferRef.current = wavesurfer
			}
		}

		// Don't destroy on every render, only when component unmounts
		return () => {
			if (wavesurferRef.current) {
				wavesurferRef.current.pause()
				setIsPlaying(false)
				setCurrentTime(0)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		audioUrl,
		handleRegionCreated,
		randomColor,
		comments,
		extension,
		toggleCommentExpansion
	])

	// Add a separate effect to handle loading new audio
	useEffect(() => {
		if (wavesurferRef.current && audioUrl) {
			wavesurferRef.current.load(audioUrl)
		}

		return () => {
			if (wavesurferRef.current) {
				// Only destroy when component unmounts
				// This is handled by the cleanup in the first effect
			}
		}
	}, [audioUrl])

	const handleReply = (commentId: string, replyText: string) => {
		setComments(
			comments.map((comment) => {
				if (comment.id === commentId) {
					return {
						...comment,
						replies: [
							...(comment.replies || []),
							{
								id: Date.now().toString(),
								text: replyText,
								startTime: comment.startTime,
								endTime: comment.endTime,
								user: {
									name: userData?.name || "You", // Replace with actual user name
									avatar: "/placeholder-user.jpg"
								},
								timestamp: Date.now()
							}
						]
					}
				}
				return comment
			})
		)
	}

	useEffect(() => {
		if (trackComment) {
			const data = trackComment
				.filter((comment) => {
					// Check if comments array exists and its first element is not empty
					return (
						comment?.comments?.length > 0 &&
						Object.keys(comment.comments[0]).length > 0
					)
				})
				.map((comment) => {
					return {
						id: comment?._id,
						text: comment?.comments[0]?.comment,
						startTime: comment?.duration?.from,
						endTime: comment?.duration?.to,
						user: {
							_id: comment?.comments[0]?.user?._id,
							name: comment?.comments[0]?.user?.name,
							avatar: comment?.comments[0]?.user?.profile_img || ""
						},
						timestamp: comment?.comments[0]?.commentedAt,
						replies: comment?.comments?.slice(1).map((reply) => ({
							id: reply?._id,
							text: reply?.comment,
							user: {
								_id: reply?.user?._id,
								name: reply?.user?.name,
								avatar: reply?.user?.profile_img || ""
							},
							timestamp: reply?.commentedAt
						}))
					}
				})
			setComments(data)
		}
	}, [trackComment])

	useEffect(() => {
		const handleMediaPlayerSeek = (e: Event) => {
			const customEvent = e as CustomEvent
			if (wavesurferRef.current && customEvent.detail.trackId === trackId) {
				// Prevent feedback loop by checking if the position is significantly different
				const currentPos = wavesurferRef.current.getCurrentTime()
				if (Math.abs(currentPos - customEvent.detail.position) > 0.5) {
					wavesurferRef.current.seekTo(customEvent.detail.position / duration)
				}
			}
		}

		document.addEventListener("media-player-seek", handleMediaPlayerSeek)
		return () => {
			document.removeEventListener("media-player-seek", handleMediaPlayerSeek)
		}
	}, [trackId, duration])

	useEffect(() => {
		const handlePauseOtherTracks = (e: Event) => {
			const customEvent = e as CustomEvent
			if (
				customEvent.detail.exceptId !== trackId &&
				wavesurferRef.current &&
				isPlaying
			) {
				wavesurferRef.current.pause()
				setIsPlaying(false)
			}
		}

		document.addEventListener("pause-other-tracks", handlePauseOtherTracks)

		return () => {
			document.removeEventListener("pause-other-tracks", handlePauseOtherTracks)
		}
	}, [trackId, isPlaying])

	useEffect(() => {
		const handleMediaLoaded = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.trackId === trackId && wavesurferRef.current) {
				// wavesurferRef.current.play()
				// wavesurferRef.current.load(audioUrl)
			}
		}

		const handleMediaPlayed = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.trackId === trackId && wavesurferRef.current) {
				// Sync to media player's current time if provided
				if (customEvent.detail.currentTime !== undefined) {
					wavesurferRef.current.seekTo(
						customEvent.detail.currentTime / duration
					)
				}
				// Use play() instead of playPause()
				wavesurferRef.current.play()
				setIsPlaying(true)
			}
		}

		const handleMediaPaused = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.trackId === trackId && wavesurferRef.current) {
				// Sync to media player's pause position if provided
				if (customEvent.detail.currentTime !== undefined) {
					wavesurferRef.current.seekTo(
						customEvent.detail.currentTime / duration
					)
				}
				// Use pause() instead of playPause()
				wavesurferRef.current.pause()
				setIsPlaying(false)
			}
		}

		const handleMediaTimeUpdate = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.trackId === trackId && wavesurferRef.current) {
				// Only update if not playing to prevent loops
				if (!isPlaying) {
					return
				}

				const mediaCurrentTime = customEvent.detail.currentTime
				const waveformCurrentTime = wavesurferRef.current.getCurrentTime()

				// Only update if there's a significant difference
				if (Math.abs(mediaCurrentTime - waveformCurrentTime) > 0.5) {
					wavesurferRef.current.seekTo(mediaCurrentTime / duration)
				}
			}
		}

		const handleMediaSeek = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.trackId === trackId && wavesurferRef.current) {
				const { newTime } = customEvent.detail
				wavesurferRef.current.seekTo(newTime / duration)
			}
		}

		document.addEventListener("media-can-play-through", handleMediaLoaded)
		document.addEventListener("media-played", handleMediaPlayed)
		document.addEventListener("media-paused", handleMediaPaused)
		document.addEventListener("media-timeupdate", handleMediaTimeUpdate)
		document.addEventListener("media-seek-forward", handleMediaSeek)
		document.addEventListener("media-seek-backward", handleMediaSeek)

		return () => {
			document.removeEventListener("media-loaded", handleMediaLoaded)
			document.removeEventListener("media-played", handleMediaPlayed)
			document.removeEventListener("media-paused", handleMediaPaused)
			document.removeEventListener("media-timeupdate", handleMediaTimeUpdate)
			document.removeEventListener("media-seek-forward", handleMediaSeek)
			document.removeEventListener("media-seek-backward", handleMediaSeek)
		}
	}, [trackId, duration, isPlaying])

	// Add this effect to handle MediaPlayer state changes
	useEffect(() => {
		const resetWaveform = () => {
			if (wavesurferRef.current) {
				wavesurferRef.current.pause()
				wavesurferRef.current.seekTo(0)
				setIsPlaying(false)
				setCurrentTime(0)
			}
		}

		// Handle MediaPlayer closure or track changes
		const handleMediaPlayerClosed = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.trackId === trackId) {
				resetWaveform()
			}
		}

		const handleTrackChanged = (e: Event) => {
			const customEvent = e as CustomEvent
			if (customEvent.detail.previousTrackId === trackId) {
				resetWaveform()
			}
		}

		document.addEventListener("media-player-closed", handleMediaPlayerClosed)
		document.addEventListener("track-changed", handleTrackChanged)

		// Clean up event listeners
		return () => {
			document.removeEventListener(
				"media-player-closed",
				handleMediaPlayerClosed
			)
			document.removeEventListener("track-changed", handleTrackChanged)
		}
	}, [trackId])

	const showCommentRegion = useCallback(
		(comment: Comment) => {
			if (!regionsRef.current) return

			if (popupRegionRef.current) {
				popupRegionRef.current.remove()
				popupRegionRef.current = null
			}

			ignoreNextRegionCreated.current = true

			popupRegionRef.current = regionsRef.current.addRegion({
				start: comment.startTime,
				end: comment.endTime,
				color: randomColor(),
				drag: false,
				resize: false
			})
		},
		[randomColor]
	)

	const removeCommentRegion = useCallback(() => {
		if (popupRegionRef.current) {
			popupRegionRef.current.remove()
			popupRegionRef.current = null
		}
	}, [])

	return (
		<div>
			<div className="flex relative gap-5 items-start p-2.5 mt-2 w-full rounded-lg bg-zinc-100 max-md:max-w-full">
				<div className="flex z-0 flex-1 shrink gap-2.5 items-center my-auto w-full basis-0 min-w-[240px] max-md:max-w-full">
					<div className="flex flex-wrap flex-1 shrink gap-4 self-stretch my-auto w-full basis-0 min-w-[240px] max-md:max-w-full">
						<Image
							src={coverImage || TRACK_THUMBNAIL}
							className="object-cover shrink-0 my-auto aspect-square w-[100px]"
							alt="artwork"
							width={100}
							height={100}
						/>
						<div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] max-md:max-w-full">
							<div className="flex gap-2 items-center text-xs font-medium tracking-normal text-white whitespace-nowrap justify-between w-full">
								<span className="flex items-center gap-2">
									<div
										className={`flex flex-col justify-center self-stretch px-2 py-0.5 my-auto w-9 rounded-lg ${getTypeColor(extension)}`}
									>
										{extension || "mp3"}
									</div>
									{track?.isAIGenerated && (
										<div
											className={`flex flex-col justify-center self-stretch px-2 py-0.5 my-auto w-9 rounded-lg bg-gradient-to-br from-gray-700 via-green-700 to-blue-700`}
										>
											AI
										</div>
									)}
								</span>
								<div className="flex items-center gap-2">
									{isComment && (
										<div
											className={`cursor-pointer p-1 rounded-md ${isCommenting ? "bg-blue-200" : ""}`}
											onClick={toggleCommenting}
										>
											<Image
												src={ADD_COMMENT_ICON || "/placeholder.svg"}
												alt="add_comment"
												width={24}
												height={24}
											/>
										</div>
									)}

									{user && (
										<MultiDropdown
											dropdownLabel={
												<button className="flex gap-2 justify-center items-center">
													<Image
														src={MORE_OPTION || "/placeholder.svg"}
														alt="more_option"
														width={24}
														height={24}
													/>
												</button>
											}
											options={filterOptions}
											className={{
												item: "flex gap-2 p-3",
												list: "flex gap-2"
											}}
										/>
									)}
								</div>
							</div>
							<div className="flex flex-col w-full text-black max-md:max-w-full">
								<div className="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full">
									<div className="flex flex-col self-stretch my-auto">
										<div className="text-sm font-semibold tracking-tight">
											{title || ""}
										</div>
										<div className="text-xs tracking-tight">{artist || ""}</div>
									</div>
								</div>
							</div>
							<div className="flex flex-wrap gap-3 items-center w-full text-base text-right text-neutral-400 max-md:max-w-full">
								<div
									className="relative h-12 cursor-pointer flex-1"
									ref={waveformRef}
								>
									{isComment &&
										comments &&
										comments?.length > 0 &&
										comments.map((comment, index) => {
											const leftPosition =
												duration > 0 ? (comment.startTime / duration) * 100 : 0
											return (
												<Popover
													key={comment.id}
													placement="top-start"
													onOpenChange={(open) => {
														if (open) {
															showCommentRegion(comment)
														} else {
															removeCommentRegion()
														}
													}}
												>
													<PopoverTrigger>
														<div
															className="absolute top-0 z-10"
															style={{
																left: `${leftPosition}%`,
																transform: `translateY(-${index + 0.1}px)`
															}}
														>
															<CommentAvatar
																initial={comment.user?.name?.[0] || "A"}
															/>
														</div>
													</PopoverTrigger>
													<PopoverContent className="bg-[#636363] p-[15px]">
														<CommentPopup
															comment={comment}
															onReply={handleReply}
														/>
													</PopoverContent>
												</Popover>
											)
										})}
								</div>
								<div className="self-stretch my-auto">
									{formatTime(currentTime)}/{formatTime(duration)}
								</div>
							</div>
						</div>
					</div>
				</div>
				<Image
					src={isPlaying ? PAUSE_IMAGE : PLAY_IMAGE}
					className="object-contain absolute bottom-[40px] left-10 z-0 shrink-0 self-start w-10 h-10 aspect-square cursor-pointer"
					alt="Play overlay"
					width={40}
					height={40}
					onClick={togglePlay}
				/>
			</div>
			{isCommenting && (
				<div className="flex gap-2 w-full mt-2">
					<Input
						type="text"
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Add comment for selected region"
						className="h-8 text-sm flex-1"
					/>
					<Button size="sm" onPress={saveComment} disabled={!newComment.trim()}>
						Save
					</Button>
				</div>
			)}
		</div>
	)
}
