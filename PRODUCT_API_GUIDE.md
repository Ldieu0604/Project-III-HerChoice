# Hướng dẫn sử dụng Product Schema và API

## 1. Schema Product

Schema sản phẩm được tạo tại `api/models/product.js` với các trường sau:

### Thông tin cơ bản
- `title` (String, bắt buộc): Tên sản phẩm
- `description` (String): Mô tả chi tiết
- `category` (String, bắt buộc): Danh mục (clothing, jewelery, shoes, accessories, electronics)

### Giá cả
- `price` (Number, bắt buộc): Giá hiện tại
- `oldPrice` (Number): Giá gốc trước khi giảm
- `offer` (String): Phần trăm giảm giá (vd: "40% off")

### Hình ảnh
- `image` (String, bắt buộc): Ảnh chính
- `carouselImages` (Array): Mảng các ảnh sản phẩm (slide)

### Chi tiết sản phẩm
- `color` (String): Màu sắc
- `size` (String): Kích thước
- `specifications` (Map): Các thông số kỹ thuật (vd: {ram: "8GB", storage: "128GB"})

### Quản lý kho
- `stock` (Number): Số lượng tồn kho
- `inStock` (Boolean): Trạng thái có sẵn hay không

### Đánh giá
- `rating` (Number): Điểm đánh giá (0-5)
- `reviews` (Array): Mảng các review từ người dùng

### Khác
- `seller` (ObjectId): ID người bán (nếu có hệ thống multi-seller)
- `isActive` (Boolean): Sản phẩm có hoạt động hay không
- `createdAt` (Date): Thời gian tạo
- `updatedAt` (Date): Thời gian cập nhật cuối

---

## 2. API Endpoints

### ✅ Endpoints công khai (không cần token)

#### Lấy danh sách sản phẩm
```
GET /products?category=electronics&search=Samsung&page=1&limit=10
```

Response:
```json
{
  "products": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

#### Lấy sản phẩm theo danh mục
```
GET /products/category/electronics
```

#### Lấy chi tiết sản phẩm
```
GET /products/:productId
```

#### Thêm review (cần token)
```
POST /products/:productId/reviews
Authorization: Bearer <token>

Body:
{
  "comment": "Sản phẩm rất tốt!",
  "rating": 5
}
```

---

### 🔐 Endpoints Admin (cần token admin)

#### Tạo sản phẩm mới
```
POST /admin/products
Authorization: Bearer <token>

Body:
{
  "title": "Samsung Galaxy S20 FE 5G",
  "description": "Premium smartphone",
  "category": "electronics",
  "price": 26000,
  "oldPrice": 74000,
  "offer": "65% off",
  "image": "https://...",
  "carouselImages": ["https://...", "https://..."],
  "color": "Cloud Navy",
  "size": "8 GB RAM 128GB Storage",
  "stock": 30
}
```

#### Cập nhật sản phẩm
```
PUT /admin/products/:productId
Authorization: Bearer <token>

Body: (chỉ cập nhật các trường cần thay đổi)
{
  "price": 25000,
  "stock": 25
}
```

#### Xóa sản phẩm (Soft delete)
```
DELETE /admin/products/:productId
Authorization: Bearer <token>
```

#### Lấy tất cả sản phẩm (có thể không hoạt động)
```
GET /admin/products?category=electronics&isActive=true&page=1&limit=20
Authorization: Bearer <token>
```

---

## 3. Nhập dữ liệu ban đầu

Tôi đã tạo file `api/seedProducts.js` chứa tất cả sản phẩm từ HomeScreen.

### Chạy script:
```bash
cd api
node seedProducts.js
```

Script này sẽ:
- Kết nối đến MongoDB
- Thêm các sản phẩm vào database
- Hiển thị danh sách sản phẩm đã thêm

---

## 4. Cập nhật HomeScreen để lấy dữ liệu từ API

Thay vì lấy dữ liệu cứng từ file, bạn có thể cập nhật HomeScreen:

```javascript
// Thay vào chỗ này:
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get("https://fakestoreapi.com/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  fetchData();
}, []);

// Với cái này:
useEffect(() => {
  const fetchData = async () => {
    try {
      // Lấy sản phẩm từ API của bạn
      const response = await axios.get("http://10.0.2.2:8000/products", {
        params: { category: category, limit: 10 }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  fetchData();
}, [category]);
```

---

## 5. Ví dụ tạo sản phẩm mới từ Admin Dashboard

```javascript
const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.post("http://localhost:8000/admin/products", 
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("Product created:", response.data);
  } catch (error) {
    console.error("Error creating product:", error);
  }
};

// Sử dụng:
createProduct({
  title: "New Product",
  category: "electronics",
  price: 5000,
  oldPrice: 7000,
  image: "https://...",
  carouselImages: ["https://..."],
  stock: 50
});
```

---

## 6. Ghi chú

✅ Schema hỗ trợ tất cả các trường từ sản phẩm trong HomeScreen
✅ API có phân quyền (user/admin) bằng JWT token
✅ Hỗ trợ soft delete (sản phẩm không bị xóa hoàn toàn, chỉ bị đánh dấu không hoạt động)
✅ Hỗ trợ tìm kiếm, lọc theo danh mục, phân trang
✅ Có hệ thống review/đánh giá

---

## 7. Thêm sản phẩm vào database

Sau khi server MongoDB của bạn chạy, chạy:

```bash
cd D:\Project-III-main\api
node seedProducts.js
```

Hoặc bạn có thể thêm sản phẩm thông qua API bằng POST request:

```bash
curl -X POST http://localhost:8000/admin/products \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "category": "electronics",
    "price": 5000,
    "image": "https://...",
    "stock": 50
  }'
```
