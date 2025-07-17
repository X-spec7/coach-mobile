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
  Alert,
} from "react-native";
import { resolveImageUri } from "@/utils/resolveImageUri";
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
import CreateMealPlanModal from "../modals/CreateMealPlanModal";
import {
  fetchMealPlans,
  fetchMealPlanDetails,
  fetchAllFoods,
  MealPlan,
  MealPlanDetails,
  Food,
  SuitableFood,
  updateMealPlan,
  updateMealPlanFoodItem,
  selectMealPlan,
  deleteMealPlan,
  getAuthHeaders,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "@/constants/api";
const { width } = Dimensions.get("window");

const menuItems = [
  { key: "preference", label: "Preference" },
  { key: "setMacros", label: "Set Macros" },
  { key: "aboutPlan", label: "About Your Plan" },
  { key: "changePlan", label: "Change Plan" },
];

export default function MealPlanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const selectedMeal = meals.find((m) => m.id === selectedId);
  const [showSetMacrosModal, setShowSetMacrosModal] = useState(false);
  const [showAssignMealPlanModal, setShowAssignMealPlanModal] = useState(false);
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
  const [suitableFoods, setSuitableFoods] = useState<SuitableFood[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [isUpdatingMacros, setIsUpdatingMacros] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [carouselKey, setCarouselKey] = useState(0);
  const [isUpdatingFood, setIsUpdatingFood] = useState(false);
  const [showCreateMealPlanModal, setShowCreateMealPlanModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
  };

  const allFoodItemIds = selectedMeal?.meal_times
    .flatMap((mt) => mt.mealplan_food_items)
    .map((item) => item.food_item_details.id);

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

  useEffect(() => {
    loadAllFoods();
  }, []);

  const loadAllFoods = async () => {
    try {
      setIsLoadingFoods(true);
      const foods = await fetchAllFoods();
      setSuitableFoods(foods);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load foods";
      if (errorMessage === "Authentication required") {
        router.replace("/(auth)/login-register");
      } else {
        console.error("Error loading foods:", err);
      }
    } finally {
      setIsLoadingFoods(false);
    }
  };

  const handleMacroUpdate = async (newMacros: {
    calories: number;
    protein: number;
    fat: number;
    carb: number;
  }) => {
    if (!selectedMeal) return;

    try {
      setIsUpdatingMacros(true);
      setUpdateError(null);

      // Update the meals state with the new data
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === selectedMeal.id
            ? {
                ...meal,
                protein: newMacros.protein,
                fat: newMacros.fat,
                carb: newMacros.carb,
                calories: newMacros.calories,
              }
            : meal
        )
      );

      // Force Carousel to update by setting a new key
      setCarouselKey((prev) => prev + 1);
      setShowSetMacrosModal(false);
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update macros"
      );
    } finally {
      setIsUpdatingMacros(false);
    }
  };

  const handleFoodUpdate = async (newFood: SuitableFood) => {
    try {
      if (!selectedMeal) return;

      // Get the first meal time and its first food item
      const firstMealTime = selectedMeal.meal_times[0];
      const firstFoodItem = firstMealTime.mealplan_food_items[0];

      if (!firstMealTime || !firstFoodItem) {
        throw new Error("No food item found to update");
      }

      // Update the food item using the API
      const updatedMealPlan = await updateMealPlanFoodItem(
        selectedMeal.id,
        firstMealTime.id,
        firstFoodItem.id,
        newFood
      );

      // Update local state with the response from the API
      setMeals((prevMeals) =>
        prevMeals.map((meal) => {
          if (meal.id !== selectedMeal.id) return meal;
          return updatedMealPlan;
        })
      );

      // Force Carousel to update by setting a new key
      setCarouselKey((prev) => prev + 1);
      setShowChangeFoodModal(false);

      // Show success message
      Alert.alert("Success", "Food item updated successfully!", [
        { text: "OK" },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update food item. Please try again.";

      // Show error alert
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  const handleCreateMealPlan = async (formData: FormData) => {
    console.log("=== handleCreateMealPlan ===");
    console.log("formData:", formData);
    try {
      let fetchOptions: RequestInit = { method: "POST" };
      const url = `${API_BASE_URL}/mealplan/create/`;
      let headers = await getAuthHeaders();
      if (headers["Content-Type"]) delete headers["Content-Type"];
      fetchOptions.body = formData;
      fetchOptions.headers = headers;

      const response = await fetch(url, fetchOptions);
      const mealPlan = await response.json();
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Assign to client
      if (selectedClient) {
        console.log("assigning to client", selectedClient);
        const assignResponse = await fetch("/api/meal-plans/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mealPlanId: mealPlan.id,
            clientId: Number(selectedClient),
          }),
        });

        if (!assignResponse.ok) {
          const error = await assignResponse.json();
          throw new Error(error.message);
        }
      }
      // Refresh meal plans
      await loadMealPlans();

      Alert.alert("Success", "Meal plan created successfully!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create meal plan. Please try again."
      );
    }
  };

  const handleSelectMealPlan = async () => {
    if (!planDetails?.mealPlan?.id) {
      Alert.alert("Error", "No meal plan selected");
      return;
    }

    try {
      await selectMealPlan(planDetails.mealPlan.id);

      // Update the selected meal plan in local state
      setSelectedId(planDetails.mealPlan.id);

      // Close the modal
      setShowPlanDetails(false);

      // Show success message
      Alert.alert("Success", "Meal plan selected successfully!");
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to select meal plan. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleAssignMealPlan = async () => {
    console.log("handleAssignMealPlan");
  };

  const handleDeleteMealPlan = async () => {
    if (!planDetails?.mealPlan?.id) {
      Alert.alert("Error", "No meal plan selected");
      return;
    }

    try {
      await deleteMealPlan(planDetails.mealPlan.id);

      // Remove the deleted meal plan from local state
      const updatedMeals = meals.filter(
        (meal) => meal.id !== planDetails.mealPlan.id
      );
      setMeals(updatedMeals);

      // Select next meal plan or set to null if no meals left
      if (updatedMeals.length > 0) {
        // Find the index of the deleted meal plan
        const deletedIndex = meals.findIndex(
          (meal) => meal.id === planDetails.mealPlan.id
        );

        // Select the next meal plan (or the previous one if we're at the end)
        let nextIndex = deletedIndex;
        if (deletedIndex >= updatedMeals.length) {
          nextIndex = updatedMeals.length - 1; // Select the last meal plan
        }

        setSelectedId(updatedMeals[nextIndex].id);
      } else {
        // No meals left, set to null
        setSelectedId(null);
      }

      // Close the modal
      setShowPlanDetails(false);

      // Show success message
      Alert.alert("Success", "Meal plan deleted successfully!");
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to delete meal plan. Please try again.";
      Alert.alert("Error", errorMessage);
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
          <TouchableOpacity
            style={styles.createPlanButton}
            onPress={() => {
              console.log("Button pressed, setting modal to true");
              setShowCreateMealPlanModal(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.createPlanButtonText}>
              Create New Meal Plan
            </Text>
          </TouchableOpacity>
        </View>
        <CreateMealPlanModal
          visible={showCreateMealPlanModal}
          onClose={() => setShowCreateMealPlanModal(false)}
          onSubmit={handleCreateMealPlan}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            marginTop: 20,
            alignSelf: "flex-end",
            padding: 4,
          }}
          onPress={() => setShowCreateMealPlanModal(true)}
        >
          <Ionicons name="add-circle-outline" size={32} color="#7C3AED" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.carouselWrap}>
          <Carousel
            key={carouselKey}
            width={320}
            height={280}
            data={meals}
            style={{ width: width, alignSelf: "center" }}
            defaultIndex={Math.max(
              0,
              meals.findIndex((m) => m.id === selectedId)
            )}
            renderItem={({ item }) => (
              <View>
                <MealPlanCard
                  key={item.id}
                  image={
                    resolveImageUri(
                      typeof item.image === "string" ? item.image : null
                    )
                      ? {
                          uri: resolveImageUri(
                            typeof item.image === "string" ? item.image : null
                          )!,
                        }
                      : require("../../assets/images/plan-placeholder.png")
                  }
                  title={item.title ?? item.name ?? ""}
                  protein={item.protein ?? 0}
                  fat={item.fat ?? 0}
                  carbs={item.carbs ?? 0}
                  selected={selectedId === item.id}
                  onTitlePress={() => handleMealSelect(item)}
                />
                {isUpdatingMacros && selectedId === item.id && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                    <Text style={styles.loadingText}>Updating macros...</Text>
                  </View>
                )}
              </View>
            )}
            mode="parallax"
            pagingEnabled
            onSnapToItem={(index) => setSelectedId(meals[index].id)}
          />
        </View>
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
        onClose={() => {
          setShowSetMacrosModal(false);
          setUpdateError(null);
        }}
        onSave={handleMacroUpdate}
        isLoading={isUpdatingMacros}
        error={updateError}
        initialValues={
          selectedMeal
            ? {
                calories: selectedMeal.calories ?? 0,
                carb: selectedMeal.carbs ?? 0,
                protein: selectedMeal.protein ?? 0,
                fat: selectedMeal.fat ?? 0,
              }
            : undefined
        }
      />
      <AboutPlanModal
        visible={showAboutPlanModal}
        mealPlans={meals}
        selectedMeal={selectedMeal}
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
        onChoose={handleSelectMealPlan}
        onAssign={handleAssignMealPlan}
        onDelete={handleDeleteMealPlan}
      />
      <ChangeFoodModal
        visible={showChangeFoodModal && !!selectedMeal}
        foods={suitableFoods.filter((food) =>
          allFoodItemIds?.includes(food.id)
        )}
        suitableFoods={suitableFoods.filter(
          (food) => !allFoodItemIds?.includes(food.id)
        )}
        onClose={() => setShowChangeFoodModal(false)}
        onSave={handleFoodUpdate}
      />
      <CreateMealPlanModal
        visible={showCreateMealPlanModal}
        onClose={() => setShowCreateMealPlanModal(false)}
        onSubmit={handleCreateMealPlan}
        selectedClient={selectedClient}
        handleClientChange={handleClientChange}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  createPlanButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  createPlanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  carouselSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuScrollView: {
    flex: 1,
  },
});
