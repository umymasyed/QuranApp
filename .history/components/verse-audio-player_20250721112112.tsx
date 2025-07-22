"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Loader2, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dataService } from "@/lib/data-service"
import { useVerseAudio } from "./verse-audio-provider"
import type { Ayah } from "@/lib/types"

interface VerseAudioPlayerProps {
  ayah: Ayah
  className?: string
  allAyahs?: Ayah[] // Pass all ayahs for auto play functionality
}

export function VerseAudioPlayer({ ayah, className, allAyahs = [] }: VerseAudioPlayerProps) {
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

  const {
    currentPlayingVerse,
    setCurrentPlayingVerse,
    autoPlayEnabled,
    currentSurahAyahs,
    setCurrentSurahAyahs,
    verseAudioEnabled,
  } = useVerseAudio() // Get verseAudioEnabled from context

  const verseKey = `${ayah.surahId}_${ayah.number}`
  const isCurrentlyPlaying = currentPlayingVerse === verseKey

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio || !audioAvailable || audioError) {
      console.log(
        `VerseAudioPlayer (${verseKey}): togglePlayPause skipped. Audio: ${!!audio}, Available: ${audioAvailable}, Error: ${audioError}`,
      )
      return
    }

    try {
      if (isPlaying) {
        console.log(`VerseAudioPlayer (${verseKey}): Pausing playback.`)
        // Pause current audio
        if (playPromiseRef.current) {
          await playPromiseRef.current.catch(() => {})
          playPromiseRef.current = null
        }
        audio.pause()
      } else {
        console.log(`VerseAudioPlayer (${verseKey}): Starting playback.`)
        // Stop any other playing verse
        if (currentPlayingVerse && currentPlayingVerse !== verseKey) {
          console.log(`VerseAudioPlayer (${verseKey}): Stopping other playing verse: ${currentPlayingVerse}`)
          setCurrentPlayingVerse(null) // This will trigger other player's handleStop
        }

        // Start loading
        setIsLoading(true)
        setAudioError(false)

        // Ensure audio is loaded
        if (audio.readyState < 2) {
          console.log(`VerseAudioPlayer (${verseKey}): Audio not ready, loading...`)
          audio.load()
          await new Promise<void>((resolve, reject) => {
            const handleCanPlay = () => {
              audio.removeEventListener("canplay", handleCanPlay)
              audio.removeEventListener("error", handleError)
              resolve()
            }
            const handleError = (e: Event) => {
              audio.removeEventListener("canplay", handleCanPlay)
              audio.removeEventListener("error", handleError)
              reject(new Error(`Failed to load audio: ${e.type}`))
            }
            audio.addEventListener("canplay", handleCanPlay)
            audio.addEventListener("error", handleError)
          })
          console.log(`VerseAudioPlayer (${verseKey}): Audio loaded and ready.`)
        }

        // Play audio
        playPromiseRef.current = audio.play()
        await playPromiseRef.current
        playPromiseRef.current = null
        console.log(`VerseAudioPlayer (${verseKey}): Playback started successfully.`)
      }
    } catch (error: any) {
      console.error(`VerseAudioPlayer (${verseKey}): Error in togglePlayPause:`, error)
      setIsLoading(false)
      setIsPlaying(false)

      // Only set error if it's not an interruption
      if (!error.message?.includes("interrupted") && !error.name?.includes("AbortError")) {
        setAudioError(true)
        setAudioAvailable(false)
      }

      if (currentPlayingVerse === verseKey) {
        setCurrentPlayingVerse(null)
      }
    }
  }

  // Update current surah ayahs when allAyahs changes
  useEffect(() => {
    if (allAyahs.length > 0) {
      console.log(`VerseAudioPlayer (${verseKey}): Setting currentSurahAyahs with ${allAyahs.length} ayahs.`)
      setCurrentSurahAyahs(allAyahs)
    }
  }, [allAyahs, setCurrentSurahAyahs])

  const handleAudioClick = async () => {
    console.log(`VerseAudioPlayer (${verseKey}): handleAudioClick called.`)
    try {
      setAudioLoading(true)
      await togglePlayPause()
    } catch (error) {
      setAudioError(true)
      console.error(`VerseAudioPlayer (${verseKey}): Error in handleAudioClick:`, error)
    } finally {
      setAudioLoading(false)
    }
  }

  // Stop playing when another verse starts
  useEffect(() => {
    if (currentPlayingVerse !== verseKey && isPlaying) {
      console.log(`VerseAudioPlayer (${verseKey}): Another verse started playing, stopping self.`)
      handleStop()
    }
  }, [currentPlayingVerse, verseKey, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      console.log(`VerseAudioPlayer (${verseKey}): loadedmetadata - duration: ${audio.duration}`)
      setDuration(audio.duration)
      setIsLoading(false)
      setAudioError(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handlePlay = () => {
      console.log(`VerseAudioPlayer (${verseKey}): play event - setting isPlaying to true.`)
      setIsPlaying(true)
      setShowPlayer(true)
      setCurrentPlayingVerse(verseKey)
    }

    const handlePause = () => {
      console.log(`VerseAudioPlayer (${verseKey}): pause event - setting isPlaying to false.`)
      setIsPlaying(false)
    }

    const handleEnded = async () => {
      console.log(`VerseAudioPlayer (${verseKey}): Audio ended. AutoPlayEnabled: ${autoPlayEnabled}`)
      setIsPlaying(false)
      setCurrentTime(0)

      // Check if auto play is enabled from the provider's state
      if (autoPlayEnabled && currentSurahAyahs.length > 0) {
        console.log(`VerseAudioPlayer (${verseKey}): Auto play is enabled, looking for next verse...`)

        // Find current verse index
        const currentIndex = currentSurahAyahs.findIndex((a) => a.number === ayah.number)

        if (currentIndex !== -1 && currentIndex < currentSurahAyahs.length - 1) {
          // There's a next verse, play it after a short delay
          const nextAyah = currentSurahAyahs[currentIndex + 1]
          console.log(`VerseAudioPlayer (${verseKey}): Auto playing next verse: ${nextAyah.surahId}:${nextAyah.number}`)

          setTimeout(() => {
            const nextVerseEvent = new CustomEvent("autoPlayVerse", {
              detail: { verseKey: `${nextAyah.surahId}_${nextAyah.number}` },
            })
            window.dispatchEvent(nextVerseEvent)
          }, 500) // 500ms delay
        } else {
          console.log(`VerseAudioPlayer (${verseKey}): Reached end of surah or no next verse, stopping auto play.`)
          handleStop() // Stop if no next verse
        }
      } else {
        handleStop() // Stop if auto play is not enabled
      }
    }

    const handleError = (e: any) => {
      console.error(`VerseAudioPlayer (${verseKey}): Audio error:`, e)
      setIsLoading(false)
      setAudioError(true)
      setAudioAvailable(false)
      setIsPlaying(false)
      if (currentPlayingVerse === verseKey) {
        setCurrentPlayingVerse(null)
      }
    }

    const handleLoadStart = () => {
      console.log(`VerseAudioPlayer (${verseKey}): Audio load start.`)
      setIsLoading(true)
      setAudioError(false)
    }

    const handleCanPlay = () => {
      console.log(`VerseAudioPlayer (${verseKey}): Audio can play.`)
      setIsLoading(false)
      setAudioAvailable(true)
      setAudioError(false)
    }

    const handleWaiting = () => {
      console.log(`VerseAudioPlayer (${verseKey}): Audio waiting.`)
      setIsLoading(true)
    }

    const handleCanPlayThrough = () => {
      console.log(`VerseAudioPlayer (${verseKey}): Audio can play through.`)
      setIsLoading(false)
    }

    // Add event listeners
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
  }, [verseKey, currentPlayingVerse, autoPlayEnabled, currentSurahAyahs, ayah.number, setCurrentPlayingVerse])

  // Listen for auto play events
  useEffect(() => {
    const handleAutoPlayVerse = (event: CustomEvent) => {
      if (event.detail.verseKey === verseKey) {
        console.log(`VerseAudioPlayer (${verseKey}): Received autoPlayVerse event.`)
        // Ensure this player is not already playing or loading
        if (!isPlaying && !isLoading) {
          togglePlayPause()
        } else {
          console.log(`VerseAudioPlayer (${verseKey}): Already playing or loading, skipping autoPlay.`)
        }
      }
    }

    window.addEventListener("autoPlayVerse", handleAutoPlayVerse as EventListener)

    return () => {
      window.removeEventListener("autoPlayVerse", handleAutoPlayVerse as EventListener)
    }
  }, [verseKey, isPlaying, isLoading]) // Removed togglePlayPause from dependencies

  const checkAudioAvailability = async () => {
    try {
      const available = await dataService.checkVerseAudioAvailability(1, ayah.surahId, ayah.number)
      console.log(`VerseAudioPlayer (${verseKey}): Audio availability check: ${available}`)
      setAudioAvailable(available)
      setAudioError(!available)
    } catch (error) {
      console.error(`VerseAudioPlayer (${verseKey}): Error checking audio availability:`, error)
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
    console.log(`VerseAudioPlayer (${verseKey}): handleStop called.`)
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Don't render if verse audio is disabled or not available
  // Use verseAudioEnabled from context for dynamic updates
  if (!verseAudioEnabled || (!audioAvailable && !isLoading)) {
    console.log(
      `VerseAudioPlayer (${verseKey}): Not rendering. verseAudioEnabled: ${verseAudioEnabled}, audioAvailable: ${audioAvailable}, isLoading: ${isLoading}`,
    )
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

          {audioLoading ? (
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
