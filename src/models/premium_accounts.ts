import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    uid: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        expires: 0
    }
})

export const PremiumAccounts = mongoose.model('PremiumAccount', Schema);