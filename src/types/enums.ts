// src/types/enums.ts

export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  KURIR: 'kurir',
  PELANGGAN: 'pelanggan',
} as const;
export type Role = typeof ROLES[keyof typeof ROLES];

export const STATUS_PESANAN = {
  MENUNGGU_KONFIRMASI: 'Menunggu_Konfirmasi',
  SEDANG_DIPROSES: 'Sedang_Diproses',
  MENUNGGU_KURIR: 'Menunggu_Kurir',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
} as const;
export type StatusPesanan = typeof STATUS_PESANAN[keyof typeof STATUS_PESANAN];

export const STATUS_KIRIM = {
  BELUM_DIKIRIM: 'Belum_Dikirim',
  SEDANG_DIKIRIM: 'Sedang_Dikirim',
  TIBA_DITUJUAN: 'Tiba_Ditujuan',
} as const;
export type StatusKirim = typeof STATUS_KIRIM[keyof typeof STATUS_KIRIM];

export const MENU_OPTIONS = {
  DASHBOARD: 'dashboard',
  PELANGGAN: 'pelanggan',
  PAKET: 'paket',
  PESANAN: 'pesanan',
  PENGIRIMAN: 'pengiriman',
  LAPORAN: 'laporan',
  PROFIL: 'profil',
} as const;
export type MenuOption = typeof MENU_OPTIONS[keyof typeof MENU_OPTIONS];

export const ROLE_PERMISSIONS: Record<string, MenuOption[]> = {
  admin: [MENU_OPTIONS.DASHBOARD, MENU_OPTIONS.PELANGGAN, MENU_OPTIONS.PAKET, MENU_OPTIONS.PESANAN, MENU_OPTIONS.PENGIRIMAN, MENU_OPTIONS.LAPORAN],
  owner: [MENU_OPTIONS.DASHBOARD, MENU_OPTIONS.PESANAN, MENU_OPTIONS.LAPORAN],
  kurir: [MENU_OPTIONS.PENGIRIMAN],
  pelanggan: [MENU_OPTIONS.PROFIL, MENU_OPTIONS.PAKET, MENU_OPTIONS.PESANAN, MENU_OPTIONS.PENGIRIMAN], // ✅ Pelanggan hanya akses ini
};
