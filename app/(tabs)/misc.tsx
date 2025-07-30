import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ClientsModal from "../modals/ClientsModal";

const menuItems = [
  { id: 1, title: "Coach", icon: "user" },
  { id: 2, title: "Client", icon: "user" },
  { id: 3, title: "Terms of Service", icon: "user" },
  { id: 4, title: "Privacy Policy", icon: "activity" },
  { id: 5, title: "Help & Support", icon: "target" },
];

export default function TermsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coachModalVisible, setCoachModalVisible] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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
      <ScrollView style={styles.scrollView}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.title === "Terms of Service") {
                  setTermsModalVisible(true);
                }
                if (item.title === "Coach") {
                  setCoachModalVisible(true);
                }
                if (item.title === "Client") {
                  setClientModalVisible(true);
                }
              }}
            >
              <Text style={styles.menuTitle}>{item.title}</Text>
              {/* <ChevronRight size={20} color="#666" /> */}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Clients Modal */}
      <ClientsModal
        visible={clientModalVisible}
        onClose={() => setClientModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    margin: 20,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
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
});
