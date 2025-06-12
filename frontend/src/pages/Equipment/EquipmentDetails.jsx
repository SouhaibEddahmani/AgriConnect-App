import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Equipment.css';

const BASE_URL = 'http://localhost:8000/api'; // Updated to match API URL

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);

  useEffect(() => {
    api.get(`/equipment/${id}`)
      .then(res => setEquipment(res.data.equipment || res.data))
      .catch(() => setEquipment(null));
  }, [id]);

  if (!equipment) return <div className="equipment-listing-page"><div className="listing-container">Loading...</div></div>;

  // Always use the backend path as local storage
  let imageUrl = '';
  if (equipment.images && equipment.images.length > 0) {
    let imgPath = equipment.images[0].replace(/\\/g, '/').trim();
    imgPath = imgPath.replace(/^\/+/, '');
    // Remove any leading 'storage/' if present
    if (imgPath.startsWith('storage/')) {
      imgPath = imgPath.substring('storage/'.length);
    }
    // Prepend 'equipment/' if not present
    if (!imgPath.startsWith('equipment/')) {
      imgPath = 'equipment/' + imgPath;
    }
    imageUrl = 'http://localhost:8000/storage/' + imgPath;
  }

  return (
    <div className="equipment-listing-page" style={{ minHeight: '100vh', background: '#fafcf9' }}>
      <div className="listing-container" style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.08)', padding: 32 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 340px', maxWidth: 340 }}>
            {imageUrl ? (
              <img src={imageUrl} alt={equipment.name} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 }} />
            ) : (
              <div style={{ width: '100%', height: 220, background: '#eaf6ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 32, borderRadius: 10 }}>No Image</div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ marginBottom: 8 }}>{equipment.name}</h2>
            <div className="demand-label" style={{ background: '#2B5727', color: '#fff', marginBottom: 12, display: 'inline-block' }}>{equipment.type}</div>
            <div className="form-group"><b>Year:</b> {equipment.year || 'N/A'} &nbsp; <b>Country:</b> {equipment.country || 'N/A'}</div>
            <div className="form-group"><b>Location:</b> {equipment.address || ''}{equipment.city ? `, ${equipment.city}` : ''}{equipment.state ? `, ${equipment.state}` : ''}{equipment.zip ? `, ${equipment.zip}` : ''}</div>
            <div className="form-group"><b>Description:</b> {equipment.description || <span style={{ color: '#aaa' }}>No description</span>}</div>
            <div className="form-group"><b>License/Registration:</b> {equipment.license || 'N/A'}</div>
            <div className="form-group"><b>Business Owner:</b> {equipment.isBusiness ? 'Yes' : 'No'}</div>
            <div className="form-group"><b>Contact:</b> {equipment.contactName || 'N/A'}{equipment.contactPhone ? ` (${equipment.contactPhone})` : ''}</div>
            <div className="form-group"><b>Terms Accepted:</b> {equipment.termsAccepted ? 'Yes' : 'No'}</div>
            <div className="form-group"><b>Available Seasons:</b> {equipment.availableSeasons?.join(', ') || 'N/A'}</div>
            <div className="form-group"><b>Pricing Type:</b> {equipment.pricingType || 'N/A'}</div>
            {equipment.pricingType === 'manual' ? (
              <div className="form-group">
                <b>Manual Prices:</b>
                <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                  <li>Low: {equipment.price_low || '-'} MAD</li>
                  <li>Medium: {equipment.price_medium || '-'} MAD</li>
                  <li>High: {equipment.price_high || '-'} MAD</li>
                  <li>Very High: {equipment.price_very_high || '-'} MAD</li>
                </ul>
              </div>
            ) : (
              <div className="form-group"><b>Minimum Price:</b> {equipment.minPrice ? `${equipment.minPrice} MAD` : 'N/A'}</div>
            )}
            <div className="form-group"><b>Minimum Rental Days:</b> {equipment.minRentalDays || 'N/A'}</div>
            <div className="form-group"><b>Deposit:</b> {equipment.deposit ? `${equipment.deposit} MAD` : 'N/A'}</div>
            <div className="form-group"><b>Latitude:</b> {equipment.lat || 'N/A'}</div>
            <div className="form-group"><b>Longitude:</b> {equipment.lng || 'N/A'}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-success" onClick={() => navigate(`/equipment/${equipment.id}/reserve`)}>Reserve Now</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/equipment')}>Back to Equipment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails; 