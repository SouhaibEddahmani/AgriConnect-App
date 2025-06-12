import React, { useState } from 'react';
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Paper, Select, Slider, Typography, useMediaQuery, Drawer, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

const LOCATIONS = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fes',
  'Tangier',
  'Agadir',
  'Oujda',
  'Kenitra',
  'Tetouan',
  'Safi',
];

const PRICE_MIN = 50;
const PRICE_MAX = 5000;

const EquipmentSidebarFilter = ({ onFilter, equipmentTypes = [] }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [location, setLocation] = useState('');
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleTypeChange = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleFilter = () => {
    onFilter && onFilter({
      startDate,
      endDate,
      types: selectedTypes,
      priceRange,
      location,
    });
    if (isMobile) setOpen(false);
  };

  const sectionSpacing = { mb: 2.5 };
  const labelStyle = { fontWeight: 700, color: '#2B5727', fontSize: 15, mb: 1 };
  const fieldSpacing = { mb: 1.5 };

  const sidebarContent = (
    <Paper elevation={isMobile ? 0 : 2} sx={{ width: isMobile ? 340 : 300, p: 3, bgcolor: '#f8fafc', borderRadius: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color="#2B5727" sx={{ fontSize: 20 }}>Filter Equipment</Typography>
        {isMobile && (
          <IconButton onClick={() => setOpen(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        )}
      </Box>
      {/* Date Availability Section */}
      <Box sx={sectionSpacing}>
        <Typography sx={labelStyle}>Date Availability</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: 'white', borderRadius: 2, fontSize: 13 } } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: 'white', borderRadius: 2, fontSize: 13 } } }}
            />
          </Box>
        </LocalizationProvider>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      {/* Equipment Type Section */}
      <Box sx={sectionSpacing}>
        <Typography sx={labelStyle}>Equipment Type</Typography>
        <FormGroup sx={{ gap: 0.5 }}>
          {equipmentTypes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>No types available</Typography>
          ) : equipmentTypes.map((type) => (
            <FormControlLabel
              key={type}
              control={<Checkbox checked={selectedTypes.includes(type)} onChange={() => handleTypeChange(type)} sx={{ color: '#2B5727', p: 0.5, '&.Mui-checked': { color: '#2B5727' } }} />}
              label={<Typography variant="body2" fontWeight={500} sx={{ fontSize: 13 }}>{type}</Typography>}
              sx={{ ml: 0.5, mb: 0.2 }}
            />
          ))}
        </FormGroup>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      {/* Price Range Section */}
      <Box sx={sectionSpacing}>
        <Typography sx={labelStyle}>Price Range</Typography>
        <Slider
          value={priceRange}
          min={PRICE_MIN}
          max={PRICE_MAX}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          sx={{ mt: 1, color: '#2B5727', height: 3 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500, fontSize: 13 }}>
          {priceRange[0]} MAD – {priceRange[1]} MAD
        </Typography>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      {/* Location Section */}
      <Box sx={sectionSpacing}>
        <Typography sx={labelStyle}>Nearest Location</Typography>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 13 }}>City</InputLabel>
          <Select
            value={location}
            label="City"
            onChange={(e) => setLocation(e.target.value)}
            MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
            sx={{ bgcolor: 'white', borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="" sx={{ fontSize: 13 }}>All Cities</MenuItem>
            {LOCATIONS.map((city) => (
              <MenuItem key={city} value={city} sx={{ fontSize: 13 }}>{city}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Filter Button */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 1, py: 1, letterSpacing: 0.5, fontSize: 15, bgcolor: '#2B5727', '&:hover': { bgcolor: '#1e3d1c' } }}
          onClick={handleFilter}
        >
          Filter Results
        </Button>
      </Box>
    </Paper>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Button
            variant="outlined"
            color="success"
            startIcon={<FilterListIcon />}
            sx={{ mb: 2, mt: 1, ml: 1, borderRadius: 2, fontWeight: 600, bgcolor: '#f8fafc', color: '#2B5727', borderColor: '#2B5727', '&:hover': { bgcolor: '#eaf6ea', borderColor: '#1e3d1c' } }}
            onClick={() => setOpen(true)}
          >
            Filters
          </Button>
          <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
            {sidebarContent}
          </Drawer>
        </>
      ) : (
        <Box sx={{ minWidth: 300, maxWidth: 340, position: 'sticky', top: 24 }}>
          {sidebarContent}
        </Box>
      )}
    </>
  );
};

export default EquipmentSidebarFilter; 