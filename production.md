Berikut adalah **Technical Deployment Blueprint** yang dirancang khusus agar tim developer dapat mengeksekusi proses migrasi dari *Localhost* ke *Production* menggunakan infrastruktur **100% Gratis**:

---

### **Task: Zero-Budget Production Deployment Strategy**

#### **1. Database Provisioning (TiDB Cloud)**
*   **Provider:** TiDB Cloud (Serverless Tier).
*   **Spec:** MySQL 8.0 compatible, 5GB storage (Free).
*   **Action:** 
    *   Provision cluster di region `aws-ap-southeast-1` (Singapore) untuk latency terendah.
    *   Update `DATABASE_URL` pada file `.env` produksi dengan CA Certificate enabled (`ssl={"rejectUnauthorized":true}`).
    *   Jalankan `bunx drizzle-kit push` dari local machine menggunakan production connection string untuk sinkronisasi skema tabel.

#### **2. Backend API Deployment (Koyeb)**
*   **Provider:** Koyeb (Nano Instance).
*   **Runtime:** Bun (Native Support).
*   **Configuration:**
    *   **Build Command:** `bun install`
    *   **Run Command:** `bun run src/index.ts`
    *   **Port:** Expose port `8000` (atau sesuai konfigurasi Elysia).
*   **Environment Variables:**
    *   Set `DATABASE_URL`, `JWT_SECRET`, dan `NODE_ENV=production`.
*   **Optimization:** Gunakan Health Check endpoint untuk monitoring stabilitas container.

#### **3. Frontend Deployment (Vercel)**
*   **Provider:** Vercel (Hobby Tier).
*   **Framework:** Next.js 15 (App Router).
*   **Action:**
    *   Link repositori GitHub (folder `/frontend` atau root).
    *   **Build Settings:** Pastikan *Install Command* menggunakan `bun install` (Vercel mendukung Bun secara native).
*   **Environment Variables:**
    *   Set `NEXT_PUBLIC_API_URL` mengarah ke URL publik dari Koyeb (misal: `https://api-pomopulse.koyeb.app`).

#### **4. Security & Networking (Critical)**
*   **CORS Configuration:** Update middleware `cors` di `backend/src/index.ts`. Ganti `origin: '*'` menjadi whitelist spesifik:
    ```typescript
    .use(cors({
      origin: ['https://pomopulse.vercel.app', /\.vercel\.app$/]
    }))
    ```
*   **Environment Hardening:** Pastikan semua *sensitive keys* (`JWT_SECRET`, `DB_PASSWORD`) tidak ada yang ter-hardcode di dalam source code dan hanya di-input via Dashboard Provider (Koyeb/Vercel).

#### **5. Maintenance Plan (Stay-Awake Script)**
*   **Issue:** Layanan gratis biasanya masuk ke mode *Sleep* setelah 15 menit inaktif.
*   **Solution:** Setup cron-job via [Cron-job.org](https://cron-job.org/) untuk melakukan `GET` request ke API endpoint setiap 10 menit agar instance Koyeb tetap *Active (Always Online)*.

---

### **Definition of Done (DoD) for Deployment:**
- [ ] Database tersinkronisasi via Drizzle Kit.
- [ ] Backend API merespon `200 OK` pada endpoint `/api/health`.
- [ ] Frontend sukses melakukan *Data Fetching* dari backend produksi.
- [ ] Sistem Auth (Login/Register) berfungsi dengan persistensi data di TiDB Cloud.
- [ ] SSL (HTTPS) aktif di kedua sisi (FE & BE).

**Instruksi untuk Tim Dev:** "Silakan mulai dengan melakukan *provisioning* database di TiDB Cloud terlebih dahulu, lalu lanjutkan dengan deployment backend ke Koyeb agar URL API tersedia untuk konfigurasi frontend di Vercel."