import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Settings, User as UserIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "@/constants/api";

const menuItems = [
  { id: 1, title: "Personal Information", icon: "user" },
  { id: 2, title: "Workout History", icon: "activity" },
  { id: 3, title: "Goals", icon: "target" },
  { id: 4, title: "Notifications", icon: "bell" },
  { id: 5, title: "Privacy", icon: "lock" },
  { id: 6, title: "Help & Support", icon: "help-circle" },
];

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  email: string;
  avatarImageUrl?: string | null;
  // ...other fields as needed, but not used in UI yet
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await fetch(API_ENDPOINTS.USER.GET_USER_INFO, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError("Could not load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
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
        <Text style={{ color: "#fff" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            {user?.avatarImageUrl ? (
              <Image
                source={{ uri: user.avatarImageUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <UserIcon size={40} color="#A26FFD" />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.fullName || "-"}</Text>
              <Text style={styles.email}>{user?.email || "-"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#fff" />
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
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {/* <ChevronRight size={20} color="#666" /> */}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
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
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  settingsButton: {
    width: 48,
    height: 48,
    backgroundColor: "#2a2a2a",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#2a2a2a",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#333",
  },
  menuContainer: {
    margin: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  menuTitle: {
    fontSize: 16,
    color: "#fff",
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "bold",
  },
  defaultAvatar: {
    backgroundColor: "#ede2ff",
    alignItems: "center",
    justifyContent: "center",
  },
});
