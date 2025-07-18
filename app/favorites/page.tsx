"use client"

import { useState, useEffect } from "react"
import { Star, Play, Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { dataService } from "@/lib/data-service"
import { useAudio } from "@/components/audio-provider"
import type { Surah } from "@/lib/types"
import Link from "next/link"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Surah[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { playSurah } = useAudio()

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setIsLoading(true)
      const favoriteIds = storage.getFavorites()
      const allSurahs = await dataService.getAllSurahs()
      const favoriteSurahs = allSurahs.filter((surah) => favoriteIds.includes(surah.id))
      setFavorites(favoriteSurahs)
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = (surahId: number) => {
    storage.removeFavorite(surahId)
    setFavorites(favorites.filter((surah) => surah.id !== surahId))
  }

  const clearAllFavorites = () => {
    if (confirm("Are you sure you want to clear all favorite surahs?")) {
      favorites.forEach((surah) => {
        storage.removeFavorite(surah.id)
      })
      setFavorites([])
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Star className="h-8 w-8 mr-3 text-yellow-500" />
            Favorite Surahs
          </h1>
          <p className="text-muted-foreground">Your most beloved chapters of the Quran</p>
        </div>
        {favorites.length > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFavorites}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Favorites Count */}
      {favorites.length > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="favorite-badge text-white">
            <Star className="h-3 w-3 mr-1" />
            {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {favorites.map((surah) => (
            <Card key={surah.id} className="surah-card-hover group">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center relative">
                        <span className="text-white font-bold">{surah.id}</span>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{surah.nameEnglish}</h3>
                        <p className="text-xl arabic-text text-muted-foreground">{surah.nameArabic}</p>
                        <p className="text-sm text-muted-foreground italic">"{surah.meaning}"</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(surah.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{surah.verses} verses</span>
                    <Badge variant={surah.revelation === "Meccan" ? "default" : "secondary"}>{surah.revelation}</Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="default" size="sm" onClick={() => playSurah(surah)} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>

                  {/* Read Link */}
                  <div className="mt-4">
                    <Link href={`/surah/${surah.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Read Full Surah
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No favorite surahs yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start exploring surahs and mark your favorites to see them here.
            </p>
          </div>
          <Link href="/library">
            <Button>Browse Surahs</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
