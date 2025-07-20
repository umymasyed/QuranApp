"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import { dataService } from "@/lib/data-service"
import { storage } from "@/lib/storage"
import type { Surah, Ayah } from "@/lib/types"

interface AudioState {
  currentSurah: Surah | null
  currentAyah: Ayah | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  selectedReciter: number
}

type AudioAction =
  | { type: "SET_CURRENT_SURAH"; payload: Surah }
  | { type: "SET_CURRENT_AYAH"; payload: Ayah }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_TIME"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_RECITER"; payload: number }

const initialState: AudioState = {
  currentSurah: null,
  currentAyah: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isLoading: false,
  selectedReciter: 1,
}

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case "SET_CURRENT_SURAH":
      return { ...state, currentSurah: action.payload }
    case "SET_CURRENT_AYAH":
      return { ...state, currentAyah: action.payload }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload }
    case "SET_TIME":
      return { ...state, currentTime: action.payload }
    case "SET_DURATION":
      return { ...state, duration: action.payload }
    case "SET_VOLUME":
      return { ...state, volume: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_RECITER":
      return { ...state, selectedReciter: action.payload }
    default:
      return state
  }
}

interface AudioContextType {
  state: AudioState
  dispatch: React.Dispatch<AudioAction>
  audioRef: React.RefObject<HTMLAudioElement>
  playSurah: (surah: Surah) => Promise<void>
  togglePlayPause: () => Promise<void>
  seekTo: (time: number) => void
  changeReciter: (reciterId: number) => Promise<void>
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const playPromiseRef = React.useRef<Promise<void> | null>(null)

  // Initialize with user's preferred reciter
  useEffect(() => {
    try {
      const preferences = storage.getPreferences()
      dispatch({ type: "SET_RECITER", payload: preferences.selectedReciter || 1 })
      dispatch({ type: "SET_VOLUME", payload: 0.7 })
    } catch (error) {
      console.error("Error loading preferences:", error)
      // Use defaults if storage fails
      dispatch({ type: "SET_RECITER", payload: 1 })
      dispatch({ type: "SET_VOLUME", payload: 0.7 })
    }
  }, [])

