import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

interface HeaderProps {
  activeScreen: "shop" | "cart" | "auth";
  onNavigate: (screen: "shop" | "cart" | "auth") => void;
}

export function Header({ activeScreen, onNavigate }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();

  return (
    <View style={styles.container}>
      {/* Brand Logo */}
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => onNavigate("shop")}
        activeOpacity={0.8}
      >
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🛍️</Text>
        </View>
        <Text style={styles.brandTitle}>
          Shopa<Text style={styles.brandDot}>.</Text>
        </Text>
      </TouchableOpacity>

      {/* Right Actions: User info & Cart */}
      <View style={styles.rightActions}>
        {user ? (
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => onNavigate("auth")}
            activeOpacity={0.7}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name.split(" ")[0]}
              </Text>
              <Text style={styles.signOutText}>Account</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => onNavigate("auth")}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}

        {/* Cart Quick Toggle Button */}
        <TouchableOpacity
          style={[
            styles.cartButton,
            activeScreen === "cart" && styles.cartButtonActive,
          ]}
          onPress={() => onNavigate("cart")}
          activeOpacity={0.8}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F68B1E",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#282828",
    letterSpacing: -0.5,
  },
  brandDot: {
    color: "#F68B1E",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F68B1E",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  userInfoText: {
    maxWidth: 80,
  },
  userName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#282828",
  },
  signOutText: {
    fontSize: 10,
    color: "#E53E3E",
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F68B1E",
  },
  signInText: {
    color: "#F68B1E",
    fontSize: 12,
    fontWeight: "bold",
  },
  cartButton: {
    position: "relative",
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  cartButtonActive: {
    backgroundColor: "#FFF3E0",
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#F68B1E",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
});
