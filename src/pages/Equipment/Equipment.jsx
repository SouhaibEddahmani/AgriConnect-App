import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipment, getEquipmentTypes, reserveEquipment } from '../../services/api';
import { toast } from 'react-toastify';
import './Equipment.css';

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
          {equipment.map((item) => (
            <div key={item.id} className="equipment-card">
              <img src={item.image_url || '/placeholder-equipment.jpg'} alt={item.name} className="equipment-image" />
              <div className="card-content">
                <h3>{item.name}</h3>
                <p className="subtitle">{item.description}</p>
                <div className="price">${item.daily_rate}<span>/day</span></div>
                <div className="status-row">
                  <span className="available">{item.status}</span>
                  <span className="location">
                    <span className="location-dot">📍</span>
                    {item.distance ? `${item.distance} miles` : 'Distance N/A'}
                  </span>
                </div>
                <button 
                  className="reserve-btn"
                  onClick={() => handleReserve(item.id)}
                  disabled={item.status !== 'active'}
                >
                  {item.status === 'active' ? 'Reserve Now' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>

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