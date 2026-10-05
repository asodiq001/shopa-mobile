import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CartItem } from "../types";
import { supabase } from "../lib/supabase";

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number;
  user: { id: string; name: string; email: string } | null;
  onOrderSuccess: (orderNumber: string, orderDetails: any) => void;
}

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers (Port Harcourt)",
  "Oyo (Ibadan)",
  "Ogun",
  "Kano",
  "Enugu",
  "Delta",
  "Other States",
];

export function CheckoutModal({
  visible,
  onClose,
  cart,
  totalAmount,
  user,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Lagos");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync user info into form fields whenever user changes or modal opens
  useEffect(() => {
    if (user) {
      if (user.name && user.name !== "Shopper") {
        setFullName(user.name);
      }
      if (user.email) {
        setEmail(user.email);
      }
    }
  }, [user, visible]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Required", "Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Required", "Please enter your phone number.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Required", "Please enter your delivery street address.");
      return;
    }

    setIsSubmitting(true);
    const orderNumber = `#SHOPA-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Insert order into Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: fullName.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          delivery_state: state,
          delivery_address: address.trim(),
          delivery_notes: notes.trim() || null,
          total_amount: totalAmount,
          status: "Confirmed",
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      // 2. Insert line items into order_items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
      }

      // 3. Dispatch Mailgun receipt via backend API
      try {
        fetch("https://shopa-1.vercel.app/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: orderNumber,
            customerName: fullName.trim(),
            customerEmail: email.trim(),
            customerPhone: phone.trim(),
            deliveryState: state,
            deliveryAddress: address.trim(),
            totalAmount: totalAmount,
            items: cart.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
            })),
          }),
        }).catch((err) => console.log("Background receipt error:", err));
      } catch (e) {
        console.log("Failed to invoke receipt endpoint:", e);
      }

      // 4. Trigger success callback
      onOrderSuccess(orderNumber, {
        orderNumber,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        deliveryState: state,
        deliveryAddress: address.trim(),
        totalAmount,
        itemsCount: cart.reduce((s, i) => s + i.quantity, 0),
      });
    } catch (err: any) {
      Alert.alert(
        "Order Failed",
        err.message || "Could not place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Checkout & Delivery</Text>
              <Text style={styles.modalSubtitle}>
                Complete details to finalize your order
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Akinlabi Babatunde"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. yourname@gmail.com"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="e.g. 08031234567"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* State Picker Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery State *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stateChipsRow}
              >
                {NIGERIAN_STATES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.stateChip,
                      state === st && styles.stateChipActive,
                    ]}
                    onPress={() => setState(st)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.stateChipText,
                        state === st && styles.stateChipTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Street Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street / Delivery Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                placeholder="e.g. Plot 12, Admiralty Way, Lekki Phase 1"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery Instructions (Optional)</Text>
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Call upon arrival at security gate"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* Order Recap */}
            <View style={styles.orderRecapBox}>
              <Text style={styles.recapHeader}>ORDER RECAP</Text>
              {cart.map((item) => (
                <View key={item.id} style={styles.recapItemRow}>
                  <Text style={styles.recapItemName} numberOfLines={1}>
                    {item.name} × {item.quantity}
                  </Text>
                  <Text style={styles.recapItemPrice}>
                    ₦{(item.price * item.quantity).toLocaleString("en-NG")}
                  </Text>
                </View>
              ))}

              <View style={styles.recapDivider} />

              <View style={styles.recapTotalRow}>
                <Text style={styles.recapTotalLabel}>Total Due:</Text>
                <Text style={styles.recapTotalValue}>
                  ₦{totalAmount.toLocaleString("en-NG")}
                </Text>
              </View>
            </View>

            {/* Payment Method Notice */}
            <View style={styles.paymentNotice}>
              <Text style={styles.paymentNoticeIcon}>💵</Text>
              <Text style={styles.paymentNoticeText}>
                <Text style={{ fontWeight: "bold" }}>Payment Method:</Text> Cash
                on Delivery / Direct Bank Transfer on arrival (Verified & Safe)
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Confirm & Place Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#282828",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F7FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#718096",
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D3748",
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2D3748",
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: "top",
  },
  stateChipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#EDF2F7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stateChipActive: {
    backgroundColor: "#FFF5EB",
    borderColor: "#F68B1E",
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
  },
  stateChipTextActive: {
    color: "#F68B1E",
    fontWeight: "700",
  },
  orderRecapBox: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
    marginTop: 6,
  },
  recapHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#718096",
    letterSpacing: 0.8,
  },
  recapItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recapItemName: {
    fontSize: 12,
    color: "#4A5568",
    flex: 1,
    paddingRight: 10,
  },
  recapItemPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D3748",
  },
  recapDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  recapTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recapTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D3748",
  },
  recapTotalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F68B1E",
  },
  paymentNotice: {
    flexDirection: "row",
    backgroundColor: "#EBF8FF",
    borderWidth: 1,
    borderColor: "#BEE3F8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    gap: 10,
  },
  paymentNoticeIcon: {
    fontSize: 18,
  },
  paymentNoticeText: {
    fontSize: 12,
    color: "#2B6CB0",
    flex: 1,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#718096",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#F68B1E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F68B1E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
