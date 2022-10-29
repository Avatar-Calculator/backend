import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    wallet: {
        type: String,
        required: true
    }
})

export const Wallets = mongoose.model('Wallet', Schema);