"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface VerseAudioState {
  currentPlayingVerse: string | null // Format: "surahId_ayahId"
  setCurrentPlayingVerse: (verseKey: string | null) => void
}

const VerseAudioContext = createContext<VerseAudioState | null>(null)

export function VerseAudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState<string | null>(null)

  return (
    <VerseAudioContext.Provider value={{ currentPlayingVerse, setCurrentPlayingVerse }}>
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
