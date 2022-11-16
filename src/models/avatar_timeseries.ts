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
    timeseries: [{
        floor_price: {
            type: Number
        },
        last_sale: {
            type: Number
        },
        createdAt: {
            type: Date
        },
        expireAt: {
            type: Date
        }
    }]
})

export const AvatarTimeSeries = mongoose.model('AvatarTimeSeries', Schema);