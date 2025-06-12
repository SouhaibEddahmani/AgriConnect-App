import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipment, getEquipmentTypes, reserveEquipment } from '../../services/api';
import { toast } from 'react-toastify';
import './Equipment.css';
import EquipmentSidebarFilter from '../../components/EquipmentSidebarFilter';
import { useMediaQuery, Paper } from '@mui/material';

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

  const BASE_URL = "http://localhost:8000/api";

  const getImageUrl = (item) => {
    if (item.images && item.images.length > 0) {
      let imgPath = item.images[0].replace(/\\/g, '/').trim();
      imgPath = imgPath.replace(/^\/+/, '');
      if (imgPath.startsWith('storage/')) {
        imgPath = imgPath.substring('storage/'.length);
      }
      if (!imgPath.startsWith('equipment/')) {
        imgPath = 'equipment/' + imgPath;
      }
      return 'http://localhost:8000/storage/' + imgPath;
    }
    return '/placeholder-equipment.jpg';
  };

  const isMobile = useMediaQuery('(max-width: 900px)');

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

  // Add a handler for the sidebar filter
  const handleSidebarFilter = ({ startDate, endDate, types, priceRange, location }) => {
    setSelectedType(types && types.length > 0 ? types.join(',') : '');
    setPriceRange(
      priceRange && priceRange.length === 2
        ? priceRange[0] === 50 && priceRange[1] === 5000
          ? ''
          : `${priceRange[0]}-${priceRange[1]}`
        : ''
    );
    // You may want to add logic for startDate, endDate, and location as needed
    // For now, just update the states
    // setStartDate(startDate); setEndDate(endDate); setLocation(location);
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
    <div
      className="equipment-page"
      style={{
        display: isMobile ? 'block' : 'flex',
        alignItems: 'flex-start',
        background: '#f5f6fa',
        padding: isMobile ? '16px 0' : '32px 0',
        minHeight: '100vh',
      }}
    >
      <Paper
        elevation={2}
        style={{
          minWidth: isMobile ? '100%' : 260,
          maxWidth: isMobile ? '100%' : 280,
          margin: isMobile ? '0 0 24px 0' : '0 0 0 32px',
          padding: 24,
          borderRadius: 12,
          boxSizing: 'border-box',
          position: isMobile ? 'static' : 'sticky',
          top: 32,
          zIndex: 2,
        }}
      >
        <EquipmentSidebarFilter onFilter={handleSidebarFilter} equipmentTypes={equipmentTypes} />
      </Paper>
      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 24,
          paddingRight: isMobile ? 0 : 24,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div className="content-header" style={{ marginBottom: 24 }}>
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
        <div
          className={`equipment-grid ${viewMode}`}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : viewMode === 'grid'
              ? 'repeat(auto-fill, minmax(320px, 1fr))'
              : '1fr',
            gap: 24,
            marginBottom: 32,
            width: '100%',
          }}
        >
          {paginatedEquipment.map((item) => (
            <div
              key={item.id}
              className="equipment-card"
              style={{
                cursor: 'pointer',
                minWidth: 0,
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(44,62,80,0.06)',
                transition: 'box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
              onClick={e => {
                if (e.target.closest('.reserve-btn')) return;
                navigate(`/equipment/${item.id}`);
              }}
            >
              <img
                src={getImageUrl(item)}
                alt={item.name}
                className="equipment-image"
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  background: '#f3f7f3',
                }}
              />
              <div className="card-content" style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#2B5727' }}>{item.name}</h3>
                <p className="subtitle" style={{ fontSize: 14, color: '#666', margin: '6px 0 12px 0' }}>{item.subtitle || 'Premium Row Crop Tractor'}</p>
                <div className="price" style={{ fontSize: 20, fontWeight: 700, color: '#333', marginBottom: 10 }}>
                  {item.minPrice ? `${item.minPrice} MAD` : (item.price ? `${item.price} MAD` : 'MAD')}
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#666', marginLeft: 4 }}>per day</span>
                </div>
                <div className="tags-row" style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {getTags(item).map((tag, idx) => (
                    <span key={idx} className="tag" style={{ background: '#f3f7f3', color: '#2B5727', fontSize: 12, fontWeight: 500, borderRadius: 12, padding: '3px 12px', border: '1px solid #e0e6e0', display: 'inline-block' }}>{tag}</span>
                  ))}
                </div>
                <div className="status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="available" style={{ color: '#2B5727', fontSize: 14, fontWeight: 500 }}>
                    {(item.status === 'published' || item.status === 'active') ? 'Available Now' : 'Not Available'}
                  </span>
                  <span className="location" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 14 }}>
                    <span className="location-dot" style={{ color: '#2B5727', fontSize: 16, marginRight: 4 }}>📍</span>
                    {item.distance ? `${item.distance} miles` : 'GPS Ready'}
                  </span>
                </div>
                <button
                  className="btn btn-success w-100 mt-2 reserve-btn"
                  disabled={item.status !== 'active'}
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    padding: '12px',
                    background: '#2B5727',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: item.status === 'active' ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s',
                  }}
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