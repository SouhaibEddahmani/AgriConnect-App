import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getAdminEquipment, updateEquipmentStatus, adminDeleteEquipment } from '../../services/api';
import { toast } from 'react-toastify';

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await getAdminEquipment();
      setEquipment(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load equipment. Please try again.');
      toast.error(err.message || 'Failed to load equipment');
      console.error('Error loading equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (equipmentId, newStatus) => {
    try {
      await updateEquipmentStatus(equipmentId, newStatus);
      await loadEquipment(); // Reload the equipment list
      toast.success('Equipment status updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update equipment status');
      console.error('Error updating equipment status:', err);
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      return;
    }

    try {
      await adminDeleteEquipment(equipmentId);
      await loadEquipment(); // Reload the equipment list
      toast.success('Equipment deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete equipment');
      console.error('Error deleting equipment:', err);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    return (
      (!filters.category || item.category === filters.category) &&
      (!filters.status || item.status === filters.status)
    );
  });

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

  return (
    <DashboardLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Equipment Management</h2>
          <div className="d-flex gap-3">
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="tractor">Tractors</option>
              <option value="harvester">Harvesters</option>
              <option value="plow">Plows</option>
              <option value="other">Other</option>
            </select>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Daily Rate</th>
                <th>Status</th>
                <th>Total Bookings</th>
                <th>Listed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{`${item.user?.prenom} ${item.user?.name}`}</td>
                  <td>${item.daily_rate}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm w-auto ${
                        item.status === 'active' ? 'text-success' :
                        item.status === 'pending' ? 'text-warning' :
                        'text-danger'
                      }`}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>{item.total_bookings || 0}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteEquipment(item.id)}
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
    </DashboardLayout>
  );
};

export default EquipmentManagement; 