/**
 * Script để import sản phẩm từ HomeScreen vào MongoDB
 * Chạy từ terminal: node api/seedProducts.js
 */

const mongoose = require("mongoose");
const Product = require("./models/product");

// Dữ liệu sản phẩm từ HomeScreen
const productsData = [
  // Deals
  {
    title: "OnePlus Nord CE 3 Lite 5G (Pastel Lime, 8GB RAM, 128GB Storage)",
    description: "Powerful 5G smartphone with Pastel Lime color",
    category: "electronics",
    price: 19000,
    oldPrice: 25000,
    offer: "24% off",
    image:
      "https://images-eu.ssl-images-amazon.com/images/G/31/wireless_products/ssserene/weblab_wf/xcm_banners_2022_in_bau_wireless_dec_580x800_once3l_v2_580x800_in-en.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/61QRgOgBx0L._SX679_.jpg",
      "https://m.media-amazon.com/images/I/61uaJPLIdML._SX679_.jpg",
      "https://m.media-amazon.com/images/I/510YZx4v3wL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/61J6s1tkwpL._SX679_.jpg",
    ],
    color: "Stellar Green",
    size: "6 GB RAM 128GB Storage",
    specifications: {
      ram: "8GB",
      storage: "128GB",
      processor: "Snapdragon",
      display: "6.5 inch",
      battery: "5000 mAh",
    },
    stock: 50,
  },
  {
    title:
      "Samsung Galaxy S20 FE 5G (Cloud Navy, 8GB RAM, 128GB Storage) with No Cost EMI & Additional Exchange Offers",
    description: "Premium smartphone with No Cost EMI options",
    category: "electronics",
    price: 26000,
    oldPrice: 74000,
    offer: "65% off",
    image:
      "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Wireless/Samsung/SamsungBAU/S20FE/GW/June23/BAU-27thJune/xcm_banners_2022_in_bau_wireless_dec_s20fe-rv51_580x800_in-en.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/81vDZyJQ-4L._SY879_.jpg",
      "https://m.media-amazon.com/images/I/61vN1isnThL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71yzyH-ohgL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/61vN1isnThL._SX679_.jpg",
    ],
    color: "Cloud Navy",
    size: "8 GB RAM 128GB Storage",
    stock: 30,
  },
  {
    title:
      "Samsung Galaxy M14 5G (ICY Silver, 4GB, 128GB Storage) | 50MP Triple Cam | 6000 mAh Battery | 5nm Octa-Core Processor | Android 13 | Without Charger",
    description: "Budget-friendly 5G smartphone with great camera",
    category: "electronics",
    price: 14000,
    oldPrice: 16000,
    offer: "12% off",
    image:
      "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Wireless/Samsung/CatPage/Tiles/June/xcm_banners_m14_5g_rv1_580x800_in-en.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/817WWpaFo1L._SX679_.jpg",
      "https://m.media-amazon.com/images/I/81KkF-GngHL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/61IrdBaOhbL._SX679_.jpg",
    ],
    color: "Icy Silver",
    size: "6 GB RAM 64GB Storage",
    stock: 45,
  },
  {
    title:
      "realme narzo N55 (Prime Blue, 4GB+64GB) 33W Segment Fastest Charging | Super High-res 64MP Primary AI Camera",
    description: "Fast charging smartphone with excellent camera",
    category: "electronics",
    price: 10999,
    oldPrice: 12999,
    offer: "15% off",
    image:
      "https://images-eu.ssl-images-amazon.com/images/G/31/tiyesum/N55/June/xcm_banners_2022_in_bau_wireless_dec_580x800_v1-n55-marchv2-mayv3-v4_580x800_in-en.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/41Iyj5moShL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/61og60CnGlL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/61twx1OjYdL._SX679_.jpg",
    ],
    stock: 60,
  },

  // Offers
  {
    title:
      "Oppo Enco Air3 Pro True Wireless in Ear Earbuds with Industry First Composite Bamboo Fiber, 49dB ANC, 30H Playtime, 47ms Ultra Low Latency,Fast Charge,BT 5.3 (Green)",
    description: "Premium wireless earbuds with active noise cancellation",
    category: "accessories",
    price: 4500,
    oldPrice: 7500,
    offer: "72% off",
    image:
      "https://m.media-amazon.com/images/I/61a2y1FCAJL._AC_UL640_FMwebp_QL65_.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/61a2y1FCAJL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71DOcYgHWFL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71LhLZGHrlL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/61Rgefy4ndL._SX679_.jpg",
    ],
    color: "Green",
    size: "Normal",
    stock: 100,
  },
  {
    title:
      "Fastrack Limitless FS1 Pro Smart Watch|1.96 Super AMOLED Arched Display with 410x502 Pixel Resolution|SingleSync BT Calling|NitroFast Charging|110+ Sports Modes|200+ Watchfaces|Upto 7 Days Battery",
    description: "Advanced smartwatch with health monitoring features",
    category: "accessories",
    price: 3495,
    oldPrice: 7955,
    offer: "40% off",
    image: "https://m.media-amazon.com/images/I/41mQKmbkVWL._AC_SY400_.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/71h2K2OQSIL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71BlkyWYupL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71c1tSIZxhL._SX679_.jpg",
    ],
    color: "Black",
    size: "Normal",
    stock: 75,
  },
  {
    title:
      "Aishwariya System On Ear Wireless On Ear Bluetooth Headphones",
    description: "Comfortable wireless headphones for everyday use",
    category: "accessories",
    price: 3495,
    oldPrice: 7955,
    offer: "40% off",
    image: "https://m.media-amazon.com/images/I/41t7Wa+kxPL._AC_SY400_.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/41t7Wa+kxPL.jpg",
    ],
    color: "Black",
    size: "Normal",
    stock: 80,
  },
  {
    title:
      "Fastrack Limitless FS1 Pro Smart Watch|1.96 Super AMOLED Arched Display with 410x502 Pixel Resolution|SingleSync BT Calling|NitroFast Charging|110+ Sports Modes|200+ Watchfaces|Upto 7 Days Battery",
    description: "Premium smartwatch with extensive customization",
    category: "accessories",
    price: 19999,
    oldPrice: 24999,
    offer: "20% off",
    image: "https://m.media-amazon.com/images/I/71k3gOik46L._AC_SY400_.jpg",
    carouselImages: [
      "https://m.media-amazon.com/images/I/41bLD50sZSL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/616pTr2KJEL._SX679_.jpg",
      "https://m.media-amazon.com/images/I/71wSGO0CwQL._SX679_.jpg",
    ],
    color: "Norway Blue",
    size: "8GB RAM, 128GB Storage",
    stock: 40,
  },

  // Thêm các sản phẩm vào các danh mục khác
  {
    title: "Premium Cotton T-Shirt (Men's)",
    description: "Comfortable premium cotton t-shirt for daily wear",
    category: "clothing",
    price: 599,
    oldPrice: 999,
    offer: "40% off",
    image: "https://via.placeholder.com/300x300?text=Tshirt",
    carouselImages: [
      "https://via.placeholder.com/300x300?text=Tshirt1",
      "https://via.placeholder.com/300x300?text=Tshirt2",
    ],
    color: "Blue",
    size: "M",
    stock: 150,
  },
  {
    title: "Elegant Gold Necklace",
    description: "Beautiful gold necklace perfect for any occasion",
    category: "jewelery",
    price: 2499,
    oldPrice: 4999,
    offer: "50% off",
    image: "https://via.placeholder.com/300x300?text=Necklace",
    carouselImages: [
      "https://via.placeholder.com/300x300?text=Necklace1",
    ],
    color: "Gold",
    size: "Normal",
    stock: 25,
  },
  {
    title: "Running Shoes (Black)",
    description: "Comfortable running shoes with excellent grip",
    category: "shoes",
    price: 3999,
    oldPrice: 5999,
    offer: "33% off",
    image: "https://via.placeholder.com/300x300?text=Shoes",
    carouselImages: [
      "https://via.placeholder.com/300x300?text=Shoes1",
      "https://via.placeholder.com/300x300?text=Shoes2",
    ],
    color: "Black",
    size: "10",
    stock: 80,
  },
];

const seedDatabase = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(
      "mongodb+srv://dieulinh:dieulinh@cluster0.kef4ovx.mongodb.net/"
    );

    console.log("✓ Connected to MongoDB");

    // await Product.deleteMany({});
    // console.log("✓ Cleared existing products");

    // Thêm sản phẩm mới
    const result = await Product.insertMany(productsData);
    console.log(`✓ Successfully added ${result.length} products to database`);

    // Hiển thị thông tin sản phẩm
    const allProducts = await Product.find({}).select("title category price stock");
    console.log("\nDanh sách sản phẩm:");
    console.log("=".repeat(80));
    allProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.title} | Danh mục: ${product.category} | Giá: ${product.price} | Kho: ${product.stock}`
      );
    });

    console.log("=".repeat(80));
    console.log("\nScript hoàn tất!");

    // Đóng kết nối
    await mongoose.connection.close();
  } catch (error) {
    console.error("✗ Error seeding database:", error.message);
    process.exit(1);
  }
};

// Chạy script
seedDatabase();
