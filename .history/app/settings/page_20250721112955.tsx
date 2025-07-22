"use client"

import { useState, useEffect } from "react"
import { Settings, Sun, Type, Volume2, Trash2, Download, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { storage } from "@/lib/storage"
import type { UserPreferences } from "@/lib/types"
import { useAudio } from "@/components/audio-provider" // Import useAudio
import { useVerseAudio } from "@/components/verse-audio-provider" // Import useVerseAudio

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { updateAutoPlay: updateSurahAutoPlay, dispatch: audioDispatch } = useAudio() // Get updateAutoPlay and dispatch from AudioProvider
  const { updateVerseAudioEnabled, updateAutoPlayEnabled: updateVerseAutoPlay } = useVerseAudio() // Get updateVerseAudioEnabled and updateAutoPlayEnabled from VerseAudioProvider

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system", // Default to system
    fontSize: "medium",
    showTranslation: true,
    showTafsir: false,
    autoPlay: false,
    selectedReciter: 1,
    selectedVerseReciter: 1,
    translationLanguage: "english_saheeh",
    verseAudioEnabled: true,
    volume: 0.7, // Default volume
  })

  // Local state for volume slider, derived from preferences.volume (0-100)
  const [localVolumePercentage, setLocalVolumePercentage] = useState<number>(70)

  // Hydrate preferences on client side and set initial local volume
  useEffect(() => {
    try {
      const loadedPreferences = storage.getPreferences()
      console.log("SettingsPage: Loaded preferences on mount:", loadedPreferences)
      setPreferences(loadedPreferences)
      // Set the local volume state based on loaded preferences, converting to percentage
      setLocalVolumePercentage(Math.round((loadedPreferences.volume ?? 0.7) * 100))
      // Also update the audio provider's volume state
      audioDispatch({ type: "SET_VOLUME", payload: loadedPreferences.volume ?? 0.7 })
      // Set theme from preferences
      setTheme(loadedPreferences.theme)
    } catch (error) {
      console.error("SettingsPage: Error loading preferences on init:", error)
    }
  }, [audioDispatch, setTheme])

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    storage.setPreferences(newPreferences)
    console.log(`SettingsPage: Updated preference ${key} to:`, value)

    // Special handling for theme, autoPlay, verseAudioEnabled, and volume to update providers directly
    if (key === "theme") {
      setTheme(value)
    } else if (key === "autoPlay") {
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
    setLocalVolumePercentage(newVolumePercentage)
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
      setPreferences(defaultPrefs)
      setLocalVolumePercentage(Math.round((defaultPrefs.volume ?? 0.7) * 100)) // Reset volume slider
      // Also reset provider states
      updateSurahAutoPlay(defaultPrefs.autoPlay)
      updateVerseAutoPlay(defaultPrefs.autoPlay) // Reset verse auto play
      updateVerseAudioEnabled(defaultPrefs.verseAudioEnabled) // Reset verse audio enabled
      audioDispatch({ type: "SET_VOLUME", payload: defaultPrefs.volume ?? 0.7 })
      setTheme(defaultPrefs.theme) // Reset theme
      alert("All data has been cleared.")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-3" />
          Settings
        </h1>
        <p className="text-muted-foreground">Customize your Quran reading experience</p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="h-5 w-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange("theme", value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reading Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Font Size</Label>
              <p className="text-sm text-muted-foreground">Adjust text size for comfortable reading</p>
            </div>
            <Select value={preferences.fontSize} onValueChange={(value) => handlePreferenceChange("fontSize", value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Translation</Label>
              <p className="text-sm text-muted-foreground">Display English translation alongside Arabic text</p>
            </div>
            <Switch
              checked={preferences.showTranslation}
              onCheckedChange={(checked) => handlePreferenceChange("showTranslation", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Tafsir</Label>
              <p className="text-sm text-muted-foreground">Display commentary and explanation for each verse</p>
            </div>
            <Switch
              checked={preferences.showTafsir}
              onCheckedChange={(checked) => handlePreferenceChange("showTafsir", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
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
              <span className="text-sm text-muted-foreground">{localVolumePercentage}%</span>
            </div>
            <Slider
              value={[localVolumePercentage]}
              onValueChange={handleVolumeSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage & Data */}
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

      {/* About */}
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
    </div>
  )
}
