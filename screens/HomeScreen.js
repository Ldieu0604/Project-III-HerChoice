import { API_URL } from "../config";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { Feather, Ionicons, MaterialIcons, Entypo, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import jwt_decode from "jwt-decode";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  // --- ĐÃ BỎ MỤC ELECTRONICS ---
  const categoriesList = [
    {
      id: "home",
      image: "https://img3.thuthuatphanmem.vn/uploads/2019/10/14/banner-quang-cao-thoi-trang-nu_113855491.jpg",
      name: "Home",
    },
    {
      id: "clothing",
      image: "https://m.media-amazon.com/images/I/51dZ19miAbL._AC_SY350_.jpg",
      name: "Clothing",
    },
    {
      id: "jewelery", 
      image: "https://925craft.uk/wp-content/uploads/2024/02/1.jpg",
      name: "Jewelry",
    },
    {
      id: "shoes",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqXRJ7DzkqmwAWp5VMuiAeHYYCY5dGv8QChA&s",
      name: "Shoes",
    },
    {
      id: "accessories",
      image: "https://www.shutterstock.com/image-photo/female-hands-holding-different-stylish-600nw-2373568665.jpg",
      name: "Accessories",
    },
  ];

  const images = [
    "https://esme.vn/wp-content/uploads/2024/06/image-luu-ngay-top-10-shop-ban-phu-kien-trang-suc-o-tphcm-sieu-xinh-164964932811410.jpg",
    "https://bkhost.vn/wp-content/uploads/2022/12/650x650.png",
    "https://upcontent.vn/wp-content/uploads/2024/06/banner-shop-thoi-trang-1-1536x960.jpg",
    "https://upcontent.vn/wp-content/uploads/2024/06/banner-thoi-trang-nu-3-1536x960.jpg",
  ];

  const [allProducts, setAllProducts] = useState([]); 
  const [displayProducts, setDisplayProducts] = useState([]); 
  const [randomOffers, setRandomOffers] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState("Home"); 
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // --- HÀM TRỘN MẢNG NGẪU NHIÊN ---
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // --- LẤY DỮ LIỆU TỪ DB ---
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/products`);
        const products = response.data.products;
        setAllProducts(products);

        // Chọn 10 sản phẩm ngẫu nhiên cho tab Home (Offer)
        const random10 = shuffleArray(products).slice(0, 10);
        setRandomOffers(random10);
        
        // Mặc định hiển thị Home
        setDisplayProducts(random10);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, []);

  // --- XỬ LÝ KHI CHỌN TAB DANH MỤC ---
  const handleCategoryPress = (item) => {
    // Nếu là Home thì lọc tại chỗ (hoặc làm mới trang)
    if (item.id === "home") {
       setSelectedCategory("Home");
       setDisplayProducts(randomOffers);
       return;
    }

    // Nếu là danh mục khác -> Chuyển sang màn hình khác
    navigation.navigate("CategoryProducts", {
      categoryName: item.name,
      categoryId: item.id,
    });
  };
  // --- CÁC LOGIC KHÁC ---
  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;
      const response = await axios.get(`${API_URL}/addresses/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(response.data.addresses || []);
    } catch (error) { console.log("Error address"); }
  }, [userId]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwt_decode(token);
        setUserId(decodedToken.userId);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId, modalVisible]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) setSelectedAddress(addresses[0]);
  }, [addresses]);


  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* 1. Header Search */}
          <View style={styles.searchContainer}>
            <Pressable style={styles.searchBar}>
              <Feather name="search" size={20} color="#999" style={{ marginRight: 6 }} />
              <TextInput placeholder="Search HerChoice..." placeholderTextColor="#999" style={styles.searchInput} />
            </Pressable>
            <Pressable style={styles.micButton}>
              <Feather name="mic" size={22} color="#333" />
            </Pressable>
          </View>

          {/* 2. Location Bar */}
          <Pressable onPress={() => setModalVisible(!modalVisible)} style={styles.locationContainer}>
            <Ionicons name="location-outline" size={24} color="black" />
            <Text style={styles.locationText}>
              {selectedAddress ? `Deliver to: ${selectedAddress?.name}...` : "Choose your location"}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="black" />
          </Pressable>

          {/* 3. Category Tabs (Modal List trên thanh) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {categoriesList.map((item, index) => (
              <Pressable 
                key={index} 
                onPress={() => handleCategoryPress(item)}
                style={[
                  styles.categoryItem,
                  selectedCategory === item.name && styles.categoryItemActive 
                ]}
              >
                <Image style={styles.categoryImage} source={{ uri: item.image }} />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === item.name && styles.categoryTextActive
                ]}>
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* 4. Banner Carousel */}
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerContainer}>
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.bannerImage} />
            ))}
          </ScrollView>

          {/* 5. Main Product List (Grid View) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === "Home" ? "Special Offers For You" : `${selectedCategory} Collection`}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#00CED1" style={{marginTop: 20}} />
          ) : (
            <View style={styles.productsGrid}>
              {displayProducts.length > 0 ? (
                displayProducts.map((item, index) => (
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
                      source={{ uri: item?.image || "https://via.placeholder.com/150" }}
                    />
                    
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={2}>{item?.title}</Text>
                      
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>{item?.price?.toLocaleString('vi-VN')} VND</Text>
                        {item?.oldPrice && (
                          <Text style={styles.oldPrice}>{item?.oldPrice?.toLocaleString('vi-VN')} VND</Text>
                        )}
                      </View>

                      {item?.offer && (
                        <View style={styles.offerBadge}>
                          <Text style={styles.offerText}>{item?.offer} Off</Text>
                        </View>
                      )}
                    </View>

                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No products found in this category.</Text>
                </View>
              )}
            </View>
          )}
          <View style={{height: 50}} /> 
        </ScrollView>
      </SafeAreaView>

      {/* Modal Address */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose your location</Text>
             </View>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 10}}>
                {addresses.map((addr, idx) => (
                    <Pressable key={idx} onPress={() => {setSelectedAddress(addr); setModalVisible(false)}} style={[styles.addressCard, {marginRight: 10}]}>
                        <Text style={{fontWeight:'bold', color:'#0066b2'}}>{addr.name}</Text>
                        <Text style={{fontSize:12}}>{addr.houseNo}, {addr.street}</Text>
                        <Text style={{fontSize:12}}>{addr.city}</Text>
                    </Pressable>
                ))}
                <Pressable onPress={() => {setModalVisible(false); navigation.navigate("Address")}} style={styles.addAddressCard}>
                    <Text style={{textAlign:'center', color:'#0066b2'}}>Add Address</Text>
                </Pressable>
             </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  
  searchContainer: {
    backgroundColor: "#00CED1",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 50,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    height: 42,
    flex: 1,
    marginRight: 12,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  micButton: {
    width: 42, height: 42, backgroundColor: "white", borderRadius: 8,
    justifyContent: "center", alignItems: "center"
  },

  locationContainer: {
    flexDirection: "row", alignItems: "center", gap: 5, padding: 10,
    backgroundColor: "#E0F7FA",
  },
  locationText: { fontSize: 14, color: "#333", flex: 1 },

  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "white",
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 8,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryItemActive: {
    borderColor: "#00CED1",
    backgroundColor: "#E0F7FA",
  },
  categoryImage: {
    width: 50, height: 50, borderRadius: 25, resizeMode: "contain",
    backgroundColor: "#f0f0f0",
  },
  categoryText: {
    fontSize: 12, marginTop: 5, fontWeight: "500", color: "#333"
  },
  categoryTextActive: {
    color: "#00CED1", fontWeight: "bold"
  },

  bannerContainer: { marginTop: 10 },
  bannerImage: {
    width: width - 20, height: 180, borderRadius: 10, marginHorizontal: 10, resizeMode: "cover"
  },

  sectionHeader: {
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20, fontWeight: "bold", color: "#333"
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
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%", height: 140, resizeMode: "contain", marginBottom: 10
  },
  productInfo: { flex: 1 },
  productTitle: {
    fontSize: 14, fontWeight: "500", color: "#333", height: 36, marginBottom: 5
  },
  priceRow: {
    flexDirection: "column", alignItems: "flex-start", gap: 2
  },
  productPrice: {
    fontSize: 16, fontWeight: "bold", color: "#E31837", marginBottom: 2,
  },
  oldPrice: {
    fontSize: 13, textDecorationLine: "line-through", color: "#999"
  },
  offerBadge: {
    backgroundColor: "#E31837", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, alignSelf: "flex-start", marginTop: 5
  },
  offerText: {
    color: "white", fontSize: 10, fontWeight: "bold"
  },
  emptyContainer: {
    width: "100%", alignItems: "center", padding: 20
  },
  emptyText: { color: "#666", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  addressCard: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: 140, height: 100, justifyContent:'center', alignItems:'center', backgroundColor: '#f9f9f9'},
  addAddressCard: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: 140, height: 100, justifyContent:'center', alignItems:'center' },
});

export default HomeScreen;