# HerChoice - Hệ Thống Bán Hàng Phụ Kiện Cho Nữ

## Giới thiệu

Dự án bán hàng cho nữ, bao gồm:
- **Mobile App (React Native + Expo):** Cho khách hàng mua sắm, đặt hàng, quản lý tài khoản.
- **Admin Dashboard (React + Vite):** Cho quản trị viên quản lý đơn hàng, người dùng, sản phẩm.
- **Backend API (Node.js + Express + MongoDB):** Xử lý logic, xác thực, lưu trữ dữ liệu.

---

## 📁 Cấu trúc thư mục

```plaintext
.
├── admin-dashboard/         # Dashboard quản trị (React)
│   ├── public/
│   └── src/
├── api/                    # Backend API (Node.js/Express)
│   ├── models/
│   └── index.js
├── assets/                 # Hình ảnh, fonts dùng chung cho app
├── components/             # Component dùng chung cho mobile app
├── navigation/             # Điều hướng (navigation) cho mobile app
├── redux/                  # Redux reducers cho mobile app
├── screens/                # Các màn hình (views) của mobile app
├── store.js                # Cấu hình Redux store
├── App.js                  # Entry point của mobile app
├── UserContext.js          # Context quản lý trạng thái người dùng
├── config.js               # File cấu hình chung (API_URL, v.v.)
├── package.json            # Thông tin và dependencies của mobile app
├── README.md               # Tài liệu này
└── ...
```

---

## ⚙️ Hướng dẫn cài đặt

### 1. Cài đặt backend API

```bash
cd api
yarn install
yarn start
```
> **Lưu ý:** Sửa file `api/index.js` để cập nhật chuỗi kết nối MongoDB và cấu hình email nếu cần.

---

### 2. Cài đặt admin-dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```
> Truy cập dashboard tại: [http://localhost:5173](http://localhost:5173)

---

### 3. Cài đặt mobile app

```bash
npm install
npx expo start
```
> Quét QR code bằng Expo Go trên điện thoại hoặc chạy trên máy ảo.

---

## 🌐 Cấu hình kết nối API

- **Máy ảo Android:** Dùng `http://10.0.2.2:8000`
- **Điện thoại thật:** Dùng `http://<IP_MAY_TINH>:8000` (ví dụ: `http://192.168.0.102:8000`)
- Sửa trong file `config.js` hoặc trực tiếp trong các file gọi API.

---

## 💡 Một số lệnh hữu ích

```bash
# Cài dependencies cho toàn bộ dự án
npm install

# Xóa cache Metro bundler (React Native)
npx react-native start --reset-cache

# Chạy lại backend
cd api
yarn start
```

---