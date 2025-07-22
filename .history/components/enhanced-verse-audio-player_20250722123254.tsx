"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Loader2, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dataService } from "@/lib/data-service"
import { storage } from "@/lib/storage"
import { useVerseAudio } from "./verse-audio-provider"
import type { Ayah } from "@/lib/types"

interface EnhancedVerseAudioPlayerProps {
  ayah: Ayah
  totalVerses: number
  className?: string
}

export function EnhancedVerseAudioPlayer({ ayah, totalVerses, className }: EnhancedVerseAudioPlayerProps) {
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioAvailable, setAudioAvailable] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  const { currentPlayingVerse, setCurrentPlayingVerse } = useVerseAudio()
  const verseKey = `${ayah.surahId}_${ayah.number}`
  const isCurrentlyPlaying = currentPlayingVerse === verseKey

  const preferences = storage.getPreferences()

  useEffect(() => {
    checkAudioAvailability()
  }, [ayah.surahId, ayah.number])

  // Auto-play this verse if it's set as current playing verse
  useEffect(() => {
    if (currentPlayingVerse === verseKey && !isPlaying && !isLoading) {
      handleAutoPlay()
    }
  }, [currentPlayingVerse, verseKey])

  const handleAutoPlay = async () => {
    try {
      setIsLoading(true)
      await togglePlayPause()
    } catch (error) {
      console.error("Auto-play failed:", error)
      setAudioError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAudioClick = async () => {
    try {
      setAudioLoading(true)
      await togglePlayPause()
    } catch (error) {
      setAudioError(true)
    } finally {
      setAudioLoading(false)
    }
  }

  // Stop playing when another verse starts
  useEffect(() => {
    if (currentPlayingVerse !== verseKey && isPlaying) {
      handleStop()
    }
  }, [currentPlayingVerse, verseKey, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      setAudioError(false)

      // Apply volume from settings when audio loads
      const currentPreferences = storage.getPreferences()
      const volume = currentPreferences.defaultVolume / 100
      audio.volume = volume
      console.log(`Applied volume to verse audio: ${currentPreferences.defaultVolume}%`)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setShowPlayer(true)
      setCurrentPlayingVerse(verseKey)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = async () => {
      console.log(`Verse ${ayah.number} audio ended`)

      // Get FRESH preferences each time a verse ends (not cached)
      const currentPreferences = storage.getPreferences()
      const shouldAutoPlay = currentPreferences.autoPlay || currentPreferences.surahPageVerseAutoPlay

      console.log("Checking autoplay settings:", {
        globalAutoPlay: currentPreferences.autoPlay,
        surahPageAutoPlay: currentPreferences.surahPageVerseAutoPlay,
        shouldAutoPlay: shouldAutoPlay,
      })

      if (shouldAutoPlay) {
        try {
          // Find the next verse in the current surah
          const nextVerseNumber = ayah.number + 1

          if (nextVerseNumber <= totalVerses) {
            const nextVerseKey = `${ayah.surahId}_${nextVerseNumber}`
            console.log(
              `Auto-playing next verse: ${nextVerseKey} (Global Auto Play: ${currentPreferences.autoPlay}, Surah Page Auto Play: ${currentPreferences.surahPageVerseAutoPlay})`,
            )

            // Set a small delay before playing next verse
            setTimeout(() => {
              // Check preferences again before actually starting the next verse
              const finalPreferences = storage.getPreferences()
              const finalShouldAutoPlay = finalPreferences.autoPlay || finalPreferences.surahPageVerseAutoPlay

              if (finalShouldAutoPlay) {
                setCurrentPlayingVerse(nextVerseKey)
              } else {
                console.log("Autoplay was disabled during delay, stopping")
                handleStop()
              }
            }, 500)
          } else {
            console.log("Reached end of surah, stopping verse auto-play")
            handleStop()
          }
        } catch (error) {
          console.error("Error in verse auto-play:", error)
          handleStop()
        }
      } else {
        console.log(
          "Auto Play disabled (Global: " +
            currentPreferences.autoPlay +
            ", Surah Page: " +
            currentPreferences.surahPageVerseAutoPlay +
            "), stopping verse playback",
        )
        handleStop()
      }
    }

    const handleError = (e: any) => {
      console.error("Verse audio error:", e)
      setIsLoading(false)
      setAudioError(true)
      setAudioAvailable(false)
      setIsPlaying(false)
      if (currentPlayingVerse === verseKey) {
        setCurrentPlayingVerse(null)
      }
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setAudioError(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setAudioAvailable(true)
      setAudioError(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleCanPlayThrough = () => {
      setIsLoading(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
    }
  }, [verseKey, currentPlayingVerse, ayah.number, totalVerses])

  // Add this useEffect after the existing useEffects, before the checkAudioAvailability function
  useEffect(() => {
    // Stop current verse if autoplay is disabled while playing
    if (isPlaying && isCurrentlyPlaying) {
      const currentPreferences = storage.getPreferences()
      const shouldAutoPlay = currentPreferences.autoPlay || currentPreferences.surahPageVerseAutoPlay

      if (!shouldAutoPlay) {
        console.log("Autoplay disabled while verse was playing, stopping current verse")
        handleStop()
      }
    }
  }, [preferences.autoPlay, preferences.surahPageVerseAutoPlay, isPlaying, isCurrentlyPlaying])

  const checkAudioAvailability = async () => {
    try {
      const available = await dataService.checkVerseAudioAvailability(1, ayah.surahId, ayah.number)
      setAudioAvailable(available)
      setAudioError(!available)
    } catch (error) {
      console.error("Error checking audio availability:", error)
      setAudioAvailable(false)
      setAudioError(true)
    }
  }

  const handleStop = () => {
    const audio = audioRef.current
    if (audio) {
      // Cancel any pending play promise
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {
          // Ignore the error if play was interrupted
        })
        playPromiseRef.current = null
      }

      audio.pause()
      audio.currentTime = 0
    }

    setIsPlaying(false)
    setCurrentTime(0)
    setShowPlayer(false)
    setIsLoading(false)

    if (currentPlayingVerse === verseKey) {
      setCurrentPlayingVerse(null)
    }
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio || !audioAvailable || audioError) return

    try {
      if (isPlaying) {
        // Pause current audio
        if (playPromiseRef.current) {
          await playPromiseRef.current.catch(() => {})
          playPromiseRef.current = null
        }
        audio.pause()
      } else {
        // Stop any other playing verse
        if (currentPlayingVerse && currentPlayingVerse !== verseKey) {
          setCurrentPlayingVerse(null)
        }

        // Start loading
        setIsLoading(true)
        setAudioError(false)

        // Apply volume from settings before playing
        const currentPreferences = storage.getPreferences()
        const volume = currentPreferences.defaultVolume / 100
        audio.volume = volume

        // Ensure audio is loaded
        if (audio.readyState < 2) {
          audio.load()
          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              audio.removeEventListener("canplay", handleCanPlay)
              audio.removeEventListener("error", handleError)
              resolve(void 0)
            }
            const handleError = () => {
              audio.removeEventListener("canplay", handleCanPlay)
              audio.removeEventListener("error", handleError)
              reject(new Error("Failed to load audio"))
            }
            audio.addEventListener("canplay", handleCanPlay)
            audio.addEventListener("error", handleError)
          })
        }

        // Play audio
        playPromiseRef.current = audio.play()
        await playPromiseRef.current
        playPromiseRef.current = null
      }
    } catch (error: any) {
      console.error("Error in togglePlayPause:", error)
      setIsLoading(false)
      setIsPlaying(false)

      // Only set error if it's not an interruption
      if (!error.message?.includes("interrupted")) {
        setAudioError(true)
        setAudioAvailable(false)
      }

      if (currentPlayingVerse === verseKey) {
        setCurrentPlayingVerse(null)
      }
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Don't render if verse audio is disabled or not available
  if (!preferences.verseAudioEnabled || (!audioAvailable && !isLoading)) {
    return null
  }

  const audioUrl = dataService.getVerseAudioUrl(1, ayah.surahId, ayah.number)

  return (
    <div className={`space-y-2 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" playsInline />

      {/* Play Button */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAudioClick}
          disabled={audioError}
          className={`h-8 px-3 transition-all duration-200 ${
            isCurrentlyPlaying
              ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 border-green-300 dark:border-green-700"
              : "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
          } border`}
        >
          <Headphones className="h-3 w-3 mr-2 text-green-600" />

          {audioLoading || isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs ml-1 text-green-700 dark:text-green-300">Loading...</span>
            </>
          ) : (
            <>
              {isCurrentlyPlaying && isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span className="text-xs ml-1 text-green-700 dark:text-green-300">
                {isCurrentlyPlaying && isPlaying ? "Pause" : "Listen"}
              </span>
            </>
          )}
        </Button>

        {audioError && <span className="text-xs text-red-500">Audio unavailable</span>}
      </div>
    </div>
  )
}
