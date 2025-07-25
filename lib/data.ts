import type { Surah } from "./types"

export const surahs: Surah[] = [
  {
    id: 1,
    name: "الفاتحة",
    nameArabic: "الفاتحة",
    nameEnglish: "Al-Fatiha",
    meaning: "The Opening",
    verses: 7,
    revelation: "Meccan",
    audioUrl: "/audio/001-al-fatiha.mp3",
    ayahs: [
      {
        id: 1,
        surahId: 1,
        number: 1,
        textArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        textEnglish: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      },
      {
        id: 2,
        surahId: 1,
        number: 2,
        textArabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        textEnglish: "[All] praise is [due] to Allah, Lord of the worlds -",
      },
      {
        id: 3,
        surahId: 1,
        number: 3,
        textArabic: "الرَّحْمَٰنِ الرَّحِيمِ",
        textEnglish: "The Entirely Merciful, the Especially Merciful,",
      },
      {
        id: 4,
        surahId: 1,
        number: 4,
        textArabic: "مَالِكِ يَوْمِ الدِّينِ",
        textEnglish: "Sovereign of the Day of Recompense.",
      },
      {
        id: 5,
        surahId: 1,
        number: 5,
        textArabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        textEnglish: "It is You we worship and You we ask for help.",
      },
      {
        id: 6,
        surahId: 1,
        number: 6,
        textArabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        textEnglish: "Guide us to the straight path -",
      },
      {
        id: 7,
        surahId: 1,
        number: 7,
        textArabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        textEnglish:
          "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      },
    ],
  },
  {
    id: 2,
    name: "البقرة",
    nameArabic: "البقرة",
    nameEnglish: "Al-Baqarah",
    meaning: "The Cow",
    verses: 286,
    revelation: "Medinan",
    audioUrl: "/audio/002-al-baqarah.mp3",
    ayahs: [
      {
        id: 8,
        surahId: 2,
        number: 1,
        textArabic: "الم",
        textEnglish: "Alif, Lam, Meem.",
      },
      {
        id: 9,
        surahId: 2,
        number: 2,
        textArabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
        textEnglish: "This is the Book about which there is no doubt, a guidance for those conscious of Allah -",
      },
    ],
  },
  {
    id: 3,
    name: "آل عمران",
    nameArabic: "آل عمران",
    nameEnglish: "Ali Imran",
    meaning: "Family of Imran",
    verses: 200,
    revelation: "Medinan",
    audioUrl: "/audio/003-ali-imran.mp3",
    ayahs: [
      {
        id: 10,
        surahId: 3,
        number: 1,
        textArabic: "الم",
        textEnglish: "Alif, Lam, Meem.",
      },
    ],
  },
  {
    id: 4,
    name: "النساء",
    nameArabic: "النساء",
    nameEnglish: "An-Nisa",
    meaning: "The Women",
    verses: 176,
    revelation: "Medinan",
    audioUrl: "/audio/004-an-nisa.mp3",
    ayahs: [],
  },
  {
    id: 5,
    name: "المائدة",
    nameArabic: "المائدة",
    nameEnglish: "Al-Maidah",
    meaning: "The Table Spread",
    verses: 120,
    revelation: "Medinan",
    audioUrl: "/audio/005-al-maidah.mp3",
    ayahs: [],
  },
  {
    id: 6,
    name: "الأنعام",
    nameArabic: "الأنعام",
    nameEnglish: "Al-Anam",
    meaning: "The Cattle",
    verses: 165,
    revelation: "Meccan",
    audioUrl: "/audio/006-al-anam.mp3",
    ayahs: [],
  },
]

export const featuredSurahs = [1, 2, 18, 36, 55, 67] // Al-Fatiha, Al-Baqarah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk
