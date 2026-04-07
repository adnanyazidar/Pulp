/**
 * ✍️ PomoPulse Editorial Copybook
 * Centralized text constants for consistent branding and easier i18n support.
 */

export const TOOLTIPS = {
  activeTask: "Select a task from the main list. The session will be automatically recorded after the timer ends.",
  dailyFocus: "Your private scratchpad. Data is stored locally in your browser for maximum privacy.",
  environment: "Nature sound mixer. Can be played simultaneously with external music.",
  mediaHub: "Paste a YouTube/Spotify link. The metadata title will be retrieved via the OEmbed API.",
  userLevel: "XP is earned from focus duration. Level up every 1000 XP.",
  syncIndicator: "Cloud Sync Status: A checked cloud means data is securely on the server.",
};

export const HANDBOOK = {
  seo: {
    title: "PomoPulse Handbook — Master Your Productivity Rhythm",
    description: "Learn how to use PomoPulse's unique XP system, ambient mixer, and cloud sync to elevate your deep work sessions.",
  },
  hero: {
    title: "Welcome to the Rhythm of Productivity",
    content: "PomoPulse bukan sekadar timer. Ini adalah pusat kendali untuk menguasai waktu, membangun ritme kerja yang stabil, dan mencapai kondisi Flow State yang mendalam. Mari pelajari bagaimana aplikasi ini bekerja untuk Anda.",
  },
  sections: [
    {
      id: "timer-logic",
      title: "The Core Mechanic (The Timer)",
      content: "Teknik Pomodoro membagi waktu Anda menjadi interval 25 menit fokus penuh, dipisahkan oleh istirahat pendek. Konsistensi dalam siklus ini membantu otak Anda mempertahankan energi mental tanpa merasa terbakar (burnout).",
      icon: "Timer",
    },
    {
      id: "pulse-system",
      title: "The Pulse System (Gamification)",
      content: "Setiap detik yang Anda habiskan dalam fokus dihitung sebagai XP (Experience Points). Kumpulkan 1000 XP untuk naik ke level berikutnya. Semakin tinggi level Anda, semakin kuat reputasi produktivitas Anda.",
      details: [
        "1 Minute Focus = 4 XP",
        "Threshold Level = 1000 XP",
        "Streaks: Focus daily to keep your rhythm alive.",
      ],
      icon: "Zap",
    },
    {
      id: "audio-architecture",
      title: "Immersion & Soundscapes",
      content: "Produktivitas membutuhkan suasana. PomoPulse memungkinkan Anda menggabungkan dua lapisan audio: Ambient Noise untuk memblokir gangguan, dan External Media untuk playlist favorit Anda.",
      icon: "Volume2",
    },
    {
      id: "data-integrity",
      title: "Privacy & Cloud Sync",
      content: "Kami menghargai progres Anda. Fitur Smart Merge kami secara otomatis memindahkan seluruh progres Anda dari mode tamu ke akun permanen saat Anda mendaftar.",
      icon: "ShieldCheck",
    }
  ],
  footer: "Siap untuk memulai ritme baru hari ini? Kembali ke Dashboard dan nyalakan Pulse pertama Anda.",
};
