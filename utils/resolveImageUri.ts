// utils/resolveImageUri.ts
import { API_BASE_URL } from "@/constants/api";

export function resolveImageUri(
  imageUri?: string | null | undefined
): string | null {
  console.log("resolveImageUri input:", imageUri);

  if (
    imageUri &&
    typeof imageUri === "string" &&
    imageUri.trim() !== "" &&
    imageUri.trim() !== "null" &&
    imageUri.trim() !== "undefined"
  ) {
    const trimmedUri = imageUri.trim();
    console.log("trimmedUri:", trimmedUri);

    // If it's already a full URL, return as is
    if (
      trimmedUri.startsWith("http://") ||
      trimmedUri.startsWith("https://") ||
      trimmedUri.startsWith("file://")
    ) {
      console.log("returning full URL:", trimmedUri);
      return trimmedUri;
    }

    // If it's a relative path starting with /, prepend the base URL without /api
    if (trimmedUri.startsWith("/")) {
      // Remove /api from the base URL for media files
      const baseUrl = API_BASE_URL.replace("/api", "");
      const fullUrl = `${baseUrl}${trimmedUri}`;
      console.log("returning relative URL with /:", fullUrl);
      return fullUrl;
    }

    // If it's a relative path without /, prepend the base URL without /api
    const baseUrl = API_BASE_URL.replace("/api", "");
    const fullUrl = `${baseUrl}/${trimmedUri}`;
    console.log("returning relative URL without /:", fullUrl);
    return fullUrl;
  }
  console.log("returning null for:", imageUri);
  return null;
}

// Helper function to check if an image URL is likely to be slow or unreliable
export function isUnreliableImageUrl(url: string): boolean {
  const unreliableDomains = [
    "picsum.photos",
    "placeholder.com",
    "via.placeholder.com",
    "placehold.it",
    "dummyimage.com",
  ];

  return unreliableDomains.some((domain) => url.includes(domain));
}

// Helper function to get a reliable fallback image
export function getFallbackImage(): number {
  return require("@/assets/images/plan-placeholder.png");
}
