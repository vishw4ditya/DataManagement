import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../index.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalCustomers: 0, monthlyCustomers: 0 });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    latitude: '',
    longitude: '',
    address: ''
  });

  const [sortBy, setSortBy] = useState('visits'); // 'visits' or 'recent'

  useEffect(() => {
    fetchCustomers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/customer/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customer/list');
      let data = response.data;
      
      // Client-side sorting for more flexibility
      if (sortBy === 'visits') {
        data.sort((a, b) => b.visitCount - a.visitCount || new Date(b.lastVisited) - new Date(a.lastVisited));
      } else {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      latitude: customer.location.latitude.toString(),
      longitude: customer.location.longitude.toString(),
      address: customer.location.address || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customer/${id}`);
      fetchCustomers();
      fetchStats();
      alert('Customer deleted successfully');
    } catch (error) {
      alert('Error deleting customer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCustomer) {
        await api.put(`/customer/${editingCustomer._id}`, {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          location: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            address: formData.address
          }
        });
        alert('Customer updated successfully!');
      } else {
        await api.post('/customer/add', {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          location: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            address: formData.address
          }
        });
        alert('Customer added successfully!');
      }

      setFormData({
        name: '',
        phoneNumber: '',
        latitude: '',
        longitude: '',
        address: ''
      });
      setShowAddForm(false);
      setEditingCustomer(null);
      fetchCustomers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving customer');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      phoneNumber: '',
      latitude: '',
      longitude: '',
      address: ''
    });
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>📊 Admin Dashboard</h1>
          <p style={{ color: '#6c757d', marginTop: '5px', fontSize: '14px' }}>Manage your customers efficiently</p>
        </div>
        <div className="user-info">
          <div style={{ textAlign: 'right', marginRight: '15px' }}>
            <div style={{ color: '#333', fontWeight: 600 }}>👤 {user?.name}</div>
            <div style={{ color: '#6c757d', fontSize: '12px' }}>{user?.phoneNumber}</div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <h3 style={{ color: '#6c757d', fontSize: '14px', marginBottom: '10px' }}>👥 Total Customers</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#667eea' }}>{stats.totalCustomers}</div>
        </div>
        <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <h3 style={{ color: '#6c757d', fontSize: '14px', marginBottom: '10px' }}>📅 Added This Month</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#28a745' }}>{stats.monthlyCustomers}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ marginBottom: '5px' }}>👥 Customers</h2>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>Total: <strong style={{ color: '#667eea' }}>{customers.length}</strong> customers</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
              >
                <option value="visits">🔥 Sort by Visits</option>
                <option value="recent">📅 Sort by Recent</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => editingCustomer ? cancelEdit() : setShowAddForm(!showAddForm)}>
              {showAddForm ? (
                <>
                  <span>❌</span> Cancel
                </>
              ) : (
                <>
                  <span>➕</span> Add Customer
                </>
              )}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', border: '2px solid rgba(102, 126, 234, 0.2)' }}>
            <h3 style={{ marginBottom: '25px' }}>{editingCustomer ? '📝 Edit Customer' : '➕ Add New Customer'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>👤 Customer Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="form-group">
                <label>📱 Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>📍 Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 28.6139"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>📍 Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., 77.2090"
                    required
                  />
                </div>
              </div>
              <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginTop: '-15px', marginBottom: '20px' }}>
                💡 Get coordinates from <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> by right-clicking on a location
              </small>

              <div className="form-group">
                <label>🏠 Address (Optional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>✅</span> {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>👤 Name</th>
                <th>📱 Phone</th>
                <th>📍 Location</th>
                <th>🔢 Visits</th>
                <th>🕒 Last Visited</th>
                <th>⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                    <div>No customers added yet</div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>Click "Add Customer" to get started</div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id}>
                    <td style={{ fontWeight: 600 }}>
                      {customer.name}
                      {customer.visitCount > 4 && (
                        <button 
                          className="btn" 
                          style={{ 
                            padding: '2px 6px', 
                            fontSize: '10px', 
                            background: '#dc3545', 
                            color: 'white', 
                            marginLeft: '8px',
                            borderRadius: '4px',
                            cursor: 'default'
                          }}
                          title="High Visit Count (>4)"
                        >
                          ✔
                        </button>
                      )}
                    </td>
                    <td>{customer.phoneNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {customer.location.latitude.toFixed(4)}, {customer.location.longitude.toFixed(4)}
                      </div>
                      {customer.location.address && (
                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                          📍 {customer.location.address}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${customer.visitCount > 4 ? 'badge-danger' : 'badge-primary'}`} style={customer.visitCount > 4 ? {background: '#dc3545'} : {}}>
                        {customer.visitCount}x
                      </span>
                    </td>
                    <td>{new Date(customer.lastVisited).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => handleEdit(customer)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          onClick={() => handleDelete(customer._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
