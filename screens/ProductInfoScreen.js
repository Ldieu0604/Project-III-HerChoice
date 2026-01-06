import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useMemo } from "react";
import { Ionicons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import axios from "axios";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");

const ProductInfoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Lấy product từ 2 nguồn: item (từ HomeScreen) hoặc id (từ ChatScreen)
  const productFromParams = route.params?.item;
  const productId = route.params?.id;

  const [product, setProduct] = useState(productFromParams || null);
  const [loading, setLoading] = useState(!productFromParams && !!productId);

  // Debug log
  useEffect(() => {
    console.log("ProductInfoScreen - productFromParams:", !!productFromParams);
    console.log("ProductInfoScreen - productId:", productId);
    console.log("ProductInfoScreen - product:", product?._id);
    console.log("ProductInfoScreen - loading:", loading);
  }, [productFromParams, productId, product, loading]);

  // Fetch sản phẩm nếu chỉ có ID (từ ChatScreen)
  useEffect(() => {
    if (productId && !productFromParams) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/products/${productId}`);
          if (response.data && response.data.product) {
            setProduct(response.data.product);
          } else {
            Alert.alert("Error", "Invalid product data received");
            navigation.goBack();
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          Alert.alert("Error", "Failed to load product details");
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else if (productFromParams) {
      // Nếu nhận product từ params, set luôn
      setProduct(productFromParams);
      setLoading(false);
    }
  }, [productId, productFromParams, navigation]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState(0);
  const [activeImage, setActiveImage] = useState(null);

  // Cập nhật stock và image khi product thay đổi
  useEffect(() => {
    if (product) {
      setCurrentStock(product.stock || 0);
      setActiveImage(product.image);
    }
  }, [product]);

  // Lấy danh sách Size duy nhất
  const uniqueSizes = useMemo(() => {
    if (!product?.variants) return [];
    const sizesSet = new Set();
    product.variants.forEach((variant) => {
      variant.sizes.forEach((s) => sizesSet.add(s.size));
    });
    return Array.from(sizesSet); // Ví dụ: ['S', 'M', 'L']
  }, [product]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0 VND";
    return amount.toLocaleString("vi-VN") + " VND";
  };

  // Logic tính toán tồn kho khi chọn Màu/Size
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      if (selectedColor && selectedSize) {
        // Tìm variant màu đã chọn
        const colorVariant = product.variants.find(
          (v) => v.color === selectedColor
        );
        // Tìm size trong màu đó
        const sizeVariant = colorVariant?.sizes.find(
          (s) => s.size === selectedSize
        );
        // Cập nhật tồn kho cụ thể
        setCurrentStock(sizeVariant ? sizeVariant.quantity : 0);
      } else {
        // Nếu chưa chọn đủ, hiển thị tổng kho
        setCurrentStock(product?.stock || 0);
      }
    }
  }, [selectedColor, selectedSize]);

  // Tăng giảm số lượng
  const handleIncrement = () => {
    if (quantity < currentStock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert("Alert", "Maximum stock limit reached!");
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const validateSelection = () => {
    if (product?.variants?.length > 0) {
      if (!selectedColor) {
        Alert.alert("Selection Required", "Please select a Color");
        return false;
      }
      if (!selectedSize) {
        Alert.alert("Selection Required", "Please select a Size");
        return false;
      }
    }
    if (currentStock === 0) {
      Alert.alert("Out of Stock", "This variation is temporarily out of stock");
      return false;
    }
    return true;
  };
  
  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!validateSelection()) return;

    const itemToAdd = {
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    };

    dispatch(addToCart(itemToAdd));
    Alert.alert("Success", "Added to cart successfully!");
  };

  // Mua ngay
  const handleBuyNow = () => {
    if (!validateSelection()) return;

    const itemToBuy = {
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    };

    dispatch(addToCart(itemToBuy));
    navigation.navigate("Main", { screen: "Cart" });
  };

  // Xử lý hiển thị Carousel ảnh
  const images = product?.carouselImages && product.carouselImages.length > 0 
    ? [product.image, ...product.carouselImages].filter(Boolean)
    : (product?.image ? [product.image] : []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#00CED1" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 16, color: "#666" }}>Product not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#00CED1", fontSize: 16, fontWeight: "bold" }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header đơn giản với nút Back */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Main", {screen: "Cart"})} style={styles.headerBtn}>
          <Ionicons name="cart-outline" size={24} color="white" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        {/* 1. Image Carousel */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={{ width: width, height: width }} 
        >
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={{ width: width, height: width, resizeMode: "cover" }}
            />
          ))}
        </ScrollView>

        {/* 2. Price & Title Info */}
        <View style={styles.sectionContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatCurrency(product?.price)}</Text>
            {product?.oldPrice && (
              <Text style={styles.oldPriceText}>{formatCurrency(product?.oldPrice)}</Text>
            )}
            {product?.offer && (
              <View style={styles.offerTag}>
                <Text style={styles.offerText}>{product?.offer} OFF</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.productTitle}>{product?.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <AntDesign name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{product?.rating || 0}/5</Text>
            </View>
           <Text style={styles.soldText}>{product?.sold || 0} sold</Text>
          </View>
        </View>

        {/* 3. Variant Selection (Màu sắc & Size) */}
        {product?.variants && product.variants.length > 0 && (
          <View style={styles.sectionContainer}>
            {/* Chọn loại */}
            <Text style={styles.variantTitle}>Variant</Text>
            <View style={styles.variantRow}>
              {product.variants.map((variant, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedColor(variant.color)}
                  style={[
                    styles.variantBtn,
                    selectedColor === variant.color && styles.variantBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.variantText,
                      selectedColor === variant.color && styles.variantTextSelected,
                    ]}
                  >
                    {variant.color}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.divider} />

            {/* --- PHẦN HIỂN THỊ SIZE (LUÔN HIỆN) --- */}
            <Text style={styles.variantTitle}>Size</Text>
            <View style={styles.variantRow}>
              {uniqueSizes.map((size, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.variantBtn,
                    selectedSize === size && styles.variantBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.variantText,
                      selectedSize === size && styles.variantTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* 4. Quantity & Stock */}
        <View style={styles.sectionContainer}>
          <View style={styles.quantityRow}>
            <Text style={styles.variantTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <Pressable onPress={handleDecrement} style={styles.qtyBtn}>
                <AntDesign name="minus" size={16} color="#333" />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable onPress={handleIncrement} style={styles.qtyBtn}>
                <AntDesign name="plus" size={16} color="#333" />
              </Pressable>
            </View>
          </View>
          <Text style={styles.stockText}>
            {currentStock > 0 ? `${currentStock} items available` : "Sold Out"}
          </Text>
        </View>

        {/* 5. Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.descriptionText}>
            {product?.description || "No description available for this product."}
          </Text>
          
          {/* Mockup Specifications */}
          {product?.specifications && (
             <View style={{marginTop: 10}}>
                {Object.entries(product.specifications).map(([key, value]) => (
                    <Text key={key} style={styles.specText}>• {key}: {value}</Text>
                ))}
             </View>
          )}
        </View>

      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={handleAddToCart} style={styles.cartBtn}>
          <MaterialCommunityIcons name="cart-plus" size={24} color="white" />
          <Text style={styles.btnText}>Add to Cart</Text>
        </Pressable>
        
        <Pressable onPress={handleBuyNow} style={styles.buyBtn}>
          <Text style={styles.btnText}>Buy Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ProductInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Section Styles
  sectionContainer: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 8,
  },
  
  // Price Info
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EE4D2D", // Màu cam Shopee
  },
  oldPriceText: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  offerTag: {
    backgroundColor: "#FCEBEB",
    marginLeft: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  offerText: {
    color: "#EE4D2D",
    fontSize: 12,
    fontWeight: "bold",
  },
  productTitle: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: { fontSize: 13, color: '#333' },
  soldText: { fontSize: 13, color: '#777' },

  // Variants
  variantTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  variantBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    backgroundColor: "#FAFAFA",
    minWidth: 60,
    alignItems: "center",
  },
  variantBtnSelected: {
    borderColor: "#EE4D2D",
    backgroundColor: "#FFFFFF",
  },
  variantText: {
    color: "#333",
  },
  variantTextSelected: {
    color: "#EE4D2D",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 15,
  },

  // Quantity
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  qtyValue: {
    width: 40,
    textAlign: "center",
    fontSize: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 5,
  },
  stockText: {
    fontSize: 13,
    color: "#757575",
    marginTop: 5,
    textAlign: 'right'
  },

  // Description
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
    padding: 10,
    marginHorizontal: -15,
    marginTop: -15,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  specText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  cartBtn: {
    flex: 1,
    backgroundColor: "#00CED1",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',
    gap: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#FFC72C",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});