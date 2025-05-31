import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Carousel from "react-native-reanimated-carousel";
import { MealPlanCard } from "./MealPlanCard";

const { width } = Dimensions.get("window");

const mockMeals = [
  {
    id: 1,
    image: require("../../assets/images/nurition.png"), // local image
    title: "Egg and Fresh Fruit",
    protein: 530,
    fat: 103,
    carbs: 250,
  },
  {
    id: 2,
    image: {
      uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    }, // remote image
    title: "Chicken Salad",
    protein: 420,
    fat: 80,
    carbs: 180,
  },
  {
    id: 3,
    image: require("../../assets/images/organic.png"), // local image
    title: "Oatmeal Bowl",
    protein: 320,
    fat: 60,
    carbs: 210,
  },
];

export default function MealPlanScreen() {
  const colorScheme = useColorScheme();
  const [selectedId, setSelectedId] = useState<number | null>(mockMeals[0].id);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <View style={styles.carouselWrap}>
        <Carousel
          width={260}
          height={260}
          data={mockMeals}
          style={{ width: width, alignSelf: "center" }}
          renderItem={({ item }) => (
            <MealPlanCard
              key={item.id}
              image={item.image}
              title={item.title}
              protein={item.protein}
              fat={item.fat}
              carbs={item.carbs}
              selected={selectedId === item.id}
            />
          )}
          mode="parallax"
          pagingEnabled
          onSnapToItem={(index) => setSelectedId(mockMeals[index].id)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  carouselWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
