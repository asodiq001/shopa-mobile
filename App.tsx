import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CartProvider, useCart } from "./src/context/CartContext";
import { Header } from "./src/components/Header";
import { ShopScreen } from "./src/screens/ShopScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { AccountScreen } from "./src/screens/AccountScreen";

function MainApp() {
  const [activeScreen, setActiveScreen] = useState<"shop" | "cart" | "auth">(
    "shop"
  );
  const { totalItems } = useCart();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <Header activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Screen Routing */}
      <View style={styles.content}>
        {activeScreen === "shop" && <ShopScreen />}
        {activeScreen === "cart" && (
          <CartScreen
            onGoToShop={() => setActiveScreen("shop")}
            onGoToAuth={() => setActiveScreen("auth")}
          />
        )}
        {activeScreen === "auth" &&
          (user ? (
            <AccountScreen
              onGoToShop={() => setActiveScreen("shop")}
              onGoToCart={() => setActiveScreen("cart")}
            />
          ) : (
            <AuthScreen
              onSuccess={() => setActiveScreen("shop")}
              onCancel={() => setActiveScreen("shop")}
            />
          ))}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeScreen === "shop" && styles.activeNavItem]}
          onPress={() => setActiveScreen("shop")}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>🛍️</Text>
          <Text
            style={[
              styles.navLabel,
              activeScreen === "shop" && styles.activeNavLabel,
            ]}
          >
            Shop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeScreen === "cart" && styles.activeNavItem]}
          onPress={() => setActiveScreen("cart")}
          activeOpacity={0.7}
        >
          <View style={styles.navCartWrapper}>
            <Text style={styles.navIcon}>🛒</Text>
            {totalItems > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{totalItems}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeScreen === "cart" && styles.activeNavLabel,
            ]}
          >
            Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeScreen === "auth" && styles.activeNavItem]}
          onPress={() => setActiveScreen("auth")}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text
            style={[
              styles.navLabel,
              activeScreen === "auth" && styles.activeNavLabel,
            ]}
          >
            {user ? "Account" : "Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDEDED",
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: "#FFF3E0",
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#718096",
    marginTop: 2,
  },
  activeNavLabel: {
    color: "#F68B1E",
    fontWeight: "bold",
  },
  navCartWrapper: {
    position: "relative",
  },
  navBadge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: "#F68B1E",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  navBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
});
