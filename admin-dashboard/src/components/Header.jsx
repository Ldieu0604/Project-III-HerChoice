import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        {/* Logo */}
        <div style={styles.logo}>
          <h1 style={styles.logoText}>HerChoice Admin</h1>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.nav}>
          <button
            onClick={() => handleNavigation('/dashboard')}
            style={styles.navButton}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => handleNavigation('/products')}
            style={styles.navButton}
          >
            📦 Products
          </button>
          <button
            onClick={() => handleNavigation('/orders')}
            style={styles.navButton}
          >
            🛒 Orders
          </button>
          <button
            onClick={() => handleNavigation('/users')}
            style={styles.navButton}
          >
            👥 Users
          </button>
        </nav>

        {/* User Info and Logout */}
        <div style={styles.userSection}>
          {user && (
            <span style={styles.userName}>
              Welcome, <strong>{user.name || 'Admin'}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px 0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    sticky: 'top',
    zIndex: 1000,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    flex: 0,
  },
  logoText: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 40px',
  },
  navButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  userSection: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flex: 0,
  },
  userName: {
    fontSize: '14px',
    color: '#ecf0f1',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
  },
};

export default Header;
