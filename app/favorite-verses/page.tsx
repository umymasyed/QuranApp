"use client"

import { useState, useEffect } from "react"
import { Heart, BookOpen, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import type { FavoriteVerse } from "@/lib/types"
import Link from "next/link"

export default function FavoriteVersesPage() {
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([])

  useEffect(() => {
    setFavoriteVerses(storage.getFavoriteVerses())
  }, [])

  const removeFavoriteVerse = (surahId: number, ayahId: number) => {
    storage.removeFavoriteVerse(surahId, ayahId)
    setFavoriteVerses(favoriteVerses.filter((v) => !(v.surahId === surahId && v.ayahId === ayahId)))
  }

  const clearAllFavoriteVerses = () => {
    if (confirm("Are you sure you want to clear all favorite verses?")) {
      favoriteVerses.forEach((verse) => {
        storage.removeFavoriteVerse(verse.surahId, verse.ayahId)
      })
      setFavoriteVerses([])
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="h-8 w-8 mr-3 text-pink-500 fill-current" />
            Favorite Verses
          </h1>
          <p className="text-muted-foreground">Your most beloved verses from the Quran</p>
        </div>
        {favoriteVerses.length > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFavoriteVerses}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Favorites Count */}
      {favoriteVerses.length > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
            <Heart className="h-3 w-3 mr-1 fill-current" />
            {favoriteVerses.length} favorite verse{favoriteVerses.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Favorite Verses List */}
      {favoriteVerses.length > 0 ? (
        <div className="space-y-4">
          {favoriteVerses
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((verse) => (
              <Card key={`${verse.surahId}-${verse.ayahId}`} className="group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{verse.surahId}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{verse.surahName}</h3>
                            <p className="text-sm text-muted-foreground">Verse {verse.verseNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Added {new Date(verse.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFavoriteVerse(verse.surahId, verse.ayahId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>

                    {/* Verse Content */}
                    <div className="space-y-3">
                      <div className="arabic-text text-lg leading-relaxed">{verse.textArabic}</div>
                      <p className="text-muted-foreground leading-relaxed">{verse.textEnglish}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end">
                      <Link href={`/surah/${verse.surahId}#ayah-${verse.ayahId}`}>
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Go to Verse
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
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No favorite verses yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start reading surahs and mark your favorite verses to see them here.
            </p>
          </div>
          <Link href="/library">
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Browse Surahs
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
