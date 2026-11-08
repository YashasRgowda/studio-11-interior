// Photos: shrink in the browser, then upload to Cloudinary with progress.
import { cloudinaryConfig } from "@/lib/cloudinary-config";

// Big phone photos are made smaller first, so uploads are quick and the site stays fast.
export async function shrink(file: File, maxSide: number): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), "image/jpeg", 0.88));
  } catch {
    return file; // the browser could not read it; let Cloudinary handle the original
  }
}

export function uploadToCloudinary(blob: Blob, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", blob, "photo.jpg");
    form.append("upload_preset", cloudinaryConfig.uploadPreset);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`);
    xhr.upload.addEventListener("progress", (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); });
    xhr.addEventListener("load", () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && res.secure_url) resolve(res.secure_url);
        else reject(new Error(res?.error?.message || `Upload failed (${xhr.status})`));
      } catch (e) { reject(e); }
    });
    xhr.addEventListener("error", () => reject(new Error("network")));
    xhr.send(form);
  });
}

// Checks a chosen file. Returns an error message, or "" when it is fine.
export function checkPhoto(file: File): string {
  if (!file.type.startsWith("image/")) return "Please choose a photo.";
  if (file.size > 30 * 1024 * 1024) return "This photo is too big. Please choose a smaller one.";
  return "";
}
