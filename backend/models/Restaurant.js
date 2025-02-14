/*const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    res_id: { type: Number, unique: true, required: true }, // Added unique res_id
    name: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: { type: String, required: true },
        city: { type: String },
        country_id: { type: Number }
    },
    cuisines: [{ type: String }],
    price_range: { type: Number },
    has_online_delivery: { type: Boolean },
    photos_url: { type: String },
    url: { type: String },
    user_rating: {
        rating_text: { type: String },
        rating_color: { type: String },
        votes: { type: String },
        aggregate_rating: { type: String }
    },
    average_cost_for_two: { type: Number },
    featured_image: { type: String },
    has_table_booking: { type: Boolean },
    extra_fields: { type: mongoose.Schema.Types.Mixed }
});

// Add a 2dsphere index on the location field
restaurantSchema.index({ location: '2dsphere' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;*/
