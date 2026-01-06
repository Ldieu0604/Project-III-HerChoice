import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");

const CategoryProductsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Lấy tham số truyền từ HomeScreen
  const { categoryName, categoryId } = route.params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cấu hình Header (Tiêu đề, nút Back) 
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, 
    });
  }, [navigation]);

  // Gọi API lấy sản phẩm theo danh mục
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        // Gọi endpoint: /products/category/:category
        const response = await axios.get(
          `${API_URL}/products/category/${categoryId}`
        );
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#00CED1" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        
        <Text style={styles.headerTitle}>{categoryName}</Text>
        
        <View style={styles.headerRight}>
          <Pressable onPress={() => navigation.navigate("Main", { screen: "Cart" })}>
            <Ionicons name="cart-outline" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00CED1" />
          <Text style={{ marginTop: 10, color: "gray" }}>
            Loading {categoryName}...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hiển thị số lượng tìm thấy */}
          <View style={styles.filterBar}>
            <Text style={styles.resultText}>
              Found {products.length} items
            </Text>
            <View style={styles.sortBtn}>
              <Ionicons name="filter" size={18} color="#333" />
              <Text style={styles.sortText}>Sort & Filter</Text>
            </View>
          </View>

          {/* Grid Sản phẩm */}
          <View style={styles.productsGrid}>
            {products.length > 0 ? (
              products.map((item, index) => (
                <Pressable
                  key={item._id || index}
                  style={styles.productCard}
                  onPress={() =>
                    navigation.navigate("Info", {
                      id: item._id,
                      title: item.title,
                      price: item?.price,
                      carouselImages: item.carouselImages || [item.image],
                      color: item?.color,
                      size: item?.variants?.[0]?.sizes?.[0]?.size || "Normal",
                      oldPrice: item?.oldPrice,
                      item: item,
                    })
                  }
                >
                  <Image
                    style={styles.productImage}
                    source={{
                      uri: item?.image || "https://via.placeholder.com/150",
                    }}
                  />

                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} 
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item?.title}
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>{item?.price?.toLocaleString('vi-VN')} VND</Text>
                      {item?.oldPrice && (
                        <Text style={styles.oldPrice}>{item?.oldPrice?.toLocaleString('vi-VN')} VND</Text>
                      )}
                    </View>

                    {item?.offer && (
                      <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>
                          {item?.offer} Off
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/2038/2038854.png",
                  }}
                  style={{ width: 100, height: 100, opacity: 0.5 }}
                />
                <Text style={styles.emptyText}>
                  No products found in this category.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#00CED1",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomColor: "#F0F0F0",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "white",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sortText: {
    fontSize: 14,
    color: "#333",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  productCard: {
    width: (width / 2) - 15, 
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    height: 36,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E31837",
    marginBottom: 2,
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#999",
    marginTop: 0,
  },
  offerBadge: {
    backgroundColor: "#E31837",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  offerText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
});