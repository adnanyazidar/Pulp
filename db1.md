Ini adalah **Arsitektur Final PomoFocus** yang menggabungkan seluruh fitur yang telah kita diskusikan: dari sistem Timer, Manajemen Tugas, Analitik Mendalam, Gamifikasi (Level/XP), hingga **Media Hub (YouTube/Spotify)**.

---

## 1. Database Schema (Final - Drizzle ORM)

Struktur ini dirancang untuk performa tinggi dan sinkronisasi data yang mulus antara perangkat.

```typescript
import {
  mysqlTable,
  serial,
  varchar,
  int,
  boolean,
  timestamp,
  mysqlEnum,
  text,
} from "drizzle-orm/mysql-core";

// 1. Identitas & Profil Pengguna
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Statistik & Gamifikasi (Dipisah untuk performa query cepat)
export const user_stats = mysqlTable("user_stats", {
  userId: int("user_id")
    .primaryKey()
    .references(() => users.id),
  level: int("level").default(1),
  xp: int("xp").default(0),
  totalFocusMinutes: int("total_focus_minutes").default(0),
  currentStreak: int("current_streak").default(0),
  bestStreak: int("best_streak").default(0),
  globalRank: int("global_rank"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

// 3. Pengaturan Personal (Dynamic Theme & Sound)
export const settings = mysqlTable("settings", {
  userId: int("user_id")
    .primaryKey()
    .references(() => users.id),
  focusDuration: int("focus_duration").default(25),
  shortBreakDuration: int("short_break_duration").default(5),
  longBreakDuration: int("long_break_duration").default(15),
  alarmSound: varchar("alarm_sound", { length: 50 }).default("digital"),
  ambientSound: varchar("ambient_sound", { length: 50 }).default("none"),
  accentColor: varchar("accent_color", { length: 20 }).default("coral"), // Untuk Dynamic Theme
  theme: mysqlEnum("theme", ["light", "dark"]).default("dark"),
  autoStartBreaks: boolean("auto_start_breaks").default(false),
});

// 4. Manajemen Proyek & Tugas
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }), // misal: 'tosca'
});

export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  projectId: int("project_id").references(() => projects.id),
  title: varchar("title", { length: 255 }).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("low"),
  estPomos: int("est_pomos").default(1),
  actPomos: int("act_pomos").default(0),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Log Sesi (Untuk Heatmap & Analytics)
export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  taskId: int("task_id").references(() => tasks.id),
  durationMinutes: int("duration_minutes").notNull(),
  rating: int("rating"), // Flow State 1-10
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Media Hub (YouTube/Spotify Playlists)
export const user_playlists = mysqlTable("user_playlists", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  platform: mysqlEnum("platform", ["youtube", "spotify", "soundcloud"]),
  url: text("url").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  isActive: boolean("is_active").default(true),
});
```

---

## 2. User Flow Database (Alur Kerja Data)

Berikut adalah urutan logika saat data berpindah di dalam PomoFocus:

1.  **Fase Onboarding:**
    - User mendaftar $\rightarrow$ Insert `users`.
    - Otomatis buat profil default $\rightarrow$ Insert `user_stats` & `settings`.
2.  **Fase Tasking:**
    - User membuat project "Coding" $\rightarrow$ Insert `projects`.
    - User menambah tugas "Refactor API" ke project "Coding" $\rightarrow$ Insert `tasks`.
3.  **Fase Fokus (The Core Loop):**
    - User memulai timer $\rightarrow$ Ambil data dari `settings`.
    - Timer selesai $\rightarrow$ **Transaction Trigger**:
      - Insert `sessions` (Log detail).
      - Update `tasks` (Tambah `actPomos` +1).
      - Update `user_stats` (Tambah `xp`, `totalFocusMinutes`, dan cek `currentStreak`).
4.  **Fase Media Station:**
    - User menempel link YouTube Lofi $\rightarrow$ Backend konversi ke link Embed.
    - Simpan ke library $\rightarrow$ Insert `user_playlists`.
5.  **Fase Analytics:**
    - Frontend request data $\rightarrow$ Query `sessions` (Grouped by date untuk Heatmap, grouped by project untuk Temporal Allocation).

---

## 3. Response API (JSON Format)

Berikut adalah struktur respon yang dikirimkan Backend (ElysiaJS) ke UI (Next.js):

### A. Response: User Profile & Gamification (`GET /api/me`)

```json
{
  "status": "success",
  "data": {
    "username": "john_focus",
    "avatar": "/img/john.png",
    "stats": {
      "level": 14,
      "xp": 850,
      "xpToNextLevel": 1000,
      "streak": 12,
      "totalHours": 342,
      "rank": "#452",
      "status": "Elite Focuser"
    }
  }
}
```

### B. Response: Media Hub (`GET /api/media/playlists`)

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Lofi Girl - Study Radio",
      "platform": "youtube",
      "embedUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
      "isActive": true
    },
    {
      "id": 2,
      "title": "Deep Focus Spotify",
      "platform": "spotify",
      "embedUrl": "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKHA6YVB2u",
      "isActive": false
    }
  ]
}
```

### C. Response: Task Summary (`GET /api/tasks/summary`)

```json
{
  "status": "success",
  "data": {
    "totalPlanned": 112,
    "totalCompleted": 84,
    "velocity": "75%",
    "activeTask": {
      "id": 101,
      "title": "Design System Documentation",
      "projectName": "Work",
      "color": "coral"
    }
  }
}
```

### D. Response: Global Settings (`GET /api/settings`)

```json
{
  "status": "success",
  "data": {
    "timer": { "focus": 25, "shortBreak": 5, "longBreak": 15 },
    "appearance": { "theme": "dark", "accentColor": "mint" },
    "audio": { "alarm": "digital", "ambient": "rain" },
    "behavior": { "autoStartBreaks": true }
  }
}
```

---

## 4. Analisis Akhir

Dengan sistem ini, PomoFocus menjadi sangat kompetitif karena:

1.  **Multi-layer Audio:** Data dari `settings` (ambient) dan `user_playlists` (musik) digabung di satu halaman.
2.  **Gamifikasi Otomatis:** Perubahan XP dan Level dikalkulasi di Backend setiap kali sesi selesai, menjamin integritas data (tidak bisa dicurangi dari frontend).
3.  **Fast Analytics:** Tabel `user_stats` menyimpan angka-angka penting (Total Hours/Streak) sehingga profil user bisa dimuat seketika tanpa menghitung ulang ribuan baris di tabel `sessions`.

**Apakah kamu sudah siap untuk mulai membangun database ini menggunakan Drizzle ORM?** Saya bisa bantu buatkan file migrasinya jika kamu butuh.
