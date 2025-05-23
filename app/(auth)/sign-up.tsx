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
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import Logo from "../components/Logo";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuthTemp } from "./auth-temp-context";

const AVATAR_PLACEHOLDER = "https://randomuser.me/api/portraits/women/44.jpg";

export const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { setTempAuth } = useAuthTemp();
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !email || !password) {
        throw new Error("User, email, and password are required");
      }

      const formData = {
        firstName: user,
        lastName: "Kadaini", // TODO: remove this
        userType: "Client", // TODO: remove this
        confirmPassword: password, // TODO: remove this
        email,
        password,
        phone,
        address,
      };

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setTempAuth(email, password);
      router.replace(`/(auth)/verification?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("err:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#EDE2FF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logoText}>
              <Logo size="small" />
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

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Feather name="mail" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A3A3A3"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Feather name="lock" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A3A3A3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Feather name="phone" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor="#A3A3A3"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Feather name="map-pin" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#A3A3A3"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              returnKeyType="done"
            />
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
        <TouchableOpacity
          style={styles.signUpBtn}
          disabled={loading}
          onPress={handleRegister}
        >
          <Text style={styles.signUpBtnText}>
            {loading ? "Signing up..." : "Sign up"}
          </Text>
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
    marginBottom: 8,
    height: 48,
  },
  input: { flex: 1, color: "#222", fontSize: 14, marginLeft: 8 },
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
  socialBtnText: { color: Colors.light.text, fontWeight: "bold", fontSize: 12 },
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
  errorContainer: {
    backgroundColor: "#ff444422",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { color: "#ff4444", fontSize: 14 },
});

export default SignUpScreen;
