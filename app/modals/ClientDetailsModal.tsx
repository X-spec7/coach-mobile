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
import { useAuth } from "../contexts/AuthContext";
import { RelationshipService } from "../services/relationshipService";
import { ClientService } from "../services/clientService";
import { ErrorModal } from "../components/ErrorModal";
import { handleConnectionRequestError, ErrorInfo } from "../utils/errorHandler";

interface ClientDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  clientId: string;
}

interface Relationship {
  id: string; // Changed from number to string for UUID support
  status: string;
  startDate: string;
  notes?: string;
  coach: { id: string }; // Changed from number to string for UUID support
  client: { id: string }; // Changed from number to string for UUID support
}

// Helper function to format dates
const formatDateReadable = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Comprehensive ClientDetailHeader component
const ClientDetailHeader: React.FC<{ client: Client }> = ({ client }) => {
  const colorScheme = useColorScheme();
  const { user, isLoading: authLoading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [isLoadingRelationship, setIsLoadingRelationship] = useState(true);
  const [isRequestingRelationship, setIsRequestingRelationship] =
    useState(false);
  
  // Error handling state
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Don't fetch if auth is still loading

    if (user?.userType === "Coach" && user?.id) {
      fetchRelationship();
    } else {
      setIsLoadingRelationship(false);
    }
  }, [user, client.id, authLoading]);

  const fetchRelationship = async () => {
    try {
      setIsLoadingRelationship(true);
      const relationshipData = await RelationshipService.getRelationshipStatus(
        user?.id || '',
        client.id
      );
      console.log("relationshipData", relationshipData);
      setRelationship(relationshipData);
    } catch (error) {
      console.error("Error fetching relationship:", error);
      setRelationship(null);
    } finally {
      setIsLoadingRelationship(false);
    }
  };

  const handleEdit = () => {
    if (authLoading) {
      Alert.alert("Error", "Please wait while authentication is loading");
      return;
    }

    // TODO: Implement edit navigation
    setShowMenu(false);
    Alert.alert("Edit", "Edit functionality coming soon");
  };

  const handleDelete = async () => {
    if (authLoading) {
      Alert.alert("Error", "Please wait while authentication is loading");
      return;
    }

    Alert.alert(
      "Delete Client",
      "Are you sure you want to delete this client?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ClientService.deleteClient(client.id);
              Alert.alert("Success", "Client deleted successfully!");
              // TODO: Navigate back or close modal
            } catch (error) {
              console.error("Error deleting client:", error);
              Alert.alert(
                "Error",
                "Failed to delete client. Please try again."
              );
            }
          },
        },
      ]
    );
    setShowMenu(false);
  };

  const handleRequestRelationship = async () => {
    if (authLoading) {
      Alert.alert("Error", "Please wait while authentication is loading");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setIsRequestingRelationship(true);
    try {
      await RelationshipService.createRelationship({
        coach_id: user.id,
        client_id: client.id,
        status: "pending",
        notes: "Relationship request from coach",
      });

      Alert.alert("Success", "Relationship request sent successfully!");
      await fetchRelationship(); // Refresh relationship status
    } catch (error) {
      console.error("Error requesting relationship:", error);
      const errorInfo = handleConnectionRequestError(error);
      setErrorInfo(errorInfo);
      setShowErrorModal(true);
    } finally {
      setIsRequestingRelationship(false);
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorInfo(null);
  };

  const handleErrorRetry = () => {
    setShowErrorModal(false);
    setErrorInfo(null);
    // You can add retry logic here if needed
  };

  console.log("user:", user);

  const getRelationshipStatusDisplay = () => {
    if (authLoading || isLoadingRelationship) {
      return (
        <View style={styles.relationshipLoadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      );
    }

    if (!user || user.userType !== "Coach") {
      return null;
    }

    if (!relationship) {
      return (
        <View style={styles.relationshipContainer}>
          <Text
            style={[
              styles.relationshipText,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            No relationship established
          </Text>
          <TouchableOpacity
            style={[
              styles.requestButton,
              isRequestingRelationship && styles.requestButtonDisabled,
            ]}
            onPress={handleRequestRelationship}
            disabled={isRequestingRelationship}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.requestButtonText}>
              {isRequestingRelationship ? "Sending..." : "Request Relationship"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const getStatusConfig = (status: string) => {
      switch (status) {
        case "pending":
          return {
            icon: "time",
            color: "#D97706",
            bgColor: "#FEF3C7",
            text: "Pending",
          };
        case "accepted":
        case "active":
          return {
            icon: "checkmark-circle",
            color: "#059669",
            bgColor: "#D1FAE5",
            text: "Connected",
          };
        case "inactive":
        case "rejected":
          return {
            icon: "close-circle",
            color: "#DC2626",
            bgColor: "#FEE2E2",
            text: "Rejected",
          };
        case "terminated":
          return {
            icon: "close-circle",
            color: "#6B7280",
            bgColor: "#F3F4F6",
            text: "Terminated",
          };
        default:
          return {
            icon: "time",
            color: "#D97706",
            bgColor: "#FEF3C7",
            text: "Pending",
          };
      }
    };

    const config = getStatusConfig(relationship.status);

    return (
      <View
        style={[
          styles.relationshipStatusContainer,
          { backgroundColor: config.bgColor },
        ]}
      >
        <View style={styles.relationshipStatusHeader}>
          <Ionicons name={config.icon as any} size={16} color={config.color} />
          <Text
            style={[styles.relationshipStatusText, { color: config.color }]}
          >
            {config.text}
          </Text>
        </View>
        <Text style={styles.relationshipDateText}>
          Since {formatDateReadable(relationship.startDate)}
        </Text>
        {relationship.notes && (
          <Text style={styles.relationshipNotesText}>
            Note: {relationship.notes}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.headerContainer}>
      {/* Header with back button and menu */}
      <View style={styles.headerTop}>
        <Text
          style={[
            styles.headerTitle,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          Client Details
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
      </View>

      {/* Menu dropdown */}
      {showMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
            <Ionicons name="create" size={16} color="#6B7280" />
            <Text style={styles.menuItemText}>Edit Client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Ionicons name="trash" size={16} color="#DC2626" />
            <Text style={[styles.menuItemText, { color: "#DC2626" }]}>
              Delete Client
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Client info */}
      <View style={styles.clientInfo}>
        <View style={styles.avatarContainer}>
          {client.avatar ? (
            <Image source={{ uri: client.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{client.name.charAt(0)}</Text>
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

      {/* Relationship section */}
      {getRelationshipStatusDisplay()}

      {/* Error Modal */}
      {errorInfo && (
        <ErrorModal
          visible={showErrorModal}
          onClose={handleErrorModalClose}
          onRetry={handleErrorRetry}
          title={errorInfo.title}
          message={errorInfo.message}
          type={errorInfo.type}
          showRetry={errorInfo.showRetry}
        />
      )}
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
  const { user, isLoading: authLoading } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [isLoadingRelationship, setIsLoadingRelationship] = useState(true);
  useEffect(() => {
    const fetchClient = async () => {
      if (!visible || !clientId || authLoading) return;

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

  // Show loading state while auth is loading
  if (authLoading) {
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

            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text
                style={[
                  styles.loadingText,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                Loading authentication...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

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
    fontSize: 20,
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
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
  // New styles for enhanced header
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
  },
  menuContainer: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3B82F6",
  },
  // Relationship styles
  relationshipLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  relationshipContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginTop: 16,
  },
  relationshipText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  requestButtonDisabled: {
    opacity: 0.5,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  relationshipStatusContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  relationshipStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  relationshipStatusText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  relationshipDateText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  relationshipNotesText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
});

export default ClientDetailsModal;
