import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../api/adminApi.js';
import Header from '../components/Header.jsx';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hàm để lấy danh sách đơn hàng từ API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllOrders();

      // Kiểm tra nếu dữ liệu trả về không phải là mảng
      if (!Array.isArray(data)) {
        setError("Invalid data format received from API. Expected an array of orders.");
        setOrders([]);
        return;
      }

      // Sắp xếp đơn hàng từ mới nhất đến cũ nhất dựa trên createdAt
      const sortedOrders = data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(sortedOrders);
    } catch (err) {
      setError(err.message || 'Failed to load order list. Please check the console for more details.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetchOrders khi component được mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Xử lý thay đổi trạng thái đơn hàng
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Tải lại danh sách đơn hàng sau khi cập nhật
      alert('Order status updated successfully!');
    } catch (err) {
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  // Xử lý xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        await fetchOrders(); // Tải lại danh sách đơn hàng sau khi xóa
        alert('Order deleted successfully!');
      } catch (err) {
        alert(`Failed to delete order: ${err.message}`);
      }
    }
  };

  if (loading) return (
    <div>
      <Header />
      <p style={styles.statusText}>Loading order list...</p>
    </div>
  );
  if (error) return (
    <div>
      <Header />
      <p style={{ ...styles.statusText, color: 'red' }}>Error: {error}</p>
    </div>
  );
  if (orders.length === 0 && !loading) return (
    <div>
      <Header />
      <p style={styles.statusText}>No orders found.</p>
    </div>
  );

  // Hàm lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      case 'Processing':
        return '#007bff';
      case 'Shipped':
        return '#17a2b8';
      case 'Delivered':
        return '#28a745';
      case 'Cancelled':
        return '#dc3545';
      default:
        return '#333';
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Header />
      <div style={styles.pageContainer}>
        <h2 style={styles.pageHeading}>Manager Orders</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>Order ID</th>
              <th style={styles.tableHeaderCell}>User</th>
              <th style={styles.tableHeaderCell}>Total Price</th>
              <th style={styles.tableHeaderCell}>Products</th>
              <th style={styles.tableHeaderCell}>Payment Method</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Order Date</th>
              <th style={styles.tableHeaderCell}>Time</th>
              <th style={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id || `order-${index}`} style={{ ...styles.tableRow, ...(index % 2 === 0 ? styles.evenRow : styles.oddRow) }}>
                <td style={styles.tableCell}>{order._id || 'N/A'}</td>
                <td style={styles.tableCell}>
                  {order.user?.name || 'Unknown'}
                </td>
                <td style={styles.tableCell}>{order.totalPrice ? order.totalPrice.toLocaleString('vi-VN') : '0.00'} VND</td>
                <td style={styles.tableCell}>
                  <ul style={styles.productList}>
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, pIdx) => (
                        <li key={pIdx} style={styles.productListItem}>
                          <div style={{fontWeight: '500', marginBottom: '4px'}}>
                            {pIdx + 1}. {product.name || 'Unknown Product'} <span style={{color: 'red'}}>(x{product.quantity || 0})</span>
                          </div>
                          <div style={styles.variantContainer}>
                            {product.color && (
                              <span style={styles.variantBadge}>
                                Variant: <b>{product.color}</b>
                              </span>
                            )}
                            {product.size && (
                              <span style={styles.variantBadge}>
                                Color/Size: <b>{product.size}</b>
                              </span>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li style={styles.productListItem}>No products found.</li>
                    )}
                  </ul>
                </td>
                <td style={styles.tableCell}>{order.paymentMethod === 'cash' ? 'Cash' : 'Card'}</td>
                <td style={styles.tableCell}>
                  <select
                    value={order.orderStatus || 'Pending'}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)} // Gọi hàm thay đổi trạng thái
                    style={{ ...styles.selectInput, color: getStatusColor(order.orderStatus || 'Pending') }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={styles.tableCell}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td style={styles.tableCell}>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}</td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => handleDeleteOrder(order._id)} // Gọi hàm xóa đơn hàng
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  pageContainer: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    margin: '20px auto',
    maxWidth: '1400px',
    width: 'calc(100% - 40px)',
  },
  pageHeading: {
    marginBottom: '25px',
    color: '#2c3e50',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
  },
  statusText: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: '18px',
    color: '#666',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    marginTop: '25px',
  },
  tableHeaderRow: {
    backgroundColor: '#eef2f7',
    borderBottom: 'none',
    borderRadius: '8px',
    overflow: 'hidden',
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
    transition: 'transform 0.1s ease',
  },
  evenRow: {},
  oddRow: {},
  tableCell: {
    padding: '15px 20px',
    color: '#333',
    fontSize: '14px',
  },
  selectInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #999',
    backgroundColor: 'white',
    minWidth: '120px',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  productList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '13px',
  },
  productListItem: {
    marginBottom: '8px',
    color: '#555',
    borderBottom: `1px dashed #eee`,
    paddingBottom: '8px',
  },
  variantContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '2px',
  },
  variantBadge: {
    backgroundColor: '#f1f2f6',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    color: '#495057',
    display: 'inline-block',
  }
};

export default OrdersPage;