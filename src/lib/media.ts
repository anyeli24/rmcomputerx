export const CATEGORY_MEDIA_ACCEPT = ".jpeg,.jpg,.png,.webp,.mp4,image/jpeg,image/jpg,image/png,image/webp,video/mp4";

const VIDEO_EXTENSIONS = [".mp4"];
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

export const getMediaKind = (src?: string | null): "image" | "video" | null => {
  if (!src) return null;

  const normalizedSrc = src.split("?")[0].toLowerCase();
  if (normalizedSrc.startsWith("data:video/")) return "video";
  if (VIDEO_EXTENSIONS.some((extension) => normalizedSrc.endsWith(extension))) return "video";

  return "image";
};

export const isAcceptedCategoryMedia = (file: File) => {
  const normalizedName = file.name.toLowerCase();

  return ALLOWED_MIME_TYPES.has(file.type) || [".jpeg", ".jpg", ".png", ".webp", ".mp4"].some((extension) => normalizedName.endsWith(extension));
};