import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { Link } from 'react-router-dom';
import { getAdminDashboardData, promoteToAdmin } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    activeRentals: 0,
    totalRevenue: 0,
    totalBookings: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardData();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setRecentBookings(data.recentBookings || []);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    try {
      await promoteToAdmin(userId);
      await loadDashboardData();
      alert('User successfully promoted to admin!');
    } catch (err) {
      alert('Failed to promote user. Please try again.');
      console.error('Promotion error:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center p-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Equipment</div>
          <div className="stat-value">{stats.totalEquipment}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Rentals</div>
          <div className="stat-value">{stats.activeRentals}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">${stats.totalRevenue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value">{stats.totalBookings}</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Users</h2>
            <Link to="/admin/users" className="btn btn-outline-success">
              Manage All Users
            </Link>
          </div>
          <div className="section-content">
            {recentUsers.length === 0 ? (
              <p className="text-muted">No recent users to display.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Equipment</th>
                      <th>Bookings</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>{user.equipment_count || 0}</td>
                        <td>{user.bookings_count || 0}</td>
                        <td>
                          <span className={`badge ${user.is_admin ? 'bg-primary' : 'bg-secondary'}`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <Link to={`/admin/users/${user.id}`} className="btn btn-sm btn-outline-primary me-2">
                            View Details
                          </Link>
                          {!user.is_admin && (
                            <button
                              className="btn btn-sm btn-outline-success me-2"
                              onClick={() => handlePromoteToAdmin(user.id)}
                            >
                              Promote to Admin
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-danger">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="section mt-4">
          <div className="section-header">
            <h2 className="section-title">Recent Bookings</h2>
            <Link to="/admin/bookings" className="btn btn-outline-success">
              View All Bookings
            </Link>
          </div>
          <div className="section-content">
            {recentBookings.length === 0 ? (
              <p className="text-muted">No recent bookings to display.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Renter</th>
                      <th>Owner</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{booking.equipment_name}</td>
                        <td>{booking.renter_name}</td>
                        <td>{booking.owner_name}</td>
                        <td>{new Date(booking.start_date).toLocaleDateString()}</td>
                        <td>{new Date(booking.end_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${
                            booking.status === 'confirmed' ? 'bg-success' :
                            booking.status === 'pending' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <Link to={`/admin/bookings/${booking.id}`} className="btn btn-sm btn-outline-primary">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 