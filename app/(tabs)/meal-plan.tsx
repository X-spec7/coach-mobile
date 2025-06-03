import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
import ChangeFoodModal from "../modals/ChangeFoodModal";
import {
  fetchMealPlans,
  fetchMealPlanDetails,
  MealPlan,
  MealPlanDetails,
} from "../services/api";

const { width } = Dimensions.get("window");

const menuItems = [
  { key: "preference", label: "Preference" },
  { key: "setMacros", label: "Set Macros" },
  { key: "aboutPlan", label: "About Your Plan" },
  { key: "changePlan", label: "Change Plan" },
];

export default function MealPlanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const selectedMeal = meals.find((m) => m.id === selectedId);
  const [showSetMacrosModal, setShowSetMacrosModal] = useState(false);
  const [macros, setMacros] = useState({
    calories: 2904,
    carbs: 276,
    protein: 126,
    fat: 142,
  });
  const [showAboutPlanModal, setShowAboutPlanModal] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [planDetails, setPlanDetails] = useState<MealPlanDetails | null>(null);
  const [showChangeFoodModal, setShowChangeFoodModal] = useState(false);

  console.log("showChangeFoodModal:", showChangeFoodModal);
  console.log("selectedMeal:", selectedMeal);
  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMealPlans();
      setMeals(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load meal plans. Please try again later.";
      if (errorMessage === "Authentication required") {
        setError("Please sign in to view meal plans");
        router.replace("/(auth)/login-register");
      } else {
        setError(errorMessage);
      }
      console.error("Error loading meal plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealSelect = async (meal: MealPlan) => {
    try {
      const details = await fetchMealPlanDetails(meal.id);
      setPlanDetails(details);
      setShowPlanDetails(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load meal details";
      if (errorMessage === "Authentication required") {
        router.replace("/(auth)/login-register");
      } else {
        console.error("Error loading meal details:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading meal plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMealPlans}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedMeal) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No meal plans available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const foods =
    selectedMeal && selectedMeal.meal_times
      ? selectedMeal.meal_times.flatMap((mt) => mt.mealplan_food_items)
      : [];

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
            width={320}
            height={260}
            data={meals}
            style={{ width: width, alignSelf: "center" }}
            renderItem={({ item }) => (
              <MealPlanCard
                key={item.id}
                image={item.image ?? { uri: "" }}
                title={item.title ?? item.name ?? ""}
                protein={item.protein ?? 0}
                fat={item.fat ?? 0}
                carbs={item.carbs ?? 0}
                selected={selectedId === item.id}
                onTitlePress={() => handleMealSelect(item)}
              />
            )}
            mode="parallax"
            pagingEnabled
            onSnapToItem={(index) => setSelectedId(meals[index].id)}
          />
        </View>
        {foods.length > 0 && (
          <View style={styles.foodListContainer}>
            <Text style={styles.foodListTitle}>Food items of this meal</Text>
            <View style={styles.foodList}>
              {foods.map((food: any, idx: number) => (
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
                else if (item.key === "changePlan")
                  setShowChangeFoodModal(true);
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
      {menuItems
        .filter((item) => item.key !== "changePlan")
        .map((item) => (
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
      <ChangeFoodModal
        visible={showChangeFoodModal && !!selectedMeal}
        foods={foods}
        onClose={() => setShowChangeFoodModal(false)}
        onSave={(newFood) => {
          if (!selectedMeal) return;
          setMeals((prevMeals) =>
            prevMeals.map((meal) => {
              if (meal.id !== selectedMeal.id) return meal;
              // Update the first food in the first meal_time
              const updatedMealTimes = meal.meal_times.map((mt, idx) => {
                if (idx === 0 && mt.mealplan_food_items.length > 0) {
                  return {
                    ...mt,
                    mealplan_food_items: [
                      newFood,
                      ...mt.mealplan_food_items.slice(1),
                    ],
                  };
                }
                return mt;
              });
              return {
                ...meal,
                meal_times: updatedMealTimes,
              };
            })
          );
          setShowChangeFoodModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
