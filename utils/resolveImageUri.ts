// utils/resolveImageUri.ts
export function resolveImageUri(
  imageUri?: string | null | undefined
): string | null {
  if (
    imageUri &&
    typeof imageUri === "string" &&
    imageUri.trim() !== "" &&
    (imageUri.startsWith("file://") || /^https?:\/\//.test(imageUri))
  ) {
    return imageUri;
  }
  return null;
}
