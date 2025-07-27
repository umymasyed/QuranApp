import type { Bookmark, UserPreferences, FavoriteVerse } from "./types"

export const storage = {
  // Bookmarks
  getBookmarks(): Bookmark[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("bookmarks") || "[]")
  },

  addBookmark(bookmark: Bookmark) {
    if (typeof window === "undefined") return
    const bookmarks = this.getBookmarks()
    const exists = bookmarks.find((b) => b.surahId === bookmark.surahId && b.ayahId === bookmark.ayahId)
    if (!exists) {
      bookmarks.push(bookmark)
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    }
  },

  removeBookmark(surahId: number, ayahId: number) {
    if (typeof window === "undefined") return
    const bookmarks = this.getBookmarks().filter((b) => !(b.surahId === surahId && b.ayahId === ayahId))
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
  },

  isBookmarked(surahId: number, ayahId: number): boolean {
    return this.getBookmarks().some((b) => b.surahId === surahId && b.ayahId === ayahId)
  },

  // Surah Favorites
  getFavorites(): number[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("favorites") || "[]")
  },

  addFavorite(surahId: number) {
    if (typeof window === "undefined") return
    const favorites = this.getFavorites()
    if (!favorites.includes(surahId)) {
      favorites.push(surahId)
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  },

  removeFavorite(surahId: number) {
    if (typeof window === "undefined") return
    const favorites = this.getFavorites().filter((id) => id !== surahId)
    localStorage.setItem("favorites", JSON.stringify(favorites))
  },

  isFavorite(surahId: number): boolean {
    return this.getFavorites().includes(surahId)
  },

  // Verse Favorites
  getFavoriteVerses(): FavoriteVerse[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("favoriteVerses") || "[]")
  },

  addFavoriteVerse(favoriteVerse: FavoriteVerse) {
    if (typeof window === "undefined") return
    const favorites = this.getFavoriteVerses()
    const exists = favorites.find((f) => f.surahId === favoriteVerse.surahId && f.ayahId === favoriteVerse.ayahId)
    if (!exists) {
      favorites.push(favoriteVerse)
      localStorage.setItem("favoriteVerses", JSON.stringify(favorites))
    }
  },

  removeFavoriteVerse(surahId: number, ayahId: number) {
    if (typeof window === "undefined") return
    const favorites = this.getFavoriteVerses().filter((f) => !(f.surahId === surahId && f.ayahId === ayahId))
    localStorage.setItem("favoriteVerses", JSON.stringify(favorites))
  },

  isFavoriteVerse(surahId: number, ayahId: number): boolean {
    return this.getFavoriteVerses().some((f) => f.surahId === surahId && f.ayahId === ayahId)
  },

  // User Preferences
  getPreferences(): UserPreferences {
    if (typeof window === "undefined")
      return {
        theme: "light",
        showTranslation: true,
        autoPlay: false,
        surahPageVerseAutoPlay: false,
        selectedReciter: 1,
        selectedVerseReciter: 1,
        translationLanguage: "english_saheeh",
        verseAudioEnabled: true,
        defaultVolume: 70,
      }
    return JSON.parse(
      localStorage.getItem("preferences") ||
        JSON.stringify({
          theme: "light",
          showTranslation: true,
          autoPlay: false,
          surahPageVerseAutoPlay: false,
          selectedReciter: 1,
          selectedVerseReciter: 1,
          translationLanguage: "english_saheeh",
          verseAudioEnabled: true,
          defaultVolume: 70,
        }),
    )
  },

  setPreferences(preferences: UserPreferences) {
    if (typeof window === "undefined") return
    localStorage.setItem("preferences", JSON.stringify(preferences))
  },

  // Recently Played
  getRecentlyPlayed() {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("recentlyPlayed") || "[]")
  },

  // Clear all data
  clearAll() {
    if (typeof window === "undefined") return
    localStorage.removeItem("bookmarks")
    localStorage.removeItem("favorites")
    localStorage.removeItem("favoriteVerses")
    localStorage.removeItem("recentlyPlayed")
    localStorage.removeItem("preferences")
  },
}
