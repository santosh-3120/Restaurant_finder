import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch(`https://restaurant-finder-foxg.onrender.com/api/restaurants/${id}`)
      .then((response) => response.json())
      .then((data) => setRestaurant(data))
      .catch((error) => console.error('Error fetching restaurant:', error));
  }, [id]);

  if (!restaurant) return <div className="loading">Loading...</div>;

  return (
    <div className="restaurant-detail">
      <h1>{restaurant.name}</h1>
      <img src={restaurant.featured_image} alt={restaurant.name} className="main-image" />
      
      <div className="basic-info">
        <p className="rating">
          ⭐ {restaurant.user_rating.aggregate_rating} ({restaurant.user_rating.rating_text})
        </p>
        <p>Average Cost for Two: {restaurant.average_cost_for_two} {restaurant.currency}</p>
        <p>Price Range: {'₹'.repeat(restaurant.price_range)}</p>
      </div>

      <div className="section">
        <h2>About</h2>
        <p>{restaurant.cuisines}</p>
        <p>Address: {restaurant.location.address}</p>
        <p>City: {restaurant.location.city}</p>
        <p>Online Delivery: {restaurant.has_online_delivery ? 'Yes' : 'No'}</p>
        <p>Table Booking: {restaurant.has_table_booking ? 'Available' : 'Not Available'}</p>
      </div>

      <div className="section">
        <h2>Contact</h2>
        <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="zomato-link">
          View on Zomato ↗
        </a>
        <a href={restaurant.menu_url} target="_blank" rel="noopener noreferrer" className="menu-link">
          View Menu ↗
        </a>
      </div>

      {restaurant.zomato_events?.length > 0 && (
        <div className="section">
          <h2>Events & Offers</h2>
          {restaurant.zomato_events.map((event, index) => (
            <div key={index} className="event-card">
              <h3>{event.event.title}</h3>
              <p>{event.event.description}</p>
              <p>📅 {event.event.display_date}</p>
              <p>⏰ {event.event.display_time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;