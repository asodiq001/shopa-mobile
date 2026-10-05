import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartItem } from "../types";

interface CartScreenProps {
  onGoToShop: () => void;
  onGoToAuth: () => void;
}

export function CartScreen({ onGoToShop, onGoToAuth }: CartScreenProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount, isLoading } =
    useCart();
  const { user } = useAuth();

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.cartImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          ₦{item.price.toLocaleString("en-NG")}
        </Text>

        {/* Quantity Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQuantity(item.id, -1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQuantity(item.id, 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeFromCart(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Realtime Live Sync Banner */}
      <View style={styles.syncBanner}>
        <View style={styles.syncDot} />
        <Text style={styles.syncBannerText}>
          {user
            ? `🟢 Real-Time Synced with Web (${user.email})`
            : "⚠️ Sign in to sync this cart instantly with your website!"}
        </Text>
        {!user && (
          <TouchableOpacity onPress={onGoToAuth} style={styles.syncLoginButton}>
            <Text style={styles.syncLoginText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F68B1E" />
          <Text style={styles.loadingText}>Syncing your cart...</Text>
        </View>
      ) : cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from the store, or add them on your website and watch them
            appear here instantly!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={onGoToShop}
            activeOpacity={0.8}
          >
            <Text style={styles.browseButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cartContent}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Checkout / Summary Footer */}
          <View style={styles.summaryFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total Items ({totalItems}):
              </Text>
              <Text style={styles.summaryValue}>
                ₦{totalAmount.toLocaleString("en-NG")}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearCart}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={onGoToShop}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutButtonText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#38A169",
  },
  syncBannerText: {
    flex: 1,
    fontSize: 11,
    color: "#2D3748",
    fontWeight: "600",
  },
  syncLoginButton: {
    backgroundColor: "#F68B1E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncLoginText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#718096",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#282828",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#718096",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 20,
    backgroundColor: "#F68B1E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  cartContent: {
    flex: 1,
  },
  listContainer: {
    padding: 14,
    paddingBottom: 20,
    gap: 10,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
    alignItems: "center",
  },
  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#EDF2F7",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#282828",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: "#F68B1E",
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E0",
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#282828",
  },
  qtyText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#282828",
    paddingHorizontal: 8,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
  },
  deleteIcon: {
    fontSize: 14,
  },
  summaryFooter: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#282828",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F68B1E",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#E53E3E",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: "#F68B1E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
