// src/lib/image-utils.ts
/**
 * Convert File/Blob ke Buffer untuk disimpan di Prisma Bytes field
 */
export async function fileToBuffer(file: File | Blob): Promise<Buffer> {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes);
}

/**
 * Convert Buffer dari DB ke base64 data URL untuk ditampilkan di <img>
 * ✅ FIX: Export name sesuai yang di-import di avatar.tsx
 */
export function bufferToDataUrl(
  buffer: Buffer | Uint8Array | string | null, 
  mimeType = "image/jpeg"
): string | null {
  if (!buffer) return null;
  if (typeof buffer === "string") return buffer;
  
  try {
    const base64 = Buffer.isBuffer(buffer) 
      ? buffer.toString("base64")
      : Buffer.from(buffer).toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * Alias: bufferToBase64 = bufferToDataUrl (untuk konsistensi nama)
 */
export const bufferToBase64 = bufferToDataUrl;

/**
 * Detect MIME type dari Buffer (simple heuristic)
 */
export function detectMimeType(buffer: Buffer): string {
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E) return "image/png";
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return "image/gif";
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46) return "image/webp";
  return "image/jpeg";
}