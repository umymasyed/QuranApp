"use client"

import { useState, useEffect } from "react"
import { Search, Play, Clock, Star, Loader2, AlertCircle, Heart, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dataService, featuredSurahIds } from "@/lib/data-service"
import { storage } from "@/lib/storage"
import { useAudio } from "@/components/audio-provider"
import type { Surah } from "@/lib/types"
import Link from "next/link"

// Daily verses for peace of heart
const dailyVerses = [
  {
    arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    english:
      "Those who believe and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest.",
    reference: "Ar-Ra'd 13:28",
  },
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    english: "For indeed, with hardship comes ease.",
    reference: "Ash-Sharh 94:5",
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    english: "And whoever fears Allah - He will make for him a way out.",
    reference: "At-Talaq 65:2",
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    english: "Allah does not charge a soul except with that within His capacity.",
    reference: "Al-Baqarah 2:286",
  },
  {
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    english: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah.'",
    reference: "Az-Zumar 39:53",
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentlyPlayed, setRecentlyPlayed] = useState<Surah[]>([])
  const [featuredSurahs, setFeaturedSurahs] = useState<Surah[]>([])
  const [searchResults, setSearchResults] = useState<{ surahs: Surah[]; verses: any[] }>({ surahs: [], verses: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyVerse, setDailyVerse] = useState(dailyVerses[0])
  const { playSurah } = useAudio()

  useEffect(() => {
    loadInitialData()
    setDailyVerseOfTheDay()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setSearchResults({ surahs: [], verses: [] })
    }
  }, [searchQuery])

  const setDailyVerseOfTheDay = () => {
    // Get verse based on current day
    const today = new Date().getDay()
    const verseIndex = today % dailyVerses.length
    setDailyVerse(dailyVerses[verseIndex])
  }

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Loading initial data...")

      // Load recently played from localStorage
      setRecentlyPlayed(storage.getRecentlyPlayed())

      // Load featured surahs
      const allSurahs = await dataService.getAllSurahs()
      console.log(`Loaded ${allSurahs.length} surahs`)

      if (allSurahs.length === 0) {
        setError("Unable to load Quran data. Please check your internet connection.")
        return
      }

      const featured = allSurahs.filter((surah) => featuredSurahIds.includes(surah.id))
      setFeaturedSurahs(featured)

      console.log(`Featured surahs: ${featured.length}`)
    } catch (error) {
      console.error("Error loading initial data:", error)
      setError("Failed to load Quran data. Using offline mode.")
    } finally {
      setIsLoading(false)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const results = await dataService.searchContent(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching:", error)
      setError("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Quran data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome to Quran App</h1>
            <p className="text-muted-foreground text-sm md:text-base">Continue your spiritual journey</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search surahs and verses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>

      {/* Daily Verse for Peace */}
      {!searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h2 className="text-lg md:text-xl font-semibold">Verse for Peace of Heart</h2>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>
          <Card className="peace-verse-card">
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div className="arabic-text text-xl md:text-2xl leading-relaxed">{dailyVerse.arabic}</div>
                <div className="text-muted-foreground leading-relaxed italic">"{dailyVerse.english}"</div>
                <div className="text-sm text-muted-foreground">— {dailyVerse.reference} —</div>
                <Link href="/peace">
                  <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                    <Heart className="h-4 w-4 mr-2" />
                    More Peace Verses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Search Results */}
      {searchQuery && (
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Search Results</h2>

          {searchResults.surahs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-medium text-muted-foreground">Surahs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {searchResults.surahs.map((surah) => (
                  <Card key={surah.id} className="surah-card-hover cursor-pointer group">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{surah.id}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm md:text-base truncate">{surah.nameEnglish}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground arabic-text truncate">
                              {surah.nameArabic}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{surah.meaning}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => playSurah(surah)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.surahs.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}
        </section>
      )}

      {/* Recently Played */}
      {!searchQuery && recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg md:text-xl font-semibold">Recently Played</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {recentlyPlayed.slice(0, 6).map((surah) => (
              <Card key={surah.id} className="surah-card-hover cursor-pointer group">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{surah.id}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{surah.nameEnglish}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground arabic-text truncate">
                          {surah.nameArabic}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playSurah(surah)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Featured Surahs */}
      {!searchQuery && featuredSurahs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg md:text-xl font-semibold">Featured Surahs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredSurahs.map((surah) => (
              <Card key={surah.id} className="surah-card-hover cursor-pointer group">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 min-w-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm md:text-lg">{surah.id}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base md:text-lg">{surah.nameEnglish}</h3>
                          <p className="text-base md:text-lg arabic-text text-muted-foreground">{surah.nameArabic}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">{surah.meaning}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playSurah(surah)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                      <span>{surah.verses} verses</span>
                      <span>{surah.revelation}</span>
                    </div>
                    <Link href={`/surah/${surah.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Read Surah
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* No Data Fallback */}
      {!searchQuery && featuredSurahs.length === 0 && !isLoading && (
        <div className="text-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Unable to load Quran data</h3>
            <p className="text-muted-foreground">Please check your internet connection and try again.</p>
          </div>
          <Button onClick={loadInitialData}>
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-2">May Allah guide us all</h3>
          <p className="text-sm opacity-90">
            "And We made from them leaders guiding by Our command when they were patient and were certain of Our signs."
          </p>
          <p className="text-xs opacity-75 mt-2">Created by Umyma Syed</p>
        </div>
      </div>
    </div>
  )
}
