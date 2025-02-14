import React, { useState, useEffect } from 'react';
import RestaurantList from '../components/RestaurantList';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import ImageUploadAndRestaurantSearch from '../components/ImageUploadAndRestaurantSearch';

import LocationSearch from '../components/LocationSearch';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [filterResults, setFilterResults] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchInitialRestaurants = async () => {
      try {
        const response = await fetch(`/api/restaurants?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch initial restaurants');

        const data = await response.json();
        console.log("Initial restaurant data:", data);

        setRestaurants(Array.isArray(data.results) ? data.results : []);
        setSearchResults(null); // Reset search results
        setFilterResults(null); // Reset filter results
      } catch (error) {
        console.error('Error fetching initial restaurants:', error);
      }
    };

    fetchInitialRestaurants();
  }, [page, limit]);

  const handleSearch = async (query) => {
    try {
      const response = await fetch(`/api/restaurants/search?search=${query}`);
      if (!response.ok) throw new Error('Failed to fetch search results');

      const data = await response.json();
      console.log('Search results:', data);

      setSearchResults(Array.isArray(data.results) ? data.results : []);
      setFilterResults(null); // Reset filter results
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleFilter = async (filters) => {
    try {
      const { country, price_range, cuisines } = filters;
      const queryParams = new URLSearchParams();

      if (country) queryParams.append('country', country);
      if (price_range) queryParams.append('price_range', price_range);
      if (cuisines) queryParams.append('cuisines', cuisines);

      const url = `/api/restaurants/filter?${queryParams.toString()}`;
      console.log('Filter API URL:', url);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch filter results');

      const data = await response.json();
      console.log('Filter API Response:', data);

      setFilterResults(Array.isArray(data.results) ? data.results : []);
      setSearchResults(null); // Reset search results
    } catch (error) {
      console.error('Error fetching filter results:', error);
    }
  };

  const handleLocationSearch = async (latitude, longitude, distance = 3) => {
    try {
      const response = await fetch(`/api/restaurants/location?latitude=${latitude}&longitude=${longitude}&distance=${distance}`);
      if (!response.ok) throw new Error('Failed to fetch location-based search results');

      const data = await response.json();
      console.log('Location-based search results:', data);

      setSearchResults(Array.isArray(data.results) ? data.results : []);
      setFilterResults(null); // Reset filter results
    } catch (error) {
      console.error('Error fetching location search results:', error);
    }
  };

  return (
    <div className="home-page">
      <h1>Restaurant Finder</h1>
      <SearchBar onSearch={handleSearch} />
      <Filters onFilter={handleFilter} />
      <ImageUploadAndRestaurantSearch />
      <LocationSearch onLocationSearch={handleLocationSearch} />
      <RestaurantList
        restaurants={searchResults || filterResults || restaurants}
        setPage={setPage}
        page={page}
      />
    </div>
  );
};

export default HomePage;