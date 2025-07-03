import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import {
  RelationshipService,
  Relationship,
} from "../services/relationshipService";
import { ContactService, IContact } from "../services/contactService";
import { API_BASE_URL } from "@/constants/api";

const { width } = Dimensions.get("window");

// Use the Contact interface from contactService instead

interface ContactsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<IContact[]>([]);
  const [filteredRelationships, setFilteredRelationships] = useState<
    Relationship[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"contacts" | "relationships">(
    "relationships"
  );
  const [updatingRelationship, setUpdatingRelationship] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  console.log("contacts:", contacts);
  //console.log("relationships:", relationships);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
      setFilteredRelationships(relationships);
    } else {
      const filtered =
        contacts &&
        contacts.filter((contact) =>
          contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      setFilteredContacts(filtered || []);

      const filteredRels = relationships.filter((rel) => {
        const coachName = rel.coach.fullName.toLowerCase();
        const clientName = rel.client.fullName.toLowerCase();
        const query = searchQuery.toLowerCase();
        return coachName.includes(query) || clientName.includes(query);
      });
      setFilteredRelationships(filteredRels);
    }
  }, [searchQuery, contacts, relationships]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Initialize with empty contacts array
      setContacts([]);
      setFilteredContacts([]);

      // Fetch relationships related to the logged-in user
      if (user?.id) {
        try {
          // Fetch contacts
          const contactsResponse = await ContactService.getContacts();
          setContacts(contactsResponse.contacts);
          //Use getRelationships without filters to get all relationships for the current user
          let relationshipsData = await RelationshipService.myRelationships();
          setRelationships(relationshipsData);
          setFilteredRelationships(relationshipsData);
        } catch (error) {
          console.error("Error fetching relationships:", error);
          // Set empty arrays on error to prevent UI issues
          setRelationships([]);
          setFilteredRelationships([]);
        }
      } else {
        setRelationships([]);
        setFilteredRelationships([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (relationshipId: number) => {
    try {
      setUpdatingRelationship(relationshipId);
      await RelationshipService.updateRelationshipStatus(
        relationshipId,
        "active"
      );
      await fetchData();
    } catch (error) {
      console.error("Error accepting relationship:", error);
    } finally {
      setUpdatingRelationship(null);
    }
  };

  const handleRejectRequest = async (relationshipId: number) => {
    try {
      setUpdatingRelationship(relationshipId);
      await RelationshipService.updateRelationshipStatus(
        relationshipId,
        "inactive"
      );
      await fetchData();
    } catch (error) {
      console.error("Error rejecting relationship:", error);
    } finally {
      setUpdatingRelationship(null);
    }
  };

  const handleWithdrawRequest = async (relationshipId: number) => {
    try {
      setUpdatingRelationship(relationshipId);
      await RelationshipService.deleteRelationship(relationshipId);
      await fetchData();
    } catch (error) {
      console.error("Error withdrawing relationship:", error);
    } finally {
      setUpdatingRelationship(null);
    }
  };

  const getAvatarUrl = (avatarUrl?: string): string | undefined => {
    if (avatarUrl && avatarUrl !== "") {
      return `${API_BASE_URL.replace("/api", "")}${avatarUrl}`;
    }
    return undefined;
  };

  const getUserTypeLabel = (userType: string) => {
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "#FEF3C7", textColor: "#92400E", label: "Pending" },
      active: { color: "#D1FAE5", textColor: "#065F46", label: "Active" },
      inactive: { color: "#FEE2E2", textColor: "#991B1B", label: "Inactive" },
      terminated: {
        color: "#F3F4F6",
        textColor: "#374151",
        label: "Terminated",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Text style={[styles.statusText, { color: config.textColor }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUserCoach = (relationship: Relationship) => {
    return user?.id === relationship.coach.id;
  };

  const isUserClient = (relationship: Relationship) => {
    return user?.id === relationship.client.id;
  };

  const renderRelationshipActions = (relationship: Relationship) => {
    if (relationship.status !== "pending") return null;

    const isLoading = updatingRelationship === relationship.id;

    if (isUserCoach(relationship)) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.withdrawButton]}
          onPress={() => handleWithdrawRequest(relationship.id)}
          disabled={isLoading}
        >
          <Text style={styles.withdrawButtonText}>
            {isLoading ? "Withdrawing..." : "Withdraw Request"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (isUserClient(relationship)) {
      return (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(relationship.id)}
            disabled={isLoading}
          >
            <Text style={styles.acceptButtonText}>
              {isLoading ? "Accepting..." : "Accept"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(relationship.id)}
            disabled={isLoading}
          >
            <Text style={styles.rejectButtonText}>
              {isLoading ? "Rejecting..." : "Reject"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderContactItem = (contact: IContact) => (
    <View key={contact.id} style={styles.contactItem}>
      <View style={styles.contactAvatarContainer}>
        {contact.avatarUrl ? (
          <Image
            source={{ uri: contact.avatarUrl }}
            style={styles.contactAvatar}
          />
        ) : (
          <View style={styles.contactAvatarPlaceholder}>
            <Ionicons name="person" size={24} color="#A26FFD" />
          </View>
        )}
        {contact.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{contact.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.fullName}</Text>
        <Text style={styles.contactType}>
          {getUserTypeLabel(contact.userType)}
        </Text>
        {contact.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {contact.lastMessage.content}
          </Text>
        )}
      </View>

      <View style={styles.contactMeta}>
        {contact.lastMessage && (
          <Text style={styles.messageDate}>
            {new Date(contact.lastMessage.sentDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );

  const renderRelationshipItem = (relationship: Relationship) => (
    <View key={relationship.id} style={styles.relationshipItem}>
      <View style={styles.relationshipHeader}>
        <View style={styles.userInfo}>
          {relationship.coach.avatarImageUrl ? (
            <Image
              source={{
                uri: getAvatarUrl(relationship.coach.avatarImageUrl)!,
              }}
              style={styles.userAvatar}
            />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person" size={20} color="#A26FFD" />
            </View>
          )}
          <View>
            <Text style={styles.userName}>{relationship.coach.fullName}</Text>
            <Text style={styles.userRole}>Coach</Text>
          </View>
        </View>
        {getStatusBadge(relationship.status)}
      </View>

      <View style={styles.relationshipDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.userInfo}>
        {relationship.client.avatarImageUrl ? (
          <Image
            source={{
              uri: getAvatarUrl(relationship.client.avatarImageUrl)!,
            }}
            style={styles.userAvatar}
          />
        ) : (
          <View style={styles.userAvatarPlaceholder}>
            <Ionicons name="person" size={20} color="#A26FFD" />
          </View>
        )}
        <View>
          <Text style={styles.userName}>{relationship.client.fullName}</Text>
          <Text style={styles.userRole}>Client</Text>
        </View>
      </View>

      <View style={styles.relationshipMeta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Started:</Text>
          <Text style={styles.metaValue}>
            {formatDate(relationship.startDate)}
          </Text>
        </View>
        {relationship.endDate && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ended:</Text>
            <Text style={styles.metaValue}>
              {formatDate(relationship.endDate)}
            </Text>
          </View>
        )}
        {relationship.notes && (
          <Text style={styles.relationshipNotes} numberOfLines={2}>
            {relationship.notes}
          </Text>
        )}
      </View>

      {renderRelationshipActions(relationship)}
    </View>
  );

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A26FFD" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Network</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "contacts" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("contacts")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "contacts" && styles.activeTabText,
                ]}
              >
                Contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "relationships" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("relationships")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "relationships" && styles.activeTabText,
                ]}
              >
                Relationships
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>

          <ScrollView
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "contacts" ? (
              <View style={styles.contactsContainer}>
                {filteredContacts?.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {searchQuery
                        ? "No contacts found matching your search."
                        : "No contacts found."}
                    </Text>
                  </View>
                ) : (
                  filteredContacts?.map(renderContactItem)
                )}
              </View>
            ) : (
              <View style={styles.relationshipsContainer}>
                {filteredRelationships.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {searchQuery
                        ? "No relationships found matching your search."
                        : "No relationships found."}
                    </Text>
                  </View>
                ) : (
                  filteredRelationships?.map(renderRelationshipItem)
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Network Statistics</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Active Relationships</Text>
              <Text style={styles.statsValue}>
                {relationships.filter((r) => r.status === "active").length}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Pending Requests</Text>
              <Text style={styles.statsValue}>
                {relationships.filter((r) => r.status === "pending").length}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Unread Messages</Text>
              <Text style={styles.statsValue}>
                {contacts?.reduce(
                  (total, contact) => total + contact.unreadCount,
                  0
                ) || 0}
              </Text>
            </View>
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
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  activeTabButton: {
    backgroundColor: "#A26FFD",
  },
  tabText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: "#fff",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  contactsContainer: {
    paddingBottom: 20,
  },
  relationshipsContainer: {
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  contactAvatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  contactType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: "#999",
  },
  contactMeta: {
    alignItems: "flex-end",
  },
  messageDate: {
    fontSize: 12,
    color: "#666",
  },
  relationshipItem: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  relationshipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  userRole: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  relationshipDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "#666",
  },
  relationshipMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  metaLabel: {
    fontSize: 12,
    color: "#666",
  },
  metaValue: {
    fontSize: 12,
    color: "#fff",
  },
  relationshipNotes: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#D1FAE5",
  },
  acceptButtonText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "500",
  },
  rejectButton: {
    backgroundColor: "#FEE2E2",
  },
  rejectButtonText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "500",
  },
  withdrawButton: {
    backgroundColor: "#FEE2E2",
    marginTop: 10,
  },
  withdrawButtonText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  statsContainer: {
    backgroundColor: "#2a2a2a",
    margin: 20,
    borderRadius: 12,
    padding: 15,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 14,
    color: "#666",
  },
  statsValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A26FFD",
  },
});
