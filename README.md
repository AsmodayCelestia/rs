# rs
# Teknikal Test - Darwis Corp

Sistem Reward POIN berbasis Web App untuk mencatat tindakan medis karyawan dan mengonversinya menjadi reward harian berdasarkan pengali yang ditentukan admin.

---

## 🚀 Cara Menjalankan Project

### Backend (Express + Sequelize + PostgreSQL)

```bash
cd server
npm install
npx sequelize db:create
npx sequelize db:migrate
npm run dev
```

### Frontend (Vue + Vite)

```bash
cd client
npm install
npm run dev
```

### Environment (.env)

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
```

---

## 👥 Role & Login Testing

| Role     | Email                                         |  Password   |
| -------- | --------------------------------------------- | ----------- |
| Admin    | [admin@mail.com]                              |   admin123  |
| Karyawan | [almira@darwis.com]                           | karyawan123 |

---

## 📦 Endpoint Dokumentasi (REST API)

### ✅ PUBLIC

#### POST `/register`

Register user baru

```json
{
  "name": "Almira",
  "email": "almira@mail.com",
  "password": "karyawan123",
  "role": "karyawan"
}
```

#### POST `/login`

Login dan mendapatkan token akses

```json
{
  "email": "almira@mail.com",
  "password": "karyawan123"
}
```

---

### 🔐 AUTHENTICATED (Header: `Authorization: Bearer <token>`)

### 📘 KARYAWAN

#### POST `/rewards`

Input tindakan dan perhitungan reward otomatis

```json
{
  "actionId": 1,
  "jumlahPasien": 10,
  "tanggal": "2025-06-20"
}
```

#### GET `/my-rewards`

Lihat rekap reward pribadi

#### GET `/my-performance`

Lihat semua tindakan mentah pribadi

---

### 🛠️ ADMIN

#### GET `/user/:id/rewards`

Lihat reward user tertentu

#### PUT `/user/:id/reward/:performanceId`

Update data reward user tertentu

```json
{
  "jumlahPasien": 12,
  "tanggal": "2025-06-21"
}
```

#### DELETE `/user/:id/reward/:performanceId`

Hapus reward satu baris

#### GET `/user/:id/performance`

Lihat data tindakan mentah milik user tertentu

#### GET `/all-rewards`

Lihat semua reward dari seluruh karyawan

---

### 🔧 CRUD MASTER DATA (ADMIN)

#### 📂 Unit

* `POST /units`
* `GET /units`
* `GET /units/:id`
* `PUT /units/:id`
* `DELETE /units/:id`

#### 🩺 Action (Tindakan)

* `POST /actions`
* `GET /actions`
* `GET /actions/:id`
* `PUT /actions/:id`
* `DELETE /actions/:id`

#### 📊 Range (Pengali)

* `POST /ranges`
* `GET /ranges`
* `GET /ranges/:id`
* `PUT /ranges/:id`
* `DELETE /ranges/:id`

---

## 🔢 Perhitungan Reward

* Reward = `jumlahPasien` → dicocokkan ke `range`
* Didapatkan `pengali` × `nilaiPerTindakan`
* Hasil = `subtotal`
* Semua tersimpan ke table `Performances` dan `RewardLogs`

---

## 📌 Catatan

* Role wajib: `admin` dan `karyawan`
* Semua proteksi role via middleware `authorization`
* Semua data tindakan harus melalui `POST /rewards`, tidak boleh manipulasi manual
* Export PDF tersedia di frontend (fitur bonus)

---

Happy coding! 🚀

---

© 2025 Darwis Corp – Technical Test Documentation
