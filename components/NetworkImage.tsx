import React from "react";
import { Image, ImageProps, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useImageWithTimeout } from "@/hooks/useImageWithTimeout";

interface NetworkImageProps extends Omit<ImageProps, "source"> {
  source: { uri: string } | number;
  fallbackSource?: number;
  timeout?: number;
  showLoadingIndicator?: boolean;
  showErrorIcon?: boolean;
}

export const NetworkImage: React.FC<NetworkImageProps> = ({
  source,
  fallbackSource = require("@/assets/images/plan-placeholder.png"),
  timeout = 8000,
  showLoadingIndicator = true,
  showErrorIcon = true,
  style,
  ...props
}) => {
  const {
    imageSource,
    isLoading,
    hasError,
    handleImageLoad,
    handleImageError,
  } = useImageWithTimeout({
    source,
    timeout,
    fallbackSource,
  });

  return (
    <View style={{ position: "relative" }}>
      <Image
        source={imageSource}
        style={[{ width: "100%", height: "100%" }, style]}
        onLoad={handleImageLoad}
        onError={handleImageError}
        defaultSource={fallbackSource}
        {...props}
      />

      {isLoading && showLoadingIndicator && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <ActivityIndicator size="small" color="#7C3AED" />
        </View>
      )}

      {hasError && showErrorIcon && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Ionicons name="image-outline" size={24} color="#94A3B8" />
        </View>
      )}
    </View>
  );
};
