// admin-dashboard/src/pages/UsersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../api/adminApi.js';
import Header from '../components/Header.jsx';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hàm để lấy danh sách người dùng từ API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetchUsers khi component được mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Xử lý thay đổi vai trò người dùng
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      await fetchUsers(); // Tải lại danh sách người dùng sau khi cập nhật
      alert('User role updated successfully!');
    } catch (err) {
      alert(`Failed to update user role: ${err.message}`);
    }
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        await fetchUsers(); // Tải lại danh sách người dùng sau khi xóa
        alert('User deleted successfully!');
      } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  if (loading) return (
    <div>
      <Header />
      <p style={styles.statusText}>Loading user list...</p>
    </div>
  );
  if (error) return (
    <div>
      <Header />
      <p style={{ ...styles.statusText, color: 'red' }}>Error: {error}</p>
    </div>
  );
  if (users.length === 0 && !loading) return (
    <div>
      <Header />
      <p style={styles.statusText}>No users found.</p>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <Header />
      <div style={styles.pageContainer}>
        <h2 style={styles.pageHeading}>Manage Users</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>ID</th>
              <th style={styles.tableHeaderCell}>Name</th>
              <th style={styles.tableHeaderCell}>Email</th>
              <th style={styles.tableHeaderCell}>Role</th>
              <th style={styles.tableHeaderCell}>Verified</th>
              <th style={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} style={{ ...styles.tableRow, ...(index % 2 === 0 ? styles.evenRow : styles.oddRow) }}>
                <td style={styles.tableCell}>{user._id}</td>
                <td style={styles.tableCell}>{user.name}</td>
                <td style={styles.tableCell}>{user.email}</td>
                <td style={styles.tableCell}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)} // Gọi hàm thay đổi vai trò
                    style={styles.selectInput}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={styles.tableCell}>{user.verified ? 'Yes' : 'No'}</td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => handleDeleteUser(user._id)} // Gọi hàm xóa người dùng
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

// Basic inline styles (Consider moving to a separate CSS file or using Tailwind/Styled Components)
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
    maxWidth: '1200px',
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
  evenRow: {
    // backgroundColor: '#f9f9f9',
  },
  oddRow: {
    // backgroundColor: '#ffffff',
  },
  tableRowHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  tableCell: {
    padding: '15px 20px',
    color: '#333',
    fontSize: '15px',
  },
  selectInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #999',
    backgroundColor: 'white',
    minWidth: '100px',
    fontSize: '14px',
    color: '#333',
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
  deleteButtonHover: {
    backgroundColor: '#c0392b',
  }
};

export default UsersPage;