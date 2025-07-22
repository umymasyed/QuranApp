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
  autoPlay: boolean
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
  | { type: "SET_AUTOPLAY"; payload: boolean }

const initialState: AudioState = {
  currentSurah: null,
  currentAyah: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isLoading: false,
  selectedReciter: 1,
  autoPlay: false,
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
    case "SET_AUTOPLAY":
      return { ...state, autoPlay: action.payload }
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
  playNextSurah: () => Promise<void>
  playPreviousSurah: () => Promise<void>
  updateAutoPlay: (enabled: boolean) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const playPromiseRef = React.useRef<Promise<void> | null>(null)

  // Initialize with user's preferred reciter and autoplay setting
  useEffect(() => {
    try {
      const preferences = storage.getPreferences()
      console.log("AudioProvider: Initializing with preferences:", preferences)
      dispatch({ type: "SET_RECITER", payload: preferences.selectedReciter || 1 })
      dispatch({ type: "SET_VOLUME", payload: preferences.volume ?? 0.7 }) // Use nullish coalescing for volume
      dispatch({ type: "SET_AUTOPLAY", payload: preferences.autoPlay || false })
    } catch (error) {
      console.error("AudioProvider: Error loading preferences on init:", error)
      // Use defaults if storage fails
      dispatch({ type: "SET_RECITER", payload: 1 })
      dispatch({ type: "SET_VOLUME", payload: 0.7 })
      dispatch({ type: "SET_AUTOPLAY", payload: false })
    }
  }, [])

  // Listen for storage changes to update autoPlay and volume
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "preferences") {
        try {
          const updatedPreferences = JSON.parse(event.newValue || "{}")
          if (typeof updatedPreferences.autoPlay === "boolean") {
            console.log("AudioProvider: Storage change detected, updating autoPlay to:", updatedPreferences.autoPlay)
            dispatch({ type: "SET_AUTOPLAY", payload: updatedPreferences.autoPlay })
          }
          if (typeof updatedPreferences.volume === "number") {
            console.log("AudioProvider: Storage change detected, updating volume to:", updatedPreferences.volume)
            dispatch({ type: "SET_VOLUME", payload: updatedPreferences.volume })
            if (audioRef.current) {
              audioRef.current.volume = updatedPreferences.volume
            }
          }
        } catch (error) {
          console.error("AudioProvider: Error parsing updated preferences from storage event:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Setup Media Session API for notification/lock screen controls
  const setupMediaSession = (surah: Surah) => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      console.log("Media Session API not available")
      return
    }

    try {
      console.log("Setting up media session for:", surah.nameEnglish)

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

      // Clear existing handlers first
      navigator.mediaSession.setActionHandler("play", null)
      navigator.mediaSession.setActionHandler("pause", null)
      navigator.mediaSession.setActionHandler("seekbackward", null)
      navigator.mediaSession.setActionHandler("seekforward", null)
      navigator.mediaSession.setActionHandler("seekto", null)

      // Set new handlers with better error handling
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("🎵 Media session PLAY clicked")
        try {
          if (audioRef.current) {
            // Added null check
            console.log("Audio element state:", {
              paused: audioRef.current.paused,
              currentTime: audioRef.current.currentTime,
              readyState: audioRef.current.readyState,
            })

            if (audioRef.current.paused) {
              console.log("▶️ Starting playback from media session")
              audioRef.current
                .play()
                .then(() => {
                  console.log("✅ Play successful from media session")
                })
                .catch((error) => {
                  console.error("❌ Play failed from media session:", error)
                })
            }
          } else {
            console.error("❌ Audio element not available for play")
          }
        } catch (error) {
          console.error("❌ Error in media session play handler:", error)
        }
      })

      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("⏸️ Media session PAUSE clicked")
        try {
          if (audioRef.current) {
            // Added null check
            console.log("Audio element state:", {
              paused: audioRef.current.paused,
              currentTime: audioRef.current.currentTime,
              readyState: audioRef.current.readyState,
            })

            if (!audioRef.current.paused) {
              console.log("⏸️ Pausing playback from media session")
              audioRef.current.pause()
              console.log("✅ Pause successful from media session")
            } else {
              console.log("⚠️ Audio already paused")
            }
          } else {
            console.error("❌ Audio element not available for pause")
          }
        } catch (error) {
          console.error("❌ Error in media session pause handler:", error)
        }
      })

      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        console.log("⏪ Media session seek backward")
        try {
          const skipTime = details.seekOffset || 10
          if (audioRef.current) {
            // Added null check
            const newTime = Math.max(0, audioRef.current.currentTime - skipTime)
            audioRef.current.currentTime = newTime
            console.log(`⏪ Seeked backward to ${newTime}s`)
          }
        } catch (error) {
          console.error("❌ Error in seek backward:", error)
        }
      })

      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        console.log("⏩ Media session seek forward")
        try {
          const skipTime = details.seekOffset || 10
          if (audioRef.current && audioRef.current.duration) {
            // Added null check
            const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + skipTime)
            audioRef.current.currentTime = newTime
            console.log(`⏩ Seeked forward to ${newTime}s`)
          }
        } catch (error) {
          console.error("❌ Error in seek forward:", error)
        }
      })

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        console.log("🎯 Media session seek to:", details.seekTime)
        try {
          if (details.seekTime !== undefined && audioRef.current) {
            // Added null check
            audioRef.current.currentTime = details.seekTime
            console.log(`🎯 Seeked to ${details.seekTime}s`)
          }
        } catch (error) {
          console.error("❌ Error in seek to:", error)
        }
      })

      // Set initial playback state
      navigator.mediaSession.playbackState = "paused"
      console.log("✅ Media session setup complete with all handlers")
    } catch (error) {
      console.error("❌ Error setting up media session:", error)
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
      console.log(`AudioProvider: Starting to play surah: ${surah.nameEnglish} (ID: ${surah.id})`)
      dispatch({ type: "SET_CURRENT_SURAH", payload: surah })
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_PLAYING", payload: false })

      // Setup media session
      setupMediaSession(surah)

      // Get audio URL for Mishary (always ID 1)
      const audioUrl = await dataService.getAudioUrl(surah.id, 1)
      console.log(`AudioProvider: Audio URL: ${audioUrl}`)

      if (!audioRef.current) {
        throw new Error("Audio element not available")
      }

      // Cancel any pending play promise
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current
        } catch (error) {
          console.log("AudioProvider: Previous play promise cancelled")
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

      console.log("AudioProvider: Audio started playing successfully")
      dispatch({ type: "SET_LOADING", payload: false })
      updateMediaSessionPosition()

      // Save to recently played
      if (typeof window !== "undefined") {
        try {
          const recentlyPlayed = storage.getRecentlyPlayed() // Use storage.getRecentlyPlayed
          const filtered = recentlyPlayed.filter((s: Surah) => s.id !== surah.id)
          localStorage.setItem("recentlyPlayed", JSON.stringify([surah, ...filtered].slice(0, 10)))
          console.log("AudioProvider: Saved to recently played")
        } catch (error) {
          console.error("AudioProvider: Error saving to recently played:", error)
        }
      }
    } catch (error: any) {
      console.error("AudioProvider: Error in playSurah:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      dispatch({ type: "SET_PLAYING", payload: false })

      // Only log error if it's not an interruption
      if (!error.message?.includes("interrupted") && !error.name?.includes("AbortError")) {
        console.error("AudioProvider: Actual playback error:", error)
      }
    }
  }

  const changeReciter = async (reciterId: number): Promise<void> => {
    // Since we only have Mishary, this function doesn't need to do much
    console.log("AudioProvider: Only Mishary Rashid Al Afasy is available")
    dispatch({ type: "SET_RECITER", payload: reciterId })
  }

  const togglePlayPause = async (): Promise<void> => {
    if (!audioRef.current) {
      console.error("AudioProvider: Audio element not available")
      return
    }

    try {
      console.log("AudioProvider: togglePlayPause called, current state:", {
        isPlaying: state.isPlaying,
        audioPaused: audioRef.current.paused,
        audioCurrentTime: audioRef.current.currentTime,
      })

      if (audioRef.current.paused) {
        // Audio is paused, so play it
        console.log("AudioProvider: Starting playback...")
        playPromiseRef.current = audioRef.current.play()
        await playPromiseRef.current
        playPromiseRef.current = null
        console.log("AudioProvider: Playback started successfully")
      } else {
        // Audio is playing, so pause it
        console.log("AudioProvider: Pausing playback...")
        // Cancel any pending play promise
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current
          } catch (error) {
            console.log("AudioProvider: Play promise cancelled for pause")
          }
          playPromiseRef.current = null
        }
        audioRef.current.pause()
        console.log("AudioProvider: Playback paused successfully")
      }
    } catch (error: any) {
      console.error("AudioProvider: Error in togglePlayPause:", error)
      dispatch({ type: "SET_LOADING", payload: false })

      // Only set playing to false if it's not an interruption
      if (!error.message?.includes("interrupted") && !error.name?.includes("AbortError")) {
        dispatch({ type: "SET_PLAYING", payload: false })
      }
    }
  }

  const seekTo = (time: number) => {
    if (!audioRef.current) {
      // Added null check
      console.error("AudioProvider: Audio element not available")
      return
    }

    try {
      audioRef.current.currentTime = time
      dispatch({ type: "SET_TIME", payload: time })
      updateMediaSessionPosition()
    } catch (error) {
      console.error("AudioProvider: Error seeking:", error)
    }
  }

  const playNextSurah = async (): Promise<void> => {
    if (!state.currentSurah) return

    try {
      console.log("AudioProvider: Playing next surah...")
      dispatch({ type: "SET_LOADING", payload: true })

      const allSurahs = await dataService.getAllSurahs()
      const currentIndex = allSurahs.findIndex((s) => s.id === state.currentSurah!.id)

      if (currentIndex < allSurahs.length - 1) {
        const nextSurah = allSurahs[currentIndex + 1]
        const fullNextSurah = await dataService.getSurah(nextSurah.id)
        if (fullNextSurah) {
          await playSurah(fullNextSurah)
        }
      } else {
        // If it's the last surah, go to first surah
        console.log("AudioProvider: Reached last surah, looping to first.")
        const firstSurah = await dataService.getSurah(1)
        if (firstSurah) {
          await playSurah(firstSurah)
        }
      }
    } catch (error) {
      console.error("AudioProvider: Error playing next surah:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const playPreviousSurah = async (): Promise<void> => {
    if (!state.currentSurah) return

    try {
      console.log("AudioProvider: Playing previous surah...")
      dispatch({ type: "SET_LOADING", payload: true })

      const allSurahs = await dataService.getAllSurahs()
      const currentIndex = allSurahs.findIndex((s) => s.id === state.currentSurah!.id)

      if (currentIndex > 0) {
        const previousSurah = allSurahs[currentIndex - 1]
        const fullPreviousSurah = await dataService.getSurah(previousSurah.id)
        if (fullPreviousSurah) {
          await playSurah(fullPreviousSurah)
        }
      } else {
        // If it's the first surah, go to last surah
        console.log("AudioProvider: Reached first surah, looping to last.")
        const lastSurah = await dataService.getSurah(114)
        if (lastSurah) {
          await playSurah(lastSurah)
        }
      }
    } catch (error) {
      console.error("AudioProvider: Error playing previous surah:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      console.log(`AudioProvider: Audio loaded, duration: ${audio.duration}`)
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
      console.log("AudioProvider: 🎵 Audio play event triggered")
      dispatch({ type: "SET_PLAYING", payload: true })
      dispatch({ type: "SET_LOADING", payload: false })

      // Update media session playback state
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        try {
          navigator.mediaSession.playbackState = "playing"
          console.log("AudioProvider: ✅ Media session state set to PLAYING")
        } catch (error) {
          console.error("AudioProvider: ❌ Error setting media session to playing:", error)
        }
      }
    }

    const handlePause = () => {
      console.log("AudioProvider: ⏸️ Audio pause event triggered")
      dispatch({ type: "SET_PLAYING", payload: false })

      // Update media session playback state
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        try {
          navigator.mediaSession.playbackState = "paused"
          console.log("AudioProvider: ✅ Media session state set to PAUSED")
        } catch (error) {
          console.error("AudioProvider: ❌ Error setting media session to paused:", error)
        }
      }
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      console.error("AudioProvider: Audio error:", target.error)
      dispatch({ type: "SET_LOADING", payload: false })
      dispatch({ type: "SET_PLAYING", payload: false })
    }

    const handleLoadStart = () => {
      console.log("AudioProvider: Audio load start")
      dispatch({ type: "SET_LOADING", payload: true })
    }

    const handleCanPlay = () => {
      console.log("AudioProvider: Audio can play")
      dispatch({ type: "SET_LOADING", payload: false })
    }

    const handleEnded = async () => {
      console.log("AudioProvider: Audio ended")
      dispatch({ type: "SET_PLAYING", payload: false })
      dispatch({ type: "SET_TIME", payload: 0 })

      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused"
      }

      // Auto play next surah if enabled
      if (state.autoPlay && state.currentSurah) {
        console.log("AudioProvider: Auto play is enabled, playing next surah...")
        try {
          const allSurahs = await dataService.getAllSurahs()
          const currentIndex = allSurahs.findIndex((s) => s.id === state.currentSurah!.id)

          if (currentIndex < allSurahs.length - 1) {
            const nextSurah = allSurahs[currentIndex + 1]
            const fullNextSurah = await dataService.getSurah(nextSurah.id)
            if (fullNextSurah) {
              setTimeout(() => {
                playSurah(fullNextSurah)
              }, 1000) // 1 second delay before auto play
            }
          } else {
            // If it's the last surah, loop to the first surah
            console.log("AudioProvider: Reached end of Quran, looping to first surah for continuous playback.")
            const firstSurah = await dataService.getSurah(1)
            if (firstSurah) {
              setTimeout(() => {
                playSurah(firstSurah)
              }, 1000)
            }
          }
        } catch (error) {
          console.error("AudioProvider: Error in auto play:", error)
        }
      }
    }

    const handleWaiting = () => {
      console.log("AudioProvider: Audio waiting")
      dispatch({ type: "SET_LOADING", payload: true })
    }

    const handleCanPlayThrough = () => {
      console.log("AudioProvider: Audio can play through")
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
  }, [state.volume, state.autoPlay, state.currentSurah])

  const updateAutoPlay = (enabled: boolean) => {
    console.log("AudioProvider: updateAutoPlay called with:", enabled)
    dispatch({ type: "SET_AUTOPLAY", payload: enabled })
    // Note: localStorage update is handled by SettingsPage or SurahDetailPage
  }

  const contextValue: AudioContextType = {
    state,
    dispatch,
    audioRef,
    playSurah,
    togglePlayPause,
    seekTo,
    changeReciter,
    playNextSurah,
    playPreviousSurah,
    updateAutoPlay,
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
