import React, { useState } from 'react';
import RestaurantList from './RestaurantList'; // Adjust the path if needed

const ImageUploadAndRestaurantSearch = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (event) => {
    const imageFile = event.target.files[0];
    if (!imageFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/upload', {  // Your API endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Restaurants from image:', data);
      setRestaurants(data.restaurants || []); // Use .restaurants
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message);
      setRestaurants([]); // Clear previous restaurants
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Food Image</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {loading && <p>Searching for restaurants...</p>}
      {error && <p>Error: {error}</p>}

      {/* Display the restaurants */}
      {restaurants.length > 0 && (
        <div>
          <h3>Restaurants Based on Image:</h3>
          <RestaurantList restaurants={restaurants} setPage={()=>{}} page={1} /> {/* Correct prop name */}
        </div>
      )}
    </div>
  );
};

export default ImageUploadAndRestaurantSearch;
