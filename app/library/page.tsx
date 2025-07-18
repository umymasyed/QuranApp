"use client"

import { useState, useEffect } from "react"
import { Search, Play, Download, Filter, Loader2, Star, Heart, Volume2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dataService } from "@/lib/data-service"
import { storage } from "@/lib/storage"
import { useAudio } from "@/components/audio-provider"
import type { Surah } from "@/lib/types"
import Link from "next/link"

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const { playSurah, state } = useAudio()

  useEffect(() => {
    loadSurahs()
    setFavorites(storage.getFavorites())
  }, [])

  useEffect(() => {
    filterSurahs()
  }, [surahs, searchQuery, filterBy])

  const loadSurahs = async () => {
    try {
      setIsLoading(true)
      const allSurahs = await dataService.getAllSurahs()
      setSurahs(allSurahs)
    } catch (error) {
      console.error("Error loading surahs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSurahs = () => {
    let filtered = surahs

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (surah) =>
          surah.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.nameArabic.includes(searchQuery) ||
          surah.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply revelation filter
    if (filterBy !== "all") {
      filtered = filtered.filter((surah) => surah.revelation.toLowerCase() === filterBy)
    }

    setFilteredSurahs(filtered)
  }

  const toggleFavorite = (surahId: number) => {
    if (favorites.includes(surahId)) {
      storage.removeFavorite(surahId)
      setFavorites(favorites.filter((id) => id !== surahId))
    } else {
      storage.addFavorite(surahId)
      setFavorites([...favorites, surahId])
    }
  }

  const handlePlaySurah = (surah: Surah) => {
    console.log("Playing surah from library:", surah.nameEnglish)
    playSurah(surah)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading Quran library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Quran Library
          </h1>
          <p className="text-muted-foreground text-lg">Explore all 114 chapters of the Holy Quran</p>
          <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mx-auto"></div>
        </div>

        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search surahs by name, meaning, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg border-2 focus:border-primary"
            />
          </div>

          <div className="flex justify-center">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48 h-10">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by revelation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surahs</SelectItem>
                <SelectItem value="meccan">Meccan (87)</SelectItem>
                <SelectItem value="medinan">Medinan (27)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{filteredSurahs.length}</div>
          <div className="text-sm text-muted-foreground">Surahs</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600">6,236</div>
          <div className="text-sm text-muted-foreground">Verses</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-600">5</div>
          <div className="text-sm text-muted-foreground">Reciters</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-yellow-600">{favorites.length}</div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-muted-foreground">
          {searchQuery ? `Found ${filteredSurahs.length} surahs` : `Showing all ${filteredSurahs.length} surahs`}
        </p>
      </div>

      {/* Surah Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filteredSurahs.map((surah) => {
          const isCurrentlyPlaying = state.currentSurah?.id === surah.id && state.isPlaying
          const isLoading = state.currentSurah?.id === surah.id && state.isLoading
          const isFavorite = favorites.includes(surah.id)

          return (
            <Card
              key={surah.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50 dark:from-green-900/10 dark:to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <CardContent className="p-6 relative">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg relative">
                          <span className="text-white font-bold text-lg">{surah.id}</span>
                          {isFavorite && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Star className="h-3 w-3 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{surah.nameEnglish}</h3>
                          <p className="text-lg arabic-text text-muted-foreground truncate">{surah.nameArabic}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground italic">"{surah.meaning}"</p>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={surah.revelation === "Meccan" ? "default" : "secondary"}
                            className={
                              surah.revelation === "Meccan"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : ""
                            }
                          >
                            {surah.revelation}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{surah.verses} verses</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(surah.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isFavorite ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePlaySurah(surah)}
                      className="flex-1 audio-player-gradient text-white hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : isCurrentlyPlaying ? (
                        <Volume2 className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Loading..." : isCurrentlyPlaying ? "Playing" : "Play"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => window.open(await dataService.getAudioUrl(surah.id, 1), "_blank")}
                      className="bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Read Link */}
                  <div className="mt-4">
                    <Link href={`/surah/${surah.id}`}>
                      <Button variant="outline" className="w-full bg-transparent hover:bg-primary/5 border-primary/20">
                        <Heart className="h-4 w-4 mr-2" />
                        Read Full Surah
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredSurahs.length === 0 && !isLoading && (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No surahs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
          <Button
            onClick={() => {
              setSearchQuery("")
              setFilterBy("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white max-w-2xl mx-auto">
          <h3 className="font-semibold mb-2">Complete Quran Collection</h3>
          <p className="text-sm opacity-90">All 114 Surahs with beautiful recitations and translations</p>
          <p className="text-xs opacity-75 mt-2">Created by Umyma Syed</p>
        </div>
      </div>
    </div>
  )
}
