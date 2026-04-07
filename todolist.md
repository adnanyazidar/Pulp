Pilihan yang sangat tepat! Membuat **Daily To-Do List** sebagai **Widget** di halaman Dashboard/Timer akan membuat PomoFocus terasa jauh lebih fungsional dan "hidup". User bisa mengelola tugas mereka tanpa harus berpindah halaman saat sedang fokus.

Berikut adalah rencana desain dan implementasi untuk **"Daily Focus Widget"** yang keren dan sinkron:

---

### 1. Konsep Visual: "The Glassmorphic Sidebar Widget"

Kita akan menempatkan widget ini di sisi kanan atau di bawah Timer (tergantung ukuran layar).

*   **Desain:** Menggunakan efek **Glassmorphism** (transparan dengan blur tinggi).
*   **Editorial Touch:** Tipografi yang bersih, dengan *heading* kecil: `DAILY FOCUS`.
*   **Interaktivitas:** Tugas yang dipilih di widget ini akan otomatis menjadi "Active Task" di Timer.

---

### 2. Fitur Utama Widget (The "Keren" Part)

Agar widget ini tidak sekadar daftar biasa, kita tambahkan fitur ini:

1.  **Quick Add:** Input bar tipis di bagian atas widget untuk menambah tugas instan (tanpa modal). Cukup ketik dan tekan `Enter`.
2.  **Click-to-Focus:** Klik pada teks tugas untuk langsung memasukkannya ke Timer sebagai tugas yang sedang dikerjakan.
3.  **Visual Progress:** Jika tugas punya estimasi (misal 2 Pomo), tampilkan *progress bar* mungil atau titik-titik kecil di bawah judul tugas.
4.  **Auto-Hide Completed:** Tugas yang sudah dicentang akan menghilang secara halus (*fade out*) untuk menjaga widget tetap bersih, namun tetap ada di menu **Tasks** utama.

---

### 3. Rencana Implementasi Teknis (Technical Plan)

**A. Component Structure (`daily-todo-widget.tsx`):**
Widget ini akan berlangganan (*subscribe*) ke `task-store.ts` yang sudah ada.

**B. Sinkronisasi Database:**
*   Setiap kali user menambah tugas lewat widget, panggil API `POST /api/tasks`.
*   Tugas baru ini secara default akan masuk ke project **"General"** atau **"Personal"** jika user tidak menentukan kategori.

**C. Integrasi Timer:**
*   Saat tugas di widget di-klik: panggil `setActiveTask(id)` di `timer-store`.
*   Timer akan menampilkan judul tugas tersebut di bawah angka waktu.

---

### 4. Layout Dashboard Baru (The "Power Dashboard")

Dengan adanya widget ini, halaman utama kamu akan terlihat seperti ini:

```text
_______________________________________________________
|             |                                       |
|   SIDEBAR   |           TOP NAVBAR (Profile/Set)    |
|   (Links)   |_______________________________________|
|             |                   |                   |
|             |      TIMER        |   DAILY FOCUS     |
|             |      (Large)      |   WIDGET          |
|             |                   |   (List Tasks)    |
|             |___________________|                   |
|             |                   |   [Add New...]    |
|             |   ACTIVE TASK     |                   |
|_____________|___________________|___________________|
```

---

### 5. Mengapa Ini Lebih Baik? (UX Advantage)

1.  **Zero Friction:** User tidak perlu klik menu "Tasks" di sidebar hanya untuk melihat apa yang harus dikerjakan selanjutnya.
2.  **Focus Flow:** Saat user melihat daftar tugas di samping timer, otak mereka akan lebih terpacu untuk menyelesaikan daftar tersebut satu per satu.
3.  **Real-time Sync:** Karena menggunakan **Zustand**, jika user mengedit tugas di halaman "Tasks" utama, perubahannya akan langsung terlihat di Widget ini secara instan.

**Kesimpulan:**
Widget ini akan menjadi "Asisten Pribadi" di halaman utama PomoFocus. Tampilan dashboard kamu akan terlihat sangat modern dan fungsional, mirip dengan aplikasi produktivitas elit.

**Apakah kamu ingin saya buatkan boilerplate kode Tailwind untuk tampilan Widget ini agar terlihat "Glossy" dan premium?**