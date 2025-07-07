import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ClientService,
  Client,
  ClientsResponse,
} from "../services/clientService";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import ClientDetailsModal from "./ClientDetailsModal";

interface ClientsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ClientSearchProps {
  onFilterChange: (filters: any) => void;
}

interface AddClientButtonProps {
  onPress: () => void;
}

interface ClientsTableProps {
  clients: Client[];
  onClientPress?: (client: Client) => void;
}

interface PaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// ClientSearch Component
const ClientSearch: React.FC<ClientSearchProps> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const colorScheme = useColorScheme();

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    onFilterChange({ search: text });
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              color: Colors[colorScheme ?? "light"].text,
              borderColor: "#D1D5DB",
            },
          ]}
          placeholder="Search clients..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
      </View>
    </View>
  );
};

// AddClientButton Component
const AddClientButton: React.FC<AddClientButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Ionicons name="add" size={20} color="#fff" />
      <Text style={styles.addButtonText}>Add Client</Text>
    </TouchableOpacity>
  );
};

// ClientsTable Component
const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onClientPress,
}) => {
  const colorScheme = useColorScheme();

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={[styles.tableRow, { borderBottomColor: "#E5E7EB" }]}
      onPress={() => onClientPress?.(item)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons
              name="person"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
            />
          </View>
        )}
      </View>
      <View style={styles.clientInfo}>
        <Text
          style={[
            styles.clientName,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.clientEmail,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          {item.email}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors[colorScheme ?? "light"].text}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.tableContainer}>
      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text
              style={[
                styles.emptyStateText,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
            >
              No clients found
            </Text>
          </View>
        }
      />
    </View>
  );
};

// Pagination Component
const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const colorScheme = useColorScheme();
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationInfo}>
        <Text
          style={[
            styles.paginationText,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} results
        </Text>
      </View>

      <View style={styles.paginationControls}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            pagination.page === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={pagination.page === 1 ? "#9CA3AF" : "#374151"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.paginationText,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          Page {pagination.page} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            pagination.page === totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={pagination.page === totalPages ? "#9CA3AF" : "#374151"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main ClientsModal Component
const ClientsModal: React.FC<ClientsModalProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<ClientsResponse>({
    clients: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ClientService.getClients(filters, {
        page: clientData.page,
        limit: clientData.limit,
      });
      setClientData(response);
    } catch (error) {
      console.error("Error fetching clients:", error);
      Alert.alert("Error", "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, [filters, clientData.page, clientData.limit]);

  useEffect(() => {
    if (visible) {
      fetchClients();
    }
  }, [visible, fetchClients]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setClientData((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setClientData((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setClientData((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleAddClient = () => {
    Alert.alert("Add Client", "Add client functionality would go here");
  };

  const handleClientPress = (client: Client) => {
    setSelectedClientId(client.id);
    setShowClientDetails(true);
  };

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
                onPress={onClose}
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
                Clients
              </Text>
              <View style={styles.placeholder} />
            </View>
          </SafeAreaView>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.mainContainer}>
              <View style={styles.topSection}>
                <ClientSearch onFilterChange={handleFilterChange} />
                <AddClientButton onPress={handleAddClient} />
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10B981" />
                </View>
              ) : (
                <>
                  <View style={styles.tableWrapper}>
                    <ClientsTable
                      clients={clientData.clients}
                      onClientPress={handleClientPress}
                    />
                  </View>

                  <Pagination
                    pagination={clientData}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Client Details Modal */}
      <ClientDetailsModal
        visible={showClientDetails}
        onClose={() => {
          setShowClientDetails(false);
          setSelectedClientId(null);
        }}
        clientId={selectedClientId || ""}
      />
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
    paddingTop: 16,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  searchInputContainer: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingLeft: 44,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 256,
  },
  tableWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableContainer: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
  },
  paginationContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationInfo: {
    flex: 1,
  },
  paginationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  paginationButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  paginationButtonDisabled: {
    backgroundColor: "#F9FAFB",
  },
});

export default ClientsModal;
