"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useAudio } from "./audio-provider"

export function AudioPlayer() {
  const { state, dispatch, audioRef, togglePlayPause, seekTo } = useAudio()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSeek = (value: number[]) => {
    if (value[0] !== undefined) {
      seekTo(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    if (audioRef?.current) {
      audioRef.current.volume = newVolume
    }
    dispatch({ type: "SET_VOLUME", payload: newVolume })
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      const newVolume = previousVolume
      if (audioRef?.current) {
        audioRef.current.volume = newVolume
      }
      dispatch({ type: "SET_VOLUME", payload: newVolume })
      setIsMuted(false)
    } else {
      setPreviousVolume(state.volume)
      if (audioRef?.current) {
        audioRef.current.volume = 0
      }
      dispatch({ type: "SET_VOLUME", payload: 0 })
      setIsMuted(true)
    }
  }

  // Don't render if no current surah
  if (!state.currentSurah) return null

  return (
    <>
      {/* Desktop Player */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t p-4 z-30">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{state.currentSurah.id}</span>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold truncate">{state.currentSurah.nameEnglish}</h4>
              <p className="text-sm text-muted-foreground truncate arabic-text">{state.currentSurah.nameArabic}</p>
              <p className="text-xs text-green-600">Mishary Rashid Al Afasy</p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md mx-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" disabled>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : state.isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" disabled>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(state.currentTime)}</span>
              <Slider
                value={[state.currentTime || 0]}
                max={state.duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
                disabled={!state.duration}
              />
              <span className="text-xs text-muted-foreground w-10">{formatTime(state.duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-1 justify-end">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted || state.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[(state.volume || 0) * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Player */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-30">
        {!isExpanded ? (
          <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{state.currentSurah.id}</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium truncate text-sm">{state.currentSurah.nameEnglish}</h4>
                <p className="text-xs text-muted-foreground truncate arabic-text">{state.currentSurah.nameArabic}</p>
                <p className="text-xs text-green-600">Mishary Al Afasy</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                togglePlayPause()
              }}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : state.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                <SkipBack className="h-4 w-4 rotate-90" />
              </Button>
              <div className="text-center">
                <h4 className="font-semibold">{state.currentSurah.nameEnglish}</h4>
                <p className="text-sm text-muted-foreground arabic-text">{state.currentSurah.nameArabic}</p>
                <p className="text-xs text-green-600">Mishary Rashid Al Afasy</p>
              </div>
              <div className="w-10" />
            </div>

            <div className="space-y-2">
              <Slider
                value={[state.currentTime || 0]}
                max={state.duration || 100}
                step={1}
                onValueChange={handleSeek}
                disabled={!state.duration}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6">
              <Button variant="ghost" size="icon" disabled>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : state.isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button variant="ghost" size="icon" disabled>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted || state.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[(state.volume || 0) * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1 max-w-32"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
