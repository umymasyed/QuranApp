import type { Bookmark, UserPreferences, FavoriteVerse } from "./types"

export const storage = {
  // Bookmarks
  getBookmarks(): Bookmark[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("bookmarks")
      console.log("Storage: getBookmarks - retrieved raw:", stored)
      // Ensure stored is a non-empty string before parsing, otherwise default to "[]"
      const parsedData = JSON.parse(stored && stored.trim() !== "" ? stored : "[]")
      console.log("Storage: getBookmarks - parsed:", parsedData)
      return parsedData
    } catch (error) {
      console.error("Storage: Error getting bookmarks:", error)
      return []
    }
  },

  addBookmark(bookmark: Bookmark) {
    if (typeof window === "undefined") return
    try {
      const bookmarks = this.getBookmarks()
      const exists = bookmarks.find((b) => b.surahId === bookmark.surahId && b.ayahId === bookmark.ayahId)
      if (!exists) {
        bookmarks.push(bookmark)
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
        console.log("Storage: addBookmark - added:", bookmark)
      }
    } catch (error) {
      console.error("Storage: Error adding bookmark:", error)
    }
  },

  removeBookmark(surahId: number, ayahId: number) {
    if (typeof window === "undefined") return
    try {
      const bookmarks = this.getBookmarks().filter((b) => !(b.surahId === surahId && b.ayahId === ayahId))
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
      console.log("Storage: removeBookmark - removed:", { surahId, ayahId })
    } catch (error) {
      console.error("Storage: Error removing bookmark:", error)
    }
  },

  isBookmarked(surahId: number, ayahId: number): boolean {
    return this.getBookmarks().some((b) => b.surahId === surahId && b.ayahId === ayahId)
  },

  // Surah Favorites
  getFavorites(): number[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("favorites")
      console.log("Storage: getFavorites - retrieved raw:", stored)
      const parsedData = JSON.parse(stored && stored.trim() !== "" ? stored : "[]")
      console.log("Storage: getFavorites - parsed:", parsedData)
      return parsedData
    } catch (error) {
      console.error("Storage: Error getting favorites:", error)
      return []
    }
  },

  addFavorite(surahId: number) {
    if (typeof window === "undefined") return
    try {
      const favorites = this.getFavorites()
      if (!favorites.includes(surahId)) {
        favorites.push(surahId)
        localStorage.setItem("favorites", JSON.stringify(favorites))
        console.log("Storage: addFavorite - added:", surahId)
      }
    } catch (error) {
      console.error("Storage: Error adding favorite:", error)
    }
  },

  removeFavorite(surahId: number) {
    if (typeof window === "undefined") return
    try {
      const favorites = this.getFavorites().filter((id) => id !== surahId)
      localStorage.setItem("favorites", JSON.stringify(favorites))
      console.log("Storage: removeFavorite - removed:", surahId)
    } catch (error) {
      console.error("Storage: Error removing favorite:", error)
    }
  },

  isFavorite(surahId: number): boolean {
    return this.getFavorites().includes(surahId)
  },

  // Verse Favorites
  getFavoriteVerses(): FavoriteVerse[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("favoriteVerses")
      console.log("Storage: getFavoriteVerses - retrieved raw:", stored)
      const parsedData = JSON.parse(stored && stored.trim() !== "" ? stored : "[]")
      console.log("Storage: getFavoriteVerses - parsed:", parsedData)
      return parsedData
    } catch (error) {
      console.error("Storage: Error getting favorite verses:", error)
      return []
    }
  },

  addFavoriteVerse(favoriteVerse: FavoriteVerse) {
    if (typeof window === "undefined") return
    try {
      const favorites = this.getFavoriteVerses()
      const exists = favorites.find((f) => f.surahId === favoriteVerse.surahId && f.ayahId === favoriteVerse.ayahId)
      if (!exists) {
        favorites.push(favoriteVerse)
        localStorage.setItem("favoriteVerses", JSON.stringify(favorites))
        console.log("Storage: addFavoriteVerse - added:", favoriteVerse)
      }
    } catch (error) {
      console.error("Storage: Error adding favorite verse:", error)
    }
  },

  removeFavoriteVerse(surahId: number, ayahId: number) {
    if (typeof window === "undefined") return
    try {
      const favorites = this.getFavoriteVerses().filter((f) => !(f.surahId === surahId && f.ayahId === ayahId))
      localStorage.setItem("favoriteVerses", JSON.stringify(favorites))
      console.log("Storage: removeFavoriteVerse - removed:", { surahId, ayahId })
    } catch (error) {
      console.error("Storage: Error removing favorite verse:", error)
    }
  },

  isFavoriteVerse(surahId: number, ayahId: number): boolean {
    return this.getFavoriteVerses().some((f) => f.surahId === surahId && f.ayahId === ayahId)
  },

  // User Preferences
  getPreferences(): UserPreferences {
    if (typeof window === "undefined") {
      console.log("Storage: getPreferences - window is undefined, returning default")
      return {
        theme: "system", // Changed default to system
        fontSize: "medium",
        showTranslation: true,
        showTafsir: false,
        autoPlay: false,
        selectedReciter: 1,
        selectedVerseReciter: 1,
        translationLanguage: "english_saheeh",
        verseAudioEnabled: true,
        volume: 0.7, // Added default volume
      }
    }
    try {
      const stored = localStorage.getItem("preferences")
      console.log("Storage: getPreferences - retrieved raw:", stored)
      const defaultPrefs = {
        theme: "system", // Changed default to system
        fontSize: "medium",
        showTranslation: true,
        showTafsir: false,
        autoPlay: false,
        selectedReciter: 1,
        selectedVerseReciter: 1,
        translationLanguage: "english_saheeh",
        verseAudioEnabled: true,
        volume: 0.7, // Added default volume
      }
      if (stored && stored.trim() !== "") {
        const parsed = JSON.parse(stored)
        console.log("Storage: getPreferences - parsed:", parsed)
        // Merge with defaults to ensure all properties exist
        return { ...defaultPrefs, ...parsed }
      }
      console.log("Storage: getPreferences - no stored preferences or empty string, returning default:", defaultPrefs)
      return defaultPrefs
    } catch (error) {
      console.error("Storage: Error getting preferences:", error)
      // Fallback to default preferences on error
      return {
        theme: "system", // Changed default to system
        fontSize: "medium",
        showTranslation: true,
        showTafsir: false,
        autoPlay: false,
        selectedReciter: 1,
        selectedVerseReciter: 1,
        translationLanguage: "english_saheeh",
        verseAudioEnabled: true,
        volume: 0.7, // Added default volume
      }
    }
  },

  setPreferences(preferences: UserPreferences) {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("preferences", JSON.stringify(preferences))
      console.log("Storage: setPreferences - saved:", preferences)
    } catch (error) {
      console.error("Storage: Error setting preferences:", error)
    }
  },

  // Recently Played
  getRecentlyPlayed() {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("recentlyPlayed")
      console.log("Storage: getRecentlyPlayed - retrieved raw:", stored)
      const parsedData = JSON.parse(stored && stored.trim() !== "" ? stored : "[]")
      console.log("Storage: getRecentlyPlayed - parsed:", parsedData)
      return parsedData
    } catch (error) {
      console.error("Storage: Error getting recently played:", error)
      return []
    }
  },

  // Clear all data
  clearAll() {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem("bookmarks")
      localStorage.removeItem("favorites")
      localStorage.removeItem("favoriteVerses")
      localStorage.removeItem("recentlyPlayed")
      localStorage.removeItem("preferences")
      console.log("Storage: clearAll - all data cleared")
    } catch (error) {
      console.error("Storage: Error clearing all data:", error)
    }
  },
}
