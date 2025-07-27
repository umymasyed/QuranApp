// Quran API service functions
const API_BASE_URL = "https://quranapi.pages.dev/api"

// Verse Audio API configuration
const VERSE_AUDIO_BASE_URL = "https://the-quran-project.github.io/Quran-Audio/Data"

export interface ApiChapter {
  surahName: string
  surahNameArabic: string
  surahNameArabicLong: string
  surahNameTranslation: string
  revelationPlace: string
  totalAyah: number
  surahNo: number
  audio: Record<
    string,
    {
      reciter: string
      url: string
      originalUrl: string
    }
  >
  english: string[]
  arabic1: string[]
  arabic2: string[]
  bengali?: string[]
  urdu?: string[]
}

export interface ApiVerse {
  surahName: string
  surahNameArabic: string
  surahNameArabicLong: string
  surahNameTranslation: string
  revelationPlace: string
  totalAyah: number
  surahNo: number
  ayahNo: number
  audio: Record<
    string,
    {
      reciter: string
      url: string
      originalUrl: string
    }
  >
  english: string
  arabic1: string
  arabic2: string
  bengali?: string
  urdu?: string
}

export interface ApiTafsir {
  surahName: string
  surahNameArabic: string
  surahNo: number
  ayahNo: number
  tafsirs: Array<{
    author: string
    groupVerse: string
    content: string
  }>
}

export interface ApiReciter {
  id: number
  name: string
  arabic_name?: string
  relative_path?: string
  format?: string
}

export interface ApiChapterAudio {
  [reciterId: string]: {
    reciter: string
    url: string
    originalUrl: string
  }
}

// Only Mishary Rashid Al Afasy - the best reciter
export const verseAudioReciters: ApiReciter[] = [
  {
    id: 1,
    name: "Mishary Rashid Al Afasy",
    arabic_name: "مشاري بن راشد العفاسي",
    relative_path: "1",
    format: "mp3",
  },
]

// API service functions
export const quranApi = {
  // Get all reciters - only Mishary
  async getReciters(): Promise<Record<string, string>> {
    try {
      console.log("Using Mishary Rashid Al Afasy as the only reciter...")
      return {
        "1": "Mishary Rashid Al Afasy",
      }
    } catch (error) {
      console.error("Error fetching reciters:", error)
      return {
        "1": "Mishary Rashid Al Afasy",
      }
    }
  },

  // Get a specific chapter with all verses
  async getChapter(surahNo: number): Promise<ApiChapter | null> {
    try {
      console.log(`Fetching surah ${surahNo} from API...`)
      const response = await fetch(`${API_BASE_URL}/${surahNo}.json`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Surah ${surahNo} response:`, data)
      return data
    } catch (error) {
      console.error(`Error fetching surah ${surahNo}:`, error)
      return null
    }
  },

  // Get a specific verse
  async getVerse(surahNo: number, ayahNo: number): Promise<ApiVerse | null> {
    try {
      console.log(`Fetching verse ${surahNo}:${ayahNo} from API...`)
      const response = await fetch(`${API_BASE_URL}/${surahNo}/${ayahNo}.json`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Verse ${surahNo}:${ayahNo} response:`, data)
      return data
    } catch (error) {
      console.error(`Error fetching verse ${surahNo}:${ayahNo}:`, error)
      return null
    }
  },

  // Get Tafsir for a specific verse
  async getTafsir(surahNo: number, ayahNo: number): Promise<ApiTafsir | null> {
    try {
      console.log(`Fetching tafsir for verse ${surahNo}:${ayahNo} from API...`)
      const response = await fetch(`${API_BASE_URL}/tafsir/${surahNo}_${ayahNo}.json`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Tafsir ${surahNo}:${ayahNo} response:`, data)
      return data
    } catch (error) {
      console.error(`Error fetching tafsir ${surahNo}:${ayahNo}:`, error)
      return null
    }
  },

  // Get chapter audio URLs - only Mishary
  async getChapterAudio(surahNo: number): Promise<ApiChapterAudio | null> {
    try {
      console.log(`Fetching audio for surah ${surahNo} from API...`)
      const response = await fetch(`${API_BASE_URL}/audio/${surahNo}.json`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Audio ${surahNo} response:`, data)
      return data
    } catch (error) {
      console.error(`Error fetching audio for surah ${surahNo}:`, error)
      return null
    }
  },

  // Get all chapters (we'll need to fetch them individually or use a list)
  async getChapters(): Promise<ApiChapter[]> {
    try {
      console.log("Fetching all chapters...")
      const chapters: ApiChapter[] = []

      // Fetch first few chapters to get the list
      const promises = []
      for (let i = 1; i <= 114; i++) {
        promises.push(this.getChapter(i))
      }

      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          chapters.push(result.value)
        }
      })

      console.log(`Loaded ${chapters.length} chapters`)
      return chapters
    } catch (error) {
      console.error("Error fetching chapters:", error)
      return []
    }
  },

  // Search verses (we'll implement a simple search through loaded data)
  async searchVerses(query: string): Promise<ApiVerse[]> {
    try {
      // For now, return empty array as the API doesn't have a direct search endpoint
      // We can implement client-side search later
      return []
    } catch (error) {
      console.error("Error searching verses:", error)
      return []
    }
  },

  // Get verse audio URL - only Mishary (reciter ID 1)
  getVerseAudioUrl(reciterId: number, surahId: number, ayahId: number): string {
    return `${VERSE_AUDIO_BASE_URL}/1/${surahId}_${ayahId}.mp3`
  },

  // Get available verse audio reciters - only Mishary
  getVerseAudioReciters(): ApiReciter[] {
    return verseAudioReciters
  },

  // Check if verse audio is available - only for Mishary
  async checkVerseAudioAvailability(reciterId: number, surahId: number, ayahId: number): Promise<boolean> {
    try {
      const url = this.getVerseAudioUrl(1, surahId, ayahId) // Always use Mishary (ID 1)
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch {
      return false
    }
  },
}
