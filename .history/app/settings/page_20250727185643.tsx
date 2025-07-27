"use client"

import { useState, useEffect } from "react"
import { Settings, Sun, Type, Volume2, Trash2, Download, BookOpen, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { storage } from "@/lib/storage"
import type { UserPreferences } from "@/lib/types"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    showTranslation: true,
    showUrduTranslation: false,
    showTafsir: false,
    autoPlay: false,
    surahPageVerseAutoPlay: false,
    selectedReciter: 1,
    selectedVerseReciter: 1,
    verseAudioEnabled: true,
    defaultVolume: 70,
  })

  useEffect(() => {
    setPreferences(storage.getPreferences())
  }, [])

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    storage.setPreferences(newPreferences)
  }

  const clearAllData = () => {
    if (
      confirm("Are you sure you want to clear all app data? This will remove all bookmarks, history, and preferences.")
    ) {
      storage.clearAll()
      setPreferences({
        theme: "light",
        showTranslation: true,
        showUrduTranslation: false,
        showTafsir: false,
        autoPlay: false,
        surahPageVerseAutoPlay: false,
        selectedReciter: 1,
        selectedVerseReciter: 1,
        verseAudioEnabled: true,
        defaultVolume: 70,
      })
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
      <p className="text-sm text-muted-foreground">
        Choose your preferred color scheme
      </p>
    </div>
    
    {/* Custom styled select dropdown */}
    <div className="relative">
     <select
  value={theme}
  onChange={(e) => setTheme(e.target.value)}
  className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
  <option value="system">System</option>
</select>


      {/* Dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</CardContent>

      </Card>

      {/* Reading Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Reading & Translation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show English Translation</Label>
              <p className="text-sm text-muted-foreground">Display English translation alongside Arabic text</p>
            </div>
            <Switch
              checked={preferences.showTranslation}
              onCheckedChange={(checked) => updatePreference("showTranslation", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center">
                <Languages className="h-4 w-4 mr-2" />
                Show Urdu Translation
              </Label>
              <p className="text-sm text-muted-foreground">
                Display Urdu translation below English translation (اردو ترجمہ انگریزی کے نیچے دکھائیں)
              </p>
            </div>
            <Switch
              checked={preferences.showUrduTranslation}
              onCheckedChange={(checked) => updatePreference("showUrduTranslation", checked)}
              disabled={!preferences.showTranslation}
            />
          </div>

          {!preferences.showTranslation && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Enable "Show English Translation" first to use Urdu translation
              </p>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Tafsir</Label>
              <p className="text-sm text-muted-foreground">Display commentary and explanation for each verse</p>
            </div>
            <Switch
              checked={preferences.showTafsir}
              onCheckedChange={(checked) => updatePreference("showTafsir", checked)}
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
              <p className="text-sm text-muted-foreground">
                Enable autoplay for surah-to-surah playback. Also required for verse-to-verse autoplay (along with surah
                page setting).
              </p>
            </div>
            <Switch
              checked={preferences.autoPlay}
              onCheckedChange={(checked) => updatePreference("autoPlay", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Verse Audio</Label>
              <p className="text-sm text-muted-foreground">Enable individual verse audio playback buttons</p>
            </div>
            <Switch
              checked={preferences.verseAudioEnabled}
              onCheckedChange={(checked) => updatePreference("verseAudioEnabled", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Default Volume</Label>
              <span className="text-sm text-muted-foreground">{preferences.defaultVolume}%</span>
            </div>
            <Slider
              value={[preferences.defaultVolume]}
              onValueChange={(value) => updatePreference("defaultVolume", value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This volume will be applied when any audio starts and on page reload
            </p>
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
              Mishary Rashid Al Afasy, translations in English and Urdu, and Tafsir.
            </p>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Version 2.1.0 - Dual Translation Edition</p>
            <p>All 114 Surahs • Mishary Al Afasy Recitation • English & Urdu Translations • Tafsir Support</p>
            <p>Built with Next.js and Tailwind CSS</p>
            <p>Audio by Mishary Rashid Al Afasy (مشاري بن راشد العفاسي)</p>
            <p>Created by Umyma Syed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
