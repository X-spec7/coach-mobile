import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FoodDislikesModalProps {
  visible: boolean;
  dislikes: string[];
  onClose: () => void;
  onSave: (dislikes: string[]) => void;
}

const MOCK_FOODS = [
  "Chicken",
  "Wheat",
  "Nust",
  "Peanut",
  "Soy",
  "Eggs",
  "Avocado",
  "Apple",
  "Fish",
  "Milk",
  "Shrimp",
  "Corn",
  "Tomato",
  "Potato",
  "Rice",
  "Beef",
  "Lamb",
  "Pork",
  "Cheese",
  "Yogurt",
  "Broccoli",
  "Carrot",
  "Spinach",
  "Mushroom",
  "Onion",
  "Garlic",
  "Pepper",
  "Orange",
  "Banana",
  "Grape",
  "Pear",
];

export const FoodDislikesModal: React.FC<FoodDislikesModalProps> = ({
  visible,
  dislikes: initialDislikes,
  onClose,
  onSave,
}) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "disliked">("all");
  const [dislikes, setDislikes] = useState<string[]>(initialDislikes);

  const foods = useMemo(() => {
    let list = MOCK_FOODS;
    if (search.trim()) {
      list = list.filter((f) =>
        f.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    if (tab === "disliked") {
      list = list.filter((f) => dislikes.includes(f));
    }
    return list;
  }, [search, tab, dislikes]);

  const handleToggle = (food: string) => {
    setDislikes((prev) =>
      prev.includes(food) ? prev.filter((d) => d !== food) : [...prev, food]
    );
  };

  const handleClear = () => setDislikes([]);

  const handleSave = () => {
    onSave(dislikes);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#22223B" />
            </TouchableOpacity>
            <Text style={styles.title}>Food Dislikes</Text>
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearBtn}>Clear</Text>
            </TouchableOpacity>
          </View>
          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons
              name="search"
              size={18}
              color="#A3A3A3"
              style={{ marginLeft: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Searching food..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#A3A3A3"
            />
          </View>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setTab("all")}
            >
              <Text
                style={[styles.tabText, tab === "all" && styles.tabTextActive]}
              >
                All Products{" "}
                <Text style={styles.tabCount}>{MOCK_FOODS.length}</Text>
              </Text>
              {tab === "all" && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setTab("disliked")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "disliked" && styles.tabTextActive,
                ]}
              >
                Disliked{" "}
                <Text style={styles.tabCount}>
                  {dislikes.length.toString().padStart(2, "0")}
                </Text>
              </Text>
              {tab === "disliked" && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          </View>
          {/* Food List */}
          <FlatList
            data={foods}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isDisliked = dislikes.includes(item);
              return (
                <TouchableOpacity
                  style={styles.foodRow}
                  onPress={() => handleToggle(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.foodName,
                      isDisliked && styles.foodNameDisliked,
                    ]}
                  >
                    {item}
                  </Text>
                  <View
                    style={[
                      styles.checkCircle,
                      isDisliked && styles.checkCircleActive,
                    ]}
                  >
                    {isDisliked && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
    maxHeight: "90%",
    paddingBottom: 0,
    paddingTop: 0,
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
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E293B",
  },
  clearBtn: {
    color: "#A3A3A3",
    fontSize: 16,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    margin: 18,
    marginBottom: 0,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    marginLeft: 8,
    padding: 0,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 18,
  },
  tabBtn: {
    marginRight: 24,
    position: "relative",
  },
  tabText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A3A3A3",
  },
  tabTextActive: {
    color: "#A78BFA",
  },
  tabCount: {
    fontSize: 15,
    fontWeight: "normal",
    color: "#A3A3A3",
  },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -2,
    height: 3,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  foodName: {
    fontSize: 18,
    color: "#1E293B",
    fontWeight: "600",
  },
  foodNameDisliked: {
    color: "#A3A3A3",
    textDecorationLine: "line-through",
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleActive: {
    backgroundColor: "#A78BFA",
  },
  saveBtn: {
    backgroundColor: "#7C3AED",
    margin: 18,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
