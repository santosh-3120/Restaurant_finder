import React, { useState } from 'react';

const Filters = ({ onFilter }) => {
  const [country, setCountry] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [cuisines, setCuisines] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ country, priceRange, cuisines });
  };

  return (
    <form onSubmit={handleSubmit} className="filters">
      <input
        type="text"
        placeholder="Country ID"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <input
        type="text"
        placeholder="Price Range (1-4)"
        value={priceRange}
        onChange={(e) => setPriceRange(e.target.value)}
      />
      <input
        type="text"
        placeholder="Cuisines"
        value={cuisines}
        onChange={(e) => setCuisines(e.target.value)}
      />
      <button type="submit">Apply Filters</button>
    </form>
  );
};

export default Filters;