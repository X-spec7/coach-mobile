import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Carousel from "react-native-reanimated-carousel";
import { MealPlanCard } from "../components/MealPlanCard";
import { Ionicons } from "@expo/vector-icons";
import { PreferenceModal } from "../modals/PreferenceModal";
import { SetMacrosModal } from "../modals/SetMacrosModal";
import { AboutPlanModal } from "../modals/AboutPlanModal";
import ChangePlanModal from "../modals/ChangePlanModal";
import { FoodDislikesModal } from "../modals/FoodDislikesModal";
import MealPlanDetailsModal from "../modals/MealPlanDetailsModal";

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

const menuItems = [
  { key: "preference", label: "Preference" },
  { key: "setMacros", label: "Set Macros" },
  { key: "aboutPlan", label: "About Your Plan" },
  { key: "changePlan", label: "Change Plan" },
];

export default function MealPlanScreen() {
  const colorScheme = useColorScheme();
  const [selectedId, setSelectedId] = useState<number | null>(mockMeals[0].id);
  const [modal, setModal] = useState<string | null>(null);
  const selectedMeal = mockMeals.find((m) => m.id === selectedId)!;
  const [showSetMacrosModal, setShowSetMacrosModal] = useState(false);
  const [macros, setMacros] = useState({
    calories: 2904,
    carbs: 276,
    protein: 126,
    fat: 142,
  });
  const [showAboutPlanModal, setShowAboutPlanModal] = useState(false);

  // State for MealPlanDetailsModal
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);

  // Example plan data for modal (should be replaced with real data)
  const getPlanDetailsFromMeal = (meal: any) => ({
    category: "Vegetarian diets",
    name: meal.title,
    description:
      "A balanced Classic Vegetarian plan is one that give your body the nutrients it needs to function properly. Enjoy the benefits of diet and don't forget to keep physically active.",
    calories: 2500,
    macros: [
      {
        key: "protein",
        label: "Protein",
        value: meal.protein,
        color: "#7C3AED",
      },
      { key: "fat", label: "Fat", value: meal.fat, color: "#F87171" },
      { key: "carbs", label: "Carbs", value: meal.carbs, color: "#FBBF24" },
    ],
    meals: [
      { title: "Boiled Vegetables", protein: 250, fat: 20, carbs: 450 },
      { title: "Vegetarian Sandwich", protein: 200, fat: 10, carbs: 300 },
      { title: "Mushroom Dumplings", protein: 120, fat: 15, carbs: 450 },
    ],
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
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
                onTitlePress={() => {
                  setPlanDetails(getPlanDetailsFromMeal(item));
                  setShowPlanDetails(true);
                }}
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
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => {
                if (item.key === "setMacros") setShowSetMacrosModal(true);
                else if (item.key === "aboutPlan") setShowAboutPlanModal(true);
                else setModal(item.key);
              }}
            >
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Modals */}
      {menuItems.map((item) => (
        <Modal
          key={item.key}
          visible={modal === item.key}
          animationType="slide"
          transparent
          onRequestClose={() => setModal(null)}
        >
          <View style={styles.modalOverlay}>
            {item.key === "preference" ? (
              <PreferenceModal
                onClose={() => setModal(null)}
                onSave={(prefs) => {
                  // handle save logic here if needed
                  setModal(null);
                }}
              />
            ) : (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{item.label}</Text>
                <Text style={styles.modalBody}>
                  This is the {item.label} modal.
                </Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => setModal(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Modal>
      ))}
      <SetMacrosModal
        visible={showSetMacrosModal}
        initialValues={macros}
        onClose={() => setShowSetMacrosModal(false)}
        onSave={(values) => setMacros(values)}
      />
      <AboutPlanModal
        visible={showAboutPlanModal}
        onClose={() => setShowAboutPlanModal(false)}
        onChange={() => {
          setShowAboutPlanModal(false);
          // Optionally open change plan modal here
        }}
      />
      <MealPlanDetailsModal
        visible={showPlanDetails}
        onClose={() => setShowPlanDetails(false)}
        plan={planDetails}
        onChoose={() => setShowPlanDetails(false)}
      />
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
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 20,
    marginTop: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    minHeight: 220,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1E293B",
  },
  modalBody: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
