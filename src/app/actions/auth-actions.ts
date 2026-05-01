// src/app/actions/auth-actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signOut } from "@/lib/auth"; // ✅ Import signOut dari auth config lo
import { revalidatePath } from "next/cache";

export async function registerPelanggan(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const validated = z.object({
      nama_pelanggan: z.string().min(3, "Nama minimal 3 karakter"),
      email: z.string().email("Format email salah"),
      password: z.string().min(6, "Password minimal 6 karakter"),
      no_telp: z.string().min(10, "Nomor telepon minimal 10 digit"),
      alamat1: z.string().min(5, "Alamat minimal 5 karakter"),
    }).parse({
      nama_pelanggan: formData.get("nama_pelanggan"),
      email: formData.get("email"),
      password: formData.get("password"),
      no_telp: formData.get("no_telp"),
      alamat1: formData.get("alamat1"),
    });

    // 1. Cek email (Jika error di sini, pastikan sudah npx prisma generate)
    const existing = await prisma.pelanggan.findUnique({ 
      where: { email: validated.email } 
    });
    
    if (existing) return { success: false, message: "Email sudah terdaftar!" };

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // 3. Simpan ke database
    await prisma.pelanggan.create({
      data: {
        namaPelanggan: validated.nama_pelanggan,
        email: validated.email,
        password: hashedPassword,
        noTelp: validated.no_telp,
        alamat1: validated.alamat1,
      },
    });

    return { success: true, message: "Registrasi berhasil! Silakan login." };
  } catch (error) {
    // FIX: ZodError menggunakan .issues, bukan .errors secara langsung
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message };
    }
    
    console.error("Register error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}


/// ✅ LOGOUT ACTION (async function - OK)
export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    // ✅ signOut dipanggil di DALAM async function, bukan di-export
    await signOut({ redirectTo: "/auth/login" });
    revalidatePath("/");
    return { success: true, message: "Berhasil logout" };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "Gagal logout" };
  }
}