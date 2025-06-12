import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Equipment.css';

const BASE_URL = 'http://localhost:8000';

const EquipmentReservation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    api.get(`/equipment/${id}`)
      .then(res => setEquipment(res.data.equipment || res.data))
      .catch(() => setEquipment(null));
  }, [id]);

  if (!equipment) return <div className="equipment-listing-page"><div className="listing-container">Loading...</div></div>;

  let imageUrl = '';
  if (equipment.images && equipment.images.length > 0) {
    if (typeof equipment.images[0] === 'string') {
      let imgPath = equipment.images[0].replace(/\\/g, '/').trim();
      imgPath = imgPath.replace(/^\/+/, '');
      if (imgPath.startsWith('storage/')) {
        imgPath = imgPath.substring('storage/'.length);
      }
      if (!imgPath.startsWith('equipment/')) {
        imgPath = 'equipment/' + imgPath;
      }
      imageUrl = 'http://localhost:8000/storage/' + imgPath;
    }
  }

  // Calculate duration and total
  let duration = 0;
  let total = 0;
  if (startDate && endDate && equipment.minPrice) {
    duration = Math.max(0, (new Date(endDate) - new Date(startDate)) / (1000*60*60*24));
    total = duration * parseFloat(equipment.minPrice);
  }

  return (
    <div className="reservation-page">
      <div className="reservation-content">
        {/* Left: Booking Details Card */}
        <div className="reservation-card booking-details-card">
          <div className="reservation-title">Booking Details</div>
          <div className="reservation-label">Select Rental Period</div>
          <div className="reservation-date-fields">
            <div>
              <label>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="reservation-stepper">
            <div className="step-circle active">1</div>
            <span className="step-label">of 3</span>
          </div>
          <button
            className="reservation-next-btn"
            disabled={!startDate || !endDate}
            onClick={() => navigate(`/equipment/${id}/reserve/details`, { state: { startDate, endDate } })}
          >
            Next
          </button>
        </div>
        {/* Right: Equipment Summary Card */}
        <div className="reservation-card equipment-summary-card">
          {imageUrl ? (
            <img src={imageUrl} alt={equipment.name} className="equipment-image" />
          ) : (
            <div className="equipment-image-placeholder">No Image</div>
          )}
          <div className="equipment-summary-content">
            <div className="equipment-title-row">
              <span className="equipment-title">{equipment.name} {equipment.year && <span className="equipment-year">{equipment.year}</span>}</span>
              {equipment.rating && (
                <span className="equipment-rating">{equipment.rating} <span className="equipment-rating-count">({equipment.reviewCount || 0})</span></span>
              )}
            </div>
            <div className="equipment-location">{equipment.city || ''}{equipment.city && equipment.state ? ', ' : ''}{equipment.state || ''}</div>
            <div className="equipment-features-label">Features</div>
            <div className="equipment-features-list">
              <div>GPS Navigation</div>
              <div>Auto-Steering</div>
              <div>Climate Control</div>
              <div>Performance Monitoring</div>
            </div>
            <div className="equipment-summary-label">Rental Summary</div>
            <div className="equipment-summary-row"><span>Daily Rate</span><span>{equipment.minPrice ? `${equipment.minPrice} MAD` : '-'}</span></div>
            <div className="equipment-summary-row"><span>Duration</span><span>{duration} days</span></div>
            <div className="equipment-summary-row total-row"><span>Total</span><span>{total ? `${total} MAD` : '0 MAD'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentReservation; 