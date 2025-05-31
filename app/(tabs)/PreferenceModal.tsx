import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PreferenceModalProps {
  onClose: () => void;
  onSave: (prefs: any) => void;
}

const DIVERSITY_OPTIONS = [
  { key: "same", label: "Same all week", desc: "Easy to meal prep" },
  { key: "low", label: "Low variety", desc: "Convenient and effective" },
  { key: "medium", label: "Medium variety", desc: "Won't get you bored" },
  { key: "new", label: "New every day", desc: "Master your cooking skills" },
];

const MEALS = ["Breakfast", "Snack", "Lunch", "Dinner"];

export const PreferenceModal: React.FC<PreferenceModalProps> = ({
  onClose,
  onSave,
}) => {
  const [diversity, setDiversity] = useState("medium");
  const [meals, setMeals] = useState<{ [k: string]: boolean }>({
    Breakfast: true,
    Snack: true,
    Lunch: true,
    Dinner: true,
  });
  const [dislikes, setDislikes] = useState<string[]>(["Chicken", "Peanut"]);
  const [addInput, setAddInput] = useState("");

  const handleToggleMeal = (meal: string) => {
    setMeals((prev) => ({ ...prev, [meal]: !prev[meal] }));
  };

  const handleRemoveDislike = (item: string) => {
    setDislikes((prev) => prev.filter((d) => d !== item));
  };

  const handleAddDislike = () => {
    if (addInput.trim() && !dislikes.includes(addInput.trim())) {
      setDislikes((prev) => [...prev, addInput.trim()]);
      setAddInput("");
    }
  };

  const handleSave = () => {
    onSave({ diversity, meals, dislikes });
    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerBack}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preference</Text>
        <TouchableOpacity
          onPress={handleSave}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerSave}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Diversity */}
        <Text style={styles.sectionTitle}>Diversity</Text>
        <Text style={styles.sectionDesc}>
          Set your meal plan variety and select how often your meals will change
        </Text>
        <View style={styles.radioGroup}>
          {DIVERSITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.radioRow}
              onPress={() => setDiversity(opt.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioOuter,
                  diversity === opt.key && styles.radioOuterActive,
                ]}
              >
                {diversity === opt.key && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.radioLabel,
                    diversity === opt.key && styles.radioLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.radioDesc}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Meals */}
        <Text style={styles.sectionTitle}>Meals</Text>
        <Text style={styles.sectionDesc}>
          At least two meals should be selected to complete your daily nutrition
          goal
        </Text>
        <View style={styles.mealList}>
          {MEALS.map((meal) => (
            <View style={styles.mealRow} key={meal}>
              <Text style={styles.mealLabel}>{meal}</Text>
              <Switch
                value={meals[meal]}
                onValueChange={() => handleToggleMeal(meal)}
                trackColor={{ false: "#E5E7EB", true: "#A78BFA" }}
                thumbColor={meals[meal] ? "#7C3AED" : "#fff"}
              />
            </View>
          ))}
        </View>
        {/* Food Dislikes */}
        <Text style={styles.sectionTitle}>Food Dislikes</Text>
        <Text style={styles.sectionDesc}>
          Choose the food that you don't like enjoy or not suitable for you and
          we will exclude them from your meal plan
        </Text>
        <View style={styles.dislikeTagsWrap}>
          {dislikes.map((item) => (
            <View style={styles.dislikeTag} key={item}>
              <Text style={styles.dislikeTagText}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemoveDislike(item)}>
                <Ionicons name="close" size={16} color="#A3A3A3" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addTagWrap}>
            <TextInput
              value={addInput}
              onChangeText={setAddInput}
              placeholder="Add"
              style={styles.addTagInput}
              onSubmitEditing={handleAddDislike}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddDislike}
              style={styles.addTagBtn}
            >
              <Ionicons name="add" size={18} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingHorizontal: 0,
    minHeight: 600,
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
    backgroundColor: "#F8FAFC",
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
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E293B",
    marginTop: 24,
    marginBottom: 2,
    paddingHorizontal: 18,
  },
  sectionDesc: {
    color: "#A3A3A3",
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  radioGroup: {
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#A78BFA",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#A78BFA",
  },
  radioLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#64748B",
  },
  radioLabelActive: {
    color: "#7C3AED",
  },
  radioDesc: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 2,
  },
  mealList: {
    marginTop: 8,
    marginBottom: 8,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mealLabel: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  dislikeTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 10,
  },
  dislikeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dislikeTagText: {
    fontSize: 15,
    color: "#1E293B",
    marginRight: 4,
  },
  addTagWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  addTagInput: {
    fontSize: 15,
    color: "#1E293B",
    minWidth: 40,
    padding: 0,
    margin: 0,
  },
  addTagBtn: {
    marginLeft: 2,
    padding: 2,
  },
});
