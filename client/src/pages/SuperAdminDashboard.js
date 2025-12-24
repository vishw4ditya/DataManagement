import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../index.css';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    latitude: '',
    longitude: '',
    address: ''
  });

  const [sortBy, setSortBy] = useState('visits');

  useEffect(() => {
    fetchAdmins();
    fetchAllCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/super-admin/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchAllCustomers = async () => {
    try {
      const response = await api.get('/super-admin/customers');
      let data = response.data;
      
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

  const fetchAdminDetails = async (adminId) => {
    setLoading(true);
    try {
      const response = await api.get(`/super-admin/admins/${adminId}`);
      let data = response.data;
      
      if (sortBy === 'visits') {
        data.customers.sort((a, b) => b.visitCount - a.visitCount || new Date(b.lastVisited) - new Date(a.lastVisited));
      } else {
        data.customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setSelectedAdmin(data);
    } catch (error) {
      console.error('Error fetching admin details:', error);
    }
    setLoading(false);
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin and all their customers?')) return;
    try {
      await api.delete(`/super-admin/admins/${id}`);
      fetchAdmins();
      fetchAllCustomers();
      if (selectedAdmin && selectedAdmin.admin.id === id) {
        setSelectedAdmin(null);
      }
      alert('Admin deleted successfully');
    } catch (error) {
      alert('Error deleting admin');
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      latitude: customer.location.latitude.toString(),
      longitude: customer.location.longitude.toString(),
      address: customer.location.address || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/super-admin/customers/${id}`);
      fetchAllCustomers();
      if (selectedAdmin) {
        fetchAdminDetails(selectedAdmin.admin.id);
      }
      alert('Customer deleted successfully');
    } catch (error) {
      alert('Error deleting customer');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/super-admin/customers/${editingCustomer._id}`, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address
        }
      });
      alert('Customer updated successfully!');
      setEditingCustomer(null);
      setFormData({ name: '', phoneNumber: '', latitude: '', longitude: '', address: '' });
      fetchAllCustomers();
      if (selectedAdmin) {
        fetchAdminDetails(selectedAdmin.admin.id);
      }
    } catch (error) {
      alert('Error updating customer');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>👑 Super Admin Dashboard</h1>
          <p style={{ color: '#6c757d', marginTop: '5px', fontSize: '14px' }}>Manage all admins and customers</p>
        </div>
        <div className="user-info">
          <div style={{ textAlign: 'right', marginRight: '15px' }}>
            <div style={{ color: '#333', fontWeight: 600 }}>👤 {user?.username}</div>
            <div style={{ color: '#6c757d', fontSize: '12px' }}>Super Administrator</div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {editingCustomer && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', border: '2px solid rgba(102, 126, 234, 0.2)' }}>
          <h3>📝 Edit Customer</h3>
          <form onSubmit={handleUpdateCustomer}>
            <div className="form-group">
              <label>👤 Customer Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>📱 Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>🏠 Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                Update Customer
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ marginBottom: '5px' }}>👥 All Admins</h2>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>Total: <strong style={{ color: '#667eea' }}>{admins.length}</strong> admins</p>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px' }}>
            {admins.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                <div>No admins registered yet</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>👤 Name</th>
                    <th>📱 Phone</th>
                    <th>👥 Total</th>
                    <th>📅 This Month</th>
                    <th>⚡ Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.name}</td>
                      <td>{admin.phoneNumber}</td>
                      <td>
                        <span className="badge badge-primary">{admin.customerCount || 0}</span>
                      </td>
                      <td>
                        <span className="badge badge-success">{admin.monthlyCount || 0}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => fetchAdminDetails(admin._id)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => handleDeleteAdmin(admin._id)}
                            title="Delete Admin"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ marginBottom: '5px' }}>👥 All Customers</h2>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Total: <strong style={{ color: '#667eea' }}>{customers.length}</strong> customers</p>
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
            >
              <option value="visits">🔥 Sort by Visits</option>
              <option value="recent">📅 Sort by Recent</option>
            </select>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '12px' }}>
            {customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                <div>No customers added yet</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>👤 Name</th>
                    <th>🔢 Visits</th>
                    <th>👨‍💼 Admin</th>
                    <th>⚡ Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
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
                          >
                            ✔
                          </button>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${customer.visitCount > 4 ? 'badge-danger' : 'badge-primary'}`} style={customer.visitCount > 4 ? {background: '#dc3545'} : {}}>
                          {customer.visitCount}x
                        </span>
                      </td>
                      <td>{customer.adminId?.name || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => handleEditCustomer(customer)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedAdmin && (
        <div className="card" style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ marginBottom: '5px' }}>👤 Admin Details: {selectedAdmin.admin.name}</h2>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Complete information and customer list</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setSelectedAdmin(null)}>
              ❌ Close
            </button>
          </div>

          <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="stats-card primary">
              <h3>📱 Phone</h3>
              <div className="stat-value" style={{ fontSize: '18px' }}>{selectedAdmin.admin.phoneNumber}</div>
            </div>
            <div className="stats-card success">
              <h3>👥 Total Customers</h3>
              <div className="stat-value">{selectedAdmin.totalCustomers}</div>
            </div>
            <div className="stats-card primary">
              <h3>📅 This Month</h3>
              <div className="stat-value">{selectedAdmin.monthlyCount || 0}</div>
            </div>
            <div className="stats-card warning">
              <h3>📅 Registered</h3>
              <div className="stat-value" style={{ fontSize: '14px' }}>{new Date(selectedAdmin.admin.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <h3 style={{ marginBottom: '20px' }}>👥 Customers ({selectedAdmin.customers.length})</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '12px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>👤 Name</th>
                  <th>📱 Phone</th>
                  <th>🔢 Visits</th>
                  <th>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedAdmin.customers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No customers</td>
                  </tr>
                ) : (
                  selectedAdmin.customers.map((customer) => (
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
                          >
                            ✔
                          </button>
                        )}
                      </td>
                      <td>{customer.phoneNumber}</td>
                      <td>
                        <span className={`badge ${customer.visitCount > 4 ? 'badge-danger' : 'badge-primary'}`} style={customer.visitCount > 4 ? {background: '#dc3545'} : {}}>
                          {customer.visitCount}x
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => handleEditCustomer(customer)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => handleDeleteCustomer(customer._id)}
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
      )}
    </div>
  );
};

export default SuperAdminDashboard;
