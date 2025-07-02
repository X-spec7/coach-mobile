import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClientSelector from "./ClientSelector";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface ClientSelectorDemoProps {
  visible: boolean;
  onClose: () => void;
  onClientSelect: (clientId: string) => void;
  selectedClient?: string;
  assignedClientIds?: string[];
}

const ClientSelectorDemo: React.FC<ClientSelectorDemoProps> = ({
  visible,
  onClose,
  onClientSelect,
  selectedClient = "",
  assignedClientIds = [],
}) => {
  const colorScheme = useColorScheme();

  const handleClientChange = (clientId: string) => {
    onClientSelect(clientId);
    onClose();
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
                Select Client
              </Text>
              <View style={styles.placeholder} />
            </View>
          </SafeAreaView>

          {/* Client Selector */}
          <View style={styles.content}>
            <ClientSelector
              selectedClient={selectedClient}
              onChange={handleClientChange}
              assignedClientIds={assignedClientIds}
            />
          </View>
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
    paddingTop: 16,
  },
});

export default ClientSelectorDemo;
