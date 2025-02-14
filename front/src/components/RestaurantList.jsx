import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantList = ({ restaurants, setPage, page }) => {
  // Check if the restaurants array is empty or invalid
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return <p className="no-results">No restaurants found.</p>;
  }

  return (
    <div className="restaurant-list">
      {restaurants.map((item, index) => {
        // Extract the nested `restaurant` object
        const restaurant = item.restaurant;

        // Skip if the restaurant object is missing or invalid
        if (!restaurant || !restaurant.R?.res_id) return null;

        return (
          <div key={`${restaurant.R.res_id}-${index}`} className="restaurant-card">
            <img
              src={restaurant.featured_image || restaurant.thumb || 'default-image.jpg'}
              alt={restaurant.name}
              className="restaurant-image"
            />
            <div className="restaurant-info">
              <h2>{restaurant.name}</h2>
              <p>{restaurant.cuisines}</p>
              <p>Cost for Two: {restaurant.average_cost_for_two} {restaurant.currency}</p>
              <p>Rating: {restaurant.user_rating.aggregate_rating} ({restaurant.user_rating.rating_text})</p>
              <div className="button-group">
                <Link to={`/restaurant/${restaurant.R.res_id}`} className="view-details-button">
                  View Details
                </Link>
                <a
                  href={restaurant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-on-zomato-button"
                >
                  View on Zomato
                </a>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RestaurantList;