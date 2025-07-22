"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
// Removed: import { useTheme } from "next-themes"
import { useAudio } from "@/components/audio-provider"
import { useVerseAudio } from "@/components/verse-audio-provider"
import type { UserPreferences } from "@/lib/types"
import { Type, Volume2, Trash2, Download, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/storage"
import { useState, useEffect } from "react"

interface SurahSettingsControlsProps {
  preferences: UserPreferences
  updatePreferences: (key: keyof UserPreferences, value: any) => void
  showSettings: boolean
  setShowSettings: (show: boolean) => void
}

export function SurahSettingsControls({
  preferences,
  updatePreferences,
  showSettings,
  setShowSettings,
}: SurahSettingsControlsProps) {
  // Removed: const { theme, setTheme } = useTheme()
  const { updateAutoPlay: updateSurahAutoPlay, dispatch: audioDispatch } = useAudio()
  const { updateVerseAudioEnabled, updateAutoPlayEnabled: updateVerseAutoPlay } = useVerseAudio()

  // Local state for volume slider, synced with preferences.volume
  const [volume, setVolume] = useState<number>(Math.round((preferences.volume ?? 0.7) * 100))

  // Sync local volume state when preferences.volume changes externally
  useEffect(() => {
    setVolume(Math.round((preferences.volume ?? 0.7) * 100))
  }, [preferences.volume])

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    updatePreferences(key, value) // Update parent's preferences state and storage

    // Special handling for audio-related settings to update providers directly
    if (key === "autoPlay") {
      updateSurahAutoPlay(value) // Update AudioProvider's autoPlay state
      updateVerseAutoPlay(value) // Update VerseAudioProvider's autoPlay state
    } else if (key === "verseAudioEnabled") {
      updateVerseAudioEnabled(value) // Update VerseAudioProvider's verseAudioEnabled state
    } else if (key === "volume") {
      audioDispatch({ type: "SET_VOLUME", payload: value })
    }
  }

  const handleVolumeSliderChange = (value: number[]) => {
    const newVolumePercentage = value[0]
    setVolume(newVolumePercentage)
    // Convert percentage to a 0-1 float for storage and audio provider
    handlePreferenceChange("volume", newVolumePercentage / 100)
  }

  const clearAllData = () => {
    if (
      confirm("Are you sure you want to clear all app data? This will remove all bookmarks, history, and preferences.")
    ) {
      storage.clearAll()
      // Reset preferences to default values after clearing
      const defaultPrefs = storage.getPreferences() // Get fresh defaults
      updatePreferences("theme", defaultPrefs.theme) // Update theme via parent handler
      updatePreferences("fontSize", defaultPrefs.fontSize)
      updatePreferences("showTranslation", defaultPrefs.showTranslation)
      updatePreferences("showTafsir", defaultPrefs.showTafsir)
      updatePreferences("autoPlay", defaultPrefs.autoPlay)
      updatePreferences("selectedReciter", defaultPrefs.selectedReciter)
      updatePreferences("selectedVerseReciter", defaultPrefs.selectedVerseReciter)
      updatePreferences("translationLanguage", defaultPrefs.translationLanguage)
      updatePreferences("verseAudioEnabled", defaultPrefs.verseAudioEnabled)
      updatePreferences("volume", defaultPrefs.volume)

      // Removed: setTheme(defaultPrefs.theme) // Reset theme directly
      alert("All data has been cleared.")
    }
  }

  return (
    <>
      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center">
              <Type className="h-4 w-4 mr-2" />
              Reading Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={preferences.fontSize}
                  onValueChange={(value) => handlePreferenceChange("fontSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="translation"
                  checked={preferences.showTranslation}
                  onCheckedChange={(checked) => handlePreferenceChange("showTranslation", checked)}
                />
                <Label htmlFor="translation">Show Translation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoplay"
                  checked={preferences.autoPlay}
                  onCheckedChange={(checked) => handlePreferenceChange("autoPlay", checked)}
                />
                <Label htmlFor="autoplay">Auto Play</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Settings (from original settings page, moved here) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            Audio Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Volume2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Mishary Rashid Al Afasy</h3>
                <p className="text-sm text-green-600 dark:text-green-300 arabic-text">مشاري بن راشد العفاسي</p>
                <p className="text-xs text-green-600 dark:text-green-400">Premium Reciter - Beautiful Voice</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto Play</Label>
              <p className="text-sm text-muted-foreground">Automatically play next surah when current one ends</p>
            </div>
            <Switch
              checked={preferences.autoPlay}
              onCheckedChange={(checked) => handlePreferenceChange("autoPlay", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Verse Audio</Label>
              <p className="text-sm text-muted-foreground">Enable individual verse audio playback</p>
            </div>
            <Switch
              checked={preferences.verseAudioEnabled}
              onCheckedChange={(checked) => handlePreferenceChange("verseAudioEnabled", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Default Volume</Label>
              <span className="text-sm text-muted-foreground">{volume}%</span>
            </div>
            <Slider value={[volume]} onValueChange={handleVolumeSliderChange} max={100} step={1} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Storage & Data (from original settings page, moved here) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Storage & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Bookmarks</Label>
                <p className="text-sm text-muted-foreground">{storage.getBookmarks().length} saved verses</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Recently Played</Label>
                <p className="text-sm text-muted-foreground">{storage.getRecentlyPlayed().length} surahs in history</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-destructive">Clear All Data</Label>
                <p className="text-sm text-muted-foreground">Remove all bookmarks, history, and preferences</p>
              </div>
              <Button variant="destructive" onClick={clearAllData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About (from original settings page, moved here) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Complete Quran App</h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive Quran reading and listening experience with all 114 chapters, beautiful recitation by
              Mishary Rashid Al Afasy, translations, and Tafsir.
            </p>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Version 2.0.0 - Complete Edition</p>
            <p>All 114 Surahs • Mishary Al Afasy Recitation • Tafsir Support</p>
            <p>Built with Next.js and Tailwind CSS</p>
            <p>Audio by Mishary Rashid Al Afasy (مشاري بن راشد العفاسي)</p>
            <p>Created by Umyma Syed</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
