const mongoose = require("mongoose");
const RestaurantCollection = mongoose.connection.collection("restaurants");
const axios = require("axios");
const multer = require("multer");
const HF_API_KEY = process.env.HF_API_KEY; // Ensure you have this environment variable set
const connectDB = require('../config/db.js'); // Corrected path

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Multer middleware

// ✅ Check if database is connected
const checkDBConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: "❌ Database not connected" });
    }
};

// ✅ Get all restaurants with pagination
const getAllRestaurants = async (req, res) => {
    try {
        checkDBConnection(res);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log(`Fetching restaurants: Page = ${page}, Limit = ${limit}`);

        const totalRestaurants = await RestaurantCollection.countDocuments();
        const restaurants = await RestaurantCollection.find().skip(skip).limit(limit).toArray();

        if (!restaurants.length) {
            return res.status(404).json({ message: "No restaurants available" });
        }

        res.json({ total: totalRestaurants, page, limit, results: restaurants });
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ message: "Error fetching restaurants", error: error.message });
    }
};

// ✅ Get restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        checkDBConnection(res);
        const restaurantId = Number(req.params.id);
        console.log(`Fetching restaurant with ID: ${restaurantId}`);

        const collection = mongoose.connection.db.collection("restaurants");

        // Find the document where restaurant.R.res_id matches the restaurantId
        const restaurant = await collection.findOne({
            "restaurant.R.res_id": restaurantId
        });

        if (!restaurant) {
            return res.status(404).json({ message: "❌ Restaurant not found" });
        }

        res.json(restaurant.restaurant); // Return the nested restaurant object
    } catch (error) {
        console.error("❌ Error fetching restaurant by ID:", error);
        res.status(500).json({ message: "❌ Error fetching restaurant", error: error.message });
    }
};

// ✅ Search by Name or Cuisine
const searchRestaurants = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const regex = new RegExp(search, "i"); // Case-insensitive search
        const collection = mongoose.connection.db.collection("restaurants");

        const restaurants = await collection.aggregate([
            {
                $match: {
                    $or: [
                        { "restaurant.name": { $regex: regex } },
                        { "restaurant.cuisines": { $regex: regex } },
                    ],
                },
            },
        ]).toArray();

        res.json({ total: restaurants.length, results: restaurants });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Search by Location
