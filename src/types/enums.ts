// src/types/enums.ts

// ========== ROLES ==========
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  KURIR: 'kurir',
  PELANGGAN: 'pelanggan',
} as const;
export type Role = typeof ROLES[keyof typeof ROLES];

// ========== STATUS PESANAN ==========
export const STATUS_PESANAN = {
  MENUNGGU_KONFIRMASI: 'Menunggu_Konfirmasi',
  SEDANG_DIPROSES: 'Sedang_Diproses',
  MENUNGGU_KURIR: 'Menunggu_Kurir',
  SEDANG_DIKIRIM: 'Sedang_Dikirim',
  TIBA_DITUJUAN: 'Tiba_Ditujuan',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
} as const;
export type StatusPesanan = typeof STATUS_PESANAN[keyof typeof STATUS_PESANAN];

// ========== STATUS KIRIM ==========
export const STATUS_KIRIM = {
  BELUM_DIKIRIM: 'Belum_Dikirim',
  SEDANG_DIKIRIM: 'Sedang_Dikirim',
  TIBA_DITUJUAN: 'Tiba_Ditujuan',
} as const;
export type StatusKirim = typeof STATUS_KIRIM[keyof typeof STATUS_KIRIM];

// ========== STATUS PEMBAYARAN ==========
export const STATUS_PEMBAYARAN = {
  MENUNGGU_PEMBAYARAN: 'Menunggu_Pembayaran',
  MENUNGGU_KONFIRMASI_BAYAR: 'Menunggu_Konfirmasi_Bayar',
  LUNAS: 'Lunas',
  GAGAL: 'Gagal',
  REFUND: 'Refund',
} as const;
export type StatusPembayaran = typeof STATUS_PEMBAYARAN[keyof typeof STATUS_PEMBAYARAN];

// ========== METODE PEMBAYARAN ==========
export const METODE_PEMBAYARAN = {
  TRANSFER_BANK: 'Transfer_Bank',
  E_WALLET: 'E_Wallet',
  COD: 'COD',
} as const;
export type MetodePembayaran = typeof METODE_PEMBAYARAN[keyof typeof METODE_PEMBAYARAN];

// ========== STATUS PAKET ==========
export const STATUS_PAKET = {
  AKTIF: 'aktif',
  NONAKTIF: 'nonaktif',
} as const;
export type StatusPaket = typeof STATUS_PAKET[keyof typeof STATUS_PAKET];

// ========== KATEGORI PAKET ==========
export const KATEGORI_PAKET = {
  PERNIKAHAN: 'Pernikahan',
  SELAMETAN: 'Selametan',
  ULANG_TAHUN: 'Ulang Tahun',
  KANTOR: 'Kantor',
  LAINNYA: 'Lainnya',
} as const;
export type KategoriPaket = typeof KATEGORI_PAKET[keyof typeof KATEGORI_PAKET];

// ========== MENU OPTIONS (untuk sidebar/navigation) ==========
export const MENU_OPTIONS = {
  DASHBOARD: 'dashboard',
  PELANGGAN: 'pelanggan',
  PAKET: 'paket',
  PESANAN: 'pesanan',
  PENGIRIMAN: 'pengiriman',
  LAPORAN: 'laporan',
  PROFIL: 'profil',
  PESAN: 'pesan',
  PEMBAYARAN: 'pembayaran',
  TRACKING: 'tracking',
  PAYMENT_METHODS: 'payment_methods',
} as const;
export type MenuOption = typeof MENU_OPTIONS[keyof typeof MENU_OPTIONS];

// ========== ROLE PERMISSIONS (middleware access control) ==========
export const ROLE_PERMISSIONS: Record<Role, MenuOption[]> = {
  admin: [
    MENU_OPTIONS.DASHBOARD,
    MENU_OPTIONS.PELANGGAN,
    MENU_OPTIONS.PAKET,
    MENU_OPTIONS.PESANAN,
    MENU_OPTIONS.PENGIRIMAN,
    MENU_OPTIONS.LAPORAN,
    MENU_OPTIONS.PAYMENT_METHODS,
  ],
  owner: [
    MENU_OPTIONS.DASHBOARD,
    MENU_OPTIONS.PELANGGAN,
    MENU_OPTIONS.PAKET,
    MENU_OPTIONS.PESANAN,
    MENU_OPTIONS.PENGIRIMAN,
    MENU_OPTIONS.LAPORAN,
    MENU_OPTIONS.PAYMENT_METHODS,
  ],
  kurir: [MENU_OPTIONS.PENGIRIMAN],
  pelanggan: [
    MENU_OPTIONS.PROFIL,
    MENU_OPTIONS.PAKET,
    MENU_OPTIONS.PESAN,
    MENU_OPTIONS.PESANAN,
    MENU_OPTIONS.PENGIRIMAN,
    MENU_OPTIONS.PEMBAYARAN,
    MENU_OPTIONS.TRACKING,
  ],
};

// ========== HELPER FUNCTIONS ==========

export function getStatusPesananLabel(status: StatusPesanan): string {
  const labels: Record<StatusPesanan, string> = {
    'Menunggu_Konfirmasi': 'Menunggu Konfirmasi',
    'Sedang_Diproses': 'Sedang Diproses',
    'Menunggu_Kurir': 'Menunggu Kurir',
    'Sedang_Dikirim': 'Sedang Dikirim',
    'Tiba_Ditujuan': 'Tiba di Tujuan',
    'Selesai': 'Selesai',
    'Dibatalkan': 'Dibatalkan',
  };
  return labels[status] || status;
}

export function getStatusPesananColor(status: StatusPesanan): string {
  const colors: Record<StatusPesanan, string> = {
    'Menunggu_Konfirmasi': 'bg-yellow-100 text-yellow-800',
    'Sedang_Diproses': 'bg-blue-100 text-blue-800',
    'Menunggu_Kurir': 'bg-purple-100 text-purple-800',
    'Sedang_Dikirim': 'bg-indigo-100 text-indigo-800',
    'Tiba_Ditujuan': 'bg-green-100 text-green-800',
    'Selesai': 'bg-emerald-100 text-emerald-800',
    'Dibatalkan': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusPembayaranLabel(status: StatusPembayaran): string {
  const labels: Record<StatusPembayaran, string> = {
    'Menunggu_Pembayaran': 'Menunggu Pembayaran',
    'Menunggu_Konfirmasi_Bayar': 'Menunggu Konfirmasi',
    'Lunas': 'Lunas',
    'Gagal': 'Gagal',
    'Refund': 'Refund',
  };
  return labels[status] || status;
}

export function getStatusPembayaranColor(status: StatusPembayaran): string {
  const colors: Record<StatusPembayaran, string> = {
    'Menunggu_Pembayaran': 'bg-gray-100 text-gray-800',
    'Menunggu_Konfirmasi_Bayar': 'bg-orange-100 text-orange-800',
    'Lunas': 'bg-green-100 text-green-800',
    'Gagal': 'bg-red-100 text-red-800',
    'Refund': 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentMethodIcon(metode: MetodePembayaran): string {
  const icons: Record<MetodePembayaran, string> = {
    'Transfer_Bank': 'CreditCard',
    'E_Wallet': 'Wallet',
    'COD': 'Truck',
  };
  return icons[metode] || 'CreditCard';
}

export function getStatusKirimColor(status: string): string {
  const colors: Record<string, string> = {
    'Belum_Dikirim': 'bg-gray-100 text-gray-800',
    'Sedang_Dikirim': 'bg-blue-100 text-blue-800',
    'Tiba_Ditujuan': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}