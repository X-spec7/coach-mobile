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
import { Ionicons } from "@expo/vector-icons";

const menuItems = [
  { id: 1, title: "Personal Information", icon: "person", route: "/personal-information" },
  // { id: 2, title: "Notifications", icon: "notifications", route: "/notifications-settings" }, // Commented out - can be enabled later
  { id: 3, title: "Privacy & Security", icon: "shield", route: "/privacy-settings" },
  { id: 4, title: "Subscription", icon: "card", route: "/subscription" },
  // { id: 5, title: "Goals", icon: "target", route: "/goals" }, // Commented out - can be enabled later
  { id: 6, title: "Help & Support", icon: "help-circle", route: "/help-support" },
];

export default function ProfileScreen() {
  console.log('ProfileScreen rendering...');
  
  const { user, isLoading, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
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

  const handleMenuPress = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  try {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A26FFD" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
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
                onPress={() => handleMenuPress("/personal-information")}
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {user?.avatarImageUrl ? (
                  <Image source={{ uri: user.avatarImageUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </Text>
                <View style={styles.userTypeContainer}>
                  <Ionicons 
                    name={user?.userType === "Coach" ? "fitness" : "person"} 
                    size={16} 
                    color="#A26FFD" 
                  />
                  <Text style={styles.userType}>
                    {user?.userType === "Coach" ? "Fitness Coach" : "Fitness Client"}
                  </Text>
                </View>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#A26FFD" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Coach Mobile v1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    );
  } catch (error) {
    console.error("Error in ProfileScreen:", error);
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Something went wrong</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#A26FFD",
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#A26FFD",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#A26FFD",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  userTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: "#A26FFD",
    fontWeight: "600",
    marginLeft: 6,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A26FFD20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF444420",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuModalItem: {
    padding: 16,
    borderRadius: 8,
  },
  menuModalText: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
});
