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
    wallet: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        expires: 0
    }
})

export const PremiumWallets = mongoose.model('PremiumWallet', Schema);