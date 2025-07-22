export interface Surah {
  id: number
  name: string
  nameArabic: string
  nameEnglish: string
  meaning: string
  verses: number
  revelation: "Meccan" | "Medinan"
  audioUrl: string
  ayahs: Ayah[]
}

export interface Ayah {
  id: number
  surahId: number
  number: number
  textArabic: string
  textEnglish: string
  audioUrl?: string
  verseKey?: string
  juzNumber?: number
  pageNumber?: number
  tafsir?: string // Add tafsir support
}

export interface Bookmark {
  surahId: number
  ayahId: number
  verseKey: string
  timestamp: number
}

export interface FavoriteVerse {
  surahId: number
  ayahId: number
  verseKey: string
  timestamp: number
  surahName: string
  verseNumber: number
  textArabic: string
  textEnglish: string
}

export interface UserPreferences {
  theme: "light" | "dark"
  fontSize: "small" | "medium" | "large"
  showTranslation: boolean
  showTafsir: boolean // Add tafsir preference
  autoPlay: boolean // Global autoplay for both surah and verse
  surahPageVerseAutoPlay: boolean // Surah page specific verse autoplay
  selectedReciter: number
  selectedVerseReciter: number
  translationLanguage: string
  verseAudioEnabled: boolean
  defaultVolume: number // Add default volume setting
}

export interface Reciter {
  id: number
  name: string
  arabicName: string
  relativePath: string
  format: string
}

export interface VerseAudio {
  reciterId: number
  surahId: number
  ayahId: number
  url: string
  isPlaying: boolean
}
