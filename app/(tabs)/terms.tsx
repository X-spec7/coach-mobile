import { View, Text, StyleSheet } from "react-native";

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <Text>Terms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6FF",
  },
});
