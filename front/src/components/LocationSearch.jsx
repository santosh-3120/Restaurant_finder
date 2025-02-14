import React, { useState } from 'react';

const LocationSearch = ({ onLocationSearch }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [distance, setDistance] = useState(3);

  const handleSearch = () => {
    if (latitude && longitude) {
      onLocationSearch(latitude, longitude, distance);
    } else {
      alert("Please enter valid latitude and longitude.");
    }
  };

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Failed to fetch location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="location-search">
      <h3>Search by Location</h3>
      <input
        type="number"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
      />
      <input
        type="number"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
      />
      <input
        type="number"
        placeholder="Distance (km)"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
      />
      <button onClick={fetchUserLocation}>Use My Location</button>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default LocationSearch;
