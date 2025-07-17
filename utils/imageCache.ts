import AsyncStorage from "@react-native-async-storage/async-storage";

interface CachedImage {
  uri: string;
  timestamp: number;
  data: string; // base64 encoded image data
}

const CACHE_PREFIX = "image_cache_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class ImageCache {
  private static instance: ImageCache;
  private cache: Map<string, CachedImage> = new Map();

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  async getCachedImage(uri: string): Promise<string | null> {
    const key = CACHE_PREFIX + this.hashString(uri);

    // Check memory cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data;
    }

    // Check AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const cachedImage: CachedImage = JSON.parse(stored);
        if (Date.now() - cachedImage.timestamp < CACHE_EXPIRY) {
          this.cache.set(key, cachedImage);
          return cachedImage.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("Error reading from image cache:", error);
    }

    return null;
  }

  async cacheImage(uri: string, data: string): Promise<void> {
    const key = CACHE_PREFIX + this.hashString(uri);
    const cachedImage: CachedImage = {
      uri,
      timestamp: Date.now(),
      data,
    };

    // Store in memory cache
    this.cache.set(key, cachedImage);

    // Store in AsyncStorage
    try {
      await AsyncStorage.setItem(key, JSON.stringify(cachedImage));
    } catch (error) {
      console.warn("Error writing to image cache:", error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      this.cache.clear();
    } catch (error) {
      console.warn("Error clearing image cache:", error);
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

export const imageCache = ImageCache.getInstance();
