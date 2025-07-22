"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Play, Pause, Bookmark, BookmarkCheck, ArrowLeft, Settings, Type, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { storage } from "@/lib/storage"
import { useAudio } from "@/components/audio-provider"
import { VerseAudioProvider } from "@/components/verse-audio-provider"
import type { Surah, UserPreferences, FavoriteVerse } from "@/lib/types"
import Link from "next/link"
import { VerseAudioPlayer } from "@/components/verse-audio-player"
import { dataService } from "@/lib/data-service"

export default function SurahDetailPage() {
  const params = useParams()
  const surahId = Number.parseInt(params.id as string)
  const [surah, setSurah] = useState<Surah | null>(null)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [favoriteVerses, setFavoriteVerses] = useState<number[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    fontSize: "medium",
    showTranslation: true,
    showTafsir: false,
    autoPlay: false,
    selectedReciter: 1,
    selectedVerseReciter: 1,
    translationLanguage: "english_saheeh",
    verseAudioEnabled: true,
  })
  const [showSettings, setShowSettings] = useState(false)
  const { state, playSurah, togglePlayPause } = useAudio()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSurah = async () => {
    try {
      setIsLoading(true)
      console.log(`Loading surah ${surahId}...`)

      const loadedSurah = await dataService.getSurah(surahId)
      if (loadedSurah) {
        setSurah(loadedSurah)
        console.log(`Loaded surah: ${loadedSurah.nameEnglish} with ${loadedSurah.ayahs.length} verses`)
      } else {
        setError("Surah not found")
      }
    } catch (error) {
      console.error("Error loading surah:", error)
      setError("Failed to load surah")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSurah()

    // Load bookmarks, favorites and preferences
    const userBookmarks = storage
      .getBookmarks()
      .filter((b) => b.surahId === surahId)
      .map((b) => b.ayahId)
    setBookmarks(userBookmarks)

    // Load favorite verses for this surah
    const userFavoriteVerses = storage
      .getFavoriteVerses()
      .filter((f) => f.surahId === surahId)
      .map((f) => f.ayahId)
    setFavoriteVerses(userFavoriteVerses)

    setIsFavorite(storage.isFavorite(surahId))
    setPreferences(storage.getPreferences())
  }, [surahId])

  const toggleBookmark = (ayahId: number) => {
    if (bookmarks.includes(ayahId)) {
      storage.removeBookmark(surahId, ayahId)
      setBookmarks(bookmarks.filter((id) => id !== ayahId))
    } else {
      storage.addBookmark({
        surahId,
        ayahId,
        verseKey: `${surahId}:${ayahId}`,
        timestamp: Date.now(),
      })
      setBookmarks([...bookmarks, ayahId])
    }
  }

  const toggleFavoriteVerse = (ayahId: number) => {
    if (!surah) return

    const ayah = surah.ayahs.find((a) => a.id === ayahId)
    if (!ayah) return

    if (favoriteVerses.includes(ayahId)) {
      storage.removeFavoriteVerse(surahId, ayahId)
      setFavoriteVerses(favoriteVerses.filter((id) => id !== ayahId))
    } else {
      const favoriteVerse: FavoriteVerse = {
        surahId,
        ayahId,
        verseKey: `${surahId}:${ayah.number}`,
        timestamp: Date.now(),
        surahName: surah.nameEnglish,
        verseNumber: ayah.number,
        textArabic: ayah.textArabic,
        textEnglish: ayah.textEnglish,
      }
      storage.addFavoriteVerse(favoriteVerse)
      setFavoriteVerses([...favoriteVerses, ayahId])
    }
  }

  const toggleFavorite = () => {
    if (isFavorite) {
      storage.removeFavorite(surahId)
      setIsFavorite(false)
    } else {
      storage.addFavorite(surahId)
      setIsFavorite(true)
    }
  }

  const updatePreferences = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    storage.setPreferences(newPreferences)
  }

  const getFontSizeClass = () => {
    switch (preferences.fontSize) {
      case "small":
        return "text-lg"
      case "large":
        return "text-2xl"
      default:
        return "text-xl"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading Surah...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error}</p>
          <Link href="/library">
            <Button className="mt-4">Back to Library</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!surah) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Surah not found</p>
          <Link href="/library">
            <Button className="mt-4">Back to Library</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isCurrentlyPlaying = state.currentSurah?.id === surah.id && state.isPlaying

  return (
    <VerseAudioProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/library">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleFavorite}>
              {isFavorite ? <Star className="h-5 w-5 text-yellow-500 fill-current" /> : <Star className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

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
                  <Select value={preferences.fontSize} onValueChange={(value) => updatePreferences("fontSize", value)}>
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
                    onCheckedChange={(checked) => updatePreferences("showTranslation", checked)}
                  />
                  <Label htmlFor="translation">Show Translation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoplay"
                    checked={preferences.autoPlay}
                    onCheckedChange={(checked) => updatePreferences("autoPlay", checked)}
                  />
                  <Label htmlFor="autoplay">Auto Play</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Surah Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center relative">
                    <span className="text-white font-bold text-xl">{surah.id}</span>
                    {isFavorite && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{surah.nameEnglish}</h1>
                    <p className="text-2xl arabic-text text-muted-foreground">{surah.nameArabic}</p>
                    <p className="text-muted-foreground italic">"{surah.meaning}"</p>
                  </div>
                </div>
              </div>
              <Badge variant={surah.revelation === "Meccan" ? "default" : "secondary"}>{surah.revelation}</Badge>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{surah.verses} verses</span>
                <span>•</span>
                <span>{surah.revelation} period</span>
              </div>
            </div>

            {/* Favorite Verses Count - Only show if there are favorites */}
            {favoriteVerses.length > 0 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  {favoriteVerses.length} favorite verse{favoriteVerses.length !== 1 ? "s" : ""} in this surah
                </Badge>
              </div>
            )}

            {/* Play Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => (isCurrentlyPlaying ? togglePlayPause() : playSurah(surah))}
                className="audio-player-gradient text-white"
              >
                {isCurrentlyPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isCurrentlyPlaying ? "Pause" : "Play Audio"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ayahs */}
        <div className="space-y-4">
          {surah.ayahs.map((ayah) => (
            <Card key={ayah.id} className="group">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Ayah Number and Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{ayah.number}</span>
                      </div>
                      <VerseAudioPlayer ayah={ayah} />
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavoriteVerse(ayah.id)}
                        className={`${
                          favoriteVerses.includes(ayah.id)
                            ? "text-pink-500 hover:text-pink-600"
                            : "text-muted-foreground hover:text-pink-500"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${favoriteVerses.includes(ayah.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleBookmark(ayah.id)}>
                        {bookmarks.includes(ayah.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className={`arabic-text ${getFontSizeClass()} leading-relaxed`}>{ayah.textArabic}</div>

                  {/* Translation */}
                  {preferences.showTranslation && (
                    <>
                      <Separator />
                      <p className="text-muted-foreground leading-relaxed">{ayah.textEnglish}</p>
                    </>
                  )}

                  {/* Favorite Indicator */}
                  {favoriteVerses.includes(ayah.id) && (
                    <div className="flex items-center space-x-2 text-xs text-pink-600">
                      <Heart className="h-3 w-3 fill-current" />
                      <span>Added to favorite verses</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <Link href={`/surah/${surah.id - 1}`}>
            <Button variant="outline" disabled={surah.id === 1}>
              Previous Surah
            </Button>
          </Link>
          <Link href={`/surah/${surah.id + 1}`}>
            <Button variant="outline" disabled={surah.id === 114}>
              Next Surah
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">May this Surah bring you peace and guidance</h3>
            <p className="text-sm opacity-90">
              "This is the Book about which there is no doubt, a guidance for those conscious of Allah"
            </p>
            <p className="text-xs opacity-75 mt-2">Created by Umyma Syed</p>
          </div>
        </div>
      </div>
    </VerseAudioProvider>
  )
}
