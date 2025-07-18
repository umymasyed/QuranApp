"use client"

import { useState, useEffect } from "react"
import { Bookmark, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { surahs } from "@/lib/data"
import type { Bookmark as BookmarkType } from "@/lib/types"
import Link from "next/link"

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])

  useEffect(() => {
    setBookmarks(storage.getBookmarks())
  }, [])

  const removeBookmark = (surahId: number, ayahId: number) => {
    storage.removeBookmark(surahId, ayahId)
    setBookmarks(bookmarks.filter((b) => !(b.surahId === surahId && b.ayahId === ayahId)))
  }

  const clearAllBookmarks = () => {
    if (confirm("Are you sure you want to clear all bookmarks?")) {
      bookmarks.forEach((bookmark) => {
        storage.removeBookmark(bookmark.surahId, bookmark.ayahId)
      })
      setBookmarks([])
    }
  }

  const getBookmarkDetails = (bookmark: BookmarkType) => {
    const surah = surahs.find((s) => s.id === bookmark.surahId)
    const ayah = surah?.ayahs.find((a) => a.id === bookmark.ayahId)
    return { surah, ayah }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Bookmark className="h-8 w-8 mr-3 text-primary" />
            Bookmarks
          </h1>
          <p className="text-muted-foreground">Your saved verses and favorite passages</p>
        </div>
        {bookmarks.length > 0 && (
          <Button
            variant="outline"
            onClick={clearAllBookmarks}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Bookmarks Count */}
      {bookmarks.length > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Bookmarks List */}
      {bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((bookmark) => {
              const { surah, ayah } = getBookmarkDetails(bookmark)
              if (!surah || !ayah) return null

              return (
                <Card key={`${bookmark.surahId}-${bookmark.ayahId}`} className="group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{surah.id}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{surah.nameEnglish}</h3>
                              <p className="text-sm text-muted-foreground arabic-text">{surah.nameArabic}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Saved {new Date(bookmark.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBookmark(bookmark.surahId, bookmark.ayahId)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Ayah Content */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Verse {ayah.number}</Badge>
                        </div>
                        <div className="arabic-text text-lg leading-relaxed">{ayah.textArabic}</div>
                        <p className="text-muted-foreground leading-relaxed">{ayah.textEnglish}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end">
                        <Link href={`/surah/${surah.id}#ayah-${ayah.id}`}>
                          <Button variant="outline" size="sm">
                            Go to Surah
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No bookmarks yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start reading surahs and bookmark your favorite verses to see them here.
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
