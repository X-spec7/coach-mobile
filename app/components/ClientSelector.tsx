import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClientService, Client } from "../services/clientService";
import { CoachClientService, CoachClientRelationship } from "../services/coachClientService";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

interface ClientSelectorProps {
  selectedClient: string;
  onChange: (clientId: string) => void;
  assignedClientIds?: string[];
  useFlatList?: boolean;
  connectedClientsOnly?: boolean; // New prop to control whether to show only connected clients
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClient,
  onChange,
  assignedClientIds = [],
  useFlatList = true,
  connectedClientsOnly = false, // Default to false for backward compatibility
}) => {
  const colorScheme = useColorScheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        if (connectedClientsOnly) {
          // Fetch only connected clients using relationships
          const response = await CoachClientService.getMyRelationships({ status: 'active' });
          console.log("Connected clients response>>", response);

          // Transform relationships to client format
          const connectedClients: Client[] = response.relationships.map((relationship: CoachClientRelationship) => ({
            id: relationship.client.id,
            name: relationship.client.fullName,
            email: relationship.client.email,
            avatar: undefined, // Relationships don't include avatar
          }));

          setClients(connectedClients);
          setFilteredClients(connectedClients);
        } else {
          // Fetch all clients (existing behavior)
          const response = await ClientService.getClients(
            { search: searchTerm },
            { page: 1, limit: 50 }
          );

          console.log("All clients response>>", response);

          setClients(response.clients);
          setFilteredClients(response.clients);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        // Fallback to empty array on error
        setClients([]);
        setFilteredClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [searchTerm, connectedClientsOnly]);

  // Filter clients by search term for connected clients
  useEffect(() => {
    if (connectedClientsOnly && searchTerm) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else if (connectedClientsOnly) {
      setFilteredClients(clients);
    }
  }, [clients, searchTerm, connectedClientsOnly]);

  const isClientAssigned = (clientId: string) => {
    return assignedClientIds.includes(clientId);
  };

  const renderClientItem = ({ item }: { item: Client }) => {
    const isAssigned = isClientAssigned(item.id);
    const isSelected = selectedClient === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.clientCard,
          isSelected && styles.clientCardSelected,
          isAssigned && styles.clientCardAssigned,
        ]}
        onPress={() => onChange(item.id)}
        activeOpacity={0.7}
      >
        {isAssigned && (
          <View style={styles.assignedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
        <View style={styles.clientInfo}>
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
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
          <View style={styles.clientDetails}>
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
            {isAssigned && (
              <Text style={styles.assignedText}>Already assigned</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text
        style={[
          styles.emptyStateText,
          { color: Colors[colorScheme ?? "light"].text },
        ]}
      >
        No clients found matching your search.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
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
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Clients List */}
      {isLoading ? (
        renderLoadingState()
      ) : useFlatList ? (
        <FlatList
          data={filteredClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.listContainer}>
          {!filteredClients || filteredClients.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.clientsGrid}>
              {filteredClients.map((item) => (
                <View key={item.id} style={styles.row}>
                  {renderClientItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
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
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  clientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  clientCard: {
    width: (width - 48) / 2, // Account for padding and gap
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  clientCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  clientCardAssigned: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  assignedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
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
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  assignedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#F59E0B",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

export default ClientSelector;
