import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

const AVATAR_PLACEHOLDER = "https://randomuser.me/api/portraits/women/44.jpg";

export const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);

  // Only user field is enabled for now
  return (
    <LinearGradient colors={["#FFFFFF", "#EDE2FF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logoText}>
              <Text style={styles.logoPurple}>COA</Text>
              <Text style={styles.logoBlack}>-CH</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Sign up to join</Text>
          </View>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: AVATAR_PLACEHOLDER }}
              style={styles.avatarImg}
            />
            <View style={styles.avatarPlus}>
              <Ionicons name="add" size={18} color="#fff" />
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formFields}>
          <View style={styles.inputRow}>
            <Feather name="user" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="User"
              placeholderTextColor="#A3A3A3"
              value={user}
              onChangeText={setUser}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputRowDisabled}>
            <Feather name="mail" size={20} color="#C7C7C7" />
            <Text style={styles.inputDisabled}>Email</Text>
          </View>
          <View style={styles.inputRowDisabled}>
            <Feather name="lock" size={20} color="#C7C7C7" />
            <Text style={styles.inputDisabled}>Password</Text>
          </View>
          <View style={styles.inputRowDisabled}>
            <Feather name="phone" size={20} color="#C7C7C7" />
            <Text style={styles.inputDisabled}>Phone</Text>
          </View>
          <View style={styles.inputRowDisabled}>
            <Feather name="map-pin" size={20} color="#C7C7C7" />
            <Text style={styles.inputDisabled}>Address</Text>
          </View>
        </View>

        {/* Social Connect */}
        <Text style={styles.orConnect}>or connect</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Feather
              name="globe"
              size={20}
              color={Colors.light.text}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Feather
              name="facebook"
              size={20}
              color={Colors.light.text}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.socialBtnText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpBtn} disabled={loading}>
          <Text style={styles.signUpBtnText}>Sign up</Text>
        </TouchableOpacity>

        {/* Terms & Privacy */}
        <Text style={styles.termsText}>
          By clicking Sign up, you will create an account and agree to ours{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.footerSignIn}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexGrow: 1, padding: 24, justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logoText: { fontSize: 28, fontWeight: "bold", letterSpacing: 1 },
  logoPurple: { color: Colors.light.text, fontWeight: "bold" },
  logoBlack: { color: "#222", fontWeight: "bold" },
  headerSubtitle: { color: "#222", fontSize: 16, marginTop: 2 },
  avatarWrap: { position: "relative", width: 56, height: 56 },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarPlus: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: Colors.light.text,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  formFields: { marginBottom: 24 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  input: { flex: 1, color: "#222", fontSize: 16, marginLeft: 8 },
  inputRowDisabled: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
    opacity: 0.5,
  },
  inputDisabled: { flex: 1, color: "#A3A3A3", fontSize: 16, marginLeft: 8 },
  orConnect: {
    textAlign: "center",
    color: "#888",
    marginBottom: 16,
    fontSize: 15,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.text,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
  },
  socialBtnText: { color: Colors.light.text, fontWeight: "bold", fontSize: 15 },
  signUpBtn: {
    backgroundColor: Colors.light.text,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  signUpBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  termsText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
  },
  link: { color: Colors.light.text, textDecorationLine: "underline" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#222", fontSize: 15 },
  footerSignIn: { color: "#222", fontWeight: "bold", fontSize: 15 },
});

export default SignUpScreen;
