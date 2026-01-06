import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import CategoryProductsScreen from "../screens/CategoryProductsScreen";
import ProductInfoScreen from "../screens/ProductInfoScreen";
import AddAddressScreen from "../screens/AddAddressScreen";
import AddressScreen from "../screens/AddressScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";
import OrderScreen from "../screens/OrderScreen";
import ChatScreen from "../screens/ChatScreen";
import FloatingChatButton from "../components/FloatingChatButton";

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState(null);
  const showChatScreens = ["HomeScreen", "Info", "CategoryProducts"];
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          headerShown={false}
          options={{
            tabBarLabel: "Home",
            headerShown: false,
            tabBarLabelStyle: { color: "#008E97" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Entypo name="home" size={24} color="#008E97" />
              ) : (
                <AntDesign name="home" size={24} color="black" />
              ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          headerShown={false}
          options={{
            headerShown: false,
            tabBarLabel: "Profile",
            tabBarLabelStyle: { color: "#008E97" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={24} color="#008E97" />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" />
              ),
          }}
        />

        <Tab.Screen
          name="Cart"
          component={CartScreen}
          headerShown={false}
          options={{
            headerShown: false,
            tabBarLabel: "Cart",
            tabBarLabelStyle: { color: "#008E97" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="shopping-cart" size={24} color="#008E97" />
              ) : (
                <AntDesign name="shopping-cart" size={24} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setCurrentRouteName(navigationRef.getCurrentRoute().name);
      }}
      onStateChange={async () => {
        const previousRouteName = currentRouteName;
        const currentRouteName = navigationRef.getCurrentRoute().name;
        if (previousRouteName !== currentRouteName) {
          setCurrentRouteName(currentRouteName);
        }
      }}
    >
      <View style={{ flex: 1 }}>
        <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategoryProducts"
          component={CategoryProductsScreen}
          options={{ headerTitle: "" }} 
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Info"
          component={ProductInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Address"
          component={AddAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Add"
          component={AddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Confirm"
          component={ConfirmationScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Order"
          component={OrderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>

      {showChatScreens.includes(currentRouteName) && (
          <FloatingChatButton
            onPress={() => {
              navigationRef.navigate("Chat");
            }}
          />
        )}
      
      </View>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
