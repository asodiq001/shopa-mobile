import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { Order } from "../types";

interface AccountScreenProps {
  onGoToShop: () => void;
  onGoToCart: () => void;
}

export function AccountScreen({ onGoToShop, onGoToCart }: AccountScreenProps) {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          created_at,
          total_amount,
          status,
          customer_name,
          customer_email,
          customer_phone,
          delivery_state,
          delivery_address,
          order_items (
            id,
            product_name,
            unit_price,
            quantity,
            image
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user orders:", error);
      } else if (data) {
        const mapped: Order[] = data.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          createdAt: new Date(o.created_at).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          totalAmount: Number(o.total_amount),
          status: o.status || "Confirmed",
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerPhone: o.customer_phone,
          deliveryState: o.delivery_state,
          deliveryAddress: o.delivery_address,
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            productName: it.product_name,
            unitPrice: Number(it.unit_price),
            quantity: it.quantity,
            image: it.image,
          })),
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Orders exception:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Shopa?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          onGoToShop();
        },
      },
    ]);
  };

  if (!user) return null;

  const initial = (user.name || user.email || "S").charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F68B1E"
        />
      }
    >
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncBadgeText}>
              Supabase Auth Synced (Web & Mobile)
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={onGoToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Cart Items</Text>
        </TouchableOpacity>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Past Orders</Text>
        </View>
      </View>

      {/* Order History Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Order History</Text>
        <Text style={styles.sectionSubtitle}>
          Live orders synchronized from database
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#F68B1E" />
          <Text style={styles.loaderText}>Loading your orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyOrdersCard}>
          <Text style={styles.emptyOrdersEmoji}>📦</Text>
          <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
          <Text style={styles.emptyOrdersSubtitle}>
            When you complete an order on the mobile app or the website, it will
            instantly appear right here!
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={onGoToShop}
            activeOpacity={0.8}
          >
            <Text style={styles.shopNowButtonText}>Browse Store</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderNumberText}>
                    {order.orderNumber}
                  </Text>
                  <Text style={styles.orderDateText}>{order.createdAt}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              {/* Items List */}
              <View style={styles.orderItemsBox}>
                {order.items.map((item) => (
                  <View key={item.id} style={styles.orderItemRow}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.itemThumbPlaceholder}>
                        <Text style={{ fontSize: 12 }}>📦</Text>
                      </View>
                    )}
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text style={styles.itemSubtext}>
                        Qty: {item.quantity} × ₦
                        {item.unitPrice.toLocaleString("en-NG")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Order Footer */}
              <View style={styles.orderCardFooter}>
                <View style={styles.deliveryLocation}>
                  <Text style={styles.locationLabel}>Deliver to:</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {order.deliveryAddress}, {order.deliveryState}
                  </Text>
                </View>
                <View style={styles.totalDueBox}>
                  <Text style={styles.totalDueLabel}>Total:</Text>
                  <Text style={styles.totalDueAmount}>
                    ₦{order.totalAmount.toLocaleString("en-NG")}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Account Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out of Shopa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F68B1E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  profileDetails: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#282828",
  },
  profileEmail: {
    fontSize: 12,
    color: "#718096",
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38A169",
  },
  syncBadgeText: {
    fontSize: 10,
    color: "#2D3748",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F68B1E",
  },
  statLabel: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "600",
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#282828",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#718096",
    marginTop: 2,
  },
  loaderContainer: {
    padding: 30,
    alignItems: "center",
    gap: 10,
  },
  loaderText: {
    fontSize: 12,
    color: "#718096",
  },
  emptyOrdersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyOrdersEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyOrdersTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#282828",
  },
  emptyOrdersSubtitle: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  shopNowButton: {
    marginTop: 14,
    backgroundColor: "#F68B1E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shopNowButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
    paddingBottom: 8,
  },
  orderNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F68B1E",
    letterSpacing: 0.5,
  },
  orderDateText: {
    fontSize: 10,
    color: "#A0AEC0",
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "#DEF7EC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "#03543F",
    fontWeight: "800",
  },
  orderItemsBox: {
    gap: 8,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#F7FAFC",
  },
  itemThumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#EDF2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D3748",
  },
  itemSubtext: {
    fontSize: 11,
    color: "#718096",
    marginTop: 1,
  },
  orderCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    paddingTop: 8,
  },
  deliveryLocation: {
    flex: 1,
    paddingRight: 10,
  },
  locationLabel: {
    fontSize: 10,
    color: "#A0AEC0",
  },
  locationText: {
    fontSize: 11,
    color: "#4A5568",
    fontWeight: "600",
  },
  totalDueBox: {
    alignItems: "flex-end",
  },
  totalDueLabel: {
    fontSize: 10,
    color: "#A0AEC0",
  },
  totalDueAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F68B1E",
  },
  actionsContainer: {
    marginTop: 8,
  },
  signOutButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FED7D7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  signOutText: {
    color: "#E53E3E",
    fontSize: 13,
    fontWeight: "bold",
  },
});

