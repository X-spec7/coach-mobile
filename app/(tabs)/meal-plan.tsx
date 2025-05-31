import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
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
    foods: [
      { name: "Balsamic vinegar", amount: "10 g" },
      { name: "Vegetables fresh", amount: "35 g" },
      { name: "Banana", amount: "75 g" },
      { name: "Beef", amount: "100 g" },
      { name: "Bitter chocolate", amount: "20 g" },
      { name: "Coconut milk", amount: "11 g" },
    ],
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
    foods: [
      { name: "Chicken breast", amount: "120 g" },
      { name: "Lettuce", amount: "40 g" },
      { name: "Tomato", amount: "30 g" },
      { name: "Olive oil", amount: "10 g" },
      { name: "Feta cheese", amount: "25 g" },
    ],
  },
  {
    id: 3,
    image: require("../../assets/images/organic.png"), // local image
    title: "Oatmeal Bowl",
    protein: 320,
    fat: 60,
    carbs: 210,
    foods: [
      { name: "Oats", amount: "50 g" },
      { name: "Milk", amount: "100 ml" },
      { name: "Honey", amount: "10 g" },
      { name: "Blueberries", amount: "30 g" },
      { name: "Almonds", amount: "15 g" },
    ],
  },
];

export default function MealPlanScreen() {
  const colorScheme = useColorScheme();
  const [selectedId, setSelectedId] = useState<number | null>(mockMeals[0].id);
  const selectedMeal = mockMeals.find((m) => m.id === selectedId)!;

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
      {selectedMeal.foods && (
        <View style={styles.foodListContainer}>
          <Text style={styles.foodListTitle}>Food items of this meal</Text>
          <View style={styles.foodList}>
            {selectedMeal.foods.map((food, idx) => (
              <View style={styles.foodRow} key={food.name + idx}>
                <View style={styles.foodDot} />
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodAmount}>{food.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  foodListContainer: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  foodListTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  foodList: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  foodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  foodName: {
    flex: 1,
    color: "#334155",
    fontSize: 16,
  },
  foodAmount: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
  },
});
