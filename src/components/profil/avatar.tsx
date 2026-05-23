// src/components/profil/avatar.tsx
import Image from "next/image"; // ✅ Import dari next/image
import { bufferToDataUrl, detectMimeType } from "@/lib/image-utils";

interface AvatarProps {
  fotoBuffer: Buffer | null;
  namaPelanggan: string;
  className?: string;
}

export function Avatar({ fotoBuffer, namaPelanggan, className }: AvatarProps) {
  // ✅ Convert Buffer ke data URL
  const imageSrc = fotoBuffer 
    ? bufferToDataUrl(fotoBuffer, detectMimeType(fotoBuffer))
    : null;

  return (
    <div className={`relative rounded-full overflow-hidden border ${className || "h-20 w-20"}`}>
      {imageSrc ? (
        <Image 
          src={imageSrc} 
          alt={namaPelanggan}
          fill // ✅ Gunakan fill agar mengikuti ukuran parent div
          className="object-cover"
          unoptimized // ✅ WAJIB untuk data URL/base64
          priority // Opsional: tambahkan jika ini adalah elemen penting di atas lipatan layar (LCP)
        />
      ) : (
        <div className="h-full w-full bg-slate-100 flex items-center justify-center">
          <span className="text-2xl font-black text-slate-400">
            {namaPelanggan.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}