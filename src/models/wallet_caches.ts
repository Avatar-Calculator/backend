import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
        timestamp: {
            type: Date,
            required: true
        },
        wallet: {
            type: String,
            required: true
        },
        avatars: {
            type: [String],
            required: true
        },
        expireAt: {
            type: Date,
            expires: 0
        }
    })

export const WalletCaches = mongoose.model('WalletCache', Schema);