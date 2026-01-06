import { createSlice } from "@reduxjs/toolkit";

export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
  },
  reducers: {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: (state, action) => {
      // Tìm xem sản phẩm này (cùng ID, cùng Màu, cùng Size) đã có trong giỏ chưa
      const itemPresent = state.cart.find(
        (item) => 
          item._id === action.payload._id && 
          item.color === action.payload.color && // Kiểm tra màu
          item.size === action.payload.size      // Kiểm tra size
      );
      if (itemPresent) {
        // Nếu đã có -> Tăng số lượng lên theo số lượng người dùng chọn
        // Lưu ý: action.payload.quantity là số lượng từ màn hình ProductInfo gửi sang
        itemPresent.quantity += action.payload.quantity || 1;
      } else {
        // Nếu chưa có -> Thêm mới vào mảng
        state.cart.push({ 
            ...action.payload, 
            quantity: action.payload.quantity || 1 
        });
      }
    },
    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: (state, action) => {
      // Xóa sản phẩm phải dựa trên cả ID, Màu, Size để tránh xóa nhầm
      const removeItem = state.cart.filter(
        (item) => 
          !(item._id === action.payload._id && 
            item.color === action.payload.color && 
            item.size === action.payload.size)
      );
      state.cart = removeItem;
    },
    // Tăng số lượng sản phẩm
    incementQuantity: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => 
          item._id === action.payload._id && 
          item.color === action.payload.color && 
          item.size === action.payload.size
      );
      if (itemPresent) {
        itemPresent.quantity++;
      }
    },
    // Giảm số lượng sản phẩm
    decrementQuantity: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => 
          item._id === action.payload._id && 
          item.color === action.payload.color && 
          item.size === action.payload.size
      );
      if (itemPresent) {
        if (itemPresent.quantity === 1) {
          // Nếu còn 1 thì xóa luôn (logic giống removeFromCart)
          const removeItem = state.cart.filter(
            (item) => 
              !(item._id === action.payload._id && 
                item.color === action.payload.color && 
                item.size === action.payload.size)
          );
          state.cart = removeItem;
        } else {
          itemPresent.quantity--;
        }
      }
    },
    // Xóa toàn bộ giỏ hàng
    cleanCart: (state) => {
      state.cart = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incementQuantity,
  decrementQuantity,
  cleanCart,
} = CartSlice.actions;

export default CartSlice.reducer;
