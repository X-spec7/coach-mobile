import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { ContactsModal } from "../components/ContactsModal";
import UserDebugInfo from "../components/UserDebugInfo";

const menuItems = [
  { id: 1, title: "Personal Information", icon: "user" },
  { id: 2, title: "Workout History", icon: "activity" },
  { id: 3, title: "Goals", icon: "target" },
  { id: 4, title: "Contacts", icon: "users" },
  { id: 5, title: "Notifications", icon: "bell" },
  { id: 6, title: "Privacy", icon: "lock" },
  { id: 7, title: "Help & Support", icon: "help-circle" },
];

export default function ProfileScreen() {
  console.log('ProfileScreen rendering...');
  
  const { user, isLoading, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      setMenuVisible(false);
      router.replace("/(auth)/login-register");
    } catch (err) {
      setError("Failed to log out");
    }
  };

  try {
    if (isLoading) {
      return (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color="#A26FFD" />
        </View>
      );
    }
    if (error) {
      return (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#1a1a1a" }}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuModal}>
              <TouchableOpacity
                style={styles.menuModalItem}
                onPress={() => {
                  setMenuVisible(false);
                  // Navigate to settings page if you have one
                }}
              >
                <Text style={styles.menuModalText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuModalItem}
                onPress={handleLogout}
              >
                <Text style={[styles.menuModalText, { color: "#FF4444" }]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
        <ScrollView style={styles.scrollView}>
          <UserDebugInfo />
          
          <View style={styles.header}>
            <View style={styles.profileInfo}>
              {user?.avatarImageUrl ? (
                <Image
                  source={{ uri: user.avatarImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.defaultAvatar]}>
                  <Text style={{color: '#fff', fontSize: 20}}>👤</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.name}>{user?.fullName || "-"}</Text>
                <Text style={styles.email}>{user?.email || "-"}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={{color: '#000', fontSize: 20}}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>42.5k</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  if (item.title === "Contacts") {
                    console.log('Contacts button pressed - temporarily disabled');
                    // setContactsModalVisible(true);
                  }
                }}
              >
                <Text style={styles.menuTitle}>{item.title}</Text>
                {/* <ChevronRight size={20} color="#666" /> */}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Temporarily commented out ContactsModal to prevent crashes
        <ContactsModal
          visible={contactsModalVisible}
          onClose={() => setContactsModalVisible(false)}
        />
        */}
      </View>
    );
  } catch (error) {
    console.error('ProfileScreen error:', error);
    return (
      <View style={styles.container}>
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 50}}>
          Error loading profile
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  settingsButton: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#e0e0e0",
  },
  menuContainer: {
    margin: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: '600',
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF4444",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "bold",
  },
  defaultAvatar: {
    backgroundColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  menuModalItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuModalText: {
    color: "#1a1a1a",
    fontSize: 18,
    fontWeight: "500",
  },
});
