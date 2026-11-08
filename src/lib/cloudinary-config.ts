// Cloudinary (free plan, account studio11interior.db@gmail.com) stores the photos
// the owner uploads in the admin panel. An unsigned preset is safe to expose:
// it only allows uploads into the "studio11" folder.
export const cloudinaryConfig = {
  cloudName: "m3t3s0hw",
  uploadPreset: "studio11_admin",
};
