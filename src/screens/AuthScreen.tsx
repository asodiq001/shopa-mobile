import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

interface AuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AuthScreen({ onSuccess, onCancel }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (newMode: "signIn" | "signUp") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (mode === "signUp" && !fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signIn") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.includes("Invalid login credentials")) {
            setErrorMessage("Invalid email or password. Please try again.");
          } else {
            setErrorMessage(error);
          }
        } else {
          onSuccess();
        }
      } else {
        const { error, message } = await signUp(fullName, email, password);
        if (error) {
          setErrorMessage(error);
        } else {
          setSuccessMessage(
            message || "Account created successfully! You can now sign in."
          );
          if (!message) {
            onSuccess();
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🛍️</Text>
            </View>
            <Text style={styles.title}>
              {mode === "signIn" ? "Welcome to Shopa! 👋" : "Create Account ✨"}
            </Text>
            <Text style={styles.subtitle}>
              {mode === "signIn"
                ? "Sign in with your Shopa account to sync your cart instantly across Web and Mobile."
                : "Join Shopa to enjoy pocket-friendly everyday tech essentials."}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === "signIn" && styles.activeTab]}
              onPress={() => switchMode("signIn")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signIn" && styles.activeTabText,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, mode === "signUp" && styles.activeTab]}
              onPress={() => switchMode("signUp")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "signUp" && styles.activeTabText,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Alerts */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {successMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {mode === "signUp" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Babatunde Adeyemi"
                  placeholderTextColor="#A0AEC0"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={
                    mode === "signUp" ? "Min. 6 characters" : "••••••••"
                  }
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeEmoji}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === "signIn" ? "Sign In to Shopa" : "Create My Account"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Skip / Guest Option */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>
              Continue browsing as Guest →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#282828",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EDF2F7",
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#718096",
  },
  activeTabText: {
    color: "#F68B1E",
  },
  errorBox: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#C53030",
    fontSize: 12,
    lineHeight: 16,
  },
  successBox: {
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#9AE6B4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    color: "#276749",
    fontSize: 12,
    lineHeight: 16,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#282828",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#282828",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 10,
    padding: 4,
  },
  eyeEmoji: {
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: "#F68B1E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#F68B1E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  guestButton: {
    marginTop: 18,
    alignItems: "center",
  },
  guestButtonText: {
    color: "#718096",
    fontSize: 12,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
