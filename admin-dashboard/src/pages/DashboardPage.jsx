// admin-dashboard/src/pages/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardPage = () => {
  const { logout, user } = useAuth();

  return (
    <div style={styles.dashboardContainer}>
      {/* Thanh bên - Thanh điều hướng bên trái */}
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>HerChoice's Admin</h3>
        <p style={styles.welcomeText}>Hello, {user?.name || 'Admin'}!</p>
        <ul style={styles.navList}>
          <li style={styles.navItem}><Link to="/products" style={styles.navLink}>Manage Products</Link></li>
          <li style={styles.navItem}><Link to="/users" style={styles.navLink}>Manage Users</Link></li>
          <li style={styles.navItem}><Link to="/orders" style={styles.navLink}>Manage Orders</Link></li>
          {/* Thêm các liên kết khác tại đây */}
        </ul>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Nội dung chính - Nội dung chính của Trang tổng quan */}
      <div style={styles.mainContent}>
        <h1 style={styles.mainContentTitle}>Welcome to HerChoice's Admin!</h1>
        <p style={styles.mainContentText}>Use the sidebar to navigate through management sections.</p>
        {/* Có thể thêm các widget, số liệu thống kê, biểu đồ tại đây */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Users</h3>
            <p style={styles.statNumber}>...</p> {/* Dữ liệu sẽ được tải từ API */}
          </div>
          <div style={styles.statCard}>
            <h3>Total Orders</h3>
            <p style={styles.statNumber}>...</p> {/* Dữ liệu sẽ được tải từ API */}
          </div>
          {/* Thêm các thẻ thống kê khác */}
        </div>
      </div>
    </div>
  );
};

// Basic inline styles (Consider moving to a separate CSS file or using Tailwind/Styled Components)
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    width: '100%',
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    backgroundColor: '#2d3a4b',
    color: '#ecf0f1',
    padding: '30px 20px',
    boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'width 0.3s ease',
  },
  sidebarTitle: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '700',
    borderBottom: '1px solid #3c4e62',
    paddingBottom: '20px',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#bdc3c7',
    fontSize: '15px',
  },
  navList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    flexGrow: 1,
  },
  navItem: {
    marginBottom: '12px',
  },
  navLink: {
    color: '#ecf0f1',
    textDecoration: 'none',
    padding: '12px 18px',
    display: 'block',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    fontSize: '16px',
    fontWeight: '500',
  },
  navLinkHover: {
    backgroundColor: '#3c4e62',
    color: '#ffffff',
  },
  logoutButton: {
    marginTop: '60px',
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
  },
  logoutButtonHover: {
    backgroundColor: '#c0392b',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
  },
  mainContentTitle: {
    marginBottom: '30px',
    color: '#2c3e50',
    fontSize: '32px',
    fontWeight: '700',
  },
  mainContentText: {
    color: '#666',
    fontSize: '17px',
    lineHeight: '1.6',
    marginBottom: '40px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
    marginTop: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    borderLeft: '5px solid #007bff',
  },
  statNumber: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: '15px',
  }
};

export default DashboardPage;