  // Setup Media Session API for notification/lock screen controls
  const setupMediaSession = (surah: Surah) => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      return
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: surah.nameEnglish,
        artist: "Mishary Rashid Al Afasy",
        album: `${surah.nameArabic} - ${surah.meaning || ""}`,
        artwork: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      })

      // Set up action handlers with proper async handling
      navigator.mediaSession.setActionHandler("play", async () => {
        console.log("Media session play clicked")
        try {
          if (audioRef.current && audioRef.current.paused) {
            await togglePlayPause()
          }
        } catch (error) {
          console.error("Error handling media session play:", error)
        }
      })

      navigator.mediaSession.setActionHandler("pause", async () => {
        console.log("Media session pause clicked")
        try {
          if (audioRef.current && !audioRef.current.paused) {
            await togglePlayPause()
          }
        } catch (error) {
          console.error("Error handling media session pause:", error)
        }
      })

      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        console.log("Media session seek backward")
        const skipTime = details.seekOffset || 10
        if (audioRef.current) {
          const newTime = Math.max(0, audioRef.current.currentTime - skipTime)
          seekTo(newTime)
        }
      })

      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        console.log("Media session seek forward")
        const skipTime = details.seekOffset || 10
        if (audioRef.current && audioRef.current.duration) {
          const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + skipTime)
          seekTo(newTime)
        }
      })

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        console.log("Media session seek to:", details.seekTime)
        if (details.seekTime !== undefined && audioRef.current) {
          seekTo(details.seekTime)
        }
      })

      // Set initial playback state
      navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused"

      console.log("Media session setup complete")
    } catch (error) {
      console.error("Error setting up media session:", error)
    }
  }

  // Update media session position
  const updateMediaSessionPosition = () => {
    if (typeof window === "undefined" || !("mediaSession" in navigator) || !audioRef.current) {
      return
    }

    try {
      const duration = audioRef.current.duration
      const currentTime = audioRef.current.currentTime

      if (isFinite(duration) && isFinite(currentTime)) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: audioRef.current.playbackRate,
          position: currentTime,
        })
      }
    } catch (error) {
      console.error("Error updating media session position:", error)
    }
  }

  const playSurah = async (surah: Surah): Promise<void> => {
    try {
      console.log(`Starting to play surah: ${surah.nameEnglish} (ID: ${surah.id})`)
      dispatch({ type: "SET_CURRENT_SURAH", payload: surah })
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_PLAYING", payload: false })

      // Setup media session
      setupMediaSession(surah)

      // Get audio URL for Mishary (always ID 1)
      const audioUrl = await dataService.getAudioUrl(surah.id, 1)
      console.log(`Audio URL: ${audioUrl}`)

      if (!audioRef.current) {
        throw new Error("Audio element not available")
      }

      // Cancel any pending play promise
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current
        } catch (error) {
          // Ignore interruption errors
          console.log("Previous play promise cancelled")
        }
        playPromiseRef.current = null
      }

      // Stop current audio
      audioRef.current.pause()
      audioRef.current.currentTime = 0

      // Reset the audio element
      audioRef.current.src = ""
      audioRef.current.load()

      // Set new source
      audioRef.current.src = audioUrl
      audioRef.current.load()

      // Wait for audio to be ready then play
      playPromiseRef.current = audioRef.current.play()
      await playPromiseRef.current
      playPromiseRef.current = null

      console.log("Audio started playing successfully")
      dispatch({ type: "SET_LOADING", payload: false })
      updateMediaSessionPosition()

      // Save to recently played
      if (typeof window !== "undefined") {
        try {
          const recentlyPlayed = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]")
          const filtered = recentlyPlayed.filter((s: Surah) => s.id !== surah.id)
          localStorage.setItem("recentlyPlayed", JSON.stringify([surah, ...filtered].slice(0, 10)))
        } catch (error) {
          console.error("Error saving to recently played:", error)
        }
      }
    } catch (error: any) {
      console.error("Error in playSurah:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      dispatch({ type: "SET_PLAYING", payload: false })

      // Only log error if it's not an interruption
      if (!error.message?.includes("interrupted") && !error.name?.includes("AbortError")) {
        console.error("Actual playback error:", error)
      }
    }
  }

  const changeReciter = async (reciterId: number): Promise<void> => {
    // Since we only have Mishary, this function doesn't need to do much
    console.log("Only Mishary Rashid Al Afasy is available")
    dispatch({ type: "SET_RECITER", payload: reciterId })
  }

  const togglePlayPause = async (): Promise<void> => {
    if (!audioRef.current) {
      console.error("Audio element not available")
      return
    }

    try {
      if (state.isPlaying) {
        // Cancel any pending play promise
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current
          } catch (error) {
            // Ignore interruption errors
            console.log("Play promise cancelled for pause")
          }
          playPromiseRef.current = null
        }
        audioRef.current.pause()
      } else {
        playPromiseRef.current = audioRef.current.play()
        await playPromiseRef.current
        playPromiseRef.current = null
      }
    } catch (error: any) {
      console.error("Error in togglePlayPause:", error)
      dispatch({ type: "SET_LOADING", payload: false })

      // Only set playing to false if it's not an interruption
      if (!error.message?.includes("interrupted") && !error.name?.includes("AbortError")) {
        dispatch({ type: "SET_PLAYING", payload: false })
      }
    }
  }

  const seekTo = (time: number) => {
    if (!audioRef.current) {
      console.error("Audio element not available")
      return
    }

    try {
      audioRef.current.currentTime = time
      dispatch({ type: "SET_TIME", payload: time })
      updateMediaSessionPosition()
    } catch (error) {
      console.error("Error seeking:", error)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      console.log(`Audio loaded, duration: ${audio.duration}`)
      if (isFinite(audio.duration)) {
        dispatch({ type: "SET_DURATION", payload: audio.duration })
      }
      dispatch({ type: "SET_LOADING", payload: false })
      updateMediaSessionPosition()
    }

    const handleTimeUpdate = () => {
      if (isFinite(audio.currentTime)) {
        dispatch({ type: "SET_TIME", payload: audio.currentTime })
        updateMediaSessionPosition()
      }
    }

    const handlePlay = () => {
      console.log("Audio play event")
      dispatch({ type: "SET_PLAYING", payload: true })
      dispatch({ type: "SET_LOADING", payload: false })

      // Update media session playback state
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        try {
          navigator.mediaSession.playbackState = "playing"
          console.log("Media session state set to playing")
        } catch (error) {
          console.error("Error setting media session to playing:", error)
        }
      }
    }

    const handlePause = () => {
      console.log("Audio pause event")
      dispatch({ type: "SET_PLAYING", payload: false })

      // Update media session playback state
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        try {
          navigator.mediaSession.playbackState = "paused"
          console.log("Media session state set to paused")
        } catch (error) {
          console.error("Error setting media session to paused:", error)
        }
      }
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      console.error("Audio error:", target.error)
      dispatch({ type: "SET_LOADING", payload: false })
      dispatch({ type: "SET_PLAYING", payload: false })
    }

    const handleLoadStart = () => {
      console.log("Audio load start")
      dispatch({ type: "SET_LOADING", payload: true })
    }

    const handleCanPlay = () => {
      console.log("Audio can play")
      dispatch({ type: "SET_LOADING", payload: false })
    }

    const handleEnded = () => {
      console.log("Audio ended")
      dispatch({ type: "SET_PLAYING", payload: false })
      dispatch({ type: "SET_TIME", payload: 0 })

      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused"
      }
    }

    const handleWaiting = () => {
      console.log("Audio waiting")
      dispatch({ type: "SET_LOADING", payload: true })
    }

    const handleCanPlayThrough = () => {
      console.log("Audio can play through")
      dispatch({ type: "SET_LOADING", payload: false })
    }

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)

    // Set volume
    audio.volume = Math.max(0, Math.min(1, state.volume))

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
    }
  }, [state.volume])

  const contextValue: AudioContextType = {
    state,
    dispatch,
    audioRef,
    playSurah,
    togglePlayPause,
    seekTo,
    changeReciter,
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" style={{ display: "none" }} playsInline />
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider")
  }
  return context
}
