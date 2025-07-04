import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Client } from "../services/clientService";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API_BASE_URL } from "@/constants/api";
import { getAuthHeaders } from "../services/api";

interface ClientDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  clientId: string;
}

// Placeholder ClientDetailHeader component
const ClientDetailHeader: React.FC<{ client: Client }> = ({ client }) => {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.clientInfo}>
        <View style={styles.avatarContainer}>
          {client.avatar ? (
            <Image source={{ uri: client.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons
                name="person"
                size={32}
                color={Colors[colorScheme ?? "light"].text}
              />
            </View>
          )}
        </View>
        <View style={styles.clientDetails}>
          <Text
            style={[
              styles.clientName,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            {client.name}
          </Text>
          <Text
            style={[
              styles.clientEmail,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            {client.email}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Placeholder ClientDetailTabs component
const ClientDetailTabs: React.FC<{ client: Client }> = ({ client }) => {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.tabsContainer}>
      <Text
        style={[
          styles.tabsPlaceholder,
          { color: Colors[colorScheme ?? "light"].text },
        ]}
      >
        Client Detail Tabs Component
      </Text>
      <Text
        style={[
          styles.tabsSubtext,
          { color: Colors[colorScheme ?? "light"].text },
        ]}
      >
        This will contain detailed client information tabs
      </Text>
    </View>
  );
};

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  visible,
  onClose,
  clientId,
}) => {
  const colorScheme = useColorScheme();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      if (!visible || !clientId) return;

      setLoading(true);
      try {
        // For now, we'll use the existing ClientService
        // You may need to create a specific endpoint for single client details
        const headers = await getAuthHeaders();
        console.log("Client fetch", `${API_BASE_URL}/users/${clientId}/`);
        const response = await fetch(`${API_BASE_URL}/users/${clientId}/`, {
          method: "GET",
          headers,
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (!response.ok) {
          if (response.status === 401) {
            console.log("Authentication failed - 401 Unauthorized");
            Alert.alert("Error", "Authentication required", [
              { text: "OK", onPress: onClose },
            ]);
            return;
          }
          if (response.status === 404) {
            console.log("Client not found - 404");
            Alert.alert("Error", "Client not found", [
              { text: "OK", onPress: onClose },
            ]);
            return;
          }
          const errorText = await response.text();
          console.log("Error response body:", errorText);
          throw new Error(
            `Failed to fetch client: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Client data response:", data);

        // Check different possible response structures
        if (data.client) {
          setClient(data.client);
        } else if (data.user) {
          // Transform user data to match Client interface
          const client: Client = {
            id: data.user.id.toString(),
            name:
              data.user.fullName ||
              `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email,
            avatar: data.user.avatarImageUrl,
          };
          setClient(client);
        } else if (data.id) {
          // Direct user object
          const client: Client = {
            id: data.id.toString(),
            name: data.fullName || `${data.firstName} ${data.lastName}`,
            email: data.email,
            avatar: data.avatarImageUrl,
          };
          setClient(client);
        } else {
          console.log("Unexpected response structure:", data);
          Alert.alert("Error", "Invalid response format", [
            { text: "OK", onPress: onClose },
          ]);
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        Alert.alert("Error", "Failed to fetch client details", [
          { text: "OK", onPress: onClose },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId, visible, onClose]);

  const handleClose = () => {
    setClient(null);
    setLoading(true);
    onClose();
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
          >
            <SafeAreaView>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Client Details ss
                </Text>
                <View style={styles.placeholder} />
              </View>
            </SafeAreaView>

            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (!client) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
          >
            <SafeAreaView>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Client Details
                </Text>
                <View style={styles.placeholder} />
              </View>
            </SafeAreaView>

            <View style={styles.errorContainer}>
              <Text
                style={[
                  styles.errorTitle,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                Client not found
              </Text>
              <Text
                style={[
                  styles.errorMessage,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                The client you're looking for doesn't exist or has been removed.
              </Text>
              <TouchableOpacity style={styles.backButton} onPress={handleClose}>
                <Text style={styles.backButtonText}>Back to Clients</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            { backgroundColor: Colors[colorScheme ?? "light"].background },
          ]}
        >
          {/* Header */}
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.headerTitle,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                Client Details
              </Text>
              <View style={styles.placeholder} />
            </View>
          </SafeAreaView>

          {/* Content */}
          <ScrollView style={styles.content}>
            <ClientDetailHeader client={client} />
            <ClientDetailTabs client={client} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 16,
    color: "#6B7280",
  },
  tabsContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  tabsPlaceholder: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  tabsSubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ClientDetailsModal;
