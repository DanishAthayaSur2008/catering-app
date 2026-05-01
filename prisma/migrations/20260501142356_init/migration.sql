-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'admin',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pelanggans" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "nama_pelanggan" TEXT NOT NULL,
    "alamat1" TEXT,
    "alamat2" TEXT,
    "alamat3" TEXT,
    "no_telp" TEXT,
    "foto" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pakets" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "nama_paket" TEXT NOT NULL,
    "menu_paket" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "harga_paket" REAL NOT NULL,
    "foto" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pemesanans" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "id_pelanggan" INTEGER NOT NULL,
    "id_jenis_pembayaran" INTEGER,
    "tanggal_pemesanan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_acara" DATETIME NOT NULL,
    "total_harga" REAL NOT NULL,
    "status_pesanan" TEXT NOT NULL DEFAULT 'Menunggu_Konfirmasi',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pemesanans_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pemesanans_id_jenis_pembayaran_fkey" FOREIGN KEY ("id_jenis_pembayaran") REFERENCES "jenispembayarans" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "detail_pemesanans" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "id_pemesanan" INTEGER NOT NULL,
    "id_paket" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "subtotal" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "detail_pemesanans_id_pemesanan_fkey" FOREIGN KEY ("id_pemesanan") REFERENCES "pemesanans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "detail_pemesanans_id_paket_fkey" FOREIGN KEY ("id_paket") REFERENCES "pakets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pengirimans" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "id_pesan" INTEGER NOT NULL,
    "tanggal_kirim" DATETIME,
    "status_kirim" TEXT NOT NULL DEFAULT 'Belum_Dikirim',
    "bukti_foto" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "kurirId" INTEGER,
    CONSTRAINT "pengirimans_id_pesan_fkey" FOREIGN KEY ("id_pesan") REFERENCES "pemesanans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pengirimans_kurirId_fkey" FOREIGN KEY ("kurirId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "jenispembayarans" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "nama_pembayaran" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "detailjenispembayarans" (
    "id" INTEGER IDENTITY(1,1) NOT NULL PRIMARY KEY,
    "id_jenis_pembayaran" INTEGER NOT NULL,
    "tempat_pembayaran" TEXT,
    "no_rekening" TEXT,
    "logo_pembayaran" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "detailjenispembayarans_id_jenis_pembayaran_fkey" FOREIGN KEY ("id_jenis_pembayaran") REFERENCES "jenispembayarans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pengirimans_id_pesan_key" ON "pengirimans"("id_pesan");
