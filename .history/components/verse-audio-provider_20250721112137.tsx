"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import type { Ayah } from "@/lib/types"

interface VerseAudioState {
  currentPlayingVerse: string | null // Format: "surahId_ayahId"
  setCurrentPlayingVerse: (verseKey: string | null) => void
  autoPlayEnabled: boolean
  updateAutoPlayEnabled: (enabled: boolean) => void // Renamed for consistency
  currentSurahAyahs: Ayah[] // Store current surah's ayahs for auto play
  setCurrentSurahAyahs: (ayahs: Ayah[]) => void
  verseAudioEnabled: boolean // Added verseAudioEnabled state
  updateVerseAudioEnabled: (enabled: boolean) => void // Added setter for verseAudioEnabled
}

const VerseAudioContext = createContext<VerseAudioState | null>(null)

export function VerseAudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState<string | null>(null)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(false)
  const [currentSurahAyahs, setCurrentSurahAyahs] = useState<Ayah[]>([])
  const [verseAudioEnabled, setVerseAudioEnabled] = useState<boolean>(true) // Initialize verseAudioEnabled

  // Initialize autoPlayEnabled and verseAudioEnabled from storage
  useEffect(() => {
    try {
      const preferences = storage.getPreferences()
      console.log("VerseAudioProvider: Initializing from preferences:", preferences)
      setAutoPlayEnabled(preferences.autoPlay || false)
      setVerseAudioEnabled(preferences.verseAudioEnabled ?? true) // Use nullish coalescing for default
    } catch (error) {
      console.error("VerseAudioProvider: Error loading preferences on init:", error)
      setAutoPlayEnabled(false) // Default to false on error
      setVerseAudioEnabled(true) // Default to true on error
    }
  }, [])

  // Listen for changes in global autoPlay and verseAudioEnabled settings from storage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "preferences") {
        try {
          const updatedPreferences = JSON.parse(event.newValue || "{}")
          if (typeof updatedPreferences.autoPlay === "boolean") {
            console.log(
              "VerseAudioProvider: Storage change detected, updating autoPlayEnabled to:",
              updatedPreferences.autoPlay,
            )
            setAutoPlayEnabled(updatedPreferences.autoPlay)
          }
          if (typeof updatedPreferences.verseAudioEnabled === "boolean") {
            console.log(
              "VerseAudioProvider: Storage change detected, updating verseAudioEnabled to:",
              updatedPreferences.verseAudioEnabled,
            )
            setVerseAudioEnabled(updatedPreferences.verseAudioEnabled)
          }
        } catch (error) {
          console.error("VerseAudioProvider: Error parsing updated preferences from storage event:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const updateAutoPlayEnabled = (enabled: boolean) => {
    setAutoPlayEnabled(enabled)
    // Update localStorage directly for this preference
    try {
      const preferences = storage.getPreferences()
      storage.setPreferences({ ...preferences, autoPlay: enabled })
    } catch (error) {
      console.error("VerseAudioProvider: Error updating autoPlay preference in storage:", error)
    }
  }

  const updateVerseAudioEnabled = (enabled: boolean) => {
    setVerseAudioEnabled(enabled)
    // Update localStorage directly for this preference
    try {
      const preferences = storage.getPreferences()
      storage.setPreferences({ ...preferences, verseAudioEnabled: enabled })
    } catch (error) {
      console.error("VerseAudioProvider: Error updating verseAudioEnabled preference in storage:", error)
    }
  }

  return (
    <VerseAudioContext.Provider
      value={{
        currentPlayingVerse,
        setCurrentPlayingVerse,
        autoPlayEnabled,
        updateAutoPlayEnabled,
        currentSurahAyahs,
        setCurrentSurahAyahs,
        verseAudioEnabled, // Provide verseAudioEnabled
        updateVerseAudioEnabled, // Provide setter for verseAudioEnabled
      }}
    >
      {children}
    </VerseAudioContext.Provider>
  )
}

export function useVerseAudio() {
  const context = useContext(VerseAudioContext)
  if (!context) {
    throw new Error("useVerseAudio must be used within VerseAudioProvider")
  }
  return context
}
