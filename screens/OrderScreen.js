import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const OrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Lấy thông tin đơn hàng từ tham số route
  const { cartItems, totalPrice, shippingAddress, paymentMethod } =
    route.params || {};

  // Chuyển hướng về màn hình chính
  const handleGoToMain = () => {
    navigation.replace("Main");
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === "android" ? 40 : 0,
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hoạt ảnh Lottie: Thumbs Up */}
        <LottieView
          source={require("../assets/thumbs.json")}
          style={styles.lottieThumbs}
          autoPlay
          loop={false}
          speed={0.7}
        />
        <Text style={styles.orderReceivedText}>
          Your Order Has Been Received!
        </Text>

        {/* Hoạt ảnh Lottie: Sparkle */}
        <LottieView
          source={require("../assets/sparkle.json")}
          style={styles.lottieSparkle}
          autoPlay
          loop={false}
          speed={0.7}
        />

        {/* Phần tóm tắt đơn hàng */}
        {cartItems && (
          <View style={styles.orderSummaryCard}>
            <Text style={styles.sectionTitle}>Order Details</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItemTitle}>Shipping to:</Text>
              <Text style={styles.summaryItemValue}>
                {shippingAddress?.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItemTitle}>Payment Method:</Text>
              <Text style={styles.summaryItemValue}>
                {paymentMethod === "cash"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItemTitle}>Total Items:</Text>
              <Text style={styles.summaryItemValue}>
                {cartItems.length} items
              </Text>
            </View>

            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalText}>Order Total:</Text>
              <Text style={styles.orderTotalAmount}>
                {totalPrice ? totalPrice.toLocaleString("vi-VN") : "0"} VND
              </Text>
            </View>
          </View>
        )}

        {/* Danh sách các mặt hàng đã mua */}
        {cartItems && cartItems.length > 0 && (
          <View style={styles.purchasedItemsCard}>
            <Text style={styles.sectionTitle}>Items Purchased</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text numberOfLines={2} style={styles.itemTitle}>
                    {item.title}
                  </Text>
                  {(item.color || item.size) && (
                    <Text style={styles.variantInfo}>
                      {item.color ? `Variant: ${item.color}` : ""}
                      {item.color && item.size ? ", " : ""}
                      {item.size ? `Size: ${item.size}` : ""}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    {item.price?.toLocaleString('vi-VN')} VND x {item.quantity}
                  </Text>
                  <Text style={styles.itemSubtotal}>
                    Subtotal: {(item.price * item.quantity)?.toLocaleString('vi-VN')} VND
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Nút "Tiếp tục mua sắm" */}
        <Pressable onPress={handleGoToMain} style={styles.goToMainButton}>
          <Text style={styles.goToMainButtonText}>Continue Shopping</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  lottieThumbs: {
    height: 260,
    width: 300,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  orderReceivedText: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  lottieSparkle: {
    height: 300,
    position: "absolute",
    top: 60,
    width: 300,
    alignSelf: "center",
    zIndex: -1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  orderSummaryCard: {
    backgroundColor: "white",
    padding: 18,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  summaryItemValue: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  orderTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  orderTotalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  orderTotalAmount: {
    color: "#C60C30",
    fontSize: 18,
    fontWeight: "bold",
  },
  purchasedItemsCard: {
    backgroundColor: "white",
    padding: 18,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 15,
    borderRadius: 5,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  variantInfo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#008397",
  },
  goToMainButton: {
    backgroundColor: "#00CED1",
    padding: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  goToMainButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});
