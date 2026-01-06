import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL } from "../config";


const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { productName, productPrice } = route.params || {};

  const [messages, setMessages] = useState([
    { id: "1", text: "Xin chào! Em là trợ lý ảo HerChoice. Chị cần em tư vấn gì không ạ? 💕", sender: "bot" },
  ]);
  
  const [inputText, setInputText] = useState(
    productName 
      ? `Em ơi, tư vấn cho chị về sản phẩm "${productName}" giá ${productPrice?.toLocaleString('vi-VN')}đ này với!` 
      : ""
  );

  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    
    const newMsgUser = { id: Date.now().toString(), text: userMsg, sender: "user" };
    setMessages((prev) => [...prev, newMsgUser]);
    setInputText("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        userMessage: userMsg,
      });

      const botReply = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Chat Error:", error);
      Alert.alert(
    "Lỗi kết nối", 
    "Chi tiết: " + (error.response ? JSON.stringify(error.response.data) : error.message)
  );
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "Hệ thống đang bận, chị thử lại sau nhé! 😢", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

const renderMessageContent = (text, isUser) => {
    // 1. Tin nhắn User -> Text thường
    if (isUser) return <Text style={styles.userText}>{text}</Text>;

    // 2. Tin nhắn Bot -> Tách chuỗi (Giữ nguyên logic split này là đúng)
    const parts = text.split(/(\[VIEW:[^\]]+\])/g);

    return (
      <Text style={styles.botText}>
        {parts.map((part, index) => {
          
          // Nếu đoạn text này có chứa từ khóa "[VIEW:" thì chắc chắn là Link
          if (part.includes("[VIEW:")) {
            
            // Lấy ID: Xóa [VIEW:, xóa ], và xóa khoảng trắng thừa (trim)
            const productId = part.replace("[VIEW:", "").replace("]", "").trim();
            
            return (
              <Text
                key={index}
                style={{ color: "#007bff", fontWeight: "bold", textDecorationLine: "underline" }}
                onPress={() => {
                  // Điều hướng
                  navigation.navigate("Info", { id: productId });
                }}
              >
                 {"\n"}👉 Xem chi tiết ngay
              </Text>
            );
          }
          
          // Nếu không phải Link thì hiện text thường
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        {renderMessageContent(item.text, isUser)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>HerChoice AI Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List Chat */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
          onScrollBeginDrag={Keyboard.dismiss}
        />

        {loading && (
          <Text style={{ marginLeft: 15, marginBottom: 5, color: "#888", fontSize: 12 }}>
            Bot đang soạn tin...
          </Text>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <Pressable onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5"
  },
  header: {
    height: 60, 
    backgroundColor: "#00CED1", 
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 15
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  chatContainer: { padding: 15, paddingBottom: 20 },
  messageBubble: { padding: 12, borderRadius: 10, marginBottom: 10, maxWidth: "80%" },
  userBubble: { backgroundColor: "#00CED1", alignSelf: "flex-end" },
  botBubble: { backgroundColor: "white", alignSelf: "flex-start", borderWidth: 1, borderColor: "#DDD" },
  messageText: { fontSize: 15 },
  userText: { color: "white", fontSize: 15 },
  botText: { color: "#333", fontSize: 15 },
  inputContainer: { 
    flexDirection: "row", 
    padding: 10, 
    backgroundColor: "white", 
    alignItems: "center", 
    borderTopWidth: 1, 
    borderColor: "#EEE" 
  },
  input: { 
    flex: 1, 
    backgroundColor: "#F0F0F0", 
    borderRadius: 20, 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    marginRight: 10, 
    maxHeight: 100 
  },
  sendButton: { 
    backgroundColor: "#00CED1", 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});