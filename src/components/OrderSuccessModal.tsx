import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

interface OrderSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    deliveryAddress: string;
    deliveryState: string;
    totalAmount: number;
    itemsCount: number;
  } | null;
}

export function OrderSuccessModal({
  visible,
  onClose,
  orderDetails,
}: OrderSuccessModalProps) {
  if (!orderDetails) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Success Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🎉</Text>
          </View>

          <Text style={styles.title}>Thank You For Your Order!</Text>
          <Text style={styles.subtitle}>
            Your order has been recorded in the database. A confirmation receipt
            has been dispatched to your email.
          </Text>

          {/* Order Badge */}
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>
              {orderDetails.orderNumber}
            </Text>
          </View>

          {/* Details Box */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {orderDetails.customerName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deliver To</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {orderDetails.deliveryAddress}, {orderDetails.deliveryState}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Items</Text>
              <Text style={styles.detailValue}>
                {orderDetails.itemsCount} product(s)
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.totalValue}>
                ₦{orderDetails.totalAmount.toLocaleString("en-NG")}
              </Text>
            </View>
          </View>

          {/* Close / Continue Shopping Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DEF7EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 19,
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
    paddingHorizontal: 10,
  },
  orderBadge: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
  },
  orderBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F68B1E",
    letterSpacing: 0.8,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 12,
    color: "#2D3748",
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#282828",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F68B1E",
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#F68B1E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#F68B1E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
