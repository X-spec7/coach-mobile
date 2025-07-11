import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClientSelector from "../components/ClientSelector";
import { API_BASE_URL } from "@/constants/api";
import { getAuthHeaders } from "../services/api";

interface AssignMealPlanModalProps {
  visible: boolean;
  onClose: () => void;
  mealPlanId: string;
  mealPlanName: string;
  onAssignSuccess?: () => void;
}

interface Assignment {
  id: string;
  mealPlanId: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
  assignedAt: string;
  notes?: string;
}

const AssignMealPlanModal: React.FC<AssignMealPlanModalProps> = ({
  visible,
  onClose,
  mealPlanId,
  mealPlanName,
  onAssignSuccess,
}) => {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  // Fetch current assignments when modal opens
  useEffect(() => {
    if (visible && mealPlanId) {
      fetchCurrentAssignments();
    }
  }, [visible, mealPlanId]);

  const fetchCurrentAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/mealplan/assignments/`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Raw assignments data:", data);

        // Extract client IDs from assignments - handle multiple possible response structures
        let clientIds: string[] = [];

        // Try different possible data structures
        const assignments = data.assignments || data.data || data.results || [];

        if (Array.isArray(assignments)) {
          clientIds = assignments
            .map((assignment: any) => {
              // Handle different possible client structures
              if (assignment.client && typeof assignment.client === "object") {
                return assignment.client.id?.toString();
              } else if (assignment.clientId) {
                return assignment.clientId.toString();
              } else if (
                assignment.client &&
                typeof assignment.client === "string"
              ) {
                return assignment.client;
              } else if (
                assignment.client &&
                typeof assignment.client === "number"
              ) {
                return assignment.client.toString();
              }
              return null;
            })
            .filter(Boolean);
        }

        console.log("Extracted client IDs:", clientIds);
        setAssignedClientIds(clientIds);
      } else {
        console.error(
          "Failed to fetch assignments:",
          response.status,
          response.statusText
        );
        setAssignedClientIds([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignedClientIds([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClient) {
      Alert.alert("Error", "Please select a client");
      return;
    }

    console.log("selectedClient:", selectedClient);
    console.log("assignedClientIds:", assignedClientIds);

    // Check if client is already assigned
    if (assignedClientIds.includes(selectedClient)) {
      Alert.alert("Error", "This client is already assigned to this meal plan");
      return;
    }

    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/mealplan/assign/`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealPlanId,
          clientId: selectedClient, // Keep as string since that's what the API expects
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign meal plan");
      }

      Alert.alert("Success", "Meal plan assigned successfully!");

      // Refresh assignments list
      await fetchCurrentAssignments();

      // Reset form
      setSelectedClient("");
      setNotes("");

      onAssignSuccess?.();
    } catch (error) {
      console.error("Error assigning meal plan:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to assign meal plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Assign Meal Plan</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Assigning: <Text style={styles.mealPlanName}>{mealPlanName}</Text>
            </Text>
            {assignedClientIds.length > 0 && (
              <Text style={styles.assignedText}>
                {assignedClientIds.length} client
                {assignedClientIds.length !== 1 ? "s" : ""} already assigned
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Select Client</Text>
            {isLoadingAssignments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
              </View>
            ) : (
              <View style={styles.clientSelectorContainer}>
                <ClientSelector
                  selectedClient={selectedClient}
                  onChange={handleClientChange}
                  assignedClientIds={assignedClientIds}
                  useFlatList={false}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes or instructions for this meal plan assignment..."
              style={styles.textInput}
              multiline
              numberOfLines={3}
              editable={!isLoading}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.assignButton,
                (!selectedClient ||
                  isLoading ||
                  assignedClientIds.includes(selectedClient)) &&
                  styles.disabledButton,
              ]}
              onPress={handleAssign}
              disabled={
                !selectedClient ||
                isLoading ||
                assignedClientIds.includes(selectedClient)
              }
            >
              <Text style={styles.assignButtonText}>
                {isLoading ? "Assigning..." : "Assign Meal Plan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  infoSection: {
    padding: 20,
    paddingTop: 0,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
  },
  mealPlanName: {
    fontWeight: "500",
    color: "#1F2937",
  },
  assignedText: {
    fontSize: 12,
    color: "#EA580C",
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  clientSelectorContainer: {
    height: 250,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 80,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  assignButton: {
    backgroundColor: "#10B981",
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AssignMealPlanModal;
