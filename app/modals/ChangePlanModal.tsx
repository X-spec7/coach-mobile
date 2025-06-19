import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { MealPlan } from "../services/api";
import { API_BASE_URL } from "@/constants/api";

interface ChangePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  mealPlans: MealPlan[];
  selectedMealPlan?: MealPlan;
}

const PLAN_CATEGORIES = [
  { key: "private", label: "Private" },
  { key: "public", label: "Public" },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  visible,
  onClose,
  onSave,
  mealPlans,
  selectedMealPlan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(
    PLAN_CATEGORIES[0].key
  );
  const filteredPlans = mealPlans.filter(
    (p) => p.visibility === selectedCategory
  );
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerBack}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Plan</Text>
            <TouchableOpacity
              onPress={onSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.headerSave}>Save</Text>
            </TouchableOpacity>
          </View>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            {PLAN_CATEGORIES.map((cat, idx) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => {
                  setSelectedCategory(cat.key);
                  setActiveIndex(0);
                }}
                style={styles.tabBtn}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === cat.key && styles.tabTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
                {selectedCategory === cat.key && (
                  <View style={styles.tabUnderline} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {/* Description */}
          <Text style={styles.categoryDesc}>{filteredPlans[0]?.info}</Text>
          {/* Carousel */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselWrap}
            onScroll={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / CARD_WIDTH
              );
              setActiveIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {filteredPlans.map((plan, idx) => (
              <View key={plan.id} style={styles.planCard}>
                {plan.image ? (
                  <Image
                    source={{
                      uri: `${API_BASE_URL.replace("/api", "")}${plan.image}`,
                    }}
                    style={styles.planImagePlaceholder}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.planImagePlaceholder} />
                )}
                <Text style={styles.planTitle}>{plan.name}</Text>
                <Text style={styles.planDesc}>{plan.description}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Indicator */}
          <View style={styles.indicatorRow}>
            {filteredPlans.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.indicator,
                  idx === activeIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  headerBack: {
    color: "#A3A3A3",
    fontSize: 16,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E293B",
  },
  headerSave: {
    color: "#A78BFA",
    fontWeight: "bold",
    fontSize: 16,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  tabBtn: {
    marginRight: 18,
    alignItems: "center",
  },
  tabText: {
    color: "#A3A3A3",
    fontSize: 18,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#A78BFA",
    fontWeight: "bold",
  },
  tabUnderline: {
    height: 3,
    width: 32,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
    marginTop: 2,
  },
  categoryDesc: {
    color: "#A3A3A3",
    fontSize: 17,
    textAlign: "center",
    marginHorizontal: 18,
    marginBottom: 18,
    marginTop: 4,
    fontWeight: "500",
  },
  carouselWrap: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  planCard: {
    width: CARD_WIDTH,
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    alignItems: "center",
    padding: 18,
    marginHorizontal: 8,
  },
  planImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 18,
  },
  planTitle: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#A78BFA",
    marginBottom: 8,
    textAlign: "center",
  },
  planDesc: {
    color: "#A3A3A3",
    fontSize: 16,
    textAlign: "center",
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  indicator: {
    width: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: "#A78BFA",
  },
});

export default ChangePlanModal;
