import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    floor_price: {
        type: Number,
        required: true
    },
    floor_price_change: {
        type: Number,
        required: true
    },
    generation: {
        type: String,
        required: true
    },
    hyperlink: {
        type: String,
        required: true
    },
    last_sale: {
        type: Number,
        required: true
    },
    last_sale_change: {
        type: Number,
        required: true
    }
})

export const Avatars = mongoose.model('Avatar', Schema);