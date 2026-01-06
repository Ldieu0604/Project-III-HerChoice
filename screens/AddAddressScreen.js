import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import React, { useEffect, useContext, useState, useCallback } from "react";
import { Feather, AntDesign, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const { userId } = useContext(UserType);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy danh sách địa chỉ người dùng
  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert(
          "Authentication Error",
          "No token found. Please log in again."
        );
        navigation.replace("Login");
        return;
      }

      // Gửi yêu cầu lấy địa chỉ
      const response = await axios.get(
        `${API_URL}/addresses/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses(response.data.addresses || []);
    } catch (error) {
      setAddresses([]);
      Alert.alert(
        "Error",
        `Failed to load address list: ${
          error.response?.data?.message || error.message
        }.`
      );
      // Xử lý lỗi xác thực
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again."
        );
        navigation.replace("Login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigation]);

  // Gọi fetchAddresses khi userId thay đổi
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId, fetchAddresses]);

  // Gọi fetchAddresses khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchAddresses();
      } else {
        setAddresses([]);
      }
    }, [userId, fetchAddresses])
  );

  // Xử lý chỉnh sửa địa chỉ (chức năng đang phát triển)
  const handleEditAddress = (addressId) => {
    Alert.alert(
      "Edit",
      `Edit address: ${addressId} function is under development.`
    );
  };

  // Xử lý xóa địa chỉ (chức năng đang phát triển)
  const handleRemoveAddress = (addressId) => {
    Alert.alert(
      "Delete",
      `Are you sure you want to delete this address? (${addressId})`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: () => {
            Alert.alert(
              "Delete",
              "Address deletion function is under development."
            );
          },
        },
      ]
    );
  };

  // Xử lý đặt địa chỉ làm mặc định (chức năng đang phát triển)
  const handleSetAsDefault = (addressId) => {
    Alert.alert(
      "Set as Default",
      `Set address ${addressId} as default function is under development.`
    );
  };

  // Lọc địa chỉ theo truy vấn tìm kiếm
  const filteredAddresses = addresses.filter((addr) => {
    const query = searchQuery.toLowerCase();
    return (
      addr.name?.toLowerCase().includes(query) ||
      addr.houseNo?.toLowerCase().includes(query) ||
      addr.street?.toLowerCase().includes(query) ||
      addr.landmark?.toLowerCase().includes(query) ||
      addr.city?.toLowerCase().includes(query) ||
      addr.country?.toLowerCase().includes(query) ||
      addr.mobileNo?.includes(query) ||
      addr.postalCode?.includes(query)
    );
  });

  return (
    <>
      <StatusBar backgroundColor="#00CED1" barStyle="light-content" />
      <View style={styles.safeArea}>
        {/* Header với tìm kiếm */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <AntDesign
              name="search"
              size={22}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search in your addresses..."
              placeholderTextColor="#666"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable
            onPress={() =>
              Alert.alert("Mic", "Voice search function coming soon!")
            }
          >
            <Feather name="mic" size={24} color="white" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Your Addresses</Text>
              {isLoading && <ActivityIndicator size="small" color="#007BFF" />}
            </View>

            {/* Nút Thêm địa chỉ mới */}
            <Pressable
              onPress={() => navigation.navigate("Add")}
              style={styles.addNewButton}
            >
              <AntDesign name="pluscircleo" size={22} color="#007BFF" />
              <Text style={styles.addNewButtonText}>Add a new address</Text>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={24}
                color="#007BFF"
              />
            </Pressable>

            {/* Danh sách địa chỉ */}
            {!isLoading && filteredAddresses.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={60} color="#CBD5E0" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No matching addresses found."
                    : "You don't have any saved addresses."}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchQuery
                    ? "Try changing your search keywords."
                    : "Add a new address to easily shop."}
                </Text>
              </View>
            )}

            {filteredAddresses.map((item) => (
              <Pressable
                key={item._id || item.id}
                style={styles.addressCard}
                onPress={() => console.log("Selected address:", item.name)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.addressName}>{item?.name}</Text>
                  <Entypo name="location-pin" size={24} color="#FF6347" />
                </View>

                <Text style={styles.addressDetail}>
                  {item?.houseNo}
                  {item?.landmark ? `, ${item?.landmark}` : ""}
                </Text>
                <Text style={styles.addressDetail}>{item?.street}</Text>
                {item?.city && item?.country && (
                  <Text style={styles.addressDetail}>
                    {item?.city}, {item?.country}
                  </Text>
                )}
                <Text style={styles.addressDetail}>
                  Phone: {item?.mobileNo}
                </Text>
                <Text style={styles.addressDetail}>
                  Postal Code: {item?.postalCode}
                </Text>

                <View style={styles.actionsContainer}>
                  <Pressable
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditAddress(item._id || item.id)} // Gọi hàm chỉnh sửa địa chỉ
                  >
                    <Feather name="edit-2" size={16} color="#2E86C1" />
                    <Text style={[styles.actionButtonText, styles.editText]}>
                      Edit
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveAddress(item._id || item.id)} // Gọi hàm xóa địa chỉ
                  >
                    <Feather name="trash-2" size={16} color="#CB4335" />
                    <Text style={[styles.actionButtonText, styles.removeText]}>
                      Delete
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.defaultButton]}
                    onPress={() => handleSetAsDefault(item._id || item.id)} // Gọi hàm đặt làm mặc định
                  >
                    <MaterialIcons
                      name="star-outline"
                      size={16}
                      color="#1E8449"
                    />
                    <Text style={[styles.actionButtonText, styles.defaultText]}>
                      Default
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default AddAddressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    backgroundColor: "#00CED1",
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007BFF",
    flex: 1,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#718096",
    marginTop: 15,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 5,
    textAlign: "center",
  },
  addressCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#34495E",
  },
  addressDetail: {
    fontSize: 14,
    color: "#566573",
    marginBottom: 4,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#E9F5FC",
    borderColor: "#AED6F1",
  },
  editText: {
    color: "#2E86C1",
  },
  removeButton: {
    backgroundColor: "#FDEDED",
    borderColor: "#F5B7B1",
  },
  removeText: {
    color: "#CB4335",
  },
  defaultButton: {
    backgroundColor: "#E8F6EF",
    borderColor: "#A9DFBF",
  },
  defaultText: {
    color: "#1E8449",
  },
});
