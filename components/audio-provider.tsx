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

const AudioContext = createContext<{
  state: AudioState
  dispatch: React.Dispatch<AudioAction>
  audioRef: React.RefObject<HTMLAudioElement>
  playSurah: (surah: Surah) => void
  togglePlayPause: () => void
  seekTo: (time: number) => void
  changeReciter: (reciterId: number) => void
} | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const playPromiseRef = React.useRef<Promise<void> | null>(null)

  // Initialize with user's preferred reciter
  useEffect(() => {
    const preferences = storage.getPreferences()
    dispatch({ type: "SET_RECITER", payload: preferences.selectedReciter || 1 })
    dispatch({ type: "SET_VOLUME", payload: 0.7 })
  }, [])

  // Setup Media Session API for notification/lock screen controls
  const setupMediaSession = (surah: Surah) => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: surah.nameEnglish,
        artist: "Mishary Rashid Al Afasy",
        album: `${surah.nameArabic} - ${surah.meaning}`,
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

      // Set up action handlers
      navigator.mediaSession.setActionHandler("play", () => {
        togglePlayPause()
      })

      navigator.mediaSession.setActionHandler("pause", () => {
        togglePlayPause()
      })

      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime)
        }
      })

      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + skipTime)
        }
      })

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime
        }
      })
    }
  }

  // Update media session position
  const updateMediaSessionPosition = () => {
    if ("mediaSession" in navigator && audioRef.current) {
      navigator.mediaSession.setPositionState({
        duration: audioRef.current.duration || 0,
        playbackRate: audioRef.current.playbackRate,
        position: audioRef.current.currentTime || 0,
      })
    }
  }

  const playSurah = async (surah: Surah) => {
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

      if (audioRef.current) {
        // Cancel any pending play promise
        if (playPromiseRef.current) {
          await playPromiseRef.current.catch(() => {})
          playPromiseRef.current = null
        }

        // Stop current audio
        audioRef.current.pause()
        audioRef.current.currentTime = 0

        // Explicitly clear the source to prevent "media removed" error
        audioRef.current.src = "" // ADD THIS LINE
        audioRef.current.load() // ADD THIS LINE to ensure the audio element is reset

        // Set new source
        audioRef.current.src = audioUrl

        // Load and play
        audioRef.current.load()

        // Wait for audio to be ready then play
        playPromiseRef.current = audioRef.current.play()
        await playPromiseRef.current
        playPromiseRef.current = null

        console.log("Audio started playing successfully")
        dispatch({ type: "SET_LOADING", payload: false })
        updateMediaSessionPosition()
      }

      // Save to recently played
      if (typeof window !== "undefined") {
        const recentlyPlayed = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]")
        const filtered = recentlyPlayed.filter((s: Surah) => s.id !== surah.id)
        localStorage.setItem("recentlyPlayed", JSON.stringify([surah, ...filtered].slice(0, 10)))
      }
    } catch (error: any) {
      console.error("Error in playSurah:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      dispatch({ type: "SET_PLAYING", payload: false })

      // Only log error if it's not an interruption
      if (!error.message?.includes("interrupted")) {
        console.error("Actual playback error:", error)
      }
    }
  }

  const changeReciter = async (reciterId: number) => {
    // Since we only have Mishary, this function doesn't need to do much
    console.log("Only Mishary Rashid Al Afasy is available")
    return
  }

  const togglePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (state.isPlaying) {
          // Cancel any pending play promise
          if (playPromiseRef.current) {
            await playPromiseRef.current.catch(() => {})
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
        if (!error.message?.includes("interrupted")) {
          dispatch({ type: "SET_PLAYING", payload: false })
        }
      }
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      dispatch({ type: "SET_TIME", payload: time })
      updateMediaSessionPosition()
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      console.log(`Audio loaded, duration: ${audio.duration}`)
      dispatch({ type: "SET_DURATION", payload: audio.duration })
      dispatch({ type: "SET_LOADING", payload: false })
      updateMediaSessionPosition()
    }

    const handleTimeUpdate = () => {
      dispatch({ type: "SET_TIME", payload: audio.currentTime })
      updateMediaSessionPosition()
    }

    const handlePlay = () => {
      console.log("Audio play event")
      dispatch({ type: "SET_PLAYING", payload: true })
      dispatch({ type: "SET_LOADING", payload: false })

      // Update media session playback state
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing"
      }
    }

    const handlePause = () => {
      console.log("Audio pause event")
      dispatch({ type: "SET_PLAYING", payload: false })

      // Update media session playback state
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused"
      }
    }

    const handleError = (e: any) => {
      console.error("Audio error:", e)
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

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused"
      }
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)

    // Set volume
    audio.volume = state.volume

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [state.volume])

  return (
    <AudioContext.Provider value={{ state, dispatch, audioRef, playSurah, togglePlayPause, seekTo, changeReciter }}>
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
