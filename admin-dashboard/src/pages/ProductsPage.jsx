import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/productApi.js';
import Header from '../components/Header.jsx';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'clothing',
    price: '',
    oldPrice: '',
    offer: '',
    image: '',
    carouselImages: [],
    variants: [],
  });
  const [imageInputs, setImageInputs] = useState(['']);
  const [variantInputs, setVariantInputs] = useState([
    { color: '', sizes: [{ size: '', quantity: '' }] }
  ]);

  const categories = ['all', 'clothing', 'jewelery', 'shoes', 'accessories'];
  const ITEMS_PER_PAGE = 10;

  // Format price with thousand separator
  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllProducts(selectedCategory, true, currentPage, ITEMS_PER_PAGE);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto scroll to form when opened
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Update formData with current input value
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Auto-calculate price from oldPrice and offer
    if ((name === 'oldPrice' || name === 'offer')) {
      const oldPrice = parseFloat(updatedFormData.oldPrice);
      const offerPercent = parseFloat(updatedFormData.offer);
      
      // If oldPrice is empty or invalid, clear price
      if (!updatedFormData.oldPrice || updatedFormData.oldPrice.trim() === '' || isNaN(oldPrice) || oldPrice <= 0) {
        setFormData(prev => ({ 
          ...prev, 
          price: ''
        }));
      }
      // If oldPrice is valid
      else if (!isNaN(oldPrice) && oldPrice > 0) {
        // If offer is empty or xóa offer, price = oldPrice
        if (!updatedFormData.offer || updatedFormData.offer.trim() === '' || isNaN(offerPercent)) {
          setFormData(prev => ({ 
            ...prev, 
            price: Math.round(oldPrice).toString()
          }));
        } 
        // If offer is valid and >= 0
        else if (offerPercent >= 0) {
          const discount = oldPrice * offerPercent / 100;
          const newPrice = oldPrice - discount;
          setFormData(prev => ({ 
            ...prev, 
            price: Math.round(newPrice).toString()
          }));
        }
      }
    }
  };

  const handleImageInputChange = (index, value) => {
    const updatedInputs = [...imageInputs];
    updatedInputs[index] = value;
    setImageInputs(updatedInputs);
  };

  const addImageInput = () => {
    setImageInputs([...imageInputs, '']);
  };

  const removeImageInput = (index) => {
    const updatedInputs = imageInputs.filter((_, i) => i !== index);
    setImageInputs(updatedInputs);
  };

  const handleVariantColorChange = (variantIndex, value) => {
    const updatedVariants = [...variantInputs];
    updatedVariants[variantIndex].color = value;
    setVariantInputs(updatedVariants);
  };

  const handleVariantSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...variantInputs];
    updatedVariants[variantIndex].sizes[sizeIndex][field] = value;
    setVariantInputs(updatedVariants);
  };

  const addVariantSize = (variantIndex) => {
    const updatedVariants = [...variantInputs];
    updatedVariants[variantIndex].sizes.push({ size: '', quantity: '' });
    setVariantInputs(updatedVariants);
  };

  const removeVariantSize = (variantIndex, sizeIndex) => {
    const updatedVariants = [...variantInputs];
    updatedVariants[variantIndex].sizes = updatedVariants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    setVariantInputs(updatedVariants);
  };

  const addVariant = () => {
    setVariantInputs([...variantInputs, { color: '', sizes: [{ size: '', quantity: '' }] }]);
  };

  const removeVariant = (variantIndex) => {
    const updatedVariants = variantInputs.filter((_, i) => i !== variantIndex);
    setVariantInputs(updatedVariants);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'clothing',
      price: '',
      oldPrice: '',
      offer: '',
      image: '',
      carouselImages: [],
      variants: [],
    });
    setImageInputs(['']);
    setVariantInputs([{ color: '', sizes: [{ size: '', quantity: '' }] }]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      category: product.category || 'clothing',
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      offer: product.offer || '',
      image: product.image || '',
      carouselImages: product.carouselImages || [],
      variants: product.variants || [],
    });
    setImageInputs(product.carouselImages || ['']);
    setVariantInputs(product.variants && product.variants.length > 0 
      ? product.variants 
      : [{ color: '', sizes: [{ size: '', quantity: '' }] }]
    );
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.image || !formData.category) {
      alert('Please fill in all required fields (Title, Price, Image, Category)');
      return;
    }

    try {
      // Filter variants to only include those with color and sizes
      const validVariants = variantInputs
        .filter(v => v.color.trim() !== '')
        .map(v => ({
          color: v.color,
          sizes: v.sizes
            .filter(s => s.size.trim() !== '' && String(s.quantity).trim() !== '')
            .map(s => ({
              size: s.size,
              quantity: parseInt(s.quantity) || 0
            }))
        }));

      const submittedData = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        carouselImages: imageInputs.filter((img) => img.trim() !== ''),
        variants: validVariants,
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, submittedData);
        alert('Product updated successfully!');
      } else {
        await createProduct(submittedData);
        alert('Product created successfully!');
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        alert('Product deleted successfully!');
        await fetchProducts();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product._id && product._id.toString().includes(searchTerm))
  );

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <Header />
        <div style={styles.loadingContainer}>
          <p style={styles.statusText}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageWrapper}>
        <Header />
        <div style={styles.loadingContainer}>
          <p style={{ ...styles.statusText, color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <Header />
      <div style={styles.pageContainer}>
        <h2 style={styles.pageHeading}>Product Management</h2>

        {/* Search Bar */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.input,
              width: '100%',
              padding: '12px 12px 12px 40px',
              fontSize: '14px'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999',
            fontSize: '18px',
            pointerEvents: 'none'
          }}>
            🔍
          </span>
        </div>

        {/* Create New Product Button */}
        <div style={styles.formSection}>
          {!showForm ? (
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  title: '',
                  description: '',
                  category: 'clothing',
                  price: '',
                  oldPrice: '',
                  offer: '',
                  image: '',
                  carouselImages: [],
                  variants: [],
                });
                setImageInputs(['']);
                setVariantInputs([{ color: '', sizes: [{ size: '', quantity: '' }] }]);
                setShowForm(true);
              }}
              style={styles.createButton}
            >
              + Create New Product
            </button>
          ) : editingProduct === null ? (
            <div style={styles.formCard} ref={formRef}>
              <h3 style={styles.formTitle}>Create New Product</h3>

              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Title */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Enter product title"
                    style={styles.input}
                    required
                  />
                </div>

                {/* Description */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter product description"
                    style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                {/* Category and Price Row */}
                <div style={styles.formRow}>
                  <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      style={styles.input}
                      required
                    >
                      <option value="clothing">Clothing</option>
                      <option value="jewelery">Jewelery</option>
                      <option value="shoes">Shoes</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div style={{ ...styles.formGroup, flex: 1, marginLeft: '20px' }}>
                    <label style={styles.label}>Price (VND) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="0"
                      style={styles.input}
                      required
                      min="0"
                    />
                  </div>

                  <div style={{ ...styles.formGroup, flex: 1, marginLeft: '20px' }}>
                    <label style={styles.label}>Old Price (VND)</label>
                    <input
                      type="number"
                      name="oldPrice"
                      value={formData.oldPrice}
                      onChange={handleFormChange}
                      placeholder="0"
                      style={styles.input}
                      min="0"
                    />
                  </div>
                </div>

                {/* Offer */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Offer (e.g. "40%")</label>
                  <input
                    type="text"
                    name="offer"
                    value={formData.offer}
                    onChange={handleFormChange}
                    placeholder="e.g. 40%"
                    style={styles.input}
                  />
                </div>

                {/* Main Image */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Main Image URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg"
                    style={styles.input}
                    required
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Product preview"
                      style={styles.imagePreview}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  )}
                </div>

                {/* Carousel Images */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Carousel Images (URLs)</label>
                  {imageInputs.map((image, index) => (
                    <div key={index} style={styles.imageInputGroup}>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageInputChange(index, e.target.value)}
                        placeholder={`Image ${index + 1} URL`}
                        style={{ ...styles.input, marginBottom: '10px' }}
                      />
                      {imageInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageInput(index)}
                          style={styles.removeImageButton}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageInput}
                    style={styles.addImageButton}
                  >
                    + Add Image
                  </button>
                </div>

                {/* Variants with Colors and Sizes */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Variants (Color & Sizes)</label>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Add color variants with their sizes and quantities</p>
                  
                  {variantInputs.map((variant, variantIndex) => (
                    <div key={variantIndex} style={styles.variantCard}>
                      <div style={styles.variantHeader}>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => handleVariantColorChange(variantIndex, e.target.value)}
                          placeholder="Color (e.g., Black, Red, Blue)"
                          style={{ ...styles.input, flex: 1, marginBottom: '10px' }}
                        />
                        {variantInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(variantIndex)}
                            style={{ ...styles.removeImageButton, marginLeft: '10px' }}
                          >
                            Remove Color
                          </button>
                        )}
                      </div>

                      {/* Sizes for this variant */}
                      <div style={{ paddingLeft: '20px', borderLeft: '3px solid #3498db' }}>
                        {variant.sizes.map((size, sizeIndex) => (
                          <div key={sizeIndex} style={styles.sizeInputGroup}>
                            <input
                              type="text"
                              value={size.size}
                              onChange={(e) => handleVariantSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
                              placeholder="Size (e.g., M, L, XL)"
                              style={{ ...styles.input, flex: 1, marginRight: '10px' }}
                            />
                            <input
                              type="number"
                              value={size.quantity}
                              onChange={(e) => handleVariantSizeChange(variantIndex, sizeIndex, 'quantity', e.target.value)}
                              placeholder="Quantity"
                              style={{ ...styles.input, flex: 0.6, marginRight: '10px' }}
                              min="0"
                            />
                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariantSize(variantIndex, sizeIndex)}
                                style={styles.removeImageButton}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addVariantSize(variantIndex)}
                          style={{ ...styles.addImageButton, marginTop: '8px' }}
                        >
                          + Add Size
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addVariant}
                    style={styles.addImageButton}
                  >
                    + Add Color Variant
                  </button>
                </div>

                {/* Form Actions */}
                <div style={styles.formActions}>
                  <button type="submit" style={styles.submitButton}>
                    Create Product
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>

        {/* Category Filter */}
        <div style={styles.filterSection}>
          <h3 style={styles.filterTitle}>Filter by Category:</h3>
          <div style={styles.categoryButtons}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === category ? styles.activeCategoryButton : {}),
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div style={styles.tableSection}>
          {filteredProducts.length === 0 ? (
            <p style={styles.statusText}>
              {searchTerm ? 'No products found matching your search.' : 'No products found in this category.'}
            </p>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeaderCell}>Image</th>
                    <th style={styles.tableHeaderCell}>Title</th>
                    <th style={styles.tableHeaderCell}>Category</th>
                    <th style={styles.tableHeaderCell}>Price</th>
                    <th style={styles.tableHeaderCell}>Stock</th>
                    <th style={styles.tableHeaderCell}>Offer</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <React.Fragment key={product._id}>
                      <tr
                      style={{
                        ...styles.tableRow,
                        ...(index % 2 === 0 ? styles.evenRow : styles.oddRow),
                      }}
                    >
                      <td style={styles.tableCell}>
                        <img
                          src={product.image}
                          alt={product.title}
                          style={styles.productImage}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                      </td>
                      <td style={{ ...styles.tableCell, maxWidth: '250px' }}>
                        <span title={product.title}>{product.title}</span>
                      </td>
                      <td style={styles.tableCell}>{product.category}</td>
                      <td style={styles.tableCell}>{formatPrice(product.price)} VND</td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.stockBadge,
                            backgroundColor: product.stock > 0 ? '#28a745' : '#e74c3c',
                          }}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{product.offer || 'N/A'}</td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => openEditForm(product, index)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Edit Modal Row */}
                    {editingProduct?._id === product._id && showForm && (
                      <tr style={styles.modalRow}>
                        <td colSpan="7" style={styles.modalCell}>
                          <div style={styles.formCard} ref={formRef}>
                            <h3 style={styles.formTitle}>Edit Product</h3>

                            <form onSubmit={handleSubmit} style={styles.form}>
                              {/* Title */}
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Product Title *</label>
                                <input
                                  type="text"
                                  name="title"
                                  value={formData.title}
                                  onChange={handleFormChange}
                                  placeholder="Enter product title"
                                  style={styles.input}
                                  required
                                />
                              </div>

                              {/* Description */}
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                  name="description"
                                  value={formData.description}
                                  onChange={handleFormChange}
                                  placeholder="Enter product description"
                                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                                />
                              </div>

                              {/* Category and Price Row */}
                              <div style={styles.formRow}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                  <label style={styles.label}>Category *</label>
                                  <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleFormChange}
                                    style={styles.input}
                                    required
                                  >
                                    <option value="clothing">Clothing</option>
                                    <option value="jewelery">Jewelery</option>
                                    <option value="shoes">Shoes</option>
                                    <option value="accessories">Accessories</option>
                                  </select>
                                </div>

                                <div style={{ ...styles.formGroup, flex: 1, marginLeft: '20px' }}>
                                  <label style={styles.label}>Price (VND) *</label>
                                  <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleFormChange}
                                    placeholder="0"
                                    style={styles.input}
                                    required
                                    min="0"
                                  />
                                </div>

                                <div style={{ ...styles.formGroup, flex: 1, marginLeft: '20px' }}>
                                  <label style={styles.label}>Old Price (VND)</label>
                                  <input
                                    type="number"
                                    name="oldPrice"
                                    value={formData.oldPrice}
                                    onChange={handleFormChange}
                                    placeholder="0"
                                    style={styles.input}
                                    min="0"
                                  />
                                </div>
                              </div>

                              {/* Offer */}
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Offer (e.g. "40%")</label>
                                <input
                                  type="text"
                                  name="offer"
                                  value={formData.offer}
                                  onChange={handleFormChange}
                                  placeholder="e.g. 40%"
                                  style={styles.input}
                                />
                              </div>

                              {/* Main Image */}
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Main Image URL *</label>
                                <input
                                  type="url"
                                  name="image"
                                  value={formData.image}
                                  onChange={handleFormChange}
                                  placeholder="https://example.com/image.jpg"
                                  style={styles.input}
                                  required
                                />
                                {formData.image && (
                                  <img
                                    src={formData.image}
                                    alt="Product preview"
                                    style={styles.imagePreview}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/150';
                                    }}
                                  />
                                )}
                              </div>

                              {/* Carousel Images */}
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Carousel Images (URLs)</label>
                                {imageInputs.map((image, imgIdx) => (
                                  <div key={imgIdx} style={styles.imageInputGroup}>
                                    <input
                                      type="url"
                                      value={image}
                                      onChange={(e) => handleImageInputChange(imgIdx, e.target.value)}
                                      placeholder={`Image ${imgIdx + 1} URL`}
                                      style={{ ...styles.input, marginBottom: '10px' }}
                                    />
                                    {imageInputs.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeImageInput(imgIdx)}
                                        style={styles.removeImageButton}
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addImageInput}
                                  style={styles.addImageButton}
                                >
                                  + Add Image
                                </button>
                              </div>

                              {/* Variants with Colors and Sizes */}
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Variants (Color & Sizes)</label>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Add color variants with their sizes and quantities</p>
                                
                                {variantInputs.map((variant, variantIdx) => (
                                  <div key={variantIdx} style={styles.variantCard}>
                                    <div style={styles.variantHeader}>
                                      <input
                                        type="text"
                                        value={variant.color}
                                        onChange={(e) => handleVariantColorChange(variantIdx, e.target.value)}
                                        placeholder="Color (e.g., Black, Red, Blue)"
                                        style={{ ...styles.input, flex: 1, marginBottom: '10px' }}
                                      />
                                      {variantInputs.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeVariant(variantIdx)}
                                          style={{ ...styles.removeImageButton, marginLeft: '10px' }}
                                        >
                                          Remove Color
                                        </button>
                                      )}
                                    </div>

                                    {/* Sizes for this variant */}
                                    <div style={{ paddingLeft: '20px', borderLeft: '3px solid #3498db' }}>
                                      {variant.sizes.map((size, sizeIdx) => (
                                        <div key={sizeIdx} style={styles.sizeInputGroup}>
                                          <input
                                            type="text"
                                            value={size.size}
                                            onChange={(e) => handleVariantSizeChange(variantIdx, sizeIdx, 'size', e.target.value)}
                                            placeholder="Size (e.g., M, L, XL)"
                                            style={{ ...styles.input, flex: 1, marginRight: '10px' }}
                                          />
                                          <input
                                            type="number"
                                            value={size.quantity}
                                            onChange={(e) => handleVariantSizeChange(variantIdx, sizeIdx, 'quantity', e.target.value)}
                                            placeholder="Quantity"
                                            style={{ ...styles.input, flex: 0.6, marginRight: '10px' }}
                                            min="0"
                                          />
                                          {variant.sizes.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeVariantSize(variantIdx, sizeIdx)}
                                              style={styles.removeImageButton}
                                            >
                                              Remove
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => addVariantSize(variantIdx)}
                                        style={{ ...styles.addImageButton, marginTop: '8px' }}
                                      >
                                        + Add Size
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={addVariant}
                                  style={styles.addImageButton}
                                >
                                  + Add Color Variant
                                </button>
                              </div>

                              {/* Form Actions */}
                              <div style={styles.formActions}>
                                <button type="submit" style={styles.submitButton}>
                                  Update Product
                                </button>
                                <button
                                  type="button"
                                  onClick={resetForm}
                                  style={styles.cancelButton}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={styles.paginationContainer}>
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.paginationButton,
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === page ? styles.activePaginationButton : {}),
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, pagination.pages))}
                    disabled={currentPage === pagination.pages}
                    style={{
                      ...styles.paginationButton,
                      opacity: currentPage === pagination.pages ? 0.5 : 1,
                      cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContainer: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#fff',
    margin: '20px auto',
    maxWidth: '1400px',
    width: 'calc(100% - 60px)',
  },
  pageHeading: {
    marginBottom: '30px',
    color: '#2c3e50',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
  },
  formSection: {
    marginBottom: '40px',
  },
  createButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  formCard: {
    backgroundColor: '#f8f9fa',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '25px',
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  imageInputGroup: {
    marginBottom: '10px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  sizeInputGroup: {
    marginBottom: '12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  variantCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '2px solid #eee',
  },
  variantHeader: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  imagePreview: {
    marginTop: '10px',
    maxWidth: '150px',
    maxHeight: '150px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  addImageButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    marginTop: '10px',
    transition: 'background-color 0.2s ease',
  },
  removeImageButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: 'fit-content',
    transition: 'background-color 0.2s ease',
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    flex: 1,
    transition: 'background-color 0.2s ease',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    flex: 1,
    transition: 'background-color 0.2s ease',
  },
  filterSection: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
  },
  filterTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#333',
  },
  categoryButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  categoryButton: {
    padding: '10px 18px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#333',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  activeCategoryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db',
  },
  tableSection: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    marginTop: '20px',
  },
  tableHeaderRow: {
    backgroundColor: '#eef2f7',
    borderBottom: 'none',
  },
  tableHeaderCell: {
    padding: '15px 20px',
    textAlign: 'left',
    color: '#444',
    fontWeight: 'bold',
    fontSize: '15px',
    textTransform: 'uppercase',
  },
  tableRow: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  modalRow: {
    backgroundColor: '#f0f7ff',
    borderRadius: '0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1) inset',
  },
  modalCell: {
    padding: '20px',
    borderRadius: '0',
  },
  evenRow: {},
  oddRow: {},
  tableCell: {
    padding: '15px 20px',
    color: '#333',
    fontSize: '14px',
  },
  productImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  stockBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    marginRight: '5px',
    transition: 'background-color 0.2s ease',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'background-color 0.2s ease',
  },
  paginationContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '30px',
    alignItems: 'center',
  },
  paginationButton: {
    padding: '10px 14px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#333',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'center',
  },
  activePaginationButton: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db',
  },
  statusText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
  },
};

export default ProductsPage;
