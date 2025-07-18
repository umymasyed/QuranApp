"use client"

import { useState } from "react"
import { Heart, Play, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAudio } from "@/components/audio-provider"
import Link from "next/link"

const peaceVerses = [
  {
    id: 1,
    surahId: 2,
    surahName: "Al-Baqarah",
    verseNumber: 255,
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    english:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
    category: "Protection",
  },
  {
    id: 2,
    surahId: 13,
    surahName: "Ar-Ra'd",
    verseNumber: 28,
    arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    english:
      "Those who believe and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest.",
    category: "Peace of Heart",
  },
  {
    id: 3,
    surahId: 94,
    surahName: "Ash-Sharh",
    verseNumber: 5,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    english: "For indeed, with hardship comes ease.",
    category: "Hope",
  },
  {
    id: 4,
    surahId: 65,
    surahName: "At-Talaq",
    verseNumber: 2,
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    english: "And whoever fears Allah - He will make for him a way out.",
    category: "Trust in Allah",
  },
  {
    id: 5,
    surahId: 3,
    surahName: "Ali Imran",
    verseNumber: 159,
    arabic: "فَاعْفُ عَنْهُمْ وَاسْتَغْفِرْ لَهُمْ وَشَاوِرْهُمْ فِي الْأَمْرِ",
    english: "So pardon them and ask forgiveness for them and consult them in the matter.",
    category: "Forgiveness",
  },
  {
    id: 6,
    surahId: 25,
    surahName: "Al-Furqan",
    verseNumber: 63,
    arabic: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا",
    english: "And the servants of the Most Merciful are those who walk upon the earth easily.",
    category: "Humility",
  },
  {
    id: 7,
    surahId: 39,
    surahName: "Az-Zumar",
    verseNumber: 53,
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    english: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah.'",
    category: "Mercy",
  },
  {
    id: 8,
    surahId: 2,
    surahName: "Al-Baqarah",
    verseNumber: 286,
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    english: "Allah does not charge a soul except with that within its capacity.",
    category: "Comfort",
  },
]

const categories = [
  "All",
  "Peace of Heart",
  "Protection",
  "Hope",
  "Trust in Allah",
  "Forgiveness",
  "Humility",
  "Mercy",
  "Comfort",
]

export default function PeaceVersesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { playSurah } = useAudio()

  const filteredVerses =
    selectedCategory === "All" ? peaceVerses : peaceVerses.filter((verse) => verse.category === selectedCategory)

  const playVerseAudio = async (verse: any) => {
    // For now, we'll play the full surah. In a complete implementation,
    // we could add individual verse audio
    const surah = {
      id: verse.surahId,
      nameEnglish: verse.surahName,
      nameArabic: verse.surahName,
      meaning: verse.surahName,
      verses: 1,
      revelation: "Meccan" as const,
      audioUrl: "",
      ayahs: [],
    }
    playSurah(surah)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="h-8 w-8 mr-3 text-pink-500" />
            Verses for Peace of Heart
          </h1>
          <p className="text-muted-foreground">Find comfort and tranquility in these beautiful verses</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
            >
              {category === "All" && <Sparkles className="h-3 w-3 mr-1" />}
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Verses Grid */}
      <div className="space-y-4">
        {filteredVerses.map((verse) => (
          <Card key={verse.id} className="peace-verse-card group">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{verse.surahId}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{verse.surahName}</h3>
                        <p className="text-sm text-muted-foreground">Verse {verse.verseNumber}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {verse.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => playVerseAudio(verse)}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <Link href={`/surah/${verse.surahId}`}>
                      <Button variant="ghost" size="icon">
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="arabic-text text-xl leading-relaxed text-center py-4">{verse.arabic}</div>

                {/* English Translation */}
                <div className="text-center">
                  <p className="text-muted-foreground leading-relaxed italic">"{verse.english}"</p>
                </div>

                {/* Reference */}
                <div className="text-center text-sm text-muted-foreground">
                  — {verse.surahName} {verse.verseNumber} —
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredVerses.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verses found in this category.</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-2">May these verses bring peace to your heart</h3>
          <p className="text-sm opacity-90">
            "And it is in the remembrance of Allah that hearts find rest" - Quran 13:28
          </p>
          <p className="text-xs opacity-75 mt-2">Created by Umyma Syed</p>
        </div>
      </div>
    </div>
  )
}
