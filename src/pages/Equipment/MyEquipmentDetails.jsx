import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { getUserEquipment } from '../../services/api';

const MyEquipmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [equipment, setEquipment] = useState(location.state?.equipment || null);
  const [loading, setLoading] = useState(!equipment);

  useEffect(() => {
    if (!equipment) {
      getUserEquipment().then(res => {
        const found = (res.data || []).find(eq => String(eq.id) === String(id));
        setEquipment(found || null);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [equipment, id]);

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

  if (!equipment) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger mt-4">Equipment data not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <h2>My Equipment Details</h2>
        <div className="card p-4 mt-3">
          <h4>{equipment.name}</h4>
          <p><strong>Status:</strong> {equipment.status}</p>
          <p><strong>Type:</strong> {equipment.type || '-'}</p>
          <p><strong>Description:</strong> {equipment.description || '-'}</p>
          <p><strong>Daily Rate:</strong> {equipment.price || equipment.minPrice || '-'}</p>
          <p><strong>License:</strong> {equipment.license || '-'}</p>
          <p><strong>Year:</strong> {equipment.year || '-'}</p>
          <p><strong>Location:</strong> {equipment.address || '-'}</p>
          <p><strong>Contact:</strong> {equipment.contactName || '-'} ({equipment.contactPhone || '-'})</p>
          <div className="mt-3">
            <button className="btn btn-outline-primary me-2" onClick={() => navigate('/equipment/list', { state: { edit: true, equipment } })}>Edit</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyEquipmentDetails; 