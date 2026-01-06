// admin-dashboard/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Chuyển hướng đến bảng điều khiển nếu đã đăng nhập với vai trò admin
  if (user && user.role === 'admin') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Xử lý việc gửi form đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi hàm đăng nhập từ AuthContext
      await login(email, password);
      // Nếu đăng nhập thành công và người dùng là admin, điều hướng
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Đăng nhập quản trị viên</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && <p style={styles.errorText}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Basic inline styles (Consider moving to a separate CSS file or using Tailwind/Styled Components)
const styles = {
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    width: '100%',
  },
  container: {
    padding: '30px',
    maxWidth: '450px',
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    textAlign: 'left',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontSize: '28px',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '600',
    fontSize: '15px',
  },
  input: {
    width: 'calc(100% - 24px)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },
  button: {
    padding: '14px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    alignSelf: 'center',
    width: '100%',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)',
  }
};

export default LoginPage;