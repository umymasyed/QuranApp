import { quranApi, type ApiChapter, type ApiVerse } from "./api"
import type { Surah, Ayah, Reciter } from "./types"

// Complete list of all 114 Surahs with accurate information
const COMPLETE_SURAH_LIST = [
  { id: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Faatiha", meaning: "The Opening", verses: 7, revelation: "Meccan" },
  { id: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", meaning: "The Cow", verses: 286, revelation: "Medinan" },
  {
    id: 3,
    nameArabic: "آل عمران",
    nameEnglish: "Ali Imran",
    meaning: "Family of Imran",
    verses: 200,
    revelation: "Medinan",
  },
  { id: 4, nameArabic: "النساء", nameEnglish: "An-Nisa", meaning: "The Women", verses: 176, revelation: "Medinan" },
  {
    id: 5,
    nameArabic: "المائدة",
    nameEnglish: "Al-Maidah",
    meaning: "The Table Spread",
    verses: 120,
    revelation: "Medinan",
  },
  { id: 6, nameArabic: "الأنعام", nameEnglish: "Al-Anam", meaning: "The Cattle", verses: 165, revelation: "Meccan" },
  { id: 7, nameArabic: "الأعراف", nameEnglish: "Al-Araf", meaning: "The Heights", verses: 206, revelation: "Meccan" },
  {
    id: 8,
    nameArabic: "الأنفال",
    nameEnglish: "Al-Anfal",
    meaning: "The Spoils of War",
    verses: 75,
    revelation: "Medinan",
  },
  {
    id: 9,
    nameArabic: "التوبة",
    nameEnglish: "At-Tawbah",
    meaning: "The Repentance",
    verses: 129,
    revelation: "Medinan",
  },
  { id: 10, nameArabic: "يونس", nameEnglish: "Yunus", meaning: "Jonah", verses: 109, revelation: "Meccan" },
  { id: 11, nameArabic: "هود", nameEnglish: "Hud", meaning: "Hud", verses: 123, revelation: "Meccan" },
  { id: 12, nameArabic: "يوسف", nameEnglish: "Yusuf", meaning: "Joseph", verses: 111, revelation: "Meccan" },
  { id: 13, nameArabic: "الرعد", nameEnglish: "Ar-Rad", meaning: "The Thunder", verses: 43, revelation: "Medinan" },
  { id: 14, nameArabic: "إبراهيم", nameEnglish: "Ibrahim", meaning: "Abraham", verses: 52, revelation: "Meccan" },
  { id: 15, nameArabic: "الحجر", nameEnglish: "Al-Hijr", meaning: "The Rocky Tract", verses: 99, revelation: "Meccan" },
  { id: 16, nameArabic: "النحل", nameEnglish: "An-Nahl", meaning: "The Bee", verses: 128, revelation: "Meccan" },
  {
    id: 17,
    nameArabic: "الإسراء",
    nameEnglish: "Al-Isra",
    meaning: "The Night Journey",
    verses: 111,
    revelation: "Meccan",
  },
  { id: 18, nameArabic: "الكهف", nameEnglish: "Al-Kahf", meaning: "The Cave", verses: 110, revelation: "Meccan" },
  { id: 19, nameArabic: "مريم", nameEnglish: "Maryam", meaning: "Mary", verses: 98, revelation: "Meccan" },
  { id: 20, nameArabic: "طه", nameEnglish: "Taha", meaning: "Taha", verses: 135, revelation: "Meccan" },
  {
    id: 21,
    nameArabic: "الأنبياء",
    nameEnglish: "Al-Anbiya",
    meaning: "The Prophets",
    verses: 112,
    revelation: "Meccan",
  },
  { id: 22, nameArabic: "الحج", nameEnglish: "Al-Hajj", meaning: "The Pilgrimage", verses: 78, revelation: "Medinan" },
  {
    id: 23,
    nameArabic: "المؤمنون",
    nameEnglish: "Al-Muminun",
    meaning: "The Believers",
    verses: 118,
    revelation: "Meccan",
  },
  { id: 24, nameArabic: "النور", nameEnglish: "An-Nur", meaning: "The Light", verses: 64, revelation: "Medinan" },
  {
    id: 25,
    nameArabic: "الفرقان",
    nameEnglish: "Al-Furqan",
    meaning: "The Criterion",
    verses: 77,
    revelation: "Meccan",
  },
  { id: 26, nameArabic: "الشعراء", nameEnglish: "Ash-Shuara", meaning: "The Poets", verses: 227, revelation: "Meccan" },
  { id: 27, nameArabic: "النمل", nameEnglish: "An-Naml", meaning: "The Ant", verses: 93, revelation: "Meccan" },
  { id: 28, nameArabic: "القصص", nameEnglish: "Al-Qasas", meaning: "The Stories", verses: 88, revelation: "Meccan" },
  {
    id: 29,
    nameArabic: "العنكبوت",
    nameEnglish: "Al-Ankabut",
    meaning: "The Spider",
    verses: 69,
    revelation: "Meccan",
  },
  { id: 30, nameArabic: "الروم", nameEnglish: "Ar-Rum", meaning: "The Romans", verses: 60, revelation: "Meccan" },
  { id: 31, nameArabic: "لقمان", nameEnglish: "Luqman", meaning: "Luqman", verses: 34, revelation: "Meccan" },
  {
    id: 32,
    nameArabic: "السجدة",
    nameEnglish: "As-Sajdah",
    meaning: "The Prostration",
    verses: 30,
    revelation: "Meccan",
  },
  { id: 33, nameArabic: "الأحزاب", nameEnglish: "Al-Ahzab", meaning: "The Clans", verses: 73, revelation: "Medinan" },
  { id: 34, nameArabic: "سبأ", nameEnglish: "Saba", meaning: "Sheba", verses: 54, revelation: "Meccan" },
  { id: 35, nameArabic: "فاطر", nameEnglish: "Fatir", meaning: "Originator", verses: 45, revelation: "Meccan" },
  { id: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", meaning: "Ya-Sin", verses: 83, revelation: "Meccan" },
  {
    id: 37,
    nameArabic: "الصافات",
    nameEnglish: "As-Saffat",
    meaning: "Those Who Set The Ranks",
    verses: 182,
    revelation: "Meccan",
  },
  { id: 38, nameArabic: "ص", nameEnglish: "Sad", meaning: "The Letter Sad", verses: 88, revelation: "Meccan" },
  { id: 39, nameArabic: "الزمر", nameEnglish: "Az-Zumar", meaning: "The Troops", verses: 75, revelation: "Meccan" },
  { id: 40, nameArabic: "غافر", nameEnglish: "Ghafir", meaning: "The Forgiver", verses: 85, revelation: "Meccan" },
  {
    id: 41,
    nameArabic: "فصلت",
    nameEnglish: "Fussilat",
    meaning: "Explained In Detail",
    verses: 54,
    revelation: "Meccan",
  },
  {
    id: 42,
    nameArabic: "الشورى",
    nameEnglish: "Ash-Shuraa",
    meaning: "The Consultation",
    verses: 53,
    revelation: "Meccan",
  },
  {
    id: 43,
    nameArabic: "الزخرف",
    nameEnglish: "Az-Zukhruf",
    meaning: "The Ornaments Of Gold",
    verses: 89,
    revelation: "Meccan",
  },
  { id: 44, nameArabic: "الدخان", nameEnglish: "Ad-Dukhan", meaning: "The Smoke", verses: 59, revelation: "Meccan" },
  {
    id: 45,
    nameArabic: "الجاثية",
    nameEnglish: "Al-Jathiyah",
    meaning: "The Crouching",
    verses: 37,
    revelation: "Meccan",
  },
  {
    id: 46,
    nameArabic: "الأحقاف",
    nameEnglish: "Al-Ahqaf",
    meaning: "The Wind-Curved Sandhills",
    verses: 35,
    revelation: "Meccan",
  },
  { id: 47, nameArabic: "محمد", nameEnglish: "Muhammad", meaning: "Muhammad", verses: 38, revelation: "Medinan" },
  { id: 48, nameArabic: "الفتح", nameEnglish: "Al-Fath", meaning: "The Victory", verses: 29, revelation: "Medinan" },
  { id: 49, nameArabic: "الحجرات", nameEnglish: "Al-Hujurat", meaning: "The Rooms", verses: 18, revelation: "Medinan" },
  { id: 50, nameArabic: "ق", nameEnglish: "Qaf", meaning: "The Letter Qaf", verses: 45, revelation: "Meccan" },
  {
    id: 51,
    nameArabic: "الذاريات",
    nameEnglish: "Adh-Dhariyat",
    meaning: "The Winnowing Winds",
    verses: 60,
    revelation: "Meccan",
  },
  { id: 52, nameArabic: "الطور", nameEnglish: "At-Tur", meaning: "The Mount", verses: 49, revelation: "Meccan" },
  { id: 53, nameArabic: "النجم", nameEnglish: "An-Najm", meaning: "The Star", verses: 62, revelation: "Meccan" },
  { id: 54, nameArabic: "القمر", nameEnglish: "Al-Qamar", meaning: "The Moon", verses: 55, revelation: "Meccan" },
  {
    id: 55,
    nameArabic: "الرحمن",
    nameEnglish: "Ar-Rahman",
    meaning: "The Beneficent",
    verses: 78,
    revelation: "Meccan",
  },
  {
    id: 56,
    nameArabic: "الواقعة",
    nameEnglish: "Al-Waqiah",
    meaning: "The Inevitable",
    verses: 96,
    revelation: "Meccan",
  },
  { id: 57, nameArabic: "الحديد", nameEnglish: "Al-Hadid", meaning: "The Iron", verses: 29, revelation: "Medinan" },
  {
    id: 58,
    nameArabic: "المجادلة",
    nameEnglish: "Al-Mujadila",
    meaning: "The Pleading Woman",
    verses: 22,
    revelation: "Medinan",
  },
  { id: 59, nameArabic: "الحشر", nameEnglish: "Al-Hashr", meaning: "The Exile", verses: 24, revelation: "Medinan" },
  {
    id: 60,
    nameArabic: "الممتحنة",
    nameEnglish: "Al-Mumtahanah",
    meaning: "She That Is To Be Examined",
    verses: 13,
    revelation: "Medinan",
  },
  { id: 61, nameArabic: "الصف", nameEnglish: "As-Saff", meaning: "The Ranks", verses: 14, revelation: "Medinan" },
  {
    id: 62,
    nameArabic: "الجمعة",
    nameEnglish: "Al-Jumuah",
    meaning: "The Congregation",
    verses: 11,
    revelation: "Medinan",
  },
  {
    id: 63,
    nameArabic: "المنافقون",
    nameEnglish: "Al-Munafiqun",
    meaning: "The Hypocrites",
    verses: 11,
    revelation: "Medinan",
  },
  {
    id: 64,
    nameArabic: "التغابن",
    nameEnglish: "At-Taghabun",
    meaning: "The Mutual Disillusion",
    verses: 18,
    revelation: "Medinan",
  },
  { id: 65, nameArabic: "الطلاق", nameEnglish: "At-Talaq", meaning: "The Divorce", verses: 12, revelation: "Medinan" },
  {
    id: 66,
    nameArabic: "التحريم",
    nameEnglish: "At-Tahrim",
    meaning: "The Prohibition",
    verses: 12,
    revelation: "Medinan",
  },
  { id: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk", meaning: "The Sovereignty", verses: 30, revelation: "Meccan" },
  { id: 68, nameArabic: "القلم", nameEnglish: "Al-Qalam", meaning: "The Pen", verses: 52, revelation: "Meccan" },
  { id: 69, nameArabic: "الحاقة", nameEnglish: "Al-Haqqah", meaning: "The Reality", verses: 52, revelation: "Meccan" },
  {
    id: 70,
    nameArabic: "المعارج",
    nameEnglish: "Al-Maarij",
    meaning: "The Ascending Stairways",
    verses: 44,
    revelation: "Meccan",
  },
  { id: 71, nameArabic: "نوح", nameEnglish: "Nuh", meaning: "Noah", verses: 28, revelation: "Meccan" },
  { id: 72, nameArabic: "الجن", nameEnglish: "Al-Jinn", meaning: "The Jinn", verses: 28, revelation: "Meccan" },
  {
    id: 73,
    nameArabic: "المزمل",
    nameEnglish: "Al-Muzzammil",
    meaning: "The Enshrouded One",
    verses: 20,
    revelation: "Meccan",
  },
  {
    id: 74,
    nameArabic: "المدثر",
    nameEnglish: "Al-Muddaththir",
    meaning: "The Cloaked One",
    verses: 56,
    revelation: "Meccan",
  },
  {
    id: 75,
    nameArabic: "القيامة",
    nameEnglish: "Al-Qiyamah",
    meaning: "The Resurrection",
    verses: 40,
    revelation: "Meccan",
  },
  { id: 76, nameArabic: "الإنسان", nameEnglish: "Al-Insan", meaning: "The Man", verses: 31, revelation: "Medinan" },
  {
    id: 77,
    nameArabic: "المرسلات",
    nameEnglish: "Al-Mursalat",
    meaning: "The Emissaries",
    verses: 50,
    revelation: "Meccan",
  },
  { id: 78, nameArabic: "النبأ", nameEnglish: "An-Naba", meaning: "The Tidings", verses: 40, revelation: "Meccan" },
  {
    id: 79,
    nameArabic: "النازعات",
    nameEnglish: "An-Naziat",
    meaning: "Those Who Drag Forth",
    verses: 46,
    revelation: "Meccan",
  },
  { id: 80, nameArabic: "عبس", nameEnglish: "Abasa", meaning: "He Frowned", verses: 42, revelation: "Meccan" },
  {
    id: 81,
    nameArabic: "التكوير",
    nameEnglish: "At-Takwir",
    meaning: "The Overthrowing",
    verses: 29,
    revelation: "Meccan",
  },
  {
    id: 82,
    nameArabic: "الانفطار",
    nameEnglish: "Al-Infitar",
    meaning: "The Cleaving",
    verses: 19,
    revelation: "Meccan",
  },
  {
    id: 83,
    nameArabic: "المطففين",
    nameEnglish: "Al-Mutaffifin",
    meaning: "The Defrauding",
    verses: 36,
    revelation: "Meccan",
  },
  {
    id: 84,
    nameArabic: "الانشقاق",
    nameEnglish: "Al-Inshiqaq",
    meaning: "The Splitting Open",
    verses: 25,
    revelation: "Meccan",
  },
  {
    id: 85,
    nameArabic: "البروج",
    nameEnglish: "Al-Buruj",
    meaning: "The Mansions Of The Stars",
    verses: 22,
    revelation: "Meccan",
  },
  {
    id: 86,
    nameArabic: "الطارق",
    nameEnglish: "At-Tariq",
    meaning: "The Morning Star",
    verses: 17,
    revelation: "Meccan",
  },
  { id: 87, nameArabic: "الأعلى", nameEnglish: "Al-Ala", meaning: "The Most High", verses: 19, revelation: "Meccan" },
  {
    id: 88,
    nameArabic: "الغاشية",
    nameEnglish: "Al-Ghashiyah",
    meaning: "The Overwhelming",
    verses: 26,
    revelation: "Meccan",
  },
  { id: 89, nameArabic: "الفجر", nameEnglish: "Al-Fajr", meaning: "The Dawn", verses: 30, revelation: "Meccan" },
  { id: 90, nameArabic: "البلد", nameEnglish: "Al-Balad", meaning: "The City", verses: 20, revelation: "Meccan" },
  { id: 91, nameArabic: "الشمس", nameEnglish: "Ash-Shams", meaning: "The Sun", verses: 15, revelation: "Meccan" },
  { id: 92, nameArabic: "الليل", nameEnglish: "Al-Layl", meaning: "The Night", verses: 21, revelation: "Meccan" },
  {
    id: 93,
    nameArabic: "الضحى",
    nameEnglish: "Ad-Duhaa",
    meaning: "The Morning Hours",
    verses: 11,
    revelation: "Meccan",
  },
  { id: 94, nameArabic: "الشرح", nameEnglish: "Ash-Sharh", meaning: "The Relief", verses: 8, revelation: "Meccan" },
  { id: 95, nameArabic: "التين", nameEnglish: "At-Tin", meaning: "The Fig", verses: 8, revelation: "Meccan" },
  { id: 96, nameArabic: "العلق", nameEnglish: "Al-Alaq", meaning: "The Clot", verses: 19, revelation: "Meccan" },
  { id: 97, nameArabic: "القدر", nameEnglish: "Al-Qadr", meaning: "The Power", verses: 5, revelation: "Meccan" },
  {
    id: 98,
    nameArabic: "البينة",
    nameEnglish: "Al-Bayyinah",
    meaning: "The Clear Proof",
    verses: 8,
    revelation: "Medinan",
  },
  {
    id: 99,
    nameArabic: "الزلزلة",
    nameEnglish: "Az-Zalzalah",
    meaning: "The Earthquake",
    verses: 8,
    revelation: "Medinan",
  },
  {
    id: 100,
    nameArabic: "العاديات",
    nameEnglish: "Al-Adiyat",
    meaning: "The Courser",
    verses: 11,
    revelation: "Meccan",
  },
  {
    id: 101,
    nameArabic: "القارعة",
    nameEnglish: "Al-Qariah",
    meaning: "The Calamity",
    verses: 11,
    revelation: "Meccan",
  },
  {
    id: 102,
    nameArabic: "التكاثر",
    nameEnglish: "At-Takathur",
    meaning: "The Rivalry In World Increase",
    verses: 8,
    revelation: "Meccan",
  },
  {
    id: 103,
    nameArabic: "العصر",
    nameEnglish: "Al-Asr",
    meaning: "The Declining Day",
    verses: 3,
    revelation: "Meccan",
  },
  {
    id: 104,
    nameArabic: "الهمزة",
    nameEnglish: "Al-Humazah",
    meaning: "The Traducer",
    verses: 9,
    revelation: "Meccan",
  },
  { id: 105, nameArabic: "الفيل", nameEnglish: "Al-Fil", meaning: "The Elephant", verses: 5, revelation: "Meccan" },
  { id: 106, nameArabic: "قريش", nameEnglish: "Quraysh", meaning: "Quraysh", verses: 4, revelation: "Meccan" },
  {
    id: 107,
    nameArabic: "الماعون",
    nameEnglish: "Al-Maun",
    meaning: "The Small Kindnesses",
    verses: 7,
    revelation: "Meccan",
  },
  {
    id: 108,
    nameArabic: "الكوثر",
    nameEnglish: "Al-Kawthar",
    meaning: "The Abundance",
    verses: 3,
    revelation: "Meccan",
  },
  {
    id: 109,
    nameArabic: "الكافرون",
    nameEnglish: "Al-Kafirun",
    meaning: "The Disbelievers",
    verses: 6,
    revelation: "Meccan",
  },
  {
    id: 110,
    nameArabic: "النصر",
    nameEnglish: "An-Nasr",
    meaning: "The Divine Support",
    verses: 3,
    revelation: "Medinan",
  },
  { id: 111, nameArabic: "المسد", nameEnglish: "Al-Masad", meaning: "The Palm Fiber", verses: 5, revelation: "Meccan" },
  {
    id: 112,
    nameArabic: "الإخلاص",
    nameEnglish: "Al-Ikhlas",
    meaning: "The Sincerity",
    verses: 4,
    revelation: "Meccan",
  },
  { id: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq", meaning: "The Daybreak", verses: 5, revelation: "Meccan" },
  { id: 114, nameArabic: "الناس", nameEnglish: "An-Nas", meaning: "Mankind", verses: 6, revelation: "Meccan" },
] as const

// Transform API data to our app format
export const dataService = {
  // Transform API chapter to our Surah format
  transformChapterToSurah(apiChapter: ApiChapter): Surah {
    // Transform verses from arrays to individual ayah objects
    const ayahs: Ayah[] = []
    if (apiChapter.english && apiChapter.arabic1) {
      for (let i = 0; i < apiChapter.english.length; i++) {
        ayahs.push({
          id: apiChapter.surahNo * 1000 + (i + 1),
          surahId: apiChapter.surahNo,
          number: i + 1,
          textArabic: apiChapter.arabic1[i] || "",
          textEnglish: apiChapter.english[i] || "",
          verseKey: `${apiChapter.surahNo}:${i + 1}`,
          juzNumber: 1, // We don't have this info from the API
          pageNumber: 1, // We don't have this info from the API
        })
      }
    }

    return {
      id: apiChapter.surahNo,
      name: apiChapter.surahNameArabic,
      nameArabic: apiChapter.surahNameArabic,
      nameEnglish: apiChapter.surahName,
      meaning: apiChapter.surahNameTranslation,
      verses: apiChapter.totalAyah,
      revelation: apiChapter.revelationPlace === "Mecca" ? "Meccan" : "Medinan",
      audioUrl: "", // Will be set by getAudioUrl method
      ayahs: ayahs,
    }
  },

  // Transform API verse to our Ayah format
  transformVerseToAyah(apiVerse: ApiVerse): Ayah {
    return {
      id: apiVerse.surahNo * 1000 + apiVerse.ayahNo,
      surahId: apiVerse.surahNo,
      number: apiVerse.ayahNo,
      textArabic: apiVerse.arabic1,
      textEnglish: apiVerse.english,
      verseKey: `${apiVerse.surahNo}:${apiVerse.ayahNo}`,
      juzNumber: 1, // We don't have this info from the API
      pageNumber: 1, // We don't have this info from the API
      audioUrl: apiVerse.audio?.["1"]?.url,
    }
  },

  // Get all surahs - now returns complete list
  async getAllSurahs(): Promise<Surah[]> {
    try {
      console.log("Getting all 114 surahs...")
      // Return complete list with proper data
      const allSurahs = COMPLETE_SURAH_LIST.map((surah) => ({
        id: surah.id,
        name: surah.nameArabic,
        nameArabic: surah.nameArabic,
        nameEnglish: surah.nameEnglish,
        meaning: surah.meaning,
        verses: surah.verses,
        revelation: surah.revelation as "Meccan" | "Medinan",
        audioUrl: "",
        ayahs: [],
      }))
      console.log(`Retrieved all ${allSurahs.length} surahs`)
      return allSurahs
    } catch (error) {
      console.error("Error getting all surahs:", error)
      return []
    }
  },

  // Get basic surah list - now complete
  async getBasicSurahList(): Promise<Surah[]> {
    return this.getAllSurahs()
  },

  // Get a specific surah with full verse content
  async getSurah(surahId: number): Promise<Surah | null> {
    try {
      console.log(`Getting surah ${surahId}...`)

      // Validate surah ID
      if (surahId < 1 || surahId > 114) {
        console.error(`Invalid surah ID: ${surahId}`)
        return null
      }

      const apiChapter = await quranApi.getChapter(surahId)
      if (!apiChapter) {
        // Return basic info if API fails
        const basicInfo = COMPLETE_SURAH_LIST.find((s) => s.id === surahId)
        if (basicInfo) {
          return {
            id: basicInfo.id,
            name: basicInfo.nameArabic,
            nameArabic: basicInfo.nameArabic,
            nameEnglish: basicInfo.nameEnglish,
            meaning: basicInfo.meaning,
            verses: basicInfo.verses,
            revelation: basicInfo.revelation as "Meccan" | "Medinan",
            audioUrl: "",
            ayahs: [],
          }
        }
        return null
      }

      const surah = this.transformChapterToSurah(apiChapter)

      // Set the proper audio URL using the audio API - only Mishary (ID 1)
      try {
        const audioData = await quranApi.getChapterAudio(surahId)
        if (audioData && audioData["1"]) {
          // Use original URL if available, otherwise use the GitHub URL
          surah.audioUrl = audioData["1"].originalUrl || audioData["1"].url
        }
      } catch (audioError) {
        console.warn(`Could not get audio for surah ${surahId}:`, audioError)
        // Audio URL will remain empty string
      }

      return surah
    } catch (error) {
      console.error(`Error getting surah ${surahId}:`, error)

      // Return basic info as fallback
      const basicInfo = COMPLETE_SURAH_LIST.find((s) => s.id === surahId)
      if (basicInfo) {
        return {
          id: basicInfo.id,
          name: basicInfo.nameArabic,
          nameArabic: basicInfo.nameArabic,
          nameEnglish: basicInfo.nameEnglish,
          meaning: basicInfo.meaning,
          verses: basicInfo.verses,
          revelation: basicInfo.revelation as "Meccan" | "Medinan",
          audioUrl: "",
          ayahs: [],
        }
      }

      return null
    }
  },

  // Get Tafsir for a specific verse using Quran.com API
  async getTafsir(surahId: number, ayahId: number): Promise<string | null> {
    try {
      console.log(`Getting tafsir for ${surahId}:${ayahId}`)

      // Validate input
      if (surahId < 1 || surahId > 114 || ayahId < 1) {
        console.error(`Invalid verse reference: ${surahId}:${ayahId}`)
        return null
      }

      // Use Quran.com API for Tafsir
      const response = await fetch(`https://api.quran.com/api/v4/verses/${surahId}:${ayahId}/tafsirs/169?language=en`)

      if (!response.ok) {
        console.warn(`Tafsir API response not ok: ${response.status}`)
        return null
      }

      const data = await response.json()

      if (data && data.tafsirs && data.tafsirs.length > 0) {
        const tafsir = data.tafsirs[0]
        if (tafsir && tafsir.text) {
          // Clean up the HTML tags from the tafsir text
          const cleanText = tafsir.text
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
            .replace(/&amp;/g, "&") // Replace &amp; with &
            .replace(/&lt;/g, "<") // Replace &lt; with <
            .replace(/&gt;/g, ">") // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .trim()

          return cleanText || null
        }
      }

      // Fallback: Try alternative tafsir source (Ibn Kathir - ID 168)
      const fallbackResponse = await fetch(
        `https://api.quran.com/api/v4/verses/${surahId}:${ayahId}/tafsirs/168?language=en`,
      )

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        if (fallbackData && fallbackData.tafsirs && fallbackData.tafsirs.length > 0) {
          const tafsir = fallbackData.tafsirs[0]
          if (tafsir && tafsir.text) {
            const cleanText = tafsir.text
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .trim()

            return cleanText || null
          }
        }
      }

      console.log(`No tafsir found for ${surahId}:${ayahId}`)
      return null
    } catch (error) {
      console.error(`Error getting tafsir for ${surahId}:${ayahId}:`, error)
      return null
    }
  },

  // Enhanced search with all surahs
  async searchContent(query: string): Promise<{ surahs: Surah[]; verses: Ayah[] }> {
    try {
      if (!query || query.trim().length === 0) {
        return { surahs: [], verses: [] }
      }

      const normalizedQuery = query.toLowerCase().trim()
      const allSurahs = await this.getAllSurahs()

      // Filter surahs that match the query
      const matchingSurahs = allSurahs.filter(
        (surah) =>
          surah.nameEnglish.toLowerCase().includes(normalizedQuery) ||
          surah.meaning.toLowerCase().includes(normalizedQuery) ||
          surah.nameArabic.includes(query) ||
          surah.id.toString() === normalizedQuery,
      )

      // For verses, we'd need to implement a more comprehensive search
      // For now, return empty verses array
      const matchingVerses: Ayah[] = []

      return {
        surahs: matchingSurahs,
        verses: matchingVerses,
      }
    } catch (error) {
      console.error("Error searching content:", error)
      return { surahs: [], verses: [] }
    }
  },

  // Get reciters - only Mishary
  async getReciters(): Promise<Reciter[]> {
    try {
      return [
        {
          id: 1,
          name: "Mishary Rashid Al Afasy",
          arabicName: "مشاري بن راشد العفاسي",
          relativePath: "1",
          format: "mp3",
        },
      ]
    } catch (error) {
      console.error("Error getting reciters:", error)
      return [
        {
          id: 1,
          name: "Mishary Rashid Al Afasy",
          arabicName: "مشاري بن راشد العفاسي",
          relativePath: "1",
          format: "mp3",
        },
      ]
    }
  },

  // Get audio URL for a surah - only Mishary (ID 1)
  async getAudioUrl(surahId: number, reciterId = 1): Promise<string> {
    try {
      // Validate surah ID
      if (surahId < 1 || surahId > 114) {
        throw new Error(`Invalid surah ID: ${surahId}`)
      }

      const audioData = await quranApi.getChapterAudio(surahId)
      if (audioData && audioData["1"]) {
        // Use original URL if available, otherwise use the GitHub URL
        const audioUrl = audioData["1"].originalUrl || audioData["1"].url
        if (audioUrl) {
          return audioUrl
        }
      }
    } catch (error) {
      console.error(`Error getting audio URL for surah ${surahId}:`, error)
    }

    // Fallback URL - always use Mishary (ID 1)
    const paddedId = surahId.toString().padStart(3, "0")
    return `https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/1/${paddedId}.mp3`
  },

  // Get verse audio URL - only Mishary
  getVerseAudioUrl(reciterId: number, surahId: number, ayahId: number): string {
    return quranApi.getVerseAudioUrl(1, surahId, ayahId) // Always use Mishary (ID 1)
  },

  // Get verse audio reciters - only Mishary
  getVerseAudioReciters(): Reciter[] {
    return [
      {
        id: 1,
        name: "Mishary Rashid Al Afasy",
        arabicName: "مشاري بن راشد العفاسي",
        relativePath: "1",
        format: "mp3",
      },
    ]
  },

  // Check verse audio availability - only Mishary
  async checkVerseAudioAvailability(reciterId: number, surahId: number, ayahId: number): Promise<boolean> {
    try {
      return await quranApi.checkVerseAudioAvailability(1, surahId, ayahId) // Always use Mishary (ID 1)
    } catch (error) {
      console.error(`Error checking verse audio availability for ${surahId}:${ayahId}:`, error)
      return false
    }
  },

  // Get featured surahs
  async getFeaturedSurahs(): Promise<Surah[]> {
    try {
      const allSurahs = await this.getAllSurahs()
      return allSurahs.filter((surah) => featuredSurahIds.includes(surah.id))
    } catch (error) {
      console.error("Error getting featured surahs:", error)
      return []
    }
  },

  // Get recently played surahs from localStorage
  getRecentlyPlayed(): Surah[] {
    if (typeof window === "undefined") {
      return []
    }

    try {
      const stored = localStorage.getItem("recentlyPlayed")
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error getting recently played:", error)
    }

    return []
  },
}

// Featured surahs (commonly read)
export const featuredSurahIds = [1, 2, 18, 36, 55, 67, 112, 113, 114]
