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

// Lấy danh sách tất cả sản phẩm (admin)
export const getAllProducts = async (category = "all", isActive = true, page = 1, limit = 10) => {
  try {
    const params = {
      page,
      limit,
    };

    if (category !== "all") {
      params.category = category;
    }

    params.isActive = isActive;

    const response = await axiosInstance.get("/admin/products", { params });

    if (response.data && Array.isArray(response.data.products)) {
      return {
        products: response.data.products,
        pagination: response.data.pagination,
      };
    } else {
      console.warn("Unexpected products data format:", response.data);
      return { products: [], pagination: { total: 0, page: 1, pages: 0 } };
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load products.");
  }
};

// Lấy chi tiết sản phẩm
export const getProductDetail = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}`);
    return response.data.product;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load product details.");
  }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post("/admin/products", productData);
    return response.data.product;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create product.");
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axiosInstance.put(`/admin/products/${productId}`, productData);
    return response.data.product;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update product.");
  }
};

// Xóa sản phẩm (soft delete)
export const deleteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/admin/products/${productId}`);
    return response.data.message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete product.");
  }
};

// Lấy sản phẩm theo danh mục (công khai)
export const getProductsByCategory = async (category) => {
  try {
    const response = await axiosInstance.get(`/products/category/${category}`);
    return response.data.products || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load products by category.");
  }
};

// Tìm kiếm sản phẩm
export const searchProducts = async (query, limit = 10) => {
  try {
    const response = await axiosInstance.get("/products", {
      params: {
        search: query,
        limit,
      },
    });
    return response.data.products || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to search products.");
  }
};
