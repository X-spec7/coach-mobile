import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MealPlanCardProps {
  image: ImageSourcePropType | { uri: string };
  title: string;
  protein: number;
  fat: number;
  carbs: number;
  selected?: boolean;
  onTitlePress?: () => void;
}

const macroColors = {
  protein: "#7C3AED", // purple
  fat: "#F87171", // red
  carbs: "#FBBF24", // yellow
};

export const MealPlanCard: React.FC<MealPlanCardProps> = ({
  image,
  title,
  protein,
  fat,
  carbs,
  selected = false,
  onTitlePress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />
        <Ionicons
          name="refresh"
          size={22}
          color="#fff"
          style={styles.refreshIcon}
        />
        {selected && (
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        {onTitlePress ? (
          <TouchableOpacity onPress={onTitlePress}>
            <Text style={styles.title}>{title}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <View style={styles.macroItemLabel}>
              <View
                style={[styles.dot, { backgroundColor: macroColors.protein }]}
              />
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <Text style={styles.macroValue}>{protein.toFixed(2)}</Text>
          </View>
          <View style={styles.macroItem}>
            <View style={styles.macroItemLabel}>
              <View
                style={[styles.dot, { backgroundColor: macroColors.fat }]}
              />
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
            <Text style={styles.macroValue}>{fat.toFixed(2)}</Text>
          </View>
          <View style={styles.macroItem}>
            <View style={styles.macroItemLabel}>
              <View
                style={[styles.dot, { backgroundColor: macroColors.carbs }]}
              />
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <Text style={styles.macroValue}>{carbs.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  imageContainer: {
    height: 200,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  refreshIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    opacity: 0.7,
  },
  checkmarkCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroItemLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 2,
  },
});
