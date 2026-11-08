// Sizes any photo for where it is shown: Unsplash and Cloudinary both resize on the fly.
export function sized(url: string, w: number, h?: number): string {
  if (!url) return url;
  if (url.includes("res.cloudinary.com")) {
    const t = h ? `f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}` : `f_auto,q_auto,c_limit,w_${w}`;
    return url.replace("/upload/", `/upload/${t}/`);
  }
  if (url.includes("images.unsplash.com")) {
    const u = new URL(url);
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    u.searchParams.set("w", String(w));
    if (h) u.searchParams.set("h", String(h));
    else u.searchParams.delete("h");
    u.searchParams.set("q", "75");
    return u.toString();
  }
  return url;
}

export function srcSet(url: string, widths: number[], ratio?: number): string {
  return widths.map((w) => `${sized(url, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(", ");
}
