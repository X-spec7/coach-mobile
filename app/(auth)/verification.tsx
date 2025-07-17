import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_ENDPOINTS } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthTemp } from "./auth-temp-context";

interface VerificationParams {
  email: string;
}

const RESEND_INTERVAL = 120; // seconds

const Verification: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === "string" ? params.email : "";
  const { password, clearTempAuth } = useAuthTemp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_CODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode: code }),
      });
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }
        console.log("Login data:", {
          email: email,
          password: password,
        });
        
        // After verification, log in the user automatically
        const loginRes = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });
        console.log("loginRes:", loginRes);
        if (!loginRes.ok) {
          const loginData = await loginRes.json();
          throw new Error(
            loginData.message || "Login failed after verification"
          );
        }

        const loginData = await loginRes.json();
        // Store token (assume loginData.token or loginData.accessToken)
        await AsyncStorage.setItem(
          "token",
          loginData.token || loginData.accessToken || ""
        );
        clearTempAuth();
        // On success, go to onboarding
        router.replace("/(onboarding)/personalize");
      } else {
        const text = await response.text();
        throw new Error(text || "Verification failed");
      }
    } catch (err) {
      console.error("err:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [email, code, password, router, clearTempAuth]);

  const handleResend = useCallback(async () => {
    setResending(true);
    setError(null);
    try {
      // You may need to call your resend endpoint here
      await fetch(API_ENDPOINTS.AUTH.RESEND_CODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setTimer(RESEND_INTERVAL);
    } catch (err) {
      setError("Could not resend code. Try again later.");
    } finally {
      setResending(false);
    }
  }, [email]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timerText = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")} min left`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1 }} />
      <View style={styles.content}>
        <Text style={styles.title}>Verifying{"\n"}your email</Text>
        <Text style={styles.subtitle}>
          We've sent your verification code to {email}
        </Text>
        <Text style={styles.label}>Enter code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="1234"
          placeholderTextColor="#999"
          autoFocus
        />
        <View style={styles.divider} />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={[styles.button, (loading || !code) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || !code}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Resend code</Text>
          {timer > 0 ? (
            <Text style={styles.timer}>{timerText}</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={[styles.timer, resending && { color: "#bbb" }]}>
                Resend
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ flex: 2 }} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    marginHorizontal: 24,
    marginTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    marginBottom: 32,
  },
  label: {
    color: "#888",
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    fontSize: 20,
    color: "#1a1a1a",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
    letterSpacing: 8,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#A26FFD",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: "#d1bfff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  resendLabel: {
    color: "#1a1a1a",
    fontSize: 16,
  },
  timer: {
    color: "#bbb",
    fontSize: 16,
  },
  error: {
    color: "#FF4444",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default Verification;
