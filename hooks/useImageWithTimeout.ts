import { useState, useEffect, useRef } from "react";
import { ImageSourcePropType } from "react-native";

interface UseImageWithTimeoutProps {
  source: ImageSourcePropType | { uri: string } | string;
  timeout?: number;
  fallbackSource?: ImageSourcePropType;
}

export const useImageWithTimeout = ({
  source,
  timeout = 10000, // 10 seconds default
  fallbackSource = require("@/assets/images/plan-placeholder.png"),
}: UseImageWithTimeoutProps) => {
  // Convert string to proper image source format
  const normalizedSource =
    typeof source === "string" ? { uri: source } : source;

  const [imageSource, setImageSource] = useState<
    ImageSourcePropType | { uri: string }
  >(normalizedSource);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSource(normalizedSource);

    // Set up timeout for network images only
    if (
      (typeof normalizedSource === "object" &&
        "uri" in normalizedSource &&
        normalizedSource.uri) ||
      (typeof source === "string" && source.startsWith("http"))
    ) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        setImageSource(fallbackSource);
      }, timeout);
    } else {
      // For local images, no timeout needed
      setIsLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [source, timeout, fallbackSource]);

  const handleImageLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
    setImageSource(fallbackSource);
  };

  return {
    imageSource,
    isLoading,
    hasError,
    handleImageLoad,
    handleImageError,
  };
};
