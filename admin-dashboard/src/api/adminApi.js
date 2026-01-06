import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để đính kèm token vào mỗi yêu cầu
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Đăng nhập quản trị viên
export const adminLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post("/login", { email, password });

    // Kiểm tra quyền truy cập admin
    if (response.data.role !== "admin") {
      throw new Error("You do not have administrator access.");
    }

    localStorage.setItem("adminToken", response.data.token);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed.");
  }
};

// Lấy tất cả người dùng
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/admin/users");

    // Xử lý định dạng dữ liệu người dùng
    if (response.data && Array.isArray(response.data.users)) {
      return response.data.users;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected users data format:", response.data);
      return [];
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to load user list."
    );
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(
      `/admin/users/${userId}`,
      userData
    );
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update user.");
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data.message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user.");
  }
};

// Lấy tất cả đơn hàng
export const getAllOrders = async () => {
  try {
    const response = await axiosInstance.get("/admin/orders");

    // Xử lý định dạng dữ liệu đơn hàng
    if (response.data && Array.isArray(response.data.orders)) {
      return response.data.orders;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected orders data format:", response.data);
      return [];
    }
  } catch (error) {
    // Log chi tiết lỗi phản hồi, yêu cầu hoặc thiết lập
    if (error.response) {
      console.error(
        "Error fetching orders:",
        error.response.data,
        "Status:",
        error.response.status
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw new Error(
      error.response?.data?.message || "Failed to load order list."
    );
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axiosInstance.put(`/admin/orders/${orderId}`, {
      orderStatus: newStatus,
    });
    return response.data.order;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update order status."
    );
  }
};

// Xóa đơn hàng
export const deleteOrder = async (orderId) => {
  try {
    const response = await axiosInstance.delete(`/admin/orders/${orderId}`);
    return response.data.message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete order.");
  }
};

// Hủy đơn hàng (đối với người dùng cuối, hoặc admin thay mặt người dùng)
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.put(
      `/orders/cancel/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      }
    );
    return response.data.message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to cancel order.");
  }
};
