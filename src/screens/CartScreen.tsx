import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartItem } from "../types";
import { CheckoutModal } from "../components/CheckoutModal";
import { OrderSuccessModal } from "../components/OrderSuccessModal";

interface CartScreenProps {
  onGoToShop: () => void;
  onGoToAuth: () => void;
}

export function CartScreen({ onGoToShop, onGoToAuth }: CartScreenProps) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount,
    isLoading,
  } = useCart();
  const { user } = useAuth();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);

  const handleStartCheckout = () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to complete your purchase and save your order.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: onGoToAuth },
        ]
      );
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = async (orderNumber: string, orderDetails: any) => {
    await clearCart();
    setLastOrderDetails(orderDetails);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
  };

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
            Explore our curated catalog of laptops, power banks, and tech gear to
            start filling your cart.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={onGoToShop}
            activeOpacity={0.8}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
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
                style={styles.continueShoppingButton}
                onPress={onGoToShop}
                activeOpacity={0.7}
              >
                <Text style={styles.continueShoppingButtonText}>Shop More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleStartCheckout}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutButtonText}>
                  Checkout ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={totalAmount}
        user={user}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        visible={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          onGoToShop();
        }}
        orderDetails={lastOrderDetails}
      />
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
    padding: 12,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cartImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: "#F7FAFC",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#282828",
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F68B1E",
    marginTop: 3,
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
    borderColor: "#E2E8F0",
  },
  qtyButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A5568",
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#282828",
    paddingHorizontal: 10,
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
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
    gap: 8,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#E53E3E",
    fontSize: 12,
    fontWeight: "bold",
  },
  continueShoppingButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  continueShoppingButtonText: {
    color: "#4A5568",
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
    shadowColor: "#F68B1E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
