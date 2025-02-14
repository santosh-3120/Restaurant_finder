const express = require('express');
const router = express.Router();
const {
    getAllRestaurants,
    getRestaurantById,
    searchRestaurants,
    searchByLocation,
    filterRestaurants,
    imageBasedRestaurantSearch,
    upload // Multer middleware
} = require('../controllers/RestaurantController');

// ✅ Get all restaurants with pagination
router.get('/api/restaurants', getAllRestaurants);

// ✅ Get restaurant by ID
router.get('/api/restaurants/:id', getRestaurantById);

// ✅ Search by Name or Cuisine
router.get('/api/restaurants/search', searchRestaurants);

// ✅ Search by Location
router.get('/api/restaurants/location', searchByLocation);

// ✅ Filter by Country, Price Range, and Cuisines
router.get('/api/restaurants/filter', filterRestaurants);

// ✅ Image-Based Restaurant Search
router.post('/upload', upload.single('image'), async (req, res) => {
    console.log("Received a request at /api/upload");

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        await imageBasedRestaurantSearch(req, res);
    } catch (error) {
        console.error("Error in /upload route:", error);
        res.status(500).json({ message: "Error processing image", error: error.message });
    }
});

router.get('/api/test', (req, res) => {
    res.json({ message: "API is working!" });
});

module.exports = router;
