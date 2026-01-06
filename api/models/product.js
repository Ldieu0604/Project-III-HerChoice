const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    title: {
      type: String,
      required: [true, "Please provide product title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["clothing", "jewelery", "shoes", "accessories", "electronics"],
      required: [true, "Please select a category"],
    },

    // Giá cả
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      min: [0, "Old price cannot be negative"],
    },
    offer: {
      type: String, // e.g., "40% off", "72% off"
      trim: true,
    },

    // Hình ảnh
    image: {
      type: String,
      required: [true, "Please provide product image"],
    },
    carouselImages: [
      {
        type: String,
        trim: true,
      },
    ],

    variants: [
      {
        color: {
          type: String,
          required: true,
          trim: true,
        },
        sizes: [
          {
            size: {
              type: String,
              required: true,
              trim: true,
            },
            quantity: {
              type: Number,
              default: 0,
              min: [0, "Quantity cannot be negative"],
            },
          },
        ],
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },

    // Quản lý kho
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },

    // Đánh giá
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be between 0 and 5"],
      max: [5, "Rating must be between 0 and 5"],
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        comment: String,
        rating: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Người bán (nếu có hệ thống multi-seller)
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index cho tìm kiếm nhanh
productSchema.index({ category: 1 });
productSchema.index({ title: "text", description: "text" });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
