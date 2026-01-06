const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Khởi tạo Google Gemini client
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GOOGLE_GEMINI_API_KEY is not defined in .env file!");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Định nghĩa Models
const User = require("./models/user");
const Order = require("./models/order");
const Product = require("./models/product");

app.listen(PORT, () => {
  console.log(`Server is running on port 8000`);
});

// Kết nối đến MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Hàm gửi email xác minh
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "HerChoice.com",
    to: email,
    subject: "Email Verification",
    text: `Please click the following link to verify your email: http://localhost:8000/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// Hàm gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let productListHtml = orderDetails.products
    .map(
      (product) => `
    <li>
      ${product.name} (x${product.quantity}) - $${product.price.toFixed(2)}
    </li>
  `
    )
    .join("");

  const mailOptions = {
    from: "HerChoice.com",
    to: userEmail,
    subject: `Order #${orderDetails._id
      .toString()
      .slice(-6)} Confirmation - HerChoice.com`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order #${orderDetails._id
        .toString()
        .slice(-6)} has been successfully placed.</p>
      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order ID:</strong> ${orderDetails._id}</li>
        <li><strong>Total Price:</strong> $${orderDetails.totalPrice.toFixed(
          2
        )}</li>
        <li><strong>Payment Method:</strong> ${
          orderDetails.paymentMethod === "cash"
            ? "Cash on Delivery"
            : "Online Payment"
        }</li>
        <li><strong>Order Status:</strong> ${orderDetails.orderStatus}</li>
      </ul>
      <h3>Shipping Address:</h3>
      <p>
        ${orderDetails.shippingAddress.name}<br>
        ${orderDetails.shippingAddress.houseNo}, ${
      orderDetails.shippingAddress.street
    }<br>
        ${
          orderDetails.shippingAddress.landmark
            ? orderDetails.shippingAddress.landmark + "<br>"
            : ""
        }
        ${orderDetails.shippingAddress.postalCode}<br>
        Phone: ${orderDetails.shippingAddress.mobileNo}
      </p>
      <h3>Products:</h3>
      <ul>
        ${productListHtml}
      </ul>
      <p>We will notify you once your order has been shipped.</p>
      <p>Thank you for shopping with Shoppy.com!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      `Error sending order confirmation email to ${userEmail}:`,
      error
    );
  }
};

// Hàm tạo khóa bí mật
const secretKey = process.env.JWT_SECRET;

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Middleware kiểm tra quyền admin
const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    console.error("Error in authorizeAdmin middleware:", error);
    res
      .status(500)
      .json({ message: "Internal server error during authorization" });
  }
};

// Đăng ký người dùng mới
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({
      name,
      email,
      password: password,
      role: "user",
    });

    newUser.verificationToken = crypto.randomBytes(20).toString("hex");
    await newUser.save();
    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(201).json({
      message:
        "Registration successful. Please check your email for verification.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Xác minh email người dùng
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Failed:", error);
    res.status(500).json({ message: "Email Verification Failed" });
  }
});

// Đăng nhập người dùng
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
      expiresIn: "24h",
    });

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Login Failed:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

// Thêm địa chỉ mới
app.post("/addresses", authenticateToken, async (req, res) => {
  try {
    const { userId, address } = req.body;

    if (req.user.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Error adding address" });
  }
});

// Lấy tất cả địa chỉ của người dùng
app.get("/addresses/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = user.addresses;
    res.status(200).json({ addresses });
  } catch (error) {
    console.error("Error retrieving the addresses:", error);
    res.status(500).json({ message: "Error retrieving the addresses" });
  }
});

// Lưu trữ tất cả các đơn hàng và gửi email xác nhận
app.post("/orders", authenticateToken, async (req, res) => {
  try {
    const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } =
      req.body;

    if (req.user.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const products = cartItems.map((item) => ({
      name: item?.title,
      quantity: item.quantity,
      price: item.price,
      image: item?.image,
      product: item._id,
      color: item.color,
      size: item.size,
    }));

    const order = new Order({
      user: userId,
      products: products,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      orderStatus: "Pending",
    });

    await order.save();

    // Gửi email xác nhận đơn hàng sau khi tạo đơn hàng thành công
    if (user.email) {
      await sendOrderConfirmationEmail(user.email, order);
    } else {
      console.warn(
        `User ${userId} does not have an email to send order confirmation.`
      );
    }

    res.status(200).json({ message: "Order created successfully!" });
  } catch (error) {
    console.error("Error creating orders", error);
    res.status(500).json({ message: "Error creating orders" });
  }
});

// Lấy hồ sơ người dùng
app.get("/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error retrieving the user profile:", error);
    res.status(500).json({ message: "Error retrieving the user profile" });
  }
});

// Lấy đơn hàng của người dùng
app.get("/orders/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const orders = await Order.find({ user: userId }).populate("user");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ message: "Error retrieving orders" });
  }
});

// --- ENDPOINTS DÀNH CHO ADMIN ---

// Lấy tất cả người dùng (chỉ admin)
app.get("/admin/users", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error getting all users (admin):", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Cập nhật người dùng (chỉ admin)
app.put(
  "/admin/users/:userId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const { name, email, role, verified, password } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { name, email, role, verified, password } },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user (admin):", error);
      res.status(500).json({ message: "Error updating user" });
    }
  }
);

// Xóa người dùng (chỉ admin)
app.delete(
  "/admin/users/:userId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user (admin):", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  }
);

// Cập nhật trạng thái đơn hàng (chỉ admin)
app.put(
  "/admin/orders/:orderId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { orderStatus } = req.body;

      const validStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];
      if (!validStatuses.includes(orderStatus)) {
        return res
          .status(400)
          .json({ message: "Invalid order status provided" });
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { $set: { orderStatus: orderStatus } },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res
        .status(200)
        .json({ message: "Order status updated successfully", order });
    } catch (error) {
      console.error("Error updating order status (admin):", error);
      res.status(500).json({ message: "Error updating order status" });
    }
  }
);

// Xóa đơn hàng (chỉ admin)
app.delete(
  "/admin/orders/:orderId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndDelete(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order (admin):", error);
      res.status(500).json({ message: "Error deleting order" });
    }
  }
);

// Hủy đơn hàng (dành cho người dùng sở hữu đơn hàng)
app.put("/orders/cancel/:orderId", authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Đảm bảo đơn hàng thuộc về người dùng đã xác thực
    if (order.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this order." });
    }

    // Chỉ cho phép hủy nếu trạng thái đơn hàng là 'Pending' hoặc 'Processing'
    if (order.orderStatus !== "Pending" && order.orderStatus !== "Processing") {
      return res
        .status(400)
        .json({
          message: `Order cannot be cancelled. Current status: ${order.orderStatus}.`,
        });
    }

    // Cập nhật trạng thái đơn hàng thành 'Cancelled'
    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully.", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order." });
  }
});

// Lấy tất cả đơn hàng (chỉ admin)
app.get(
  "/admin/orders",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find().populate("user", "name email");
      res.json({ orders });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders." });
    }
  }
);

// Lấy tất cả sản phẩm (công khai)
app.get("/products", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };

    // Lọc theo danh mục
    if (category && category !== "all") {
      filter.category = category;
    }

    // Tìm kiếm theo tiêu đề hoặc mô tả
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Lấy sản phẩm theo danh mục
app.get("/products/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({
      category: category,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

// Lấy chi tiết sản phẩm
app.get("/products/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate(
      "reviews.userId",
      "name"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Error fetching product details" });
  }
});

// Thêm review cho sản phẩm
app.post("/products/:productId/reviews", authenticateToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { comment, rating } = req.body;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const review = {
      userId: userId,
      userName: user.name,
      comment,
      rating,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    product.save();

    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review" });
  }
});


// Tạo sản phẩm mới (chỉ admin)
app.post(
  "/admin/products",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        price,
        oldPrice,
        offer,
        image,
        carouselImages,
        color,
        variants,
        specifications,
      } = req.body;

      // Validate required fields
      if (!title || !category || !price || !image) {
        return res.status(400).json({
          message:
            "Title, category, price, and image are required fields",
        });
      }

      // Tính toán tổng stock từ tất cả variants (color) và sizes
      let totalStock = 0;
      if (variants && Array.isArray(variants) && variants.length > 0) {
        variants.forEach(variant => {
          if (variant.sizes && Array.isArray(variant.sizes)) {
            variant.sizes.forEach(size => {
              totalStock += parseInt(size.quantity) || 0;
            });
          }
        });
      }

      const newProduct = new Product({
        title,
        description,
        category,
        price,
        oldPrice,
        offer,
        image,
        carouselImages: carouselImages || [image],
        color,
        variants: variants || [],
        specifications,
        stock: totalStock,
        inStock: totalStock > 0,
      });

      await newProduct.save();
      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  }
);

// Cập nhật sản phẩm (chỉ admin)
app.put(
  "/admin/products/:productId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const productId = req.params.productId;
      const updates = req.body;

      // Nếu có variants, tính toán lại stock từ tổng quantity của tất cả variants
      if (updates.variants && Array.isArray(updates.variants)) {
        let totalStock = 0;
        updates.variants.forEach(variant => {
          if (variant.sizes && Array.isArray(variant.sizes)) {
            variant.sizes.forEach(size => {
              totalStock += parseInt(size.quantity) || 0;
            });
          }
        });
        updates.stock = totalStock;
        updates.inStock = totalStock > 0;
      } else if (updates.stock !== undefined) {
        // Cập nhật trạng thái inStock dựa trên stock
        updates.inStock = updates.stock > 0;
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product" });
    }
  }
);

// Xóa sản phẩm (chỉ admin)
app.delete(
  "/admin/products/:productId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const productId = req.params.productId;

      // Soft delete: đặt isActive = false
      const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: false },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  }
);

// Lấy tất cả sản phẩm (admin)
app.get(
  "/admin/products",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { category, isActive = true, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      let filter = { isActive: isActive === "true" ? true : false };

      if (category && category !== "all") {
        filter.category = category;
      }

      const products = await Product.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments(filter);

      res.status(200).json({
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching products (admin):", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  }
);

// ChatBot endpoint using Google Gemini
app.post("/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;
    
    if (!userMessage || userMessage.trim() === "") {
      return res.status(400).json({ message: "User message is required" });
    }

    console.log("📩 Nhận tin nhắn:", userMessage);

    // Check if API key exists
    if (!GEMINI_API_KEY) {
      console.error("❌ GOOGLE_GEMINI_API_KEY is missing!");
      return res.status(500).json({ message: "Bot chưa được cấu hình đúng. Vui lòng liên hệ admin! 😢" });
    }
    
    let products = [];
    try {
      products = await Product.find({ isActive: true })
        .select("_id title price variants category description") 
        .limit(100) 
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.error("Error fetching products:", dbError);
    }

    const productText = products && products.length > 0 ? products.map((p, index) => {
        const variantInfo = p.variants && p.variants.length > 0 ? p.variants.map(v => {
            const sizes = v.sizes && v.sizes.length > 0 ? v.sizes.map(s => s.size).join(", ") : "N/A";
            return `${v.color} [Size: ${sizes}]`;
        }).join(" | ") : "N/A";
        return `
        ${index + 1}. [ID: ${p._id}] - SẢN PHẨM: ${p.title}
           - Giá: ${p.price.toLocaleString('vi-VN')} VND
           - Phân loại: ${variantInfo}
           - Danh mục: ${p.category}
           - MÔ TẢ CHI TIẾT: ${p.description || "Không có mô tả"} 
        `;
    }).join("\n--------------------\n") : "Hiện chưa có sản phẩm nào";

    const fashionKnowledge = `
    --- KIẾN THỨC CHUYÊN GIA (Sử dụng để tư vấn):
    1. CHẤT LIỆU:
       - Đũi, Linen, Xô: Rất thoáng mát, thấm mồ hôi. => Hợp mùa hè, đi biển.
       - Lụa, Satin: Mát, nhẹ, sang trọng. => Hợp đi tiệc hoặc đồ ngủ.
       - Len, Nỉ: Giữ ấm. => Hợp mùa đông.
    
    2. TƯ VẤN DÁNG & DỊP:
       - Nếu mô tả ghi "đi tiệc": Hãy gợi ý mặc đi đám cưới, event.
       - Nếu mô tả ghi "dáng suông": Tư vấn là che bụng tốt, bầu bí mặc được.
       - Nếu mô tả ghi "basic": Tư vấn là dễ phối đồ, mặc đi làm đi học đều đẹp.
    `;

    const systemPrompt = `VAI TRÒ:
    Bạn là trợ lý ảo AI chuyên nghiệp của ứng dụng thời trang "HerChoice".
    Khách hàng của bạn chủ yếu là nữ giới yêu thích thời trang trẻ trung, hiện đại.

    TÍNH CÁCH:
    - Luôn vui vẻ, thân thiện, nhiệt tình.
    - Sử dụng nhiều emoji phù hợp (👗, 👠, ✨, 💖) trong câu trả lời.
    - Xưng hô: "Em" và gọi khách là "Chị".
    - Trả lời ngắn gọn, đi thẳng vào vấn đề, không viết văn quá dài dòng.

    KIẾN THỨC BÁN HÀNG:
    1. Vận chuyển:
       - Phí ship đồng giá 30k toàn quốc.
       - Freeship cho đơn hàng trên 500.000 VNĐ.
       - Thời gian giao: 2-4 ngày tùy khu vực.
    
    2. Chính sách đổi trả:
       - Hỗ trợ đổi size trong vòng 7 ngày.
       - Quay video khi mở hàng để được hỗ trợ tốt nhất.
    
    3. Dữ liệu cửa hàng (hãy sử dụng thông tin này để tư vấn khách hàng):
    ${productText}
    Hãy nhắc tới các offer khuyến mãi của sản phẩm khi tư vấn.
       (Luôn nhắc khách là bảng size chỉ mang tính tham khảo).

    NHIỆM VỤ:
    - Tư vấn phối đồ (Mix & Match). Ví dụ: Khách hỏi mua áo thun, hãy gợi ý thêm quần jeans hoặc chân váy.
    - Giải đáp thắc mắc về đơn hàng.
    - Nếu khách hỏi về giá cụ thể của một sản phẩm mà bạn không biết, hãy nói: "Dạ chị có thể xem giá chi tiết ngay bên dưới hình ảnh sản phẩm giúp em nha! 💕"

    QUY TẮC QUAN TRỌNG (BẮT BUỘC):
    1. Khi bạn gợi ý một sản phẩm cụ thể, bạn PHẢI chèn ID sản phẩm đó vào ngay sau tên sản phẩm theo định dạng: [VIEW:ID_SẢN_PHẨM].
    2. Ví dụ chuẩn: "Chị xem thử mẫu Đầm Xòe [VIEW:65a123bc...] này nhé!".
    3. Tuyệt đối KHÔNG tự bịa ra ID. Chỉ lấy ID từ danh sách trên (phần [ID: ...]).
    
    YÊU CẦU: 
    - TƯ VẤN KỸ: Dựa vào phần "MÔ TẢ CHI TIẾT (Description)" để tư vấn chất liệu, kiểu dáng cho khách. 
         (Ví dụ: Nếu mô tả ghi "vải lụa", hãy nói với khách là mặc rất mát và nhẹ).
         ${fashionKnowledge}
    - BÁN HÀNG: Luôn báo giá và check xem có size phù hợp với khách không.
    - KHÔNG BỊA ĐẶT: Chỉ tư vấn sản phẩm có trong danh sách trên.
    - TRẢ LỜI NGẮN GỌN dưới 80 từ, đủ ý và mỗi câu trả lời không được để thiếu thông tin

    QUY TẮC CẤM:
    - Không bàn luận về chính trị, tôn giáo, vấn đề nhạy cảm.
    - Không nhắc đến các thương hiệu đối thủ.
    - Tuyệt đối không bịa đặt thông tin sai lệch về chính sách. 

    CÂU HỎI CỦA KHÁCH HÀNG: "${userMessage}"
    HÃY TRẢ LỜI NGẮN GỌN VÀ GẮN LINK SẢN PHẨM NẾU CÓ THỂ.`;

    console.log("🤖 Calling Gemini API...");
    
    // Gọi Google Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const chatCompletion = await model.generateContent(systemPrompt);

    const botReply = chatCompletion.response.text() || "Em chưa hiểu ý chị lắm, chị nói lại giúp em nha! 😅";
    console.log("✅ Gemini trả lời:", botReply);
    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ Lỗi Gemini chi tiết:", {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });

    if (error.status === 429) {
        return res.json({ reply: "Hệ thống đang quá tải, chị chờ xíu rồi hỏi lại em nha! 😢" });
    }

    res.status(500).json({ message: "Bot đang bận xíu, chị thử lại nha! 😢" });
  }
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});