import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/CartReducer";
const ProductItem = ({ item }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();

  // Thêm sản phẩm vào giỏ hàng
  const addItemToCart = (item) => {
    setAddedToCart(true);
    dispatch(addToCart(item));
    // Đặt lại trạng thái "addedToCart" sau 6 giây
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  return (
    <Pressable style={{ marginHorizontal: 20, marginVertical: 20 }}>
      <Image
        source={{ uri: item?.image }}
        style={{ width: 150, height: 150, resizeMode: "contain" }}
      />
      <Text numberOfLines={1} style={{ width: 150, marginTop: 10 }}>
        {item?.title}
      </Text>

      <View
        style={{
          maginTop: 5,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>${item?.price}</Text>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {item?.rating?.rate} ratings
        </Text>
      </View>
      <Pressable
        onPress={() => addItemToCart(item)} // Gọi hàm thêm sản phẩm vào giỏ hàng
        style={({ pressed }) => ({
          backgroundColor: addedToCart ? "#82E0AA" : "#F8C471", // Thay đổi màu nền khi sản phẩm được thêm vào giỏ
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 25,
          marginTop: 10,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 10,
          elevation: 3,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {addedToCart ? (
            <>
              <Text
                style={{
                  color: "#000000",
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Added to cart
              </Text>
            </>
          ) : (
            <Text
              style={{
                color: "#000000",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Add to cart
            </Text>
          )}
        </View>
      </Pressable>
    </Pressable>
  );
};

export default ProductItem;

const styles = StyleSheet.create({});
