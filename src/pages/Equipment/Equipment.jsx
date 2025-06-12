import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipment, getEquipmentTypes, reserveEquipment } from '../../services/api';
import { toast } from 'react-toastify';
import './Equipment.css';

const ITEMS_PER_PAGE = 9;

const Equipment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  
  // Filter states
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [availability, setAvailability] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recommended');

  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalEquipment, setModalEquipment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  const priceRanges = [
    { label: 'Under $300', value: 'under-300', min: 0, max: 300 },
    { label: '$300 - $350', value: '300-350', min: 300, max: 350 },
    { label: 'Over $350', value: 'over-350', min: 350, max: Infinity }
  ];

  const availabilityOptions = [
    { label: 'Available Now', value: 'now' },
    { label: 'Next Week', value: 'next-week' },
    { label: 'Next Month', value: 'next-month' }
  ];

  const BASE_URL = "http://localhost:8000";

  const getImageUrl = (item) => {
    if (item.images && item.images.length > 0) {
      let imgPath = item.images[0].replace(/\\/g, '/').trim();
      if (imgPath.startsWith('/')) {
        imgPath = imgPath.substring(1);
      }
      return BASE_URL + '/' + imgPath;
    }
    return '/placeholder-equipment.jpg';
  };

  // Fetch equipment types and initial equipment data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [typesResponse, equipmentResponse] = await Promise.all([
          getEquipmentTypes(),
          getAllEquipment()
        ]);

        setEquipmentTypes(typesResponse.data || []);
        setEquipment(equipmentResponse.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load equipment data');
        toast.error(err.message || 'Failed to load equipment data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch equipment when filters change
  useEffect(() => {
    const fetchFilteredEquipment = async () => {
      try {
        setLoading(true);
        const response = await getAllEquipment({
          type: selectedType,
          priceRange,
          availability,
          sortBy
        });
        
        setEquipment(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to filter equipment');
        toast.error(err.message || 'Failed to filter equipment');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredEquipment();
  }, [selectedType, priceRange, availability, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedType('');
    setPriceRange('');
    setAvailability('');
    setSortBy('recommended');
  };

  // Handle equipment reservation
  const handleReserve = async (equipmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: '/equipment' } });
        return;
      }

      await reserveEquipment(equipmentId, {
        startDate: new Date().toISOString(),
        // Add other reservation details as needed
      });

      // Refresh equipment list after reservation
      const response = await getAllEquipment({
        type: selectedType,
        priceRange,
        availability,
        sortBy
      });
      
      setEquipment(response.data || []);
      toast.success('Equipment reserved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to reserve equipment');
    }
  };

  // Tag generator for each equipment card
  const getTags = (item) => {
    const tags = [];
    if (item.status === 'active') tags.push('Available Now');
    if (item.gps_ready) tags.push('GPS Ready');
    if (item.hp) tags.push(`${item.hp} HP`);
    return tags;
  };

  const paginatedEquipment = equipment.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(equipment.length / ITEMS_PER_PAGE);

  // Reservation modal logic
  const openReserveModal = (equipment) => {
    setModalEquipment(equipment);
    setShowModal(true);
    setStartDate('');
    setEndDate('');
    setDateError('');
  };
  const closeReserveModal = () => {
    setShowModal(false);
    setModalEquipment(null);
    setStartDate('');
    setEndDate('');
    setDateError('');
  };
  const handleReserveSubmit = async () => {
    setDateError('');
    if (!startDate || !endDate) {
      setDateError('Both start and end dates are required.');
      return;
    }
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start < new Date(today.toDateString())) {
      setDateError('Start date must be today or later.');
      return;
    }
    if (end <= start) {
      setDateError('End date must be after start date.');
      return;
    }
    try {
      await reserveEquipment(modalEquipment.id, { startDate, endDate });
      toast.success('Reservation successful!');
      closeReserveModal();
    } catch (err) {
      setDateError(err.message || 'Reservation failed.');
    }
  };

  if (loading && !equipment.length) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading equipment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="equipment-page">
      {/* Reservation Modal */}
      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', zIndex:1000 }}>
          <div className="modal-content" style={{ background:'#fff', maxWidth:400, margin:'10vh auto', padding:24, borderRadius:8, boxShadow:'0 2px 16px rgba(0,0,0,0.2)', position:'relative' }}>
            <h4>Reserve: {modalEquipment?.name}</h4>
            <div className="form-group mt-3">
              <label>Start Date</label>
              <input type="date" className="form-control" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group mt-2">
              <label>End Date</label>
              <input type="date" className="form-control" value={endDate} min={startDate || new Date().toISOString().split('T')[0]} onChange={e => setEndDate(e.target.value)} />
            </div>
            {dateError && <div className="alert alert-danger mt-2">{dateError}</div>}
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={closeReserveModal}>Cancel</button>
              <button className="btn btn-success" onClick={handleReserveSubmit}>Confirm Reservation</button>
            </div>
          </div>
        </div>
      )}
      <div className="filters-sidebar">
        <h3>Filters</h3>
        <a href="#" className="clear-all" onClick={(e) => { e.preventDefault(); clearFilters(); }}>
          Clear All
        </a>
        
        <div className="filter-group">
          <h4>Equipment Type</h4>
          <ul>
            {equipmentTypes.map(type => (
              <li key={type}>
                <a
                  href="#"
                  className={selectedType === type ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setSelectedType(type); }}
                >
                  {type}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="filter-group">
          <h4>Price Range (per day)</h4>
          <ul>
            {priceRanges.map(range => (
              <li key={range.value}>
                <a
                  href="#"
                  className={priceRange === range.value ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setPriceRange(range.value); }}
                >
                  {range.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="filter-group">
          <h4>Availability</h4>
          <ul>
            {availabilityOptions.map(option => (
              <li key={option.value}>
                <a
                  href="#"
                  className={availability === option.value ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setAvailability(option.value); }}
                >
                  {option.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="filter-group">
          <h4>Location</h4>
          <div className="location-text">
            <span className="location-dot">●</span>
            <span>Current Location</span>
          </div>
          <div className="location-sub">Within 50 miles of Kansas City, MO</div>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <h2>Browse Equipment</h2>
            <p className="results-count">
              Showing {equipment.length} items available near you
            </p>
          </div>
          <div className="header-right">
            <select
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="distance">Distance</option>
            </select>
            <div className="view-toggles">
              <button
                className={`view-btn grid ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <span className="grid-icon">▤</span>
              </button>
              <button
                className={`view-btn list ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <span className="list-icon">☰</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`equipment-grid ${viewMode}`}>
          {paginatedEquipment.map((item) => (
            <div key={item.id} className="equipment-card" style={{ cursor: 'pointer' }}
              onClick={e => {
                if (e.target.closest('.reserve-btn')) return;
                navigate(`/equipment/${item.id}`);
              }}
            >
              <img src={getImageUrl(item)} alt={item.name} className="equipment-image" />
              <div className="card-content">
                <h3>{item.name}</h3>
                <p className="subtitle">{item.subtitle || 'Premium Row Crop Tractor'}</p>
                <div className="price">
                  {item.minPrice ? `${item.minPrice} MAD` : (item.price ? `${item.price} MAD` : '$')}
                  <span> per day</span>
                </div>
                <div className="tags-row">
                  {getTags(item).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="status-row">
                  <span className="available">
                    {(item.status === 'published' || item.status === 'active') ? 'Available Now' : 'Not Available'}
                  </span>
                  <span className="location">
                    <span className="location-dot">📍</span>
                    {item.distance ? `${item.distance} miles` : 'GPS Ready'}
                  </span>
                </div>
                <button 
                  className="btn btn-success w-100 mt-2"
                  disabled={item.status !== 'active'}
                  onClick={() => openReserveModal(item)}
                >
                  Reserve Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ marginRight: 8 }}
            >
              Previous
            </button>
            <span style={{ alignSelf: 'center', fontWeight: 500 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ marginLeft: 8 }}
            >
              Next
            </button>
          </div>
        )}

        {equipment.length === 0 && !loading && (
          <div className="no-results">
            <p>No equipment found matching your filters</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipment; 