const searchByLocation = async (req, res) => {
    try {
        const longitude = parseFloat(req.query.longitude);
        const latitude = parseFloat(req.query.latitude);
        const distanceInKilometers = parseFloat(req.query.distance) || 3;
        const maxDistanceInMeters = distanceInKilometers * 1000;

        if (isNaN(longitude) || isNaN(latitude)) {
            return res.status(400).json({ message: "Invalid latitude or longitude" });
        }

        const restaurants = await RestaurantCollection.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distance",
                    maxDistance: maxDistanceInMeters,
                    spherical: true,
                },
            },
        ]).toArray();

        // Formatting response to match `searchRestaurants`
        const formattedRestaurants = restaurants.map((restaurant) => ({
            restaurant: {
                R: { res_id: restaurant.restaurant.R.res_id },
                name: restaurant.restaurant.name,
                cuisines: restaurant.restaurant.cuisines,
                featured_image: restaurant.restaurant.featured_image,
                thumb: restaurant.restaurant.thumb,
                average_cost_for_two: restaurant.restaurant.average_cost_for_two,
                currency: restaurant.restaurant.currency,
                user_rating: restaurant.restaurant.user_rating,
                url: restaurant.restaurant.url,
            },
        }));

        res.json({ total: formattedRestaurants.length, results: formattedRestaurants });
    } catch (error) {
        console.error("Error fetching nearby restaurants:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Filter by Country, Price Range, and Cuisines
const country_mapping = {
    1: "India",
    14: "Australia",
    17: "Kenya",
    30: "Brazil",
    37: "Canada",
    94: "Indonesia",
    148: "New Zealand",
    162: "Philippines",
    166: "Qatar",
    184: "Singapore",
    189: "South Africa",
    191: "Sri Lanka",
    208: "Turkey",
    214: "United Arab Emirates",
    215: "United Kingdom",
    216: "United States"
};

const filterRestaurants = async (req, res) => {
    try {
        const { country, price_range, cuisines } = req.query;
        const query = {};

        if (country) query["restaurant.location.country_id"] = Number(country);
        if (price_range) query["restaurant.price_range"] = Number(price_range);
        if (cuisines) query["restaurant.cuisines"] = { $regex: cuisines, $options: "i" };

        const restaurants = await RestaurantCollection.find(query).toArray();

        // Formatting response to match `searchRestaurants`
        const formattedRestaurants = restaurants.map((restaurant) => ({
            restaurant: {
                R: { res_id: restaurant.restaurant.R.res_id },
                name: restaurant.restaurant.name,
                cuisines: restaurant.restaurant.cuisines,
                featured_image: restaurant.restaurant.featured_image,
                thumb: restaurant.restaurant.thumb,
                average_cost_for_two: restaurant.restaurant.average_cost_for_two,
                currency: restaurant.restaurant.currency,
                user_rating: restaurant.restaurant.user_rating,
                url: restaurant.restaurant.url,
            },
        }));

        res.json({ total: formattedRestaurants.length, results: formattedRestaurants });
    } catch (error) {
        console.error("Error filtering restaurants:", error);
        res.status(500).json({ message: "Error filtering restaurants", error: error.message });
    }
};

// ✅ Image Based Restaurant Search
const foodToCuisineMap = {  // Keep this mapping for easier customization and maintainability
    burger: "American",
    pizza: "Italian",
    sushi: "Japanese",
    biryani: "Indian",
    tacos: "Mexican",
    pasta: "Italian",
    cheesecake: "Dessert",
    "baked potato": "American",
    "crispy chicken": "Fast Food",
    chai: "Indian",
};

const detectFood = async (imageBuffer, apiKey) => {
    try {
        console.log("Sending image to Hugging Face API for food detection...");
        const headers = {
            Authorization: `Bearer ${apiKey}`, // Use the passed API key
            "Content-Type": "application/octet-stream",
        };
        console.log("Authorization header:", headers.Authorization);
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/ewanlong/food_type_image_detection",
            imageBuffer,
            {
                headers: headers,
                responseType: 'json',
                transformRequest: [(data) => data],
            }
        );
        console.log("Hugging Face API response:", JSON.stringify(response.data));
        console.log("Food detection response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error calling Hugging Face API:", error.response?.data || error.message);
        return null;
    }
};

const imageBasedRestaurantSearch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const foodDetectionResult = await detectFood(req.file.buffer, process.env.HF_API_KEY);

        if (!foodDetectionResult || !Array.isArray(foodDetectionResult) || foodDetectionResult.length === 0) {
            return res.status(500).json({ error: "Food detection failed" });
        }

        // Get top 2 detected cuisines
        const topCuisines = foodDetectionResult
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map((item) => foodToCuisineMap[item.label.toLowerCase()] || null)
            .filter(Boolean);

        if (topCuisines.length === 0) {
            return res.json({ message: "No cuisines identified", restaurants: [] });  // Return empty restaurants array
        }

        // Database Query
        const restaurants = await RestaurantCollection.aggregate([
            {
                $match: {
                    "restaurant.cuisines": { $in: topCuisines },
                },
            },
        ]).toArray();

        // Formatting response to match `searchRestaurants` -  important for consistency
        const formattedRestaurants = restaurants.map((restaurant) => ({
            restaurant: {
                R: { res_id: restaurant.restaurant.R.res_id },
                name: restaurant.restaurant.name,
                cuisines: restaurant.restaurant.cuisines,
                featured_image: restaurant.restaurant.featured_image,
                thumb: restaurant.restaurant.thumb,
                average_cost_for_two: restaurant.restaurant.average_cost_for_two,
                currency: restaurant.restaurant.currency,
                user_rating: restaurant.restaurant.user_rating,
                url: restaurant.restaurant.url,
            },
        }));

        res.json({
            total: formattedRestaurants.length,
            restaurants: formattedRestaurants, // Add the restaurants property
        });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ message: "Error processing image", error: error.message });
    }
};

// ✅ Export functions
module.exports = {
    getAllRestaurants,
    getRestaurantById,
    searchRestaurants,
    searchByLocation,
    filterRestaurants,
    imageBasedRestaurantSearch,
    upload // Add the upload middleware to the exports
